import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";
import {
  SPEAKLY_ASSESSOR_BACKGROUND,
  SPEAKLY_ASSESSOR_FOCUS,
  SPEAKLY_ASSESSOR_QUALIFICATIONS,
  SPEAKLY_REASONS,
  SPEAKLY_ROLE_ASSESSOR,
  SPEAKLY_ROLE_LEARNER,
  SPEAKLY_SPEAKING_CONTEXTS,
} from "../config/speaklyRegistration";
import {
  getSkillTrack,
  PERSONA_EXPERIENCE_LEVELS,
  PERSONA_TRACK_VOICE,
} from "../config/personaRegistration";
import { PERSONA_USERS_COLLECTION } from "./personaUsers";
import {
  MAX_PROGRAM_DAYS,
  MIN_PROGRAM_DAYS,
  normalizeProgramDuration,
} from "./speechTrainingProgram";
import apiClient from "./apiClient";

export const SPEAKLY_USERS_COLLECTION = "speakly_users";

const VALID_REASON_IDS = new Set(SPEAKLY_REASONS.map((a) => a.id));
const VALID_QUALIFICATION_IDS = new Set(
  SPEAKLY_ASSESSOR_QUALIFICATIONS.map((a) => a.id),
);
const VALID_ASSESSOR_FOCUS_IDS = new Set(
  SPEAKLY_ASSESSOR_FOCUS.map((a) => a.id),
);
const VALID_BACKGROUND_IDS = new Set(
  SPEAKLY_ASSESSOR_BACKGROUND.map((a) => a.id),
);

function validIdsFrom(bank) {
  return new Set((bank || []).map((option) => option.id));
}

export function getSpeaklyUserRole(profile) {
  return profile?.role === SPEAKLY_ROLE_ASSESSOR
    ? SPEAKLY_ROLE_ASSESSOR
    : SPEAKLY_ROLE_LEARNER;
}

function validatePillSelection({ values, validIds, otherText, label }) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`Select at least one option for ${label}.`);
  }
  const invalid = values.filter((id) => !validIds.has(id));
  if (invalid.length > 0) {
    throw new Error(`One or more ${label} options are invalid.`);
  }
  if (values.includes("other") && !otherText?.trim()) {
    throw new Error(
      `Tell us a little more about your “Other” ${label} choice.`,
    );
  }
}

/** A single value from `profile.discipline`, or the first of a legacy array-based field. */
function normalizeDiscipline(profile) {
  const raw = profile.discipline ?? profile.disciplines ?? profile.voiceDisciplines;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw ?? null;
}

/**
 * Validates a learner profile's answers against whichever track it's
 * actually for—disciplines, reasons, contexts, focus areas, and end goals
 * are all checked generically against that track's question bank, so this
 * works the same way regardless of which skill is being learned.
 */
function validateLearnerProfile(profile) {
  // Callers that predate the multi-track wizard (e.g. the legacy Speakly-only
  // registration page) never set `track`—treat that as voice, since this
  // collection's whole reason for existing was voice training.
  const learnerQuestions =
    getSkillTrack(profile.track || PERSONA_TRACK_VOICE)?.learnerQuestions ?? {};
  // That same legacy page also sends `speakingContexts`/`voiceDisciplines`
  // instead of the generic wizard's `contexts`/`discipline`.
  const contexts = profile.contexts ?? profile.speakingContexts;
  const contextsOther = profile.contextsOther ?? profile.speakingContextsOther;
  const discipline = normalizeDiscipline(profile);

  // Discipline is a single choice, and (like level) optional on entry
  // points that predate it—but any provided value must be valid for this
  // profile's track.
  if (
    discipline != null &&
    !validIdsFrom(learnerQuestions.disciplines).has(discipline)
  ) {
    throw new Error("Choose a valid discipline.");
  }

  // Level is a single choice, not a pill multi-select, and (like disciplines)
  // is optional on entry points that predate it—but any provided value must
  // be one of the real experience levels.
  if (profile.level != null && !validIdsFrom(PERSONA_EXPERIENCE_LEVELS).has(profile.level)) {
    throw new Error("Choose a valid experience level.");
  }

  validatePillSelection({
    values: profile.reasonsForJoining,
    validIds: validIdsFrom(learnerQuestions.reasons),
    otherText: profile.reasonsForJoiningOther,
    label: "reasons",
  });

  validatePillSelection({
    values: contexts,
    validIds: validIdsFrom(learnerQuestions.contexts),
    otherText: contextsOther,
    label: "context",
  });

  validatePillSelection({
    values: profile.focusAreas,
    validIds: validIdsFrom(learnerQuestions.focus),
    otherText: profile.focusAreasOther,
    label: "focus area",
  });

  validatePillSelection({
    values: profile.endGoals,
    validIds: validIdsFrom(learnerQuestions.goals),
    otherText: profile.endGoalsOther,
    label: "end goal",
  });

  const duration = normalizeProgramDuration(profile.programDuration);
  if (duration < MIN_PROGRAM_DAYS || duration > MAX_PROGRAM_DAYS) {
    throw new Error(
      `Choose a programme length between ${MIN_PROGRAM_DAYS} and ${MAX_PROGRAM_DAYS} days.`,
    );
  }
}

function validateAssessorProfile(profile) {
  validatePillSelection({
    values: profile.qualifications,
    validIds: VALID_QUALIFICATION_IDS,
    otherText: profile.qualificationsOther,
    label: "qualifications",
  });

  validatePillSelection({
    values: profile.assessorFocus,
    validIds: VALID_ASSESSOR_FOCUS_IDS,
    otherText: profile.assessorFocusOther,
    label: "review focus",
  });

  validatePillSelection({
    values: profile.assessorBackground,
    validIds: VALID_BACKGROUND_IDS,
    otherText: null,
    label: "background",
  });

  const bio = profile.assessorBio?.trim() ?? "";
  if (bio.length > 0 && bio.length < 10) {
    throw new Error(
      "Share a little more in your bio (at least 10 characters), or leave it blank.",
    );
  }
}

export function validateRegistrationProfile(profile) {
  const name = profile.name?.trim() ?? "";
  const email = profile.email?.trim() ?? "";
  const role = profile.role;

  if (!name) {
    throw new Error("Enter your name.");
  }
  if (name.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }
  if (!email) {
    throw new Error("Enter your email.");
  }
  if (role !== SPEAKLY_ROLE_LEARNER && role !== SPEAKLY_ROLE_ASSESSOR) {
    throw new Error(
      "Choose whether you are joining as a learner or an assessor.",
    );
  }

  if (role === SPEAKLY_ROLE_ASSESSOR) {
    validateAssessorProfile(profile);
  } else {
    validateLearnerProfile(profile);
  }
}

export function buildUserDocument(uid, profile) {
  const now = new Date().toISOString();
  const base = {
    uid,
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
    role: profile.role,
    track: profile.track,
    createdAt: now,
    updatedAt: now,
  };

  if (profile.role === SPEAKLY_ROLE_ASSESSOR) {
    return {
      ...base,
      qualifications: [...profile.qualifications],
      qualificationsOther: profile.qualifications.includes("other")
        ? profile.qualificationsOther.trim()
        : null,
      assessorFocus: [...profile.assessorFocus],
      assessorFocusOther: profile.assessorFocus.includes("other")
        ? profile.assessorFocusOther.trim()
        : null,
      assessorBackground: [...profile.assessorBackground],
      assessorBio: profile.assessorBio?.trim() ?? "",
    };
  }

  // Contexts stored under their original Speakly field names for backward
  // compatibility with code that already reads `speakingContexts` (e.g.
  // assessment submission context)—sourced from whichever the caller
  // actually sent: the generic wizard's `contexts`, or the legacy page's.
  const contexts = profile.contexts ?? profile.speakingContexts;
  const contextsOther = profile.contextsOther ?? profile.speakingContextsOther;

  return {
    ...base,
    role: SPEAKLY_ROLE_LEARNER,
    level: profile.level ?? null,
    discipline: normalizeDiscipline(profile),
    reasonsForJoining: [...profile.reasonsForJoining],
    reasonsForJoiningOther: profile.reasonsForJoining.includes("other")
      ? profile.reasonsForJoiningOther.trim()
      : null,
    contexts: [...contexts],
    contextsOther: contexts.includes("other") ? contextsOther.trim() : null,
    focusAreas: [...profile.focusAreas],
    focusAreasOther: profile.focusAreas.includes("other")
      ? profile.focusAreasOther.trim()
      : null,
    endGoals: [...profile.endGoals],
    endGoalsOther: profile.endGoals.includes("other")
      ? profile.endGoalsOther.trim()
      : null,
    programDuration: normalizeProgramDuration(profile.programDuration),
  };
}

/**
 * Every new user—any role, any track—is created here in `persona_users`,
 * the one canonical user directory. `createSpeaklyUser` below is a separate,
 * legacy-only path for the old Speakly-specific registration page.
 */
export async function createPersonaUser(uid, profile) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }
  validateRegistrationProfile(profile);
  console.log("starting build user document", { profile });
  const data = buildUserDocument(uid, profile);
  console.log({ data });
  await apiClient.post("/provn-api/task/create", data, { toast: false });
  await setDoc(doc(db, PERSONA_USERS_COLLECTION, uid), data);
  return data;
}

export async function createSpeaklyUser(uid, profile) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  validateRegistrationProfile(profile);

  const data = buildUserDocument(uid, profile);
  await apiClient.post("/speakly-api/task/create", data, { toast: false });
  await setDoc(doc(db, SPEAKLY_USERS_COLLECTION, uid), data);
  return data;
}

export async function getSpeaklyUser(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;
  const snap = await getDoc(doc(db, SPEAKLY_USERS_COLLECTION, uid));
  return snap.exists() ? snap.data() : null;
}

const REASON_LABEL_BY_ID = Object.fromEntries(
  SPEAKLY_REASONS.map((r) => [r.id, r.label]),
);

const SPEAKING_CONTEXT_LABEL_BY_ID = Object.fromEntries(
  SPEAKLY_SPEAKING_CONTEXTS.map((c) => [c.id, c.label]),
);

export function formatLearnerReasonLabels(
  reasonsForJoining,
  reasonsForJoiningOther,
) {
  if (!Array.isArray(reasonsForJoining) || reasonsForJoining.length === 0) {
    return [];
  }
  return reasonsForJoining.map((id) => {
    if (id === "other" && reasonsForJoiningOther?.trim()) {
      return reasonsForJoiningOther.trim();
    }
    return REASON_LABEL_BY_ID[id] || id;
  });
}

export function formatSpeakingContextLabels(
  speakingContexts,
  speakingContextsOther,
) {
  if (!Array.isArray(speakingContexts) || speakingContexts.length === 0) {
    return [];
  }
  return speakingContexts.map((id) => {
    if (id === "other" && speakingContextsOther?.trim()) {
      return speakingContextsOther.trim();
    }
    return SPEAKING_CONTEXT_LABEL_BY_ID[id] || id;
  });
}

/** Snapshot learner context onto public assessment submissions (assessors are unauthenticated). */
export async function buildLearnerContextForSubmission(userId) {
  const profile = await getSpeaklyUser(userId);
  if (!profile) return null;

  const reasons = formatLearnerReasonLabels(
    profile.reasonsForJoining,
    profile.reasonsForJoiningOther,
  );
  const speakingContexts = formatSpeakingContextLabels(
    profile.speakingContexts,
    profile.speakingContextsOther,
  );

  if (
    reasons.length === 0 &&
    speakingContexts.length === 0 &&
    !profile.name?.trim()
  ) {
    return null;
  }

  return {
    learnerName: profile.name?.trim() || null,
    learnerReasons: reasons,
    learnerSpeakingContexts: speakingContexts,
  };
}

export function learnerNeedsReasons(profile) {
  if (getSpeaklyUserRole(profile) !== SPEAKLY_ROLE_LEARNER) return false;
  return (
    !Array.isArray(profile?.reasonsForJoining) ||
    profile.reasonsForJoining.length === 0
  );
}

export async function updateLearnerReasons(
  uid,
  { reasonsForJoining, reasonsForJoiningOther },
) {
  if (!isFirebaseConfigured || !db || !uid) {
    throw new Error("Firebase is not configured.");
  }

  validatePillSelection({
    values: reasonsForJoining,
    validIds: VALID_REASON_IDS,
    otherText: reasonsForJoiningOther,
    label: "reasons",
  });

  const payload = {
    role: SPEAKLY_ROLE_LEARNER,
    reasonsForJoining: [...reasonsForJoining],
    reasonsForJoiningOther: reasonsForJoining.includes("other")
      ? reasonsForJoiningOther.trim()
      : null,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, SPEAKLY_USERS_COLLECTION, uid), payload, {
    merge: true,
  });
  return payload;
}

export async function updateSpeaklyUserTheme(uid, themeColor) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  await setDoc(
    doc(db, SPEAKLY_USERS_COLLECTION, uid),
    {
      themeColor,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
