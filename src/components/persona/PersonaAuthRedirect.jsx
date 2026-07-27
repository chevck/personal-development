import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AppLogo from "../AppLogo";
import { PERSONA_ROLE_ASSESSOR } from "../../config/personaRegistration";
import { SPEAKLY_ROLE_ASSESSOR } from "../../config/speaklyRegistration";
import { useAuth } from "../../contexts/AuthContext";
import { getPersonaUser } from "../../lib/personaUsers";
import { getSpeaklyUser, getSpeaklyUserRole } from "../../lib/speaklyUsers";

/**
 * Signed-in users land on the dashboard, which lists their subscribed
 * skills and links into each skill's task app—except assessors, who go
 * straight to their assessor portal instead.
 */
export default function PersonaAuthRedirect() {
  const { user } = useAuth();
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!user?.uid) {
        setDestination("/");
        return;
      }
      try {
        const personaProfile = await getPersonaUser(user.uid);
        if (personaProfile?.role === PERSONA_ROLE_ASSESSOR) {
          if (!cancelled) setDestination("/assessor");
          return;
        }

        const speaklyProfile = await getSpeaklyUser(user.uid);
        if (getSpeaklyUserRole(speaklyProfile) === SPEAKLY_ROLE_ASSESSOR) {
          if (!cancelled) setDestination("/speakly/assessor");
          return;
        }

        if (!cancelled) setDestination("/dashboard");
      } catch {
        if (!cancelled) setDestination("/dashboard");
      }
    }

    resolve();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  if (!destination) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4 font-sans bg-white text-persona-muted'>
        <AppLogo variant='icon' size='lg' className='app-loading-spin' />
        <p>Taking you to your account…</p>
      </div>
    );
  }

  return <Navigate to={destination} replace />;
}
