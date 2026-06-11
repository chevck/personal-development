import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { resolveSpeaklyProgrammeForUser } from '../lib/speaklyProgrammes';
import { getProgrammePhases, setProgrammePhases } from '../lib/speechTrainingProgram';

export function useSpeaklyProgramme() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('local');
  const [programmeId, setProgrammeId] = useState('local');

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let cancelled = false;

    async function loadProgramme() {
      setLoading(true);

      const result = await resolveSpeaklyProgrammeForUser(user?.uid);
      if (cancelled) return;

      setProgrammePhases(result.phases);
      setSource(result.source);
      setProgrammeId(result.id);
      setLoading(false);
    }

    loadProgramme();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.uid]);

  return {
    loading: authLoading || loading,
    source,
    programmeId,
    phases: getProgrammePhases(),
  };
}
