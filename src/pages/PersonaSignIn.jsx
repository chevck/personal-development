import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import PersonaAuthLayout from "../components/persona/PersonaAuthLayout";
import PersonaAuthRedirect from "../components/persona/PersonaAuthRedirect";
import { useAuth } from "../contexts/AuthContext";
import { signInWithPassword } from "../firebase/auth";
import { isFirebaseConfigured } from "../firebase/config";
import { showErrorToast } from "../lib/toast";

const inputClassName =
  "mt-1.5 w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-base text-persona-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-persona-lavender-deep transition focus:ring-2 focus:ring-persona-purple";

function FieldLabel({ children, required }) {
  return (
    <span className='text-sm font-bold text-persona-ink'>
      {children}
      {required && <span className='text-red-500'> *</span>}
    </span>
  );
}

export default function PersonaSignIn() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    // A protected page sent them here; return them to it after sign-in.
    const from = location.state?.from;
    if (from?.pathname) {
      return <Navigate to={from} replace />;
    }
    return <PersonaAuthRedirect />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      showErrorToast(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PersonaAuthLayout
      title='Sign in to Provn'
      subtitle='Welcome back—one account for everything you train or assess.'
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            to='/register'
            className='font-bold text-persona-ink underline-offset-2 hover:underline'
          >
            Create account
          </Link>
        </>
      }
    >
      {!isFirebaseConfigured ? (
        <p className='px-4 py-3 text-sm rounded-2xl bg-amber-50 text-amber-900'>
          Firebase is not configured. Add your Firebase keys to{" "}
          <code>.env</code> and restart the dev server.
        </p>
      ) : (
        <form className='space-y-5' onSubmit={handleSubmit}>
          <label className='block'>
            <FieldLabel required>Email</FieldLabel>
            <input
              type='email'
              name='email'
              autoComplete='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              className={inputClassName}
            />
          </label>

          <label className='block'>
            <FieldLabel required>Password</FieldLabel>
            <div className='relative'>
              <input
                type={showPassword ? "text" : "password"}
                name='password'
                autoComplete='current-password'
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Your password'
                className={inputClassName}
              />
              <button
                type='button'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute text-xs font-semibold -translate-y-1/2 right-4 top-1/2 text-persona-muted hover:text-persona-ink'
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className='mt-2 text-right'>
              <Link
                to='/speakly/forgot-password'
                className='text-sm font-semibold transition text-persona-purple hover:text-persona-purple-dark'
              >
                Forgot password?
              </Link>
            </p>
          </label>

          <button
            type='submit'
            disabled={submitting}
            className='flex w-full items-center justify-center gap-3 rounded-2xl bg-persona-purple py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(14,174,110,0.35)] transition hover:bg-persona-purple-hover disabled:opacity-50'
          >
            <span className='flex items-center justify-center w-8 h-8 rounded-full bg-black/20'>
              →
            </span>
            {submitting ? "Signing in…" : "Sign in now"}
          </button>
        </form>
      )}
    </PersonaAuthLayout>
  );
}
