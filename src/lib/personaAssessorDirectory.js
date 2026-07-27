import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";

export const PERSONA_ASSESSOR_DIRECTORY_COLLECTION = "persona_users";

/**
 * Denormalized, publicly-readable-by-signed-in-users assessor listing.
 * Kept separate from persona_users/speakly_users (which hold private
 * profile data) so learners can browse assessors without needing broad
 * read access to other users' account documents.
 *
 * `kycStatus` moves through `unverified` -> `pending` -> `active`. Callers
 * only pass `kycStatus` when they intend to move it along that path
 * (registration stamps `unverified`; submitting the KYC form stamps
 * `pending`)—every other re-sync (name/photo/expertise updates) omits it so
 * `{ merge: true }` leaves whatever is already there untouched. Firestore
 * rules block the owner from setting anything beyond that one
 * `unverified` -> `pending` step themselves, so it only reaches `active`
 * when someone flips it by hand (e.g. via the Firebase console, after
 * reviewing their KYC ID and charge).
 */
export async function upsertAssessorDirectoryEntry(
  uid,
  {
    name,
    track,
    focusLabels = [],
    qualificationLabels = [],
    backgroundLabels = [],
    bio = "",
    photoUrl = null,
    mentoringCharge = null,
    mentoringCurrency = null,
    kycStatus,
  },
) {
  if (!isFirebaseConfigured || !db || !uid) return;

  const payload = {
    uid,
    name: name?.trim() || "Assessor",
    track,
    focusLabels,
    qualificationLabels,
    backgroundLabels,
    bio: bio?.trim() || "",
    photoUrl,
    mentoringCharge,
    mentoringCurrency,
    updatedAt: new Date().toISOString(),
  };
  if (kycStatus) {
    payload.kycStatus = kycStatus;
  }
  // Only stamped once, at directory-entry creation—every later re-sync
  // (name/photo/expertise edits) must omit these or `{ merge: true }` would
  // stomp the accumulated counters back to zero.
  if (kycStatus === "unverified") {
    payload.ratingSum = 0;
    payload.ratingCount = 0;
    payload.studentsCount = 0;
  }

  await setDoc(doc(db, PERSONA_ASSESSOR_DIRECTORY_COLLECTION, uid), payload, {
    merge: true,
  });
}

/** True once this learner has already rated this assessor (ratings are one-time, no edits). */
export async function hasRatedAssessor(assessorUid, learnerUid) {
  if (!isFirebaseConfigured || !db || !assessorUid || !learnerUid) return false;
  const snap = await getDoc(
    doc(db, PERSONA_ASSESSOR_DIRECTORY_COLLECTION, assessorUid, "ratings", learnerUid),
  );
  return snap.exists();
}

/**
 * Records a learner's one-time 1–5 star rating for an assessor. Both writes
 * go in a single batch so Firestore rules can evaluate the "hasn't rated
 * before" guard against the same pre-write snapshot for both documents.
 */
export async function rateAssessor(assessorUid, learnerUid, score) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }
  const rounded = Math.round(score);
  if (!Number.isInteger(rounded) || rounded < 1 || rounded > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const batch = writeBatch(db);
  batch.set(
    doc(db, PERSONA_ASSESSOR_DIRECTORY_COLLECTION, assessorUid, "ratings", learnerUid),
    { score: rounded, ratedAt: new Date().toISOString() },
  );
  batch.update(doc(db, PERSONA_ASSESSOR_DIRECTORY_COLLECTION, assessorUid), {
    ratingSum: increment(rounded),
    ratingCount: increment(1),
  });
  await batch.commit();
}

/** Denormalized counter—bumped once per assignment, so it tracks assignments, not unique learners. */
export async function incrementAssessorStudentCount(assessorUid) {
  if (!isFirebaseConfigured || !db || !assessorUid) return;
  await setDoc(
    doc(db, PERSONA_ASSESSOR_DIRECTORY_COLLECTION, assessorUid),
    { studentsCount: increment(1) },
    { merge: true },
  );
}

/** Only ever returns fully-active assessors—unverified/pending ones stay hidden from learners. */
export async function listAssessorsForTrack(track) {
  if (!isFirebaseConfigured || !db || !track) return [];
  const assessorsQuery = query(
    collection(db, PERSONA_ASSESSOR_DIRECTORY_COLLECTION),
    where("role", "==", "assessor"),
    where("track", "==", track),
    where("kycStatus", "==", "active"),
  );
  const snap = await getDocs(assessorsQuery);
  return snap.docs
    .map((entry) => entry.data())
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}
