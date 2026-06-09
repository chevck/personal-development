import { Link } from 'react-router-dom';
import { SPEAKLY_SUPPORT_EMAIL, SPEAKLY_SUPPORT_MAILTO } from '../../config/speaklySupport';

export default function PasswordResetEmailSent({ email, onTryDifferentEmail }) {
  const trimmedEmail = email.trim();

  return (
    <div className="space-y-5">
      <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">
        If an account exists for <strong>{trimmedEmail}</strong>, we sent a reset link. Open the
        email and tap the button to choose a new password.
      </p>

      <p className="text-sm text-taskly-muted">
        Didn&apos;t get it? Check spam, or{' '}
        <button
          type="button"
          onClick={onTryDifferentEmail}
          className="font-semibold text-speakly-coral hover:underline"
        >
          try a different email
        </button>
        . Didn&apos;t request this? Contact{' '}
        <a href={SPEAKLY_SUPPORT_MAILTO} className="font-semibold text-speakly-coral hover:underline">
          {SPEAKLY_SUPPORT_EMAIL}
        </a>
        .
      </p>

      <Link
        to="/speakly/login"
        className="flex w-full items-center justify-center rounded-2xl bg-speakly-coral py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(217,93,57,0.35)] transition hover:bg-speakly-coral-hover"
      >
        Back to sign in
      </Link>
    </div>
  );
}
