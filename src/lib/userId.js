import { auth } from '../firebase/auth';

export function getUserId() {
  const uid = auth?.currentUser?.uid;
  if (!uid) {
    throw new Error('You must be signed in.');
  }
  return uid;
}

export function getUserEmail() {
  return auth?.currentUser?.email || null;
}
