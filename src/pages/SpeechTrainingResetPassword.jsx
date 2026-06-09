import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import SpeaklyAuthLayout from '../components/speakly/SpeaklyAuthLayout';
import { SPEAKLY_SUPPORT_EMAIL } from '../config/speaklySupport';
import {
  completePasswordReset,
  validatePassword,
  verifyPasswordResetRequest,
} from '../firebase/auth';
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

export default function SpeechTrainingResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode') || '';
  const mode = searchParams.get('mode') || '';

  const [accountEmail, setAccountEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const linkIsValid = useMemo(() => Boolean(oobCode) && mode === 'resetPassword', [mode, oobCode]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setVerifying(false);
      return;
    }

    if (!linkIsValid) {
      setError('This reset link is missing or invalid. Request a new password reset email.');
      setVerifying(false);
      return;
    }

    let cancelled = false;

    async function verifyLink() {
      setVerifying(true);
      setError(null);

      try {
        const email = await verifyPasswordResetRequest(oobCode);
        if (!cancelled) {
          setAccountEmail(email);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'This reset link is invalid or has expired.');
        }
      } finally {
        if (!cancelled) {
          setVerifying(false);
        }
      }
    }

    verifyLink();

    return () => {
      cancelled = true;
    };
  }, [linkIsValid, oobCode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      validatePassword(password, { confirm: confirmPassword });
      await completePasswordReset(oobCode, password);
      navigate('/speakly/login', {
        replace: true,
        state: { passwordReset: true },
      });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SpeaklyAuthLayout
      title="Choose a new password"
      subtitle={
        accountEmail
          ? `Set a new password for ${accountEmail}.`
          : 'Confirm your new password to finish resetting your account.'
      }
      footer={
        <>
          Remembered your password?{' '}
          <Link
            to="/speakly/login"
            className="font-bold text-taskly-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {!isFirebaseConfigured ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Firebase is not configured. Add your Firebase keys to <code>.env</code> and restart the
          dev server.
        </p>
      ) : verifying ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-sm text-taskly-muted shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          Checking your reset link…
        </p>
      ) : error && !accountEmail ? (
        <div className="space-y-4">
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
          <Link
            to="/speakly/forgot-password"
            className="inline-flex rounded-2xl bg-speakly-coral px-5 py-3 text-sm font-bold text-white hover:bg-speakly-coral-hover"
          >
            Request a new reset email
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <FieldLabel required>New password</FieldLabel>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-taskly-muted hover:text-taskly-ink"
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <label className="block">
            <FieldLabel required>Confirm new password</FieldLabel>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your new password"
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
            {submitting ? 'Updating password…' : 'Save new password'}
          </button>
        </form>
      )}
    </SpeaklyAuthLayout>
  );
}
