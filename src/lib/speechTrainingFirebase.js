import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isStorageConfigured } from '../firebase/config';
import { requireAuthUser } from '../firebase/auth';
import { extensionForMimeType, normalizeMimeType } from './audioRecording';
import { getUserId } from './userId';

export function buildRecordingPath(dayNum, mimeType) {
  const userId = getUserId();
  const ext = extensionForMimeType(mimeType);
  return `speech-training/${userId}/day-${dayNum}/${Date.now()}.${ext}`;
}

export async function uploadDayRecording(dayNum, blob) {
  if (!isStorageConfigured || !storage) {
    throw new Error('Firebase Storage is not configured. Add REACT_APP_FIREBASE_STORAGE_BUCKET to .env');
  }

  await requireAuthUser();

  const contentType = normalizeMimeType(blob.type || 'audio/webm');
  const storagePath = buildRecordingPath(dayNum, contentType);
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob, { contentType });
  const downloadUrl = await getDownloadURL(storageRef);

  return {
    storagePath,
    downloadUrl,
    mimeType: contentType,
    sizeBytes: blob.size,
  };
}

export async function deleteDayRecording(storagePath) {
  if (!isStorageConfigured || !storage || !storagePath) return;
  await requireAuthUser();
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}
