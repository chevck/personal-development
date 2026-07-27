import {
  PERSONA_ROLE_ASSESSOR,
  PERSONA_ROLE_LEARNER,
  PERSONA_TRACK_VOICE,
} from "../config/personaRegistration";
import { PERSONA_SKILLS } from "../config/personaSkills";
import { SPEECH_TRAINING_PROJECT_ID } from "../config/projects";
import { SPEAKLY_ROLE_ASSESSOR } from "../config/speaklyRegistration";
import { getPersonaUser } from "./personaUsers";
import { getSkillProgress } from "./personaSkillProgress";
import { getProvnProgramme } from "./provnProgrammes";
import { getSpeaklyUser, getSpeaklyUserRole } from "./speaklyUsers";

const SKILL_BY_ID = Object.fromEntries(PERSONA_SKILLS.map((s) => [s.id, s]));

/**
 * Resolve the skills a signed-in user is subscribed to from their profiles.
 * The generic registration wizard writes every track's learner (voice,
 * design, or any future track) into `speakly_users`, keyed by whatever
 * `track` id is actually stored there—so a `speaklyProfile` is NOT always
 * voice, and this reads its `track` field rather than assuming so.
 * `persona_users` holds assessors (any track) plus design learners added
 * through the secondary guided-setup flow. Returns one entry per subscribed
 * skill: `{ skill, role, taskPath, displayName }` where `taskPath` is null
 * when the skill has no task app yet, or the learner hasn't generated tasks
 * for it.
 */
/** One profile's subscription entry, generic across every track (voice included). */
function trackSubscription({ track, isAssessor, name, hasGuidedTasks }) {
  const isVoice = track === PERSONA_TRACK_VOICE;
  return {
    skill: SKILL_BY_ID[isVoice ? SPEECH_TRAINING_PROJECT_ID : track],
    role: isAssessor ? PERSONA_ROLE_ASSESSOR : PERSONA_ROLE_LEARNER,
    taskPath: isVoice
      ? isAssessor
        ? "/speakly/assessor"
        : `/skills/${SPEECH_TRAINING_PROJECT_ID}`
      : isAssessor
        ? "/assessor"
        : // Only routes to the task page once the learner has generated tasks.
          hasGuidedTasks
          ? `/skills/${track}`
          : null,
    displayName: name ?? null,
  };
}

export function buildSkillSubscriptions({
  personaProfile,
  speaklyProfile,
  hasGuidedTasks = false,
}) {
  const subscriptions = [];

  if (speaklyProfile) {
    // Callers that predate the multi-track wizard (the legacy Speakly-only
    // registration page) never set `track`—treat that as voice, since this
    // collection's original purpose was voice training.
    const track = speaklyProfile.track || PERSONA_TRACK_VOICE;
    subscriptions.push(
      trackSubscription({
        track,
        isAssessor:
          getSpeaklyUserRole(speaklyProfile) === SPEAKLY_ROLE_ASSESSOR,
        name: speaklyProfile.name ?? personaProfile?.name ?? null,
        hasGuidedTasks,
      }),
    );
  }

  if (personaProfile?.track) {
    subscriptions.push(
      trackSubscription({
        track: personaProfile.track,
        isAssessor: personaProfile.role === PERSONA_ROLE_ASSESSOR,
        name: personaProfile.name ?? null,
        hasGuidedTasks,
      }),
    );
  }

  // A learner whose track lives in `speaklyProfile` can also show up as an
  // assessor in `persona_users` (or vice versa)—dedupe so the same skill
  // doesn't render twice.
  const seen = new Set();
  return subscriptions.filter((sub) => {
    const key = sub.skill?.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getUserSkillSubscriptions(uid) {
  if (!uid) return { subscriptions: [], displayName: null };

  const [personaProfile, speaklyProfile] = await Promise.all([
    getPersonaUser(uid),
    getSpeaklyUser(uid),
  ]);

  console.log({ personaProfile, speaklyProfile });

  // The non-voice learner track can live in either profile—whichever one
  // actually has a learner (not assessor) registered against it.
  const guidedTrack =
    speaklyProfile?.track &&
    speaklyProfile.track !== PERSONA_TRACK_VOICE &&
    getSpeaklyUserRole(speaklyProfile) !== SPEAKLY_ROLE_ASSESSOR
      ? speaklyProfile.track
      : personaProfile?.track &&
          personaProfile.track !== PERSONA_TRACK_VOICE &&
          personaProfile.role !== PERSONA_ROLE_ASSESSOR
        ? personaProfile.track
        : null;
  console.log({ guidedTrack });

  // Tasks can come from either the older client-generated flow
  // (`persona_skill_progress`) or the Provn task-generation backend
  // (`provn_programmes`)—either one unlocks the task page.
  const hasGuidedTasks = guidedTrack
    ? Boolean(
        (await getSkillProgress(uid, guidedTrack)) ||
        (await getProvnProgramme(uid, guidedTrack)),
      )
    : false;
  console.log({ hasGuidedTasks });

  const subscriptions = buildSkillSubscriptions({
    personaProfile,
    speaklyProfile,
    hasGuidedTasks,
  });
  console.log({ subscriptions });
  return {
    subscriptions,
    displayName:
      subscriptions.find((s) => s.displayName)?.displayName ??
      personaProfile?.name ??
      speaklyProfile?.name ??
      null,
  };
}
