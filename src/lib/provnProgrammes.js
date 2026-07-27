import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";
import { incrementAssessorStudentCount } from "./personaAssessorDirectory";

export const PROVN_PROGRAMMES_COLLECTION = "provn_programmes";

/**
 * A learner's generated daily programme for a track—written server-side by
 * the Provn task-generation backend (`/provn-api/task/create`), not created
 * client-side. Docs have auto-generated ids, so they're found by querying
 * on the `userId`/`track` fields the backend stamps onto each one.
 */
export async function getProvnProgramme(uid, track) {
  if (!isFirebaseConfigured || !db || !uid || !track) return null;
  try {
    const programmesQuery = query(
      collection(db, PROVN_PROGRAMMES_COLLECTION),
      where("userId", "==", uid),
      where("track", "==", track),
      limit(1),
    );
    const snap = await getDocs(programmesQuery);
    if (snap.empty) return null;

    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.log("error fetching data", error, error.data);
  }
}

function programmeDocRef(programmeId) {
  return doc(db, PROVN_PROGRAMMES_COLLECTION, programmeId);
}

/** Assessor picks are permanent—refuses to overwrite an existing assignment. */
export async function assignProgrammeAssessor(programmeId, { assessorId, assessorName }) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const ref = programmeDocRef(programmeId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("We couldn't find that programme.");
  }
  if (snap.data().assignedAssessorId) {
    throw new Error("An assessor is already assigned for this skill.");
  }

  await updateDoc(ref, {
    assignedAssessorId: assessorId,
    assignedAssessorName: assessorName,
    updatedAt: new Date().toISOString(),
  });
  await incrementAssessorStudentCount(assessorId);
}

/** Training can't start until an assessor is locked in for this programme. */
export async function startProgrammeTraining(programmeId) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }

  const ref = programmeDocRef(programmeId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("We couldn't find that programme.");
  }
  if (!snap.data().assignedAssessorId) {
    throw new Error("Select an assessor before starting training.");
  }

  await updateDoc(ref, {
    trainingStarted: true,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Submits a task's work (a link and/or image URLs, plus an optional note)
 * to the learner's assigned assessor. Firestore has no way to update a
 * single array element in place, so this rewrites the whole `tasks` array
 * with the matching entry replaced. Returns the updated array so the caller
 * can update its local state without a second read.
 */
export async function submitProgrammeTask(
  programmeId,
  taskId,
  { link = "", imageUrls = [], note = "" },
) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured.");
  }
  if (!link && imageUrls.length === 0) {
    throw new Error("Add a link or at least one image before submitting.");
  }

  const ref = programmeDocRef(programmeId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("We couldn't find that programme.");
  }

  const submittedAt = new Date().toISOString();
  const tasks = (snap.data().tasks || []).map((task) =>
    task.id === taskId
      ? {
          ...task,
          submission: {
            link,
            imageUrls,
            note,
            submittedAt,
            status: "pending",
          },
        }
      : task,
  );

  await updateDoc(ref, { tasks, updatedAt: submittedAt });
  return tasks;
}
