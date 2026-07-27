import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { isStorageConfigured, storage } from "../firebase/config";

export const MAX_ASSESSOR_PHOTO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_ASSESSOR_PHOTO_TYPES = ["image/png", "image/jpeg"];

export const MAX_ASSESSOR_ID_DOCUMENT_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_ASSESSOR_ID_DOCUMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
];

function sanitizeFileName(name) {
  return (name || "file").replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function validateAssessorPhoto(file) {
  if (!ACCEPTED_ASSESSOR_PHOTO_TYPES.includes(file.type)) {
    throw new Error("Your photo must be a PNG or JPG file.");
  }
  if (file.size > MAX_ASSESSOR_PHOTO_BYTES) {
    throw new Error("Your photo must be under 5MB.");
  }
}

export function validateAssessorIdDocument(file) {
  if (!ACCEPTED_ASSESSOR_ID_DOCUMENT_TYPES.includes(file.type)) {
    throw new Error("Upload your ID as a PDF, PNG, or JPG file.");
  }
  if (file.size > MAX_ASSESSOR_ID_DOCUMENT_BYTES) {
    throw new Error("Your ID file must be under 8MB.");
  }
}

function assertStorageConfigured() {
  if (!isStorageConfigured || !storage) {
    throw new Error(
      "Firebase Storage is not configured. Add REACT_APP_FIREBASE_STORAGE_BUCKET to .env",
    );
  }
}

/** Uploads an assessor's KYC profile photo and returns its download URL. */
export async function uploadAssessorPhoto(uid, file) {
  assertStorageConfigured();
  validateAssessorPhoto(file);

  const storagePath = `assessor_kyc/${uid}/photo-${Date.now()}-${sanitizeFileName(file.name)}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

/** Uploads an assessor's KYC ID document and returns its download URL. */
export async function uploadAssessorIdDocument(uid, file) {
  assertStorageConfigured();
  validateAssessorIdDocument(file);

  const storagePath = `assessor_kyc/${uid}/id-${Date.now()}-${sanitizeFileName(file.name)}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
