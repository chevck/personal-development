import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../config/projects';
import { useAuth } from '../contexts/AuthContext';
import { registerWithPassword, signInWithPassword } from '../firebase/auth';
import { isFirebaseConfigured } from '../firebase/config';

export default function SpeechTrainingLogin() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/speech-training';

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await registerWithPassword(email, password);
      } else {
        await signInWithPassword(email, password);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  const isRegister = mode === 'register';

  return (
    <div className="speakly-app min-h-screen bg-white font-speakly text-taskly-ink">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <AppLogo
          projectId={SPEECH_TRAINING_PROJECT_ID}
          variant="logo"
          size="lg"
          linkTo="/"
          className="mb-10"
        />

        <div className="rounded-3xl border border-taskly-border bg-white p-8 shadow-card">
          <h1 className="text-3xl font-bold tracking-tight">Speak With Intention</h1>
          <p className="mt-3 text-base leading-relaxed text-taskly-muted">
            {isRegister
              ? 'Create an account with your email and a password. Your 21-day progress stays tied to that account.'
              : 'Sign in with your email and password to continue your programme.'}
          </p>

          <div className="mt-6 flex rounded-2xl bg-taskly-surface p-1">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                !isRegister ? 'bg-white text-taskly-ink shadow-soft' : 'text-taskly-muted'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                isRegister ? 'bg-white text-taskly-ink shadow-soft' : 'text-taskly-muted'
              }`}
            >
              Create account
            </button>
          </div>

          {!isFirebaseConfigured ? (
            <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Firebase is not configured. Add your Firebase keys to <code>.env</code> and restart
              the dev server.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-wider text-taskly-muted">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-2xl border border-taskly-border bg-white px-4 py-3 text-base outline-none ring-taskly-yellow focus:border-taskly-yellow focus:ring-2"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold uppercase tracking-wider text-taskly-muted">
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
                  className="mt-2 w-full rounded-2xl border border-taskly-border bg-white px-4 py-3 text-base outline-none ring-taskly-yellow focus:border-taskly-yellow focus:ring-2"
                />
              </label>

              {isRegister && (
                <label className="block">
                  <span className="text-sm font-semibold uppercase tracking-wider text-taskly-muted">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="mt-2 w-full rounded-2xl border border-taskly-border bg-white px-4 py-3 text-base outline-none ring-taskly-yellow focus:border-taskly-yellow focus:ring-2"
                  />
                </label>
              )}

              {error && (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !isFirebaseConfigured}
                className="w-full rounded-2xl bg-taskly-ink px-4 py-3 text-base font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? isRegister
                    ? 'Creating account…'
                    : 'Signing in…'
                  : isRegister
                    ? 'Create account'
                    : 'Sign in'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
