import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";
import { incrementAssessorStudentCount } from "./personaAssessorDirectory";

export const PERSONA_SKILL_PROGRESS_COLLECTION = "persona_skill_progress";

function progressDocRef(uid, skillId) {
  return doc(db, PERSONA_SKILL_PROGRESS_COLLECTION, uid, "skills", skillId);
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function addDaysToKey(key, delta) {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/**
 * Pure streak calculation from a task list's `completedAt` date keys
 * (YYYY-MM-DD). A day still counts toward the current streak if it's
 * yesterday and today hasn't happened yet.
 */
export function computeStreak(tasks, referenceDate = new Date()) {
  const completedDates = new Set(
    (tasks || [])
      .filter((task) => task.completed && task.completedAt)
      .map((task) => task.completedAt),
  );

  if (completedDates.size === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...completedDates].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    run = addDaysToKey(sorted[i - 1], 1) === sorted[i] ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const today = todayKey(referenceDate);
  let cursor = completedDates.has(today) ? today : addDaysToKey(today, -1);
  let current = 0;
  while (completedDates.has(cursor)) {
    current += 1;
    cursor = addDaysToKey(cursor, -1);
  }

  return { current, longest };
}

export async function getSkillProgress(uid, skillId) {
  if (!isFirebaseConfigured || !db || !uid || !skillId) return null;
  const snap = await getDoc(progressDocRef(uid, skillId));
  return snap.exists() ? snap.data() : null;
}

export async function createSkillProgress(uid, skillId, { track, answers, tasks }) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const now = new Date().toISOString();
  const data = {
    uid,
    skillId,
    track,
    answers,
    tasks,
    streak: computeStreak(tasks),
    assignedAssessorId: null,
    assignedAssessorName: null,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(progressDocRef(uid, skillId), data);
  return data;
}

export async function completeSkillTask(uid, skillId, day) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const progress = await getSkillProgress(uid, skillId);
  if (!progress) {
    throw new Error("No progress found for this skill.");
  }

  const completedAt = todayKey();
  const tasks = progress.tasks.map((task) =>
    task.day === day && !task.completed
      ? { ...task, completed: true, completedAt }
      : task,
  );
  const streak = computeStreak(tasks);

  await updateDoc(progressDocRef(uid, skillId), {
    tasks,
    streak,
    updatedAt: new Date().toISOString(),
  });

  return { tasks, streak };
}

/**
 * Submits a task's work (a link and/or image URLs, plus an optional note) to
 * the learner's assigned assessor, and marks the task complete.
 */
export async function submitSkillTask(uid, skillId, day, { link = "", imageUrls = [], note = "" }) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }
  if (!link && imageUrls.length === 0) {
    throw new Error("Add a link or at least one image before submitting.");
  }

  const progress = await getSkillProgress(uid, skillId);
  if (!progress) {
    throw new Error("No progress found for this skill.");
  }
  if (!progress.assignedAssessorId) {
    throw new Error("Pick an assessor before submitting a task.");
  }

  const submittedAt = new Date().toISOString();
  const completedAt = todayKey();
  const tasks = progress.tasks.map((task) => {
    if (task.day !== day) return task;
    const previous = task.submission;
    return {
      ...task,
      completed: true,
      completedAt: task.completedAt || completedAt,
      submission: {
        link,
        imageUrls,
        note,
        submittedAt,
        status: "pending",
        reviewComment: null,
        reviewedAt: null,
        reviewDurationSeconds: previous?.reviewDurationSeconds || 0,
        previousReviewComment: previous?.reviewComment ?? previous?.previousReviewComment ?? null,
      },
    };
  });
  const streak = computeStreak(tasks);

  await updateDoc(progressDocRef(uid, skillId), {
    tasks,
    streak,
    updatedAt: submittedAt,
  });

  return { tasks, streak };
}

/**
 * Flattens every assigned learner's tasks into submission queue entries,
 * split by what's actionable for the assessor vs. waiting on the learner.
 */
export function summarizeAssignedLearners(learnerDocs) {
  const studentUids = new Set((learnerDocs || []).map((doc) => doc.uid));
  const awaitingReview = [];
  const pendingResponse = [];
  let reviewSeconds = 0;

  for (const learnerDoc of learnerDocs || []) {
    for (const task of learnerDoc.tasks || []) {
      if (!task.submission) continue;
      reviewSeconds += task.submission.reviewDurationSeconds || 0;

      const entry = { learner: learnerDoc, task };
      if (task.submission.status === "pending") {
        awaitingReview.push(entry);
      } else if (task.submission.status === "changes_requested") {
        pendingResponse.push(entry);
      }
    }
  }

  awaitingReview.sort(
    (a, b) => new Date(a.task.submission.submittedAt) - new Date(b.task.submission.submittedAt),
  );
  pendingResponse.sort(
    (a, b) => new Date(b.task.submission.reviewedAt) - new Date(a.task.submission.reviewedAt),
  );

  return {
    studentCount: studentUids.size,
    hoursReviewing: Math.round((reviewSeconds / 3600) * 10) / 10,
    awaitingReview,
    pendingResponse,
  };
}

/**
 * Every skill-progress doc this assessor is assigned to, across all
 * learners—powers the assessor's students list and submission queues.
 */
export async function getAssignedLearners(assessorUid) {
  if (!isFirebaseConfigured || !db || !assessorUid) return [];

  const assignedQuery = query(
    collectionGroup(db, "skills"),
    where("assignedAssessorId", "==", assessorUid),
  );
  const snap = await getDocs(assignedQuery);
  return snap.docs.map((entry) => entry.data());
}

/**
 * Assessor reviews a submitted task: approve (marks it complete) or request
 * changes (reopens it for the learner to resubmit). Tracks how long the
 * review took, in seconds, so it accumulates into real "hours reviewing".
 */
export async function reviewSkillSubmission(
  learnerUid,
  skillId,
  day,
  { outcome, comment = "", reviewDurationSeconds = 0 },
) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }
  if (outcome !== "approved" && outcome !== "changes_requested") {
    throw new Error("Invalid review outcome.");
  }

  const progress = await getSkillProgress(learnerUid, skillId);
  if (!progress) {
    throw new Error("No progress found for this skill.");
  }

  const reviewedAt = new Date().toISOString();
  const approved = outcome === "approved";

  const tasks = progress.tasks.map((task) => {
    if (task.day !== day || !task.submission) return task;
    return {
      ...task,
      completed: approved,
      completedAt: approved ? task.completedAt || todayKey() : null,
      submission: {
        ...task.submission,
        status: approved ? "approved" : "changes_requested",
        reviewComment: comment,
        reviewedAt,
        reviewDurationSeconds:
          (task.submission.reviewDurationSeconds || 0) + Math.max(0, reviewDurationSeconds),
      },
    };
  });
  const streak = computeStreak(tasks);

  await updateDoc(progressDocRef(learnerUid, skillId), {
    tasks,
    streak,
    updatedAt: reviewedAt,
  });

  return { tasks, streak };
}

/** Assessor picks are permanent—refuses to overwrite an existing assignment. */
export async function assignSkillAssessor(uid, skillId, { assessorId, assessorName }) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const progress = await getSkillProgress(uid, skillId);
  if (progress?.assignedAssessorId) {
    throw new Error("An assessor is already assigned for this skill.");
  }

  await updateDoc(progressDocRef(uid, skillId), {
    assignedAssessorId: assessorId,
    assignedAssessorName: assessorName,
    updatedAt: new Date().toISOString(),
  });
  await incrementAssessorStudentCount(assessorId);
}
