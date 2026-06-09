import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SpeaklyAuthLayout from '../components/speakly/SpeaklyAuthLayout';
import SpeaklyAuthRedirect from '../components/speakly/SpeaklyAuthRedirect';
import { signInWithPassword } from '../firebase/auth';
import { isFirebaseConfigured } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

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

export default function SpeechTrainingSignIn() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const passwordReset = location.state?.passwordReset;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!loading && user) {
    return <SpeaklyAuthRedirect />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SpeaklyAuthLayout
      title="Sign in"
      subtitle="Welcome back—learners continue their programme; assessors open review links from learners."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/speakly/register"
            className="font-bold text-taskly-ink underline-offset-2 hover:underline"
          >
            Create account
          </Link>
        </>
      }
    >
      {!isFirebaseConfigured ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Firebase is not configured. Add your Firebase keys to <code>.env</code> and restart the
          dev server.
        </p>
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

          <label className="block">
            <FieldLabel required>Password</FieldLabel>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-taskly-muted hover:text-taskly-ink"
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="mt-2 text-right">
              <Link
                to="/speakly/forgot-password"
                className="text-sm font-semibold text-speakly-coral transition hover:text-speakly-coral-dark"
              >
                Forgot password?
              </Link>
            </p>
          </label>

          {passwordReset && (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
              Your password was updated. Sign in with your new password.
            </p>
          )}

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
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20">
              →
            </span>
            {submitting ? 'Signing in…' : 'Sign in now'}
          </button>
        </form>
      )}
    </SpeaklyAuthLayout>
  );
}
