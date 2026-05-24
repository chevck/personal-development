import { auth } from '../firebase/auth';

const STORAGE_KEY = 'persona-dev-user-id';

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function getUserId() {
  if (auth?.currentUser?.uid) {
    return auth.currentUser.uid;
  }

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = createId();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
