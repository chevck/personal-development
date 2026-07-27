import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
import {
  PERSONA_ACCOUNTABILITY_OPTIONS,
  PERSONA_LEARNING_TOPICS,
  PERSONA_WAITLIST_HEARD_ABOUT,
  PERSONA_WAITLIST_PRICING_PREFERENCES,
} from '../config/personaWaitlist';
import { isFirebaseConfigured } from '../firebase/config';
import { submitPersonaWaitlist } from '../lib/personaWaitlist';

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-persona-border bg-white px-4 py-3 text-base text-persona-ink outline-none transition placeholder:text-persona-muted/60 focus:border-persona-purple focus:ring-2 focus:ring-persona-purple/20';

const textareaClassName = `${inputClassName} resize-y`;

function WaitlistShell({ title, subtitle, footer, children }) {
  return (
    <div className="persona-landing min-h-screen bg-white font-sans text-persona-ink antialiased">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_60%_60%_at_50%_-15%,rgba(14,174,110,0.08),transparent)]"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-persona-border bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-4 px-6">
          <Link to="/" className="inline-flex items-center gap-2.5 no-underline">
            <AppLogo variant="logo" size="sm" className="rounded-lg" />
            <span className="text-base font-bold tracking-tight text-persona-ink">Provn</span>
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-persona-muted transition hover:text-persona-ink"
          >
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-persona-purple">
            Waitlist
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-persona-ink md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 text-base leading-relaxed text-persona-muted">
              {subtitle}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-persona-border bg-white p-6 shadow-[0_1px_2px_rgba(23,19,31,0.04),0_12px_32px_-12px_rgba(23,19,31,0.08)] md:p-8">
          {children}
        </div>

        {footer && <div className="mt-8 text-center text-sm text-persona-muted">{footer}</div>}
      </main>
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <span className="text-sm font-semibold text-persona-ink">
      {children}
      {required && <span className="text-persona-purple"> *</span>}
    </span>
  );
}

function SectionTitle({ children, subtitle }) {
  return (
    <div className="border-t border-persona-border pt-8 first:border-0 first:pt-0">
      <h2 className="text-lg font-bold tracking-tight text-persona-ink">{children}</h2>
      {subtitle && <p className="mt-1 text-sm leading-relaxed text-persona-muted">{subtitle}</p>}
    </div>
  );
}

function toggleInList(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

function PillGroup({ options, values, onToggle }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = values.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
              selected
                ? 'border-persona-purple bg-persona-lavender/60 text-persona-purple-dark'
                : 'border-persona-border bg-white text-persona-ink hover:border-persona-purple/40 hover:text-persona-purple'
            }`}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function PersonaWaitlist() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [learningTopics, setLearningTopics] = useState([]);
  const [customLearningInterest, setCustomLearningInterest] = useState('');
  const [accountabilityPreferences, setAccountabilityPreferences] = useState([]);
  const [willingToPayUsd, setWillingToPayUsd] = useState('');
  const [pricingPreference, setPricingPreference] = useState('');
  const [heardAbout, setHeardAbout] = useState('');
  const [heardAboutOther, setHeardAboutOther] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const showCustomLearningField =
    learningTopics.includes('other') || learningTopics.length === 0;

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await submitPersonaWaitlist({
        name,
        email,
        learningTopics,
        customLearningInterest,
        accountabilityPreferences,
        willingToPayUsd,
        pricingPreference,
        heardAbout,
        heardAboutOther,
        additionalNotes,
        marketingOptIn,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <WaitlistShell
        title="You're on the list"
        subtitle="Thanks for helping shape Provn—we'll reach out when we're ready for you."
        footer={
          <Link to="/" className="font-semibold text-persona-purple underline-offset-2 hover:underline">
            Back to Provn
          </Link>
        }
      >
        <div className="px-2 py-6 text-center md:px-6">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 12l5 5L20 6" />
            </svg>
          </span>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-persona-muted">
            We saved what you want to learn, how you&apos;d like to stay accountable, and your
            pricing expectations. Watch{' '}
            <strong className="font-semibold text-persona-ink">{email}</strong> for updates.
          </p>
          <Link to="/" className="btn-primary mt-8">
            Back to Provn
          </Link>
        </div>
      </WaitlistShell>
    );
  }

  return (
    <WaitlistShell
      title="Join the Provn waitlist"
      subtitle="Provn helps you learn by practising every day—with progress you can see and accountability built in. Tell us what you want to learn, even if we don't offer it yet."
      footer={
        <>
          Want to see what we&apos;re building?{' '}
          <Link to="/#skills" className="font-semibold text-persona-purple underline-offset-2 hover:underline">
            Browse skills
          </Link>
        </>
      }
    >
      {!isFirebaseConfigured ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Firebase is not configured. Add your Firebase keys to <code>.env</code> and restart
          the dev server.
        </p>
      ) : (
        <form className="space-y-8" onSubmit={handleSubmit}>
          <SectionTitle subtitle="We'll use this to contact you about early access.">
            About you
          </SectionTitle>

          <label className="block">
            <FieldLabel required>Full name</FieldLabel>
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className={inputClassName}
            />
          </label>

          <label className="block">
            <FieldLabel required>Email</FieldLabel>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClassName}
            />
          </label>

          <SectionTitle subtitle="Pick anything that fits—or describe something we don't list yet.">
            What would you like to learn?
          </SectionTitle>
          <PillGroup
            options={PERSONA_LEARNING_TOPICS}
            values={learningTopics}
            onToggle={(id) => setLearningTopics((prev) => toggleInList(prev, id))}
          />

          {showCustomLearningField && (
            <label className="block">
              <FieldLabel required={learningTopics.includes('other')}>
                {learningTopics.includes('other')
                  ? 'Describe what you want to learn'
                  : 'Or describe what you want to learn'}
              </FieldLabel>
              <textarea
                rows={3}
                value={customLearningInterest}
                onChange={(event) => setCustomLearningInterest(event.target.value)}
                placeholder="e.g. I want to build a daily writing habit and publish one essay a week"
                className={textareaClassName}
              />
            </label>
          )}

          <SectionTitle subtitle="Provn is built around learning by doing—not just watching.">
            How should we keep you accountable?
          </SectionTitle>
          <PillGroup
            options={PERSONA_ACCOUNTABILITY_OPTIONS}
            values={accountabilityPreferences}
            onToggle={(id) =>
              setAccountabilityPreferences((prev) => toggleInList(prev, id))
            }
          />

          <SectionTitle subtitle="Honest answers help us price Provn fairly.">Pricing</SectionTitle>

          <label className="block">
            <FieldLabel required>What would you pay for this? (USD)</FieldLabel>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-persona-muted">
                $
              </span>
              <input
                type="number"
                name="willingToPayUsd"
                required
                min={0}
                max={10000}
                step={1}
                value={willingToPayUsd}
                onChange={(event) => setWillingToPayUsd(event.target.value)}
                placeholder="29"
                className={`${inputClassName} !mt-0 pl-8`}
              />
            </div>
            <p className="mt-2 text-xs text-persona-muted">
              Monthly or per programme—enter what feels fair for daily practice and tracking.
            </p>
          </label>

          <label className="block">
            <FieldLabel>Preferred pricing model</FieldLabel>
            <select
              value={pricingPreference}
              onChange={(event) => setPricingPreference(event.target.value)}
              className={inputClassName}
            >
              <option value="">Select an option (optional)</option>
              {PERSONA_WAITLIST_PRICING_PREFERENCES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <SectionTitle subtitle="Optional—but it helps us prioritise.">Anything else?</SectionTitle>

          <label className="block">
            <FieldLabel>How did you hear about Provn?</FieldLabel>
            <select
              value={heardAbout}
              onChange={(event) => setHeardAbout(event.target.value)}
              className={inputClassName}
            >
              <option value="">Select an option (optional)</option>
              {PERSONA_WAITLIST_HEARD_ABOUT.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {heardAbout === 'other' && (
            <label className="block">
              <FieldLabel required>Tell us where</FieldLabel>
              <input
                type="text"
                value={heardAboutOther}
                onChange={(event) => setHeardAboutOther(event.target.value)}
                placeholder="Where did you hear about us?"
                className={inputClassName}
              />
            </label>
          )}

          <label className="block">
            <FieldLabel>Additional notes</FieldLabel>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Anything else we should know—goals, constraints, features you need…"
              className={textareaClassName}
            />
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-persona-border bg-persona-surface/60 px-4 py-4">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(event) => setMarketingOptIn(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-persona-border text-persona-purple focus:ring-persona-purple"
            />
            <span className="text-sm leading-relaxed text-persona-muted">
              Keep me updated about Provn launch news and early access.
            </span>
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full !py-3.5 !text-base disabled:opacity-50"
          >
            {submitting ? 'Joining waitlist…' : 'Join the Provn waitlist'}
          </button>
        </form>
      )}
    </WaitlistShell>
  );
}
