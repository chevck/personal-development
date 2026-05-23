import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isStorageConfigured } from '../firebase/config';
import { getUserId } from './userId';

export function buildRecordingPath(dayNum) {
  const userId = getUserId();
  return `speech-training/${userId}/day-${dayNum}/${Date.now()}.webm`;
}

export async function uploadDayRecording(dayNum, blob) {
  if (!isStorageConfigured || !storage) {
    throw new Error('Firebase Storage is not configured. Add REACT_APP_FIREBASE_STORAGE_BUCKET to .env.local');
  }

  const storagePath = buildRecordingPath(dayNum);
  const storageRef = ref(storage, storagePath);
  const contentType = blob.type || 'audio/webm';

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
  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}
