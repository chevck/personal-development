import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { isStorageConfigured, storage } from "../firebase/config";

export const MAX_SUBMISSION_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_SUBMISSION_IMAGES = 4;

function sanitizeFileName(name) {
  return (name || "file").replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function validateSubmissionImage(file) {
  if (!file.type?.startsWith("image/")) {
    throw new Error("Only image files can be attached.");
  }
  if (file.size > MAX_SUBMISSION_IMAGE_BYTES) {
    throw new Error("Images must be under 8MB.");
  }
}

/** Uploads one image for a task submission and returns its public URL. */
export async function uploadTaskSubmissionImage(uid, skillId, day, file) {
  if (!isStorageConfigured || !storage) {
    throw new Error(
      "Firebase Storage is not configured. Add REACT_APP_FIREBASE_STORAGE_BUCKET to .env",
    );
  }

  validateSubmissionImage(file);

  const storagePath = `skill_task_submissions/${uid}/${skillId}/day-${day}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, { contentType: file.type });
  const downloadUrl = await getDownloadURL(storageRef);

  return { storagePath, downloadUrl };
}

export function normalizeSubmissionLink(link) {
  const trimmed = link?.trim() ?? "";
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
