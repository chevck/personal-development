import { doc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { phases as localPhases } from '../projects/speech-training/phases';
import { getSpeaklyUser } from './speaklyUsers';

export const SPEAKLY_PROGRAMMES_COLLECTION = 'speakly_programmes';

export function getLocalProgrammePhases() {
  return localPhases;
}

function getBundledDay(dayNum) {
  for (const phase of localPhases) {
    const day = phase.days.find((d) => d.day === dayNum);
    if (day) return day;
  }
  return null;
}

/** Replace legacy non-audio day copy with bundled audio-first exercises. */
function applyBundledDayPatches(phases) {
  const staleDayNumbers = phases
    .flatMap((phase) => phase.days)
    .filter((day) => {
      if (day.day === 17) return day.title === 'The Body Language Anchor';
      if (day.day === 21) {
        return day.title === 'The Commitment' && String(day.exercise || '').includes('Write down');
      }
      return false;
    })
    .map((day) => day.day);

  if (staleDayNumbers.length === 0) return phases;

  const patches = Object.fromEntries(
    staleDayNumbers
      .map((dayNum) => [dayNum, getBundledDay(dayNum)])
      .filter(([, patch]) => patch),
  );

  return phases.map((phase) => ({
    ...phase,
    days: phase.days.map((day) =>
      patches[day.day] ? { ...patches[day.day], day: day.day } : day,
    ),
  }));
}

function normalizeDay(day, index) {
  if (!day || typeof day !== 'object') return null;
  const title = typeof day.title === 'string' ? day.title.trim() : '';
  if (!title) return null;

  return {
    ...day,
    day: Number.isFinite(Number(day.day)) ? Number(day.day) : index + 1,
    title,
  };
}

function normalizePhase(phase, index) {
  if (!phase || typeof phase !== 'object' || !Array.isArray(phase.days)) {
    return null;
  }

  const days = phase.days.map((day, dayIndex) => normalizeDay(day, dayIndex)).filter(Boolean);
  if (days.length === 0) return null;

  return {
    ...phase,
    id: phase.id ?? index + 1,
    days,
  };
}

/** Accept Firestore payload or raw phases array. Returns null if invalid. */
export function normalizeProgrammePhases(data) {
  const rawPhases = Array.isArray(data) ? data : data?.phases;
  if (!Array.isArray(rawPhases) || rawPhases.length === 0) {
    return null;
  }

  const phases = rawPhases
    .map((phase, index) => normalizePhase(phase, index))
    .filter(Boolean);

  return phases.length > 0 ? phases : null;
}

export async function hasRemoteSpeaklyProgramme(uid) {
  if (!uid) return false;
  try {
    const profile = await getSpeaklyUser(uid);
    const programmeId = profile?.programmeId || uid;
    const remote = await fetchSpeaklyProgrammeDocument(programmeId);
    return Boolean(remote);
  } catch {
    return false;
  }
}

/** Poll Firestore until the user's programme exists or attempts are exhausted. */
export async function waitForSpeaklyProgramme(uid, { intervalMs = 1200, maxAttempts = 45 } = {}) {
  if (!uid) return null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const profile = await getSpeaklyUser(uid);
    const programmeId = profile?.programmeId || uid;
    const remote = await fetchSpeaklyProgrammeDocument(programmeId);
    if (remote) return remote;

    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => {
        setTimeout(resolve, intervalMs);
      });
    }
  }

  return null;
}

export async function fetchSpeaklyProgrammeDocument(programmeId) {
  if (!isFirebaseConfigured || !db || !programmeId) {
    return null;
  }

  const snap = await getDoc(doc(db, SPEAKLY_PROGRAMMES_COLLECTION, programmeId));
  if (!snap.exists()) return null;

  const phases = applyBundledDayPatches(normalizeProgrammePhases(snap.data()));
  if (!phases) return null;

  return {
    id: snap.id,
    phases,
    raw: snap.data(),
  };
}

/**
 * Load a user's programme from Firestore (`speakly_programmes/{programmeId}`).
 * Uses `speakly_users.programmeId` when set, otherwise the user's uid.
 * Falls back to bundled local phases when missing or invalid.
 */
export async function resolveSpeaklyProgrammeForUser(uid) {
  const fallback = {
    phases: getLocalProgrammePhases(),
    source: 'local',
    id: 'local',
  };

  if (!uid) {
    return fallback;
  }

  try {
    const profile = await getSpeaklyUser(uid);
    const programmeId = profile?.programmeId || uid;
    const remote = await fetchSpeaklyProgrammeDocument(programmeId);

    if (remote) {
      return {
        phases: remote.phases,
        source: 'remote',
        id: remote.id,
      };
    }
  } catch (error) {
    console.error('Failed to load Speakly programme:', error);
  }

  return fallback;
}
