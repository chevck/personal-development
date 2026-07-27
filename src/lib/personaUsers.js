import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";
import {
  MAX_MENTORING_CHARGE,
  PERSONA_CURRENCIES,
  PERSONA_DESIGN_CONTEXTS,
  PERSONA_DESIGN_DISCIPLINES,
  PERSONA_DESIGN_END_GOALS,
  PERSONA_DESIGN_FOCUS_AREAS,
  PERSONA_DESIGN_REASONS,
  PERSONA_ROLE_ASSESSOR,
  PERSONA_ROLE_LEARNER,
  PERSONA_TRACK_DESIGN,
  getSkillTrack,
} from "../config/personaRegistration";
import { SPEAKLY_ASSESSOR_BACKGROUND } from "../config/speaklyRegistration";
import { uploadAssessorPhoto } from "./personaAssessorMedia";
import { upsertAssessorDirectoryEntry } from "./personaAssessorDirectory";
import {
  MAX_PROGRAM_DAYS,
  MIN_PROGRAM_DAYS,
  normalizeProgramDuration,
} from "./speechTrainingProgram";

export const PERSONA_USERS_COLLECTION = "persona_users";

const VALID_DESIGN_DISCIPLINE_IDS = new Set(
  PERSONA_DESIGN_DISCIPLINES.map((a) => a.id),
);
const VALID_DESIGN_REASON_IDS = new Set(
  PERSONA_DESIGN_REASONS.map((a) => a.id),
);
const VALID_DESIGN_CONTEXT_IDS = new Set(
  PERSONA_DESIGN_CONTEXTS.map((a) => a.id),
);
const VALID_DESIGN_FOCUS_IDS = new Set(
  PERSONA_DESIGN_FOCUS_AREAS.map((a) => a.id),
);
const VALID_DESIGN_END_GOAL_IDS = new Set(
  PERSONA_DESIGN_END_GOALS.map((a) => a.id),
);
const VALID_ASSESSOR_BACKGROUND_IDS = new Set(
  SPEAKLY_ASSESSOR_BACKGROUND.map((a) => a.id),
);
const VALID_CURRENCY_IDS = new Set(PERSONA_CURRENCIES.map((c) => c.id));

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

/** `assessorBackground` used to be multi-select (an array)—tolerate old docs that still are. */
function normalizeSingleValue(value) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function validateSingleSelection({ value, validIds, label }) {
  if (!value) {
    throw new Error(`Select one option for ${label}.`);
  }
  if (!validIds.has(value)) {
    throw new Error(`Choose a valid ${label}.`);
  }
}

function idsToLabels(ids, bank) {
  const byId = Object.fromEntries((bank || []).map((option) => [option.id, option.label]));
  return (ids || []).map((id) => byId[id]).filter(Boolean);
}

function validIdsFrom(bank) {
  return new Set((bank || []).map((option) => option.id));
}

/**
 * Syncs the learner-facing assessor directory from whichever track this
 * assessor belongs to. Pass `kycStatus` only when this call should move
 * that field along (registration -> 'unverified', KYC submission ->
 * 'pending')—omit it for ordinary re-syncs so the existing value survives.
 */
async function syncAssessorDirectory(uid, data, { kycStatus } = {}) {
  const assessorQuestions = getSkillTrack(data.track)?.assessorQuestions ?? {};
  await upsertAssessorDirectoryEntry(uid, {
    name: data.name,
    track: data.track,
    focusLabels: idsToLabels(data.assessorFocus, assessorQuestions.focus),
    qualificationLabels: idsToLabels(data.qualifications, assessorQuestions.qualifications),
    backgroundLabels: idsToLabels(
      normalizeSingleValue(data.assessorBackground)
        ? [normalizeSingleValue(data.assessorBackground)]
        : [],
      SPEAKLY_ASSESSOR_BACKGROUND,
    ),
    bio: data.assessorBio,
    photoUrl: data.photoUrl ?? null,
    mentoringCharge: data.mentoringCharge ?? null,
    mentoringCurrency: data.mentoringCurrency ?? null,
    kycStatus,
  });
}

export function validateNameAndEmail(profile) {
  const name = profile.name?.trim() ?? "";
  const email = profile.email?.trim() ?? "";

  if (!name) {
    throw new Error("Enter your name.");
  }
  if (name.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }
  if (!email) {
    throw new Error("Enter your email.");
  }
}

export function validateDesignRegistrationProfile(profile) {
  validateNameAndEmail(profile);

  validatePillSelection({
    values: profile.designDisciplines,
    validIds: VALID_DESIGN_DISCIPLINE_IDS,
    otherText: null,
    label: "design path",
  });

  validatePillSelection({
    values: profile.reasonsForJoining,
    validIds: VALID_DESIGN_REASON_IDS,
    otherText: profile.reasonsForJoiningOther,
    label: "reasons",
  });

  validatePillSelection({
    values: profile.designContexts,
    validIds: VALID_DESIGN_CONTEXT_IDS,
    otherText: profile.designContextsOther,
    label: "design context",
  });

  validatePillSelection({
    values: profile.focusAreas,
    validIds: VALID_DESIGN_FOCUS_IDS,
    otherText: profile.focusAreasOther,
    label: "focus area",
  });

  validatePillSelection({
    values: profile.endGoals,
    validIds: VALID_DESIGN_END_GOAL_IDS,
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

/** Validates against whichever track's assessor question banks apply—any track, not just design. */
export function validateAssessorRegistrationProfile(profile) {
  validateNameAndEmail(profile);

  const assessorQuestions = getSkillTrack(profile.track)?.assessorQuestions ?? {};

  validatePillSelection({
    values: profile.qualifications,
    validIds: validIdsFrom(assessorQuestions.qualifications),
    otherText: profile.qualificationsOther,
    label: "qualifications",
  });

  validatePillSelection({
    values: profile.assessorFocus,
    validIds: validIdsFrom(assessorQuestions.focus),
    otherText: profile.assessorFocusOther,
    label: "review focus",
  });

  validateSingleSelection({
    value: profile.assessorBackground,
    validIds: VALID_ASSESSOR_BACKGROUND_IDS,
    label: "experience level",
  });

  const bio = profile.assessorBio?.trim() ?? "";
  if (bio.length > 0 && bio.length < 10) {
    throw new Error(
      "Share a little more in your bio (at least 10 characters), or leave it blank.",
    );
  }
}

/**
 * KYC requirements: ID document and mentoring charge. Unlike registration,
 * this is required—it's what moves an assessor from `unverified` to
 * `pending`, so all of it must be present to submit.
 */
export function validateAssessorKycSubmission(profile) {
  if (!profile.idDocumentUrl) {
    throw new Error("Upload a photo or PDF of your ID to continue.");
  }

  const charge = Number(profile.mentoringCharge);
  if (!Number.isFinite(charge) || charge <= 0) {
    throw new Error("Enter how much you charge for mentoring.");
  }
  if (charge > MAX_MENTORING_CHARGE) {
    throw new Error(`Mentoring charge can't exceed ${MAX_MENTORING_CHARGE}.`);
  }
  if (!VALID_CURRENCY_IDS.has(profile.mentoringCurrency)) {
    throw new Error("Choose a currency for your mentoring charge.");
  }
}

export function buildPersonaDesignUserDocument(uid, profile) {
  const now = new Date().toISOString();
  return {
    uid,
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
    track: PERSONA_TRACK_DESIGN,
    role: PERSONA_ROLE_LEARNER,
    designDisciplines: [...profile.designDisciplines],
    reasonsForJoining: [...profile.reasonsForJoining],
    reasonsForJoiningOther: profile.reasonsForJoining.includes("other")
      ? profile.reasonsForJoiningOther.trim()
      : null,
    designContexts: [...profile.designContexts],
    designContextsOther: profile.designContexts.includes("other")
      ? profile.designContextsOther.trim()
      : null,
    focusAreas: [...profile.focusAreas],
    focusAreasOther: profile.focusAreas.includes("other")
      ? profile.focusAreasOther.trim()
      : null,
    endGoals: [...profile.endGoals],
    endGoalsOther: profile.endGoals.includes("other")
      ? profile.endGoalsOther.trim()
      : null,
    programDuration: normalizeProgramDuration(profile.programDuration),
    createdAt: now,
    updatedAt: now,
  };
}

export async function createPersonaDesignUser(uid, profile) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  validateDesignRegistrationProfile(profile);

  const data = buildPersonaDesignUserDocument(uid, profile);
  await setDoc(doc(db, PERSONA_USERS_COLLECTION, uid), data);
  return data;
}

export function buildPersonaAssessorDocument(uid, profile) {
  const now = new Date().toISOString();
  return {
    uid,
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
    track: profile.track,
    role: PERSONA_ROLE_ASSESSOR,
    qualifications: [...profile.qualifications],
    qualificationsOther: profile.qualifications.includes("other")
      ? profile.qualificationsOther.trim()
      : null,
    assessorFocus: [...profile.assessorFocus],
    assessorFocusOther: profile.assessorFocus.includes("other")
      ? profile.assessorFocusOther.trim()
      : null,
    assessorBackground: profile.assessorBackground,
    assessorBio: profile.assessorBio?.trim() ?? "",
    // Photo is the only KYC field collected at sign-up, and it's optional
    // there—everything else is filled in later via submitAssessorKyc.
    photoUrl: profile.photoUrl ?? null,
    idDocumentUrl: null,
    mentoringCharge: null,
    mentoringCurrency: null,
    // Every new assessor starts unverified—hidden from learners, and
    // flagged on their own dashboard, until they submit KYC (-> pending)
    // and someone approves it by hand (-> active; see personaAssessorDirectory.js).
    kycStatus: "unverified",
    createdAt: now,
    updatedAt: now,
  };
}

export async function createPersonaAssessor(uid, profile) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  validateAssessorRegistrationProfile(profile);

  const data = buildPersonaAssessorDocument(uid, profile);
  await setDoc(doc(db, PERSONA_USERS_COLLECTION, uid), data);
  await syncAssessorDirectory(uid, data, { kycStatus: "unverified" });
  return data;
}

/** Moves an assessor from `unverified` to `pending`—the one KYC step they submit themselves. */
export async function submitAssessorKyc(uid, { idDocumentUrl, mentoringCharge, mentoringCurrency }) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const kycProfile = { idDocumentUrl, mentoringCharge, mentoringCurrency };
  validateAssessorKycSubmission(kycProfile);

  const now = new Date().toISOString();
  const data = {
    idDocumentUrl,
    mentoringCharge: Number(mentoringCharge),
    mentoringCurrency,
    kycStatus: "pending",
    updatedAt: now,
  };

  await updateDoc(doc(db, PERSONA_USERS_COLLECTION, uid), data);

  const profile = await getPersonaUser(uid);
  await syncAssessorDirectory(uid, { ...profile, ...data }, { kycStatus: "pending" });

  return data;
}

export async function getPersonaUser(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;
  const snap = await getDoc(doc(db, PERSONA_USERS_COLLECTION, uid));
  return snap.exists() ? snap.data() : null;
}

export async function updatePersonaUserName(uid, name) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }
  const trimmed = name?.trim() ?? "";
  if (trimmed.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }

  const now = new Date().toISOString();
  await updateDoc(doc(db, PERSONA_USERS_COLLECTION, uid), {
    name: trimmed,
    updatedAt: now,
  });

  const profile = await getPersonaUser(uid);
  if (profile?.role === PERSONA_ROLE_ASSESSOR) {
    await syncAssessorDirectory(uid, { ...profile, name: trimmed });
  }

  return trimmed;
}

/** Assessors can change their KYC photo anytime from account settings. */
export async function updateAssessorPhoto(uid, file) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const photoUrl = await uploadAssessorPhoto(uid, file);
  const now = new Date().toISOString();

  await updateDoc(doc(db, PERSONA_USERS_COLLECTION, uid), {
    photoUrl,
    updatedAt: now,
  });

  const profile = await getPersonaUser(uid);
  await syncAssessorDirectory(uid, { ...profile, photoUrl });

  return photoUrl;
}

export async function updateAssessorExpertise(uid, profile) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const assessorQuestions = getSkillTrack(profile.track)?.assessorQuestions ?? {};

  validatePillSelection({
    values: profile.qualifications,
    validIds: validIdsFrom(assessorQuestions.qualifications),
    otherText: profile.qualificationsOther,
    label: "qualifications",
  });
  validatePillSelection({
    values: profile.assessorFocus,
    validIds: validIdsFrom(assessorQuestions.focus),
    otherText: profile.assessorFocusOther,
    label: "review focus",
  });
  validateSingleSelection({
    value: profile.assessorBackground,
    validIds: VALID_ASSESSOR_BACKGROUND_IDS,
    label: "experience level",
  });
  const bio = profile.assessorBio?.trim() ?? "";
  if (bio.length > 0 && bio.length < 10) {
    throw new Error(
      "Share a little more in your bio (at least 10 characters), or leave it blank.",
    );
  }

  const data = {
    qualifications: [...profile.qualifications],
    qualificationsOther: profile.qualifications.includes("other")
      ? profile.qualificationsOther.trim()
      : null,
    assessorFocus: [...profile.assessorFocus],
    assessorFocusOther: profile.assessorFocus.includes("other")
      ? profile.assessorFocusOther.trim()
      : null,
    assessorBackground: profile.assessorBackground,
    assessorBio: bio,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(doc(db, PERSONA_USERS_COLLECTION, uid), data);

  const profileDoc = await getPersonaUser(uid);
  await syncAssessorDirectory(uid, { ...profileDoc, ...data, track: profile.track });

  return data;
}
