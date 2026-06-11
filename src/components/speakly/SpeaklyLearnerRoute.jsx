import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AppLogo from '../AppLogo';
import SpeaklyProgrammeBuilder from './SpeaklyProgrammeBuilder';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import { useAuth } from '../../contexts/AuthContext';
import {
  hasRemoteSpeaklyProgramme,
  waitForSpeaklyProgramme,
} from '../../lib/speaklyProgrammes';
import {
  getSpeaklyUser,
  getSpeaklyUserRole,
  learnerNeedsReasons,
} from '../../lib/speaklyUsers';
import { SPEAKLY_ROLE_ASSESSOR, SPEAKLY_ROLE_LEARNER } from '../../config/speaklyRegistration';
import SpeaklyReasonsPrompt from './SpeaklyReasonsPrompt';

const RECENT_PROFILE_MS = 10 * 60 * 1000;

function isRecentlyCreatedProfile(profile) {
  if (!profile?.createdAt) return false;
  const created = new Date(profile.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < RECENT_PROFILE_MS;
}

export default function SpeaklyLearnerRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const skipProgrammeGateRef = useRef(location.state?.fromRegistration === true);
  const [profile, setProfile] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [programmeGate, setProgrammeGate] = useState(
    skipProgrammeGateRef.current ? 'ready' : 'loading',
  );
  const [programmeBuilt, setProgrammeBuilt] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!user?.uid) return;
      try {
        const data = await getSpeaklyUser(user.uid);
        if (cancelled) return;
        setProfile(data);
        if (getSpeaklyUserRole(data) === SPEAKLY_ROLE_ASSESSOR) {
          setRedirect('/speakly/assessor');
        } else {
          setRedirect('allow');
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setRedirect('allow');
        }
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    async function ensureProgramme() {
      if (!user?.uid || redirect !== 'allow') return;

      if (skipProgrammeGateRef.current) {
        setProgrammeGate('ready');
        return;
      }

      setProgrammeGate('loading');
      setProgrammeBuilt(false);

      const userProfile = profile ?? (await getSpeaklyUser(user.uid));
      const ready = await hasRemoteSpeaklyProgramme(user.uid);
      if (cancelled) return;

      if (ready) {
        setProgrammeGate('ready');
        return;
      }

      if (!isRecentlyCreatedProfile(userProfile)) {
        setProgrammeGate('ready');
        return;
      }

      setProgrammeGate('building');
      await waitForSpeaklyProgramme(user.uid);
      if (cancelled) return;

      setProgrammeBuilt(true);
    }

    ensureProgramme();
    return () => {
      cancelled = true;
    };
  }, [profile, redirect, user?.uid]);

  if (redirect === '/speakly/assessor') {
    return <Navigate to="/speakly/assessor" replace />;
  }

  if (redirect === null || programmeGate === 'loading') {
    return (
      <div className="speakly-app flex min-h-screen flex-col items-center justify-center gap-4 bg-white font-speakly text-taskly-muted">
        <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="icon" size="lg" />
        <p>Loading your programme…</p>
      </div>
    );
  }

  if (programmeGate === 'building') {
    return (
      <SpeaklyProgrammeBuilder
        userName={user?.displayName || profile?.name || 'speaker'}
        programDuration={profile?.programDuration}
        role={SPEAKLY_ROLE_LEARNER}
        complete={programmeBuilt}
        subtitle="Your personalised quests are almost ready—we are syncing them now."
        onFinished={() => setProgrammeGate('ready')}
      />
    );
  }

  const showReasonsPrompt = learnerNeedsReasons(profile);

  return (
    <>
      {children}
      {showReasonsPrompt && user?.uid && (
        <SpeaklyReasonsPrompt
          uid={user.uid}
          userName={user.displayName || user.email}
          onComplete={(updated) =>
            setProfile((prev) => ({
              ...(prev || {}),
              ...updated,
            }))
          }
        />
      )}
    </>
  );
}
