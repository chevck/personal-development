import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  setDoc,
  where,
} from 'firebase/firestore';
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

function generateShareCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

export function buildSubmissionDocId(shareCode, dayNum, recordingNum) {
  return `${shareCode}-day-${dayNum}-recording-${recordingNum}`;
}

export function buildAssessUrl(shareCode, dayNum, recordingNum) {
  return `${window.location.origin}/${shareCode}/day-${dayNum}/recording-${recordingNum}`;
}

export function parseAssessPathSegments(userCode, daySegment, recordingSegment) {
  const code = String(userCode || '');
  const dayMatch = String(daySegment || '').match(/^day-(\d+)$/i);
  const recordingMatch = String(recordingSegment || '').match(/^recording-(\d+)$/i);
  if (!/^\d{5}$/.test(code) || !dayMatch || !recordingMatch) {
    return null;
  }
  const dayNum = Number(dayMatch[1]);
  const recordingNum = Number(recordingMatch[1]);
  if (dayNum < 1 || recordingNum < 1) {
    return null;
  }
  return { shareCode: code, dayNum, recordingNum };
}

export function resolveSubmissionDocId({
  shareId,
  userCode,
  dayNum,
  recordingNum,
  daySegment,
  recordingSegment,
}) {
  if (shareId) {
    return shareId;
  }

  const parsed =
    daySegment != null && recordingSegment != null
      ? parseAssessPathSegments(userCode, daySegment, recordingSegment)
      : null;

  const code = parsed?.shareCode ?? String(userCode || '');
  const day = parsed?.dayNum ?? Number(dayNum);
  const recording = parsed?.recordingNum ?? Number(recordingNum);

  if (!/^\d{5}$/.test(code) || !Number.isFinite(day) || day < 1 || !Number.isFinite(recording) || recording < 1) {
    return null;
  }
  return buildSubmissionDocId(code, day, recording);
}

async function isShareCodeTaken(shareCode, excludeUserId) {
  const snap = await getDocs(
    query(collection(db, PROGRESS_PATH), where('shareCode', '==', shareCode), limit(5))
  );
  return snap.docs.some((d) => d.id !== excludeUserId);
}

async function allocateShareCode(excludeUserId, attemptsLeft = 12) {
  if (attemptsLeft <= 0) {
    throw new Error('Could not create a share code. Please try again.');
  }
  const candidate = generateShareCode();
  const taken = await isShareCodeTaken(candidate, excludeUserId);
  if (!taken) return candidate;
  return allocateShareCode(excludeUserId, attemptsLeft - 1);
}

export async function ensureUserShareCode(userId) {
  const progressRef = doc(db, PROGRESS_PATH, userId);
  const progressSnap = await getDoc(progressRef);
  if (progressSnap.exists() && progressSnap.data().shareCode) {
    return progressSnap.data().shareCode;
  }

  const shareCode = await allocateShareCode(userId);

  await setDoc(
    progressRef,
    {
      shareCode,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return shareCode;
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

  const shareCode = await ensureUserShareCode(userId);
  const lastRecordingNum = assessments[dayNum]?.lastRecordingNum || 0;
  const recordingNum = lastRecordingNum + 1;
  const submissionDocId = buildSubmissionDocId(shareCode, dayNum, recordingNum);
  const submissionRef = doc(db, SUBMISSIONS_PATH, submissionDocId);

  await setDoc(submissionRef, {
    shareId: submissionDocId,
    shareCode,
    dayNum,
    recordingNum,
    userId,
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
    pendingSubmissionId: submissionDocId,
    lastRecordingNum: recordingNum,
    status: 'pending_review',
    sharedAt: new Date().toISOString(),
    requiresRedo: false,
  };

  await setDoc(
    progressRef,
    { assessments, updatedAt: new Date().toISOString() },
    { merge: true }
  );

  return {
    shareCode,
    dayNum,
    recordingNum,
    submissionDocId,
    url: buildAssessUrl(shareCode, dayNum, recordingNum),
  };
}

export async function getSubmission(submissionDocId) {
  if (!isFirebaseConfigured || !db || !submissionDocId) return null;
  const snap = await getDoc(doc(db, SUBMISSIONS_PATH, submissionDocId));
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

export async function submitAssessmentReview(submissionDocId, { score, comment, assessorName }) {
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

  const submissionRef = doc(db, SUBMISSIONS_PATH, submissionDocId);

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
      submissionId: submissionDocId,
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
