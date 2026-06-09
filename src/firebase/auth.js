import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { app, isFirebaseConfigured } from "./config";
import apiClient, { getApiErrorMessage } from "../lib/apiClient";

let auth = null;

if (isFirebaseConfigured && app) {
  auth = getAuth(app);
}

export { auth };

const MIN_PASSWORD_LENGTH = 6;

export function normalizeEmail(email) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid email address.");
  }
  return normalized;
}

export function validatePassword(password, { confirm } = {}) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }
  if (confirm !== undefined && password !== confirm) {
    throw new Error("Passwords do not match.");
  }
}

function formatAuthError(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Sign in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Incorrect email or password.";
    case "auth/user-not-found":
      return "No account found for this email. Create an account instead.";
    case "auth/weak-password":
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/expired-action-code":
      return "This reset link has expired. Request a new password reset email.";
    case "auth/invalid-action-code":
      return "This reset link is invalid or has already been used. Request a new one.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    default:
      return error.message || "Authentication failed.";
  }
}

export async function requestPasswordResetEmail(email) {
  if (!email) return "";

  if (!auth) {
    throw new Error("Firebase is not configured.");
  }

  const cleanEmail = normalizeEmail(email);

  try {
    await apiClient.post(
      "/speakly-api/auth/reset-password",
      { email: cleanEmail },
      {
        toast: {
          loading: "Sending reset email…",
          success: "Reset email sent. Check your inbox.",
          error: "Could not send reset email.",
        },
      },
    );
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not send reset email."));
  }
}

export async function verifyResetToken(token) {
  const cleanToken = String(token || "").trim();
  if (!cleanToken) {
    throw new Error("This reset link is missing or invalid.");
  }

  try {
    const { data } = await apiClient.get("/speakly-api/auth/verify-reset-token", {
      params: { token: cleanToken },
      toast: false,
    });
    return {
      email: data?.email || data?.user?.email || "",
      ...data,
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, "This reset link is invalid or has expired."),
    );
  }
}

export async function confirmResetPassword(token, newPassword) {
  const cleanToken = String(token || "").trim();
  if (!cleanToken) {
    throw new Error("This reset link is missing or invalid.");
  }

  validatePassword(newPassword);

  try {
    await apiClient.post(
      "/speakly-api/auth/confirm-reset-password",
      { token: cleanToken, newPassword },
      {
        toast: {
          loading: "Updating password…",
          success: "Password updated. Sign in with your new password.",
          error: "Could not update password.",
        },
      },
    );
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update password."));
  }
}

export async function signInWithPassword(email, password) {
  if (!auth) {
    throw new Error("Firebase is not configured.");
  }

  try {
    const normalized = normalizeEmail(email);
    validatePassword(password);
    const credential = await signInWithEmailAndPassword(
      auth,
      normalized,
      password,
    );
    return credential.user;
  } catch (error) {
    if (error.message && !error.code) throw error;
    throw new Error(formatAuthError(error));
  }
}

export async function registerWithPassword(
  email,
  password,
  { displayName } = {},
) {
  if (!auth) {
    throw new Error("Firebase is not configured.");
  }

  try {
    const normalized = normalizeEmail(email);
    validatePassword(password);
    const credential = await createUserWithEmailAndPassword(
      auth,
      normalized,
      password,
    );
    const name = displayName?.trim();
    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }
    return credential.user;
  } catch (error) {
    if (error.message && !error.code) throw error;
    throw new Error(formatAuthError(error));
  }
}

export async function requireAuthUser() {
  if (!auth) {
    throw new Error("Firebase is not configured.");
  }
  if (!auth.currentUser) {
    throw new Error("You must be signed in to continue.");
  }
  return auth.currentUser;
}
