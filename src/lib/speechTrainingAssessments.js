import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { requireAuthUser } from '../firebase/auth';

const PROGRESS_PATH = 'projects/speech-training/progress';
const SUBMISSIONS_PATH = 'projects/speech-training/submissions';

export function normalizeDayMap(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  Object.entries(obj).forEach(([key, value]) => {
    out[Number(key)] = value;
  });
  return out;
}

function createShareId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `share-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function buildAssessUrl(shareId) {
  return `${window.location.origin}/assess/${shareId}`;
}

export async function supersedePendingSubmission(submissionId) {
  if (!submissionId || !db) return;
  const ref = doc(db, SUBMISSIONS_PATH, submissionId);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().status === 'pending') {
    await setDoc(
      ref,
      { status: 'superseded', updatedAt: new Date().toISOString() },
      { merge: true }
    );
  }
}

export async function createAssessmentSubmission({ userId, dayNum, day, recording }) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is required to share recordings for assessment.');
  }

  await requireAuthUser();

  const progressRef = doc(db, PROGRESS_PATH, userId);
  const progressSnap = await getDoc(progressRef);
  const assessments = progressSnap.exists()
    ? normalizeDayMap(progressSnap.data().assessments)
    : {};

  const previousPendingId = assessments[dayNum]?.pendingSubmissionId;
  await supersedePendingSubmission(previousPendingId);

  const shareId = createShareId();
  const submissionRef = doc(db, SUBMISSIONS_PATH, shareId);

  await setDoc(submissionRef, {
    shareId,
    userId,
    dayNum,
    dayTitle: day.title,
    dayType: day.type,
    exercise: day.exercise,
    description: day.description,
    duration: day.duration,
    recording,
    status: 'pending',
    review: null,
    createdAt: new Date().toISOString(),
  });

  assessments[dayNum] = {
    ...(assessments[dayNum] || {}),
    pendingSubmissionId: shareId,
    status: 'pending_review',
    sharedAt: new Date().toISOString(),
    requiresRedo: false,
  };

  await setDoc(
    progressRef,
    { assessments, updatedAt: new Date().toISOString() },
    { merge: true }
  );

  return shareId;
}

export async function getSubmission(shareId) {
  if (!isFirebaseConfigured || !db) return null;
  const snap = await getDoc(doc(db, SUBMISSIONS_PATH, shareId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

function reviewAlreadyTakenError(submission) {
  if (submission.status === 'reviewed' && submission.review) {
    const who = submission.review.assessorName || 'An assessor';
    return `${who} has already submitted the only review for this link. No one else can review it.`;
  }
  if (submission.status === 'superseded') {
    return 'This link is no longer active. The student shared a newer recording.';
  }
  return 'This submission is no longer accepting reviews.';
}

export async function submitAssessmentReview(shareId, { score, comment, assessorName }) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is required to submit a review.');
  }

  const numericScore = Number(score);
  if (!Number.isFinite(numericScore) || numericScore < 1 || numericScore > 10) {
    throw new Error('Score must be between 1 and 10.');
  }

  const requiresRedo = numericScore < 5;
  const review = {
    score: numericScore,
    comment: comment.trim(),
    assessorName: assessorName.trim() || 'Assessor',
    reviewedAt: new Date().toISOString(),
    requiresRedo,
  };

  const submissionRef = doc(db, SUBMISSIONS_PATH, shareId);

  return runTransaction(db, async (transaction) => {
    const submissionSnap = await transaction.get(submissionRef);
    if (!submissionSnap.exists()) {
      throw new Error('This submission link is invalid or has expired.');
    }

    const submission = submissionSnap.data();
    if (submission.status !== 'pending') {
      throw new Error(reviewAlreadyTakenError(submission));
    }

    const progressRef = doc(db, PROGRESS_PATH, submission.userId);
    const progressSnap = await transaction.get(progressRef);
    const completed = progressSnap.exists()
      ? normalizeDayMap(progressSnap.data().completed)
      : {};
    const assessments = progressSnap.exists()
      ? normalizeDayMap(progressSnap.data().assessments)
      : {};

    assessments[submission.dayNum] = {
      requiresRedo,
      latestScore: numericScore,
      latestComment: review.comment,
      latestReviewedAt: review.reviewedAt,
      assessorName: review.assessorName,
      submissionId: shareId,
      status: requiresRedo ? 'redo_required' : 'approved',
      pendingSubmissionId: null,
    };

    if (requiresRedo) {
      delete completed[submission.dayNum];
    } else {
      completed[submission.dayNum] = true;
    }

    transaction.set(
      submissionRef,
      { status: 'reviewed', review, updatedAt: review.reviewedAt },
      { merge: true }
    );

    transaction.set(
      progressRef,
      {
        completed,
        assessments,
        updatedAt: review.reviewedAt,
      },
      { merge: true }
    );

    return review;
  });
}
