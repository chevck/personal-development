const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const MIN_PASSWORD_LENGTH = 6;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

exports.resetSpeaklyPassword = functions.https.onCall(async (request) => {
  const email = normalizeEmail(request.data?.email);
  const newPassword = String(request.data?.newPassword || '');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Enter a valid email address.');
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    );
  }

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      throw new functions.https.HttpsError('not-found', 'No account found for this email.');
    }
    throw new functions.https.HttpsError('internal', 'Could not look up this account.');
  }

  await admin.auth().updateUser(userRecord.uid, { password: newPassword });

  return { success: true };
});
