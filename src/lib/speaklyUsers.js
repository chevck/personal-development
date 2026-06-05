import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import {
  SPEAKLY_ASSESSOR_BACKGROUND,
  SPEAKLY_ASSESSOR_FOCUS,
  SPEAKLY_ASSESSOR_QUALIFICATIONS,
  SPEAKLY_END_GOALS,
  SPEAKLY_FOCUS_AREAS,
  SPEAKLY_REASONS,
  SPEAKLY_ROLE_ASSESSOR,
  SPEAKLY_ROLE_LEARNER,
} from '../config/speaklyRegistration';
import {
  MAX_PROGRAM_DAYS,
  MIN_PROGRAM_DAYS,
  normalizeProgramDuration,
} from './speechTrainingProgram';

export const SPEAKLY_USERS_COLLECTION = 'speakly_users';

const VALID_REASON_IDS = new Set(SPEAKLY_REASONS.map((a) => a.id));
const VALID_END_GOAL_IDS = new Set(SPEAKLY_END_GOALS.map((a) => a.id));
const VALID_FOCUS_IDS = new Set(SPEAKLY_FOCUS_AREAS.map((a) => a.id));
const VALID_QUALIFICATION_IDS = new Set(SPEAKLY_ASSESSOR_QUALIFICATIONS.map((a) => a.id));
const VALID_ASSESSOR_FOCUS_IDS = new Set(SPEAKLY_ASSESSOR_FOCUS.map((a) => a.id));
const VALID_BACKGROUND_IDS = new Set(SPEAKLY_ASSESSOR_BACKGROUND.map((a) => a.id));

export function getSpeaklyUserRole(profile) {
  return profile?.role === SPEAKLY_ROLE_ASSESSOR ? SPEAKLY_ROLE_ASSESSOR : SPEAKLY_ROLE_LEARNER;
}

function validatePillSelection({ values, validIds, otherText, label }) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error(`Select at least one option for ${label}.`);
  }
  const invalid = values.filter((id) => !validIds.has(id));
  if (invalid.length > 0) {
    throw new Error(`One or more ${label} options are invalid.`);
  }
  if (values.includes('other') && !(otherText?.trim())) {
    throw new Error(`Tell us a little more about your “Other” ${label} choice.`);
  }
}

function validateLearnerProfile(profile) {
  validatePillSelection({
    values: profile.reasonsForJoining,
    validIds: VALID_REASON_IDS,
    otherText: profile.reasonsForJoiningOther,
    label: 'reasons',
  });

  validatePillSelection({
    values: profile.focusAreas,
    validIds: VALID_FOCUS_IDS,
    otherText: profile.focusAreasOther,
    label: 'focus area',
  });

  validatePillSelection({
    values: profile.endGoals,
    validIds: VALID_END_GOAL_IDS,
    otherText: profile.endGoalsOther,
    label: 'end goal',
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
    label: 'qualifications',
  });

  validatePillSelection({
    values: profile.assessorFocus,
    validIds: VALID_ASSESSOR_FOCUS_IDS,
    otherText: profile.assessorFocusOther,
    label: 'review focus',
  });

  validatePillSelection({
    values: profile.assessorBackground,
    validIds: VALID_BACKGROUND_IDS,
    otherText: null,
    label: 'background',
  });

  const bio = profile.assessorBio?.trim() ?? '';
  if (bio.length > 0 && bio.length < 10) {
    throw new Error('Share a little more in your bio (at least 10 characters), or leave it blank.');
  }
}

export function validateRegistrationProfile(profile) {
  const name = profile.name?.trim() ?? '';
  const email = profile.email?.trim() ?? '';
  const role = profile.role;

  if (!name) {
    throw new Error('Enter your name.');
  }
  if (name.length < 2) {
    throw new Error('Name must be at least 2 characters.');
  }
  if (!email) {
    throw new Error('Enter your email.');
  }
  if (role !== SPEAKLY_ROLE_LEARNER && role !== SPEAKLY_ROLE_ASSESSOR) {
    throw new Error('Choose whether you are joining as a learner or an assessor.');
  }

  if (role === SPEAKLY_ROLE_ASSESSOR) {
    validateAssessorProfile(profile);
  } else {
    validateLearnerProfile(profile);
  }
}

export function buildSpeaklyUserDocument(uid, profile) {
  const now = new Date().toISOString();
  const base = {
    uid,
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
    role: profile.role,
    createdAt: now,
    updatedAt: now,
  };

  if (profile.role === SPEAKLY_ROLE_ASSESSOR) {
    return {
      ...base,
      qualifications: [...profile.qualifications],
      qualificationsOther: profile.qualifications.includes('other')
        ? profile.qualificationsOther.trim()
        : null,
      assessorFocus: [...profile.assessorFocus],
      assessorFocusOther: profile.assessorFocus.includes('other')
        ? profile.assessorFocusOther.trim()
        : null,
      assessorBackground: [...profile.assessorBackground],
      assessorBio: profile.assessorBio?.trim() ?? '',
    };
  }

  return {
    ...base,
    role: SPEAKLY_ROLE_LEARNER,
    reasonsForJoining: [...profile.reasonsForJoining],
    reasonsForJoiningOther: profile.reasonsForJoining.includes('other')
      ? profile.reasonsForJoiningOther.trim()
      : null,
    focusAreas: [...profile.focusAreas],
    focusAreasOther: profile.focusAreas.includes('other')
      ? profile.focusAreasOther.trim()
      : null,
    endGoals: [...profile.endGoals],
    endGoalsOther: profile.endGoals.includes('other')
      ? profile.endGoalsOther.trim()
      : null,
    programDuration: normalizeProgramDuration(profile.programDuration),
  };
}

export async function createSpeaklyUser(uid, profile) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured.');
  }

  validateRegistrationProfile(profile);

  const data = buildSpeaklyUserDocument(uid, profile);
  await setDoc(doc(db, SPEAKLY_USERS_COLLECTION, uid), data);
  return data;
}

export async function getSpeaklyUser(uid) {
  if (!isFirebaseConfigured || !db || !uid) return null;
  const snap = await getDoc(doc(db, SPEAKLY_USERS_COLLECTION, uid));
  return snap.exists() ? snap.data() : null;
}

const REASON_LABEL_BY_ID = Object.fromEntries(SPEAKLY_REASONS.map((r) => [r.id, r.label]));

export function formatLearnerReasonLabels(reasonsForJoining, reasonsForJoiningOther) {
  if (!Array.isArray(reasonsForJoining) || reasonsForJoining.length === 0) {
    return [];
  }
  return reasonsForJoining.map((id) => {
    if (id === 'other' && reasonsForJoiningOther?.trim()) {
      return reasonsForJoiningOther.trim();
    }
    return REASON_LABEL_BY_ID[id] || id;
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

  if (reasons.length === 0 && !profile.name?.trim()) {
    return null;
  }

  return {
    learnerName: profile.name?.trim() || null,
    learnerReasons: reasons,
  };
}

export function learnerNeedsReasons(profile) {
  if (getSpeaklyUserRole(profile) !== SPEAKLY_ROLE_LEARNER) return false;
  return !Array.isArray(profile?.reasonsForJoining) || profile.reasonsForJoining.length === 0;
}

export async function updateLearnerReasons(uid, { reasonsForJoining, reasonsForJoiningOther }) {
  if (!isFirebaseConfigured || !db || !uid) {
    throw new Error('Firebase is not configured.');
  }

  validatePillSelection({
    values: reasonsForJoining,
    validIds: VALID_REASON_IDS,
    otherText: reasonsForJoiningOther,
    label: 'reasons',
  });

  const payload = {
    role: SPEAKLY_ROLE_LEARNER,
    reasonsForJoining: [...reasonsForJoining],
    reasonsForJoiningOther: reasonsForJoining.includes('other')
      ? reasonsForJoiningOther.trim()
      : null,
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, SPEAKLY_USERS_COLLECTION, uid), payload, { merge: true });
  return payload;
}
