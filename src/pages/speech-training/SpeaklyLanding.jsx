import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../../components/AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';

const navLinks = [
  { label: 'Programme', href: '#programme' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Waitlist', to: '/waitlist' },
];

const features = [
  {
    title: 'Flexible length',
    description:
      'Choose 7 to 60 days—one exercise per calendar day—so the programme fits your schedule.',
    icon: '📅',
  },
  {
    title: 'Record your practice',
    description:
      'Capture each exercise, listen back, and save to the cloud before sharing for review.',
    icon: '🎙️',
  },
  {
    title: 'Assessor feedback',
    description:
      'Share a link with a coach or mentor. One review per submission; score 5+ to complete a day.',
    icon: '✓',
  },
  {
    title: 'Calendar pacing',
    description:
      'One challenge per calendar day keeps progress steady without overwhelming you.',
    icon: '⏱️',
  },
  {
    title: 'Progress tracking',
    description:
      'See completed days, active week, and what to work on next across the full programme.',
    icon: '📊',
  },
  {
    title: 'Personalised goals',
    description:
      'Tell us why you joined and what you want to improve—we tailor the journey to you.',
    icon: '🎯',
  },
];

const waveHeights = [6, 14, 10, 18, 8, 16, 12, 20, 9, 15, 11, 17];

function AnimatedWaveform({ className = '', light = false }) {
  return (
    <span className={`flex items-end gap-1 ${className}`} aria-hidden>
      {waveHeights.map((h, i) => (
        <span
          key={i}
          className={`wave-bar w-1 rounded-full ${
            light
              ? 'bg-gradient-to-t from-white to-white/50'
              : 'bg-gradient-to-t from-speakly-coral to-speakly-coral-dark'
          }`}
          style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </span>
  );
}

function HeroRing() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2"
      aria-hidden
    >
      <div className="h-[320px] w-[320px] rounded-full border border-speakly-coral-ring/60 md:h-[420px] md:w-[420px]" />
      <div className="absolute inset-8 rounded-full border border-speakly-coral-muted/80" />
      <div className="absolute inset-16 rounded-full bg-speakly-coral/15 blur-2xl" />
    </div>
  );
}

function Reveal({ children, className = '', delay, as: Tag = 'div' }) {
  const [ref, visible] = useRevealOnScroll({ threshold: 0.12 });
  const delayClass = delay ? `sk-reveal-${delay}` : '';
  return (
    <Tag
      ref={ref}
      className={`sk-reveal ${delayClass} ${visible ? 'is-visible' : ''} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

const LOADER_MESSAGES = [
  'Slowing your pace',
  'Sharpening your clarity',
  'Building your confidence',
  'Shaping your delivery',
  'Preparing your programme',
];

function SpeaklyLoader({ exiting }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADER_MESSAGES.length);
    }, 620);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`speakly-loader ${exiting ? 'is-exiting' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="loader-mark relative flex h-20 w-20 items-center justify-center">
        <span className="loader-ring absolute inset-0 rounded-[1.4rem] border-2 border-white/40" aria-hidden />
        <span className="loader-ring-2 absolute inset-0 rounded-[1.4rem] border-2 border-white/30" aria-hidden />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-white shadow-2xl">
          <AppLogo
            projectId={SPEECH_TRAINING_PROJECT_ID}
            variant="icon"
            size="lg"
            className="h-12 w-12"
          />
        </span>
      </div>

      <div className="mt-7 flex items-end gap-1" aria-hidden>
        {waveHeights.map((h, i) => (
          <span
            key={i}
            className="wave-bar w-1 rounded-full bg-white/85"
            style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>

      <p className="font-display mt-6 text-2xl font-medium text-white">Speakly</p>
      <p className="mt-1 h-5 text-sm font-semibold text-white/80">
        <span key={msgIndex} className="loader-msg inline-block">
          {LOADER_MESSAGES[msgIndex]}…
        </span>
      </p>

      <div className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-white/20">
        <div className="loader-bar-fill h-full w-full rounded-full bg-white" />
      </div>
    </div>
  );
}

export default function SpeaklyLanding() {
  const [showLoader, setShowLoader] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2600);
    const hideTimer = setTimeout(() => setShowLoader(false), 3200);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="speakly-landing relative min-h-screen overflow-x-hidden bg-speakly-coral-light font-speakly text-speakly-ink">
      {showLoader && <SpeaklyLoader exiting={exiting} />}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(217,93,57,0.18),transparent),radial-gradient(ellipse_55%_40%_at_100%_60%,rgba(217,93,57,0.08),transparent),radial-gradient(ellipse_50%_35%_at_0%_90%,rgba(194,78,47,0.1),transparent)]"
        aria-hidden
      />

      <header className="sticky top-0 z-50 border-b border-speakly-coral-ring/50 bg-white/75 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden text-sm font-semibold text-taskly-muted transition hover:text-speakly-coral sm:inline"
            >
              ← Provn
            </Link>
            <AppLogo
              projectId={SPEECH_TRAINING_PROJECT_ID}
              variant="logo"
              size="md"
              linkTo="/speakly/welcome"
            />
          </div>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Speakly">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-semibold text-taskly-muted transition hover:text-speakly-coral"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-taskly-muted transition hover:text-speakly-coral"
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/waitlist"
              className="hidden text-sm font-semibold text-taskly-muted transition hover:text-speakly-coral sm:inline"
            >
              Join waitlist
            </Link>
            <Link
              to="/speakly/login"
              className="text-sm font-semibold text-taskly-muted transition hover:text-speakly-coral"
            >
              Sign in
            </Link>
            <Link to="/speakly/register" className="btn-primary whitespace-nowrap px-4 py-2.5 text-sm sm:px-5">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-20 pt-14 md:pb-28 md:pt-20">
        <HeroRing />
        <div
          className="hero-glow pointer-events-none absolute left-[15%] top-20 h-64 w-64 rounded-full bg-speakly-coral/25 blur-3xl"
          aria-hidden
        />
        <div
          className="hero-glow-alt pointer-events-none absolute right-[12%] top-40 h-56 w-56 rounded-full bg-speakly-coral/20 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="sk-in sk-in-1 inline-flex items-center gap-2 rounded-full border border-speakly-coral-ring bg-white/90 px-4 py-1.5 text-sm font-semibold text-speakly-coral-dark shadow-soft backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-speakly-coral" />
            A Provn skill · 7–60 days
          </span>

          <h1 className="font-display sk-in sk-in-2 mt-6 text-4xl font-medium leading-[1.12] tracking-tight md:text-6xl lg:text-[3.75rem]">
            <span className="text-speakly-ink">The voice training skill for </span>
            <span className="text-gradient">real conversations</span>
          </h1>
          <p className="sk-in sk-in-3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-taskly-muted md:text-xl">
            From rushed speech to clear, confident delivery—guided exercises, recordings, and
            assessor reviews in a programme length you choose (7–60 days).
          </p>

          <div className="sk-in sk-in-4 mx-auto mt-10 flex flex-wrap justify-center gap-6 md:gap-10">
            {[
              { value: '7–60', label: 'Days you choose' },
              { value: '3', label: 'Focused phases' },
              { value: '1:1', label: 'Assessor review' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-medium text-speakly-coral md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-taskly-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="sk-in sk-in-5 relative mx-auto mt-12 max-w-xl">
            <div
              className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-speakly-coral via-[#e07a3a] to-speakly-coral-dark opacity-50 blur-sm"
              aria-hidden
            />
            <div className="relative rounded-3xl border border-white/80 bg-white/95 p-6 shadow-card backdrop-blur-sm md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-speakly-coral">
                    Today&apos;s practice preview
                  </p>
                  <p className="font-display mt-2 text-2xl text-speakly-ink md:text-3xl">
                    The Pause Breath
                  </p>
                </div>
                <AnimatedWaveform className="shrink-0 pt-1" />
              </div>
              <p className="mt-4 text-left text-base leading-relaxed text-taskly-muted">
                Before every sentence you speak today, take one silent breath. Build awareness
                before you open your mouth.
              </p>
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-speakly-coral-muted px-4 py-2 text-sm font-semibold text-speakly-coral-dark">
                  Day 1 · Awareness
                </span>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/speakly/register"
                    className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:justify-start"
                  >
                    Start programme
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    to="/speakly/login"
                    className="text-center text-sm font-semibold text-speakly-coral transition hover:text-speakly-coral-dark sm:text-right"
                  >
                    Already have an account? Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="sk-in sk-in-6 mt-10 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/waitlist" className="btn-primary px-8 py-3.5 text-base">
                Join the waitlist
              </Link>
              <Link to="/speakly/register" className="btn-secondary px-8 py-3.5 text-base">
                Get started
              </Link>
              <a href="#features" className="btn-secondary px-8 py-3.5 text-base hidden sm:inline-flex">
                See features
              </a>
            </div>
            <Link
              to="/speakly/login"
              className="text-sm font-semibold text-speakly-coral transition hover:text-speakly-coral-dark"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </section>

      <section id="programme" className="relative px-6 py-14 md:py-16">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-speakly-coral">
            Built in three phases
          </p>
          <p className="mt-4 text-base leading-relaxed text-taskly-muted">
            However long you train, you move through <strong className="text-speakly-ink">The Brake</strong>,{' '}
            <strong className="text-speakly-ink">The Shape</strong>, and{' '}
            <strong className="text-speakly-ink">The Platform</strong>—exercises cycle as your programme
            continues.
          </p>
        </Reveal>
      </section>

      <section id="features" className="relative px-6 py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-speakly-coral-ring to-transparent"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="mx-auto block w-fit rounded-full bg-speakly-coral-muted px-4 py-1 text-xs font-bold uppercase tracking-wider text-speakly-coral-dark">
              Features
            </span>
            <h2 className="font-display mt-4 text-center text-3xl font-medium tracking-tight md:text-4xl">
              Everything you need to <span className="text-gradient">train your voice</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-base text-taskly-muted">
              Structured practice, honest feedback, and progress you can see.
            </p>
          </Reveal>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal
                as="li"
                key={feature.title}
                delay={(i % 3) + 1}
                className="group rounded-3xl border border-speakly-coral-ring/60 bg-gradient-to-br from-white via-white to-speakly-coral-light p-6 shadow-soft transition hover:-translate-y-1 hover:border-speakly-coral/40 hover:shadow-card"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-speakly-coral text-xl text-white shadow-[0_4px_14px_rgba(217,93,57,0.35)] transition group-hover:scale-110 group-hover:bg-speakly-coral-hover">
                  {feature.icon}
                </span>
                <h3 className="mt-4 text-lg font-bold text-speakly-ink">{feature.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-taskly-muted">
                  {feature.description}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section id="how-it-works" className="relative overflow-hidden px-6 py-20">
        <div
          className="absolute inset-0 bg-gradient-to-b from-white via-speakly-coral-light to-speakly-coral-muted/30"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal as="h2" className="font-display text-3xl font-medium md:text-4xl">
            Designed for steady, lasting improvement
          </Reveal>
          <ol className="mt-12 space-y-5 text-left">
            {[
              {
                step: '1',
                title: 'Record & save',
                body: 'Complete each day’s exercise, listen back, and upload your practice.',
              },
              {
                step: '2',
                title: 'Share for assessment',
                body: 'Send your recording to a coach or mentor with a private review link.',
              },
              {
                step: '3',
                title: 'Advance with approval',
                body: 'Days count as complete when your assessor scores you 5 or above.',
              },
            ].map((item, i) => (
              <Reveal
                as="li"
                key={item.step}
                delay={(i % 3) + 1}
                className="flex gap-5 rounded-2xl border border-speakly-coral-ring/50 bg-white/90 bg-gradient-to-r from-white to-speakly-coral-light/50 p-6 shadow-soft backdrop-blur-sm"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-speakly-coral text-lg font-bold text-white shadow-[0_4px_14px_rgba(217,93,57,0.3)]">
                  {item.step}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-speakly-ink">{item.title}</h3>
                  <p className="mt-1 text-base text-taskly-muted">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-20">
        <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-8 py-14 text-center md:px-16">
          <div
            className="absolute inset-0 bg-gradient-to-br from-speakly-coral via-[#c24e2f] to-speakly-coral-dark"
            aria-hidden
          />
          <div className="relative flex justify-center">
            <AnimatedWaveform className="mb-6 opacity-90" light />
          </div>
          <h2 className="font-display relative text-3xl font-medium text-white md:text-4xl">
            Ready to speak with intention?
          </h2>
          <p className="relative mx-auto mt-4 max-w-lg text-base text-white/90">
            Join the Provn waitlist to help shape learn-by-doing skills—or start Speakly today.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/waitlist"
              className="inline-flex rounded-full bg-white px-8 py-3.5 text-base font-bold text-speakly-coral shadow-lg transition hover:scale-[1.03] hover:bg-speakly-coral-light"
            >
              Join the waitlist
            </Link>
            <Link
              to="/speakly/register"
              className="inline-flex rounded-full border-2 border-white/80 px-8 py-3.5 text-base font-bold text-white transition hover:bg-white/10"
            >
              Get started
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="relative border-t border-speakly-coral-ring/60 bg-white/70 px-6 py-10 text-center text-sm text-taskly-muted backdrop-blur-sm">
        <AppLogo
          projectId={SPEECH_TRAINING_PROJECT_ID}
          variant="logo"
          size="sm"
          className="mx-auto mb-3"
        />
        <p>
          © {new Date().getFullYear()} Speak With Intention ·{' '}
          <Link to="/" className="font-semibold text-speakly-coral hover:underline">
            Provn
          </Link>
        </p>
      </footer>
    </div>
  );
}
