import { Link } from 'react-router-dom';
import AppLogo from '../../components/AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import { useAuth } from '../../contexts/AuthContext';

export default function AssessorHome() {
  const { user, signOut } = useAuth();

  return (
    <div className="speakly-app min-h-screen bg-gradient-to-b from-speakly-coral-light via-white to-speakly-coral-muted/40 font-speakly text-speakly-ink">
      <header className="border-b border-speakly-coral-ring/50 bg-white/80 px-6 py-4 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="logo" size="md" linkTo="/" />
          <button
            type="button"
            onClick={() => signOut()}
            className="text-sm font-semibold text-taskly-muted transition hover:text-speakly-coral"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="step-in overflow-hidden rounded-3xl border border-speakly-coral-ring/60 bg-white p-8 shadow-card md:p-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-speakly-coral-muted px-4 py-1.5 text-sm font-bold text-speakly-coral-dark">
            <span className="h-2 w-2 rounded-full bg-speakly-coral" />
            Assessor account
          </span>

          <h1 className="font-display mt-5 text-3xl font-medium tracking-tight md:text-4xl">
            You&apos;re set up to review
          </h1>
          <p className="mt-4 text-base leading-relaxed text-taskly-muted">
            Learners share a private link when they want feedback. Open that link to listen, score
            their practice (5+ completes their day), and leave notes—one review per submission.
          </p>

          {user?.email && (
            <p className="mt-6 rounded-2xl bg-taskly-surface px-4 py-3 text-sm text-taskly-muted">
              Signed in as{' '}
              <span className="font-semibold text-taskly-ink">{user.email}</span>
            </p>
          )}

          <ul className="mt-8 space-y-3 text-base text-taskly-ink">
            <li className="flex gap-3 rounded-2xl bg-speakly-coral-light/80 px-4 py-3">
              <span aria-hidden>1.</span>
              <span>Learners send you an assess link after they record a day.</span>
            </li>
            <li className="flex gap-3 rounded-2xl bg-speakly-coral-light/80 px-4 py-3">
              <span aria-hidden>2.</span>
              <span>Listen, score 1–10, and add optional written feedback.</span>
            </li>
            <li className="flex gap-3 rounded-2xl bg-speakly-coral-light/80 px-4 py-3">
              <span aria-hidden>3.</span>
              <span>Only the first review on each link counts—then it closes.</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-center text-sm text-taskly-muted">
          <Link to="/speakly/welcome" className="font-semibold text-speakly-coral hover:underline">
            About Speakly
          </Link>
          {' · '}
          <Link to="/" className="font-semibold text-speakly-coral hover:underline">
            Persona home
          </Link>
        </p>
      </main>
    </div>
  );
}
