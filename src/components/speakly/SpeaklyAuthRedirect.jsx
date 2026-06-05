import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AppLogo from '../AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import { useAuth } from '../../contexts/AuthContext';
import { getSpeaklyUser, getSpeaklyUserRole } from '../../lib/speaklyUsers';
import { SPEAKLY_ROLE_ASSESSOR } from '../../config/speaklyRegistration';

export default function SpeaklyAuthRedirect({ fallback = '/speakly' }) {
  const { user } = useAuth();
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!user?.uid) {
        setDestination(fallback);
        return;
      }
      try {
        const profile = await getSpeaklyUser(user.uid);
        if (cancelled) return;
        setDestination(
          getSpeaklyUserRole(profile) === SPEAKLY_ROLE_ASSESSOR
            ? '/speakly/assessor'
            : fallback,
        );
      } catch {
        if (!cancelled) setDestination(fallback);
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, fallback]);

  if (!destination) {
    return (
      <div className="speakly-app flex min-h-screen flex-col items-center justify-center gap-4 bg-white font-speakly text-taskly-muted">
        <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="icon" size="lg" />
        <p>Taking you to your dashboard…</p>
      </div>
    );
  }

  return <Navigate to={destination} replace />;
}
