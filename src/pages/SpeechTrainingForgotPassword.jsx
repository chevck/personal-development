import { useState } from 'react';
import { Link } from 'react-router-dom';
import SpeaklyAuthLayout from '../components/speakly/SpeaklyAuthLayout';
import PasswordResetEmailSent from '../components/speakly/PasswordResetEmailSent';
import { requestPasswordResetEmail } from '../firebase/auth';
import { isFirebaseConfigured } from '../firebase/config';

const inputClassName =
  'mt-1.5 w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-base text-speakly-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-speakly-coral-ring/80 transition focus:ring-2 focus:ring-speakly-coral';

function FieldLabel({ children, required }) {
  return (
    <span className="text-sm font-bold text-taskly-ink">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </span>
  );
}

export default function SpeechTrainingForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await requestPasswordResetEmail(email);
      setEmailSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleTryDifferentEmail() {
    setEmailSent(false);
    setError(null);
    setEmail('');
  }

  return (
    <SpeaklyAuthLayout
      title={emailSent ? 'Check your email' : 'Reset your password'}
      subtitle={
        emailSent
          ? 'Open the link in that message to set a new password.'
          : 'Enter your account email and we will send you a link to choose a new password in Speakly.'
      }
      footer={
        emailSent ? null : (
          <>
            Remembered your password?{' '}
            <Link
              to="/speakly/login"
              className="font-bold text-taskly-ink underline-offset-2 hover:underline"
            >
              Sign in
            </Link>
          </>
        )
      }
    >
      {!isFirebaseConfigured ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Firebase is not configured. Add your Firebase keys to <code>.env</code> and restart the
          dev server.
        </p>
      ) : emailSent ? (
        <PasswordResetEmailSent email={email} onTryDifferentEmail={handleTryDifferentEmail} />
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <FieldLabel required>Email</FieldLabel>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClassName}
            />
          </label>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-speakly-coral py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(217,93,57,0.35)] transition hover:bg-speakly-coral-hover disabled:opacity-50"
          >
            {submitting ? 'Sending reset email…' : 'Send reset email'}
          </button>
        </form>
      )}
    </SpeaklyAuthLayout>
  );
}
