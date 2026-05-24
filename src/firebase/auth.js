import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app, isFirebaseConfigured } from './config';

let auth = null;
let signInPromise = null;

if (isFirebaseConfigured && app) {
  auth = getAuth(app);
}

export { auth };

export const isAuthConfigured = Boolean(
  isFirebaseConfigured &&
    process.env.REACT_APP_FIREBASE_EMAIL &&
    process.env.REACT_APP_FIREBASE_PASSWORD
);

export async function ensureFirebaseAuth() {
  if (!auth) {
    throw new Error('Firebase is not configured.');
  }

  if (auth.currentUser) {
    return auth.currentUser;
  }

  const email = process.env.REACT_APP_FIREBASE_EMAIL;
  const password = process.env.REACT_APP_FIREBASE_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Set REACT_APP_FIREBASE_EMAIL and REACT_APP_FIREBASE_PASSWORD in .env, then restart the dev server.'
    );
  }

  if (!signInPromise) {
    signInPromise = signInWithEmailAndPassword(auth, email, password)
      .then((credential) => credential.user)
      .catch((error) => {
        signInPromise = null;
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
          throw new Error('Firebase sign-in failed. Check REACT_APP_FIREBASE_EMAIL and REACT_APP_FIREBASE_PASSWORD.');
        }
        if (error.code === 'auth/user-not-found') {
          throw new Error('Firebase user not found. Create this email in Firebase Console → Authentication.');
        }
        throw new Error(error.message || 'Firebase sign-in failed.');
      });
  }

  return signInPromise;
}
