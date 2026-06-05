import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppLogo from '../AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import { useAuth } from '../../contexts/AuthContext';
import {
  getSpeaklyUser,
  getSpeaklyUserRole,
  learnerNeedsReasons,
} from '../../lib/speaklyUsers';
import { SPEAKLY_ROLE_ASSESSOR } from '../../config/speaklyRegistration';
import SpeaklyReasonsPrompt from './SpeaklyReasonsPrompt';

export default function SpeaklyLearnerRoute({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [redirect, setRedirect] = useState(null);

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

  if (redirect === '/speakly/assessor') {
    return <Navigate to="/speakly/assessor" replace />;
  }

  if (redirect === null) {
    return (
      <div className="speakly-app flex min-h-screen flex-col items-center justify-center gap-4 bg-white font-speakly text-taskly-muted">
        <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="icon" size="lg" />
        <p>Loading your programme…</p>
      </div>
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
