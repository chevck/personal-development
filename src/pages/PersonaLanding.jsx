import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import { PERSONA_SKILLS } from "../config/personaSkills";
import { SPEECH_TRAINING_PROJECT_ID } from "../config/projects";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

const navLinks = [
  { label: "Skills", href: "#skills" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why Persona", href: "#why" },
];

const HERO_PHOTOS = {
  learn: `${process.env.PUBLIC_URL}/images/hero/learn.jpg`,
  practise: `${process.env.PUBLIC_URL}/images/hero/practise.jpg`,
};

const HERO_STATS = [
  { value: "7–60", label: "Days per skill" },
  { value: "1+", label: "Skills & growing" },
  { value: "Daily", label: "Practice rhythm" },
];

const EQ_BARS = [10, 22, 16, 30, 20, 38, 26, 44, 30, 36, 22, 28, 18, 24];

const featureCards = [
  {
    title: "Choose your",
    accent: "skill",
    accentColor: "text-persona-purple",
    description:
      "Pick what you want to improve—speech training is live; more programmes are on the way.",
    icon: (
      <svg
        viewBox='0 0 24 24'
        className='h-7 w-7'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
      >
        <path d='M12 6v6l4 2' strokeLinecap='round' />
        <circle cx='12' cy='12' r='9' />
      </svg>
    ),
    bg: "bg-persona-lavender",
    pattern: "dots",
    iconBg: "bg-white text-persona-purple",
  },
  {
    title: "Practice",
    accent: "daily",
    accentColor: "text-persona-yellow",
    description:
      "One focused exercise per calendar day. Set 7–60 days and build a rhythm that lasts.",
    icon: (
      <svg
        viewBox='0 0 24 24'
        className='h-7 w-7'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
      >
        <path d='M4 12h16M12 4v16' strokeLinecap='round' />
        <circle cx='12' cy='12' r='9' />
      </svg>
    ),
    bg: "bg-persona-purple",
    pattern: "rings",
    iconBg: "bg-white/20 text-white",
    light: true,
  },
  {
    title: "Track real",
    accent: "progress",
    accentColor: "text-persona-purple-dark",
    description:
      "See your active week, completed days, and what to work on next—across every programme.",
    icon: (
      <svg
        viewBox='0 0 24 24'
        className='h-7 w-7'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
      >
        <path d='M4 18V8M10 18V4M16 18v-6M22 18H2' strokeLinecap='round' />
      </svg>
    ),
    bg: "bg-persona-yellow",
    pattern: "waves",
    iconBg: "bg-white text-persona-ink",
  },
];

const steps = [
  {
    step: "1",
    title: "Choose a skill",
    body: "Start with Speakly for speech—or explore new skills as we release them.",
  },
  {
    step: "2",
    title: "Set your length",
    body: "Commit to 7–60 days. One exercise unlocks per calendar day at a sustainable pace.",
  },
  {
    step: "3",
    title: "Practise & progress",
    body: "Complete daily work, track your weeks, and finish when the habit sticks.",
  },
];

function PersonaBrand({ size = "md" }) {
  const textSize = size === "sm" ? "text-lg" : "text-xl";
  const logoSizeClass =
    size === "sm"
      ? "!h-[calc(2.25rem+0.9rem)] !w-[calc(2.25rem+0.9rem)]"
      : "!h-[calc(2.5rem+0.9rem)] !w-[calc(2.5rem+0.9rem)]";
  return (
    <Link
      to='/'
      className='group inline-flex items-center gap-2.5 no-underline'
      aria-label='Persona — home'
    >
      <AppLogo
        variant='logo'
        size={size === "sm" ? "sm" : "md"}
        className={`${logoSizeClass} rounded-xl transition-transform duration-300 group-hover:scale-[1.02]`}
      />
      <span
        className={`${textSize} font-extrabold tracking-tight text-persona-ink`}
      >
        Persona
      </span>
    </Link>
  );
}

function RevealSection({ children, className = "", as: Tag = "div" }) {
  const [ref, visible] = useRevealOnScroll();
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

function SquiggleUnderline() {
  return (
    <svg
      className='w-40 h-3 mx-auto mt-1 text-persona-purple md:w-52'
      viewBox='0 0 200 12'
      fill='none'
      aria-hidden
    >
      <path
        className='squiggle-draw'
        d='M4 8c40-10 80 14 120 4s56-6 72 2'
        stroke='currentColor'
        strokeWidth='3'
        strokeLinecap='round'
      />
    </svg>
  );
}

function StarburstIcon({ children, light = false }) {
  return (
    <span
      className={`relative flex h-16 w-16 shrink-0 items-center justify-center ${
        light ? "text-white" : "text-persona-purple"
      }`}
    >
      <svg
        className='absolute inset-0 w-full h-full star-twinkle'
        viewBox='0 0 64 64'
        aria-hidden
      >
        <path
          fill={light ? "rgba(255,255,255,0.25)" : "rgba(94,58,173,0.12)"}
          d='M32 4l4 12h12l-10 8 4 12-10-8-10 8 4-12-10-8h12z'
        />
      </svg>
      <span
        className={`relative flex h-12 w-12 items-center justify-center rounded-full ${
          light ? "bg-white/25" : "bg-white shadow-soft"
        }`}
      >
        {children}
      </span>
    </span>
  );
}

function CardPattern({ type, light = false }) {
  const stroke = light ? "rgba(255,255,255,0.15)" : "rgba(94,58,173,0.12)";
  if (type === "dots") {
    return (
      <svg
        className='absolute w-24 h-24 pointer-events-none card-pattern -right-2 -top-2 opacity-80'
        viewBox='0 0 80 80'
        aria-hidden
      >
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={16 + col * 24}
              cy={16 + row * 24}
              r='3'
              fill={stroke}
            />
          )),
        )}
      </svg>
    );
  }
  if (type === "rings") {
    return (
      <svg
        className='absolute bottom-0 pointer-events-none card-pattern -right-4 h-28 w-28'
        viewBox='0 0 100 100'
        aria-hidden
      >
        <circle
          cx='50'
          cy='50'
          r='40'
          stroke={stroke}
          strokeWidth='2'
          fill='none'
        />
        <circle
          cx='50'
          cy='50'
          r='28'
          stroke={stroke}
          strokeWidth='2'
          fill='none'
        />
        <circle
          cx='50'
          cy='50'
          r='16'
          stroke={stroke}
          strokeWidth='2'
          fill='none'
        />
      </svg>
    );
  }
  return (
    <svg
      className='absolute bottom-0 w-32 h-20 pointer-events-none card-pattern -left-2 opacity-70'
      viewBox='0 0 120 40'
      aria-hidden
    >
      <path
        d='M0 28c20-16 40 8 60 4s40-12 60-8'
        stroke={stroke}
        strokeWidth='3'
        fill='none'
        strokeLinecap='round'
      />
      <path
        d='M0 20c24-12 48 4 72 0s32-8 48-4'
        stroke={stroke}
        strokeWidth='2'
        fill='none'
        strokeLinecap='round'
      />
    </svg>
  );
}

function ProgressRing({ value = 62, size = 52, stroke = 6 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className='-rotate-90'
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='rgba(94,58,173,0.15)'
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='#5E3AAD'
        strokeWidth={stroke}
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function HeroShowcase() {
  return (
    <div className='relative w-full max-w-sm mx-auto hero-in hero-in-delay-3 mt-14 lg:mt-0 lg:max-w-md'>
      <div
        className='absolute w-48 h-48 rounded-full pointer-events-none hero-blob -left-10 top-2 -z-10 bg-persona-lavender-deep/60 blur-3xl'
        aria-hidden
      />
      <div
        className='absolute rounded-full pointer-events-none hero-blob-alt -right-8 bottom-2 -z-10 h-44 w-44 bg-persona-yellow/40 blur-3xl'
        aria-hidden
      />

      <div
        className='pointer-events-none absolute -right-6 -top-8 z-0 h-28 w-28 overflow-hidden rounded-[42%_58%_55%_45%/52%_46%_54%_48%] border-[5px] border-white shadow-[0_12px_30px_rgba(94,58,173,0.2)] sm:h-32 sm:w-32'
        aria-hidden
      >
        <img
          src={HERO_PHOTOS.practise}
          alt=''
          className='object-cover w-full h-full'
        />
      </div>
      <div
        className='pointer-events-none absolute -bottom-8 -left-6 z-0 h-24 w-24 overflow-hidden rounded-[55%_45%_48%_52%/45%_55%_45%_55%] border-[5px] border-white shadow-[0_12px_30px_rgba(94,58,173,0.2)] sm:h-28 sm:w-28'
        aria-hidden
      >
        <img
          src={HERO_PHOTOS.learn}
          alt=''
          className='object-cover w-full h-full'
        />
      </div>

      <div className='card-float relative z-10 rounded-[1.75rem] border border-persona-lavender-deep/60 bg-white/95 p-6 shadow-[0_28px_70px_rgba(94,58,173,0.25)] backdrop-blur'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='flex items-center justify-center h-11 w-11 rounded-2xl bg-persona-lavender'>
              <AppLogo
                projectId={SPEECH_TRAINING_PROJECT_ID}
                variant='icon'
                size='sm'
                className='w-6 h-6'
              />
            </span>
            <div>
              <p className='text-sm font-extrabold text-persona-ink'>Speakly</p>
              <p className='text-xs font-semibold text-persona-muted'>
                Day 3 of 21
              </p>
            </div>
          </div>
          <span className='px-3 py-1 text-xs font-bold rounded-full bg-persona-yellow/40 text-persona-purple-dark'>
            Today
          </span>
        </div>

        <h3 className='mt-5 text-lg font-extrabold tracking-tight text-persona-ink'>
          Pace &amp; clarity drill
        </h3>
        <p className='mt-1 text-sm leading-relaxed text-persona-muted'>
          Read aloud, slow down on key words, and record your take.
        </p>

        <div className='mt-5 flex h-16 items-end justify-center gap-1.5 rounded-2xl bg-persona-cream px-4 py-3'>
          {EQ_BARS.map((h, i) => (
            <span
              key={i}
              className='eq-bar w-1.5 rounded-full bg-gradient-to-t from-persona-purple to-persona-purple/50'
              style={{ height: `${h}px`, animationDelay: `${i * 0.07}s` }}
            />
          ))}
        </div>

        <div className='flex items-center justify-between mt-5'>
          <div className='flex items-center gap-3'>
            <span className='relative inline-flex'>
              <ProgressRing value={62} />
              <span className='absolute inset-0 flex items-center justify-center text-[11px] font-extrabold text-persona-purple'>
                62%
              </span>
            </span>
            <div>
              <p className='text-xs font-semibold text-persona-muted'>
                Programme
              </p>
              <p className='text-sm font-bold text-persona-ink'>On track</p>
            </div>
          </div>
          <span className='flex h-12 w-12 items-center justify-center rounded-full bg-persona-purple text-white shadow-[0_8px_20px_rgba(94,58,173,0.4)]'>
            <svg
              viewBox='0 0 24 24'
              className='w-5 h-5'
              fill='currentColor'
              aria-hidden
            >
              <path d='M8 5v14l11-7z' />
            </svg>
          </span>
        </div>
      </div>

      <div className='chip-float absolute -left-5 top-6 z-20 rounded-2xl border border-persona-lavender-deep/60 bg-white px-3.5 py-2.5 shadow-[0_12px_30px_rgba(94,58,173,0.2)]'>
        <div className='flex items-center gap-2'>
          <span className='text-base' aria-hidden>
            🔥
          </span>
          <div>
            <p className='text-[11px] font-semibold leading-tight text-persona-muted'>
              Streak
            </p>
            <p className='text-sm font-extrabold leading-tight text-persona-ink'>
              5 days
            </p>
          </div>
        </div>
      </div>

      <div className='chip-float-delayed absolute -bottom-4 right-2 z-20 rounded-2xl border border-persona-lavender-deep/60 bg-white px-3.5 py-2.5 shadow-[0_12px_30px_rgba(94,58,173,0.2)]'>
        <div className='flex items-center gap-2.5'>
          <span
            className='flex items-center justify-center w-8 h-8 text-green-600 bg-green-100 rounded-full'
            aria-hidden
          >
            <svg
              viewBox='0 0 20 20'
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
            >
              <path
                d='M4 10l4 4 8-9'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </span>
          <div>
            <p className='text-[11px] font-semibold leading-tight text-persona-muted'>
              Assessor feedback
            </p>
            <p className='text-sm font-extrabold leading-tight text-persona-ink'>
              Scored 8/10
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedSkillCard({ skill }) {
  const [ref, visible] = useRevealOnScroll({ threshold: 0.1 });

  return (
    <li
      ref={ref}
      className={`reveal md:col-span-3 ${visible ? "is-visible" : ""}`}
    >
      <Link
        to={skill.marketingPath}
        className='feature-card group relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-persona-purple via-persona-purple to-persona-purple-dark p-8 no-underline shadow-[0_18px_50px_rgba(94,58,173,0.4)] md:p-10'
      >
        <CardPattern type='rings' light />
        <div className='flex items-start justify-between gap-3'>
          <StarburstIcon light>
            <AppLogo
              projectId={skill.id}
              variant='icon'
              size='sm'
              className='h-7 w-7'
            />
          </StarburstIcon>
          <span className='px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full shrink-0 bg-persona-yellow text-persona-ink'>
            {skill.tag}
          </span>
        </div>

        <h3 className='mt-6 text-3xl font-extrabold tracking-tight text-white md:text-[2rem]'>
          {skill.title}
        </h3>
        <p className='max-w-md mt-3 text-base leading-relaxed text-white/90 md:text-lg'>
          {skill.description}
        </p>

        {skill.highlights?.length > 0 && (
          <ul className='flex flex-wrap gap-2 mt-6'>
            {skill.highlights.map((item) => (
              <li
                key={item}
                className='rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm'
              >
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className='flex items-center justify-between gap-4 pt-8 mt-auto'>
          <span className='text-sm font-semibold text-persona-yellow'>
            {skill.durationLabel}
          </span>
          <span className='inline-flex items-center gap-2 text-sm font-bold text-white'>
            Explore {skill.name}
            <span
              className='flex items-center justify-center transition rounded-full h-9 w-9 bg-white/20 group-hover:translate-x-1 group-hover:bg-white/30'
              aria-hidden
            >
              <svg
                viewBox='0 0 20 20'
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
              >
                <path
                  d='M4 10h12M11 5l5 5-5 5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          </span>
        </div>
      </Link>
    </li>
  );
}

function ComingSoonSkillCard({ skill }) {
  const [ref, visible] = useRevealOnScroll({ threshold: 0.1 });

  return (
    <li
      ref={ref}
      className={`reveal reveal-stagger-1 md:col-span-2 ${visible ? "is-visible" : ""}`}
    >
      <div
        className='relative flex h-full flex-col overflow-hidden rounded-[2rem] border-2 border-dashed border-persona-lavender-deep bg-persona-cream/70 p-6'
        aria-disabled='true'
      >
        <CardPattern type='dots' />
        <div className='flex items-start justify-between gap-3'>
          <span className='flex items-center justify-center w-12 h-12 text-xl rounded-2xl bg-persona-lavender'>
            {skill.icon}
          </span>
          <span className='px-3 py-1 text-xs font-bold tracking-wide uppercase bg-white rounded-full shrink-0 text-persona-muted ring-1 ring-persona-lavender-deep'>
            {skill.tag}
          </span>
        </div>
        <h3 className='mt-5 text-xl font-extrabold tracking-tight text-persona-ink'>
          {skill.title}
        </h3>
        <p className='mt-2 text-sm leading-relaxed text-persona-muted'>
          {skill.description}
        </p>
        <div className='flex items-center justify-between gap-3 pt-6 mt-auto'>
          <span className='text-xs font-semibold text-persona-muted'>
            {skill.durationLabel}
          </span>
          <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-persona-muted'>
            <svg
              viewBox='0 0 16 16'
              className='h-3.5 w-3.5'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
            >
              <rect x='3' y='7' width='10' height='7' rx='1.5' />
              <path d='M5 7V5a3 3 0 0 1 6 0v2' />
            </svg>
            Not available yet
          </span>
        </div>
      </div>
    </li>
  );
}

function SkillCard({ skill }) {
  if (skill.status === "available") {
    return <FeaturedSkillCard skill={skill} />;
  }
  return <ComingSoonSkillCard skill={skill} />;
}

export default function PersonaLanding() {
  const [featuresRef, featuresVisible] = useRevealOnScroll({ threshold: 0.08 });

  return (
    <div className='relative min-h-screen overflow-x-hidden font-sans persona-landing bg-persona-cream text-persona-ink'>
      <div
        className='pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,rgba(232,224,245,0.9),transparent),radial-gradient(ellipse_40%_30%_at_95%_20%,rgba(245,200,66,0.15),transparent),radial-gradient(ellipse_35%_25%_at_5%_80%,rgba(94,58,173,0.08),transparent)]'
        aria-hidden
      />

      <header className='sticky top-0 z-50 border-b border-persona-lavender-deep/60 bg-white/85 backdrop-blur-lg'>
        <div className='flex items-center justify-between max-w-6xl gap-6 px-6 py-4 mx-auto'>
          <PersonaBrand />
          <nav className='items-center hidden gap-8 md:flex' aria-label='Main'>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className='text-sm font-semibold transition text-persona-muted hover:text-persona-purple'
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a href='#skills' className='text-sm group btn-cta'>
            <span className='px-2'>Get started</span>
            <span className='btn-cta-icon' aria-hidden>
              <svg
                viewBox='0 0 20 20'
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
              >
                <path
                  d='M4 10h12M11 5l5 5-5 5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            </span>
          </a>
        </div>
      </header>

      <section className='relative px-6 pt-12 pb-20 overflow-hidden md:pt-16'>
        <div
          className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,224,245,0.85),transparent_70%)]'
          aria-hidden
        />
        <div className='mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8'>
          <div className='text-center lg:text-left'>
            <span className='hero-in hero-in-delay-1 inline-flex items-center gap-2 rounded-full bg-persona-lavender px-4 py-1.5 text-sm font-bold text-persona-purple'>
              <span className='w-2 h-2 rounded-full animate-pulse bg-persona-yellow' />
              Self-development · Structured practice
            </span>

            <h1 className='hero-in hero-in-delay-2 mt-6 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-persona-ink sm:text-5xl lg:text-[4rem]'>
              Learn what you want to{" "}
              <span className='relative inline-block'>
                <span className='font-accent text-[3.2rem] font-bold leading-none text-persona-purple sm:text-6xl lg:text-[4.6rem]'>
                  improve
                </span>
              </span>
              ,{" "}
              <span className='relative inline-block'>
                <span className='font-accent text-[3.2rem] font-bold leading-none text-persona-yellow sm:text-6xl lg:text-[4.6rem]'>
                  daily
                </span>
                <SquiggleUnderline />
              </span>
            </h1>

            <p className='max-w-xl mx-auto mt-6 text-lg leading-relaxed hero-in hero-in-delay-3 text-persona-muted md:text-xl lg:mx-0'>
              Persona is your home for focused growth—choose a skill, set 7–60
              days, and practise one exercise per day. Speech training is live;
              more skills are coming soon.
            </p>

            <div className='flex flex-wrap items-center justify-center gap-4 hero-in hero-in-delay-4 mt-9 lg:justify-start'>
              <a href='#skills' className='text-base group btn-cta'>
                <span className='px-2'>Browse skills</span>
                <span className='btn-cta-icon' aria-hidden>
                  <svg
                    viewBox='0 0 20 20'
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                  >
                    <path
                      d='M4 10h12M11 5l5 5-5 5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
              </a>
              <Link
                to='/speakly/welcome'
                className='btn-secondary px-8 py-3.5 text-base'
              >
                Meet Speakly
              </Link>
            </div>

            <ul className='flex items-center justify-center gap-5 mt-10 sm:gap-7 lg:justify-start'>
              {HERO_STATS.map((stat, i) => (
                <li
                  key={stat.label}
                  className='flex items-center gap-5 hero-in sm:gap-7'
                  style={{ animationDelay: `${0.55 + i * 0.08}s`, opacity: 0 }}
                >
                  {i > 0 && (
                    <span
                      className='w-px h-9 bg-persona-lavender-deep'
                      aria-hidden
                    />
                  )}
                  <div className='text-center lg:text-left'>
                    <p className='text-2xl font-medium font-display text-persona-purple sm:text-3xl'>
                      {stat.value}
                    </p>
                    <p className='mt-0.5 whitespace-nowrap text-xs font-semibold text-persona-muted sm:text-sm'>
                      {stat.label}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <HeroShowcase />
        </div>
      </section>

      <section className='relative px-6 py-12 md:py-20'>
        <RevealSection className='max-w-6xl mx-auto text-center'>
          <span className='inline-block px-4 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-persona-yellow/40 text-persona-purple-dark'>
            How Persona helps
          </span>
          <h2 className='mt-4 text-3xl font-extrabold tracking-tight text-persona-ink md:text-4xl'>
            Learn,{" "}
            <span className='text-4xl font-accent text-persona-purple md:text-5xl'>
              practise
            </span>
            ,{" "}
            <span className='text-4xl font-accent text-persona-yellow md:text-5xl'>
              progress
            </span>
          </h2>
        </RevealSection>

        <ul
          ref={featuresRef}
          className='grid max-w-6xl gap-6 mx-auto mt-12 md:grid-cols-3 md:gap-8'
        >
          {featureCards.map((card, i) => (
            <li
              key={card.title}
              className={`reveal reveal-stagger-${i + 1} feature-card relative overflow-hidden rounded-[2rem] p-8 ${card.bg} ${
                featuresVisible ? "is-visible" : ""
              } ${card.light ? "text-white" : "text-persona-ink"}`}
            >
              <CardPattern type={card.pattern} light={card.light} />
              <StarburstIcon light={card.light}>
                <span className={card.iconBg}>{card.icon}</span>
              </StarburstIcon>
              <h3 className='mt-6 text-2xl font-extrabold leading-tight'>
                {card.title}{" "}
                <span
                  className={`font-accent text-3xl font-bold ${card.accentColor}`}
                >
                  {card.accent}
                </span>
              </h3>
              <p
                className={`mt-3 text-base leading-relaxed ${
                  card.light ? "text-white/90" : "text-persona-muted"
                }`}
              >
                {card.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id='skills' className='relative px-6 py-16 md:py-24'>
        <RevealSection className='max-w-6xl mx-auto text-center'>
          <span className='inline-block px-4 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-persona-lavender text-persona-purple-dark'>
            Skills library
          </span>
          <h2 className='mt-4 text-3xl font-extrabold tracking-tight text-persona-ink md:text-4xl'>
            Choose what to{" "}
            <span className='text-4xl font-accent text-persona-purple md:text-5xl'>
              work on
            </span>
          </h2>
          <p className='max-w-2xl mx-auto mt-4 text-base text-persona-muted'>
            Each skill is a guided programme with daily exercises. Speech
            training is live; content creation is on the way.
          </p>
        </RevealSection>

        <ul className='grid items-stretch max-w-5xl gap-6 mx-auto mt-14 md:grid-cols-5'>
          {PERSONA_SKILLS.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </ul>
      </section>

      <section
        id='how-it-works'
        className='relative px-6 py-20 overflow-hidden'
      >
        <div
          className='absolute inset-0 bg-gradient-to-b from-persona-lavender/40 via-white to-persona-cream'
          aria-hidden
        />
        <RevealSection className='relative max-w-3xl mx-auto text-center'>
          <h2 className='text-3xl font-extrabold text-persona-ink md:text-4xl'>
            How Persona{" "}
            <span className='text-4xl font-accent text-persona-purple md:text-5xl'>
              works
            </span>
          </h2>
        </RevealSection>
        <ol className='relative max-w-3xl mx-auto mt-12 space-y-5'>
          {steps.map((item, i) => (
            <RevealSection
              key={item.step}
              as='li'
              className={`reveal-stagger-${i + 1} flex gap-5 rounded-[1.75rem] border-2 border-persona-lavender-deep bg-white p-6 shadow-soft`}
            >
              <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-persona-purple text-xl font-bold text-white shadow-[0_4px_16px_rgba(94,58,173,0.3)]'>
                {item.step}
              </span>
              <div>
                <h3 className='text-lg font-bold text-persona-ink'>
                  {item.title}
                </h3>
                <p className='mt-1 text-base text-persona-muted'>{item.body}</p>
              </div>
            </RevealSection>
          ))}
        </ol>
      </section>

      <section id='why' className='px-6 py-20 md:py-28'>
        <RevealSection className='max-w-6xl mx-auto text-center'>
          <h2 className='text-3xl font-extrabold text-persona-ink md:text-4xl'>
            Built for{" "}
            <span className='text-4xl font-accent text-persona-yellow md:text-5xl'>
              lasting growth
            </span>
          </h2>
        </RevealSection>
        <ul className='grid max-w-6xl gap-5 mx-auto mt-14 sm:grid-cols-2 lg:grid-cols-3'>
          {[
            {
              title: "Flexible length",
              description: "7–60 days per skill—one exercise per calendar day.",
              icon: "📅",
            },
            {
              title: "Deep focus",
              description: "One skill at a time so practice stays meaningful.",
              icon: "🎯",
            },
            {
              title: "Clear progress",
              description: "Weeks, days, and next steps always in view.",
              icon: "📊",
            },
            {
              title: "Steady pacing",
              description: "Calendar rhythm prevents burnout.",
              icon: "⏱️",
            },
            {
              title: "Personalised",
              description: "Share your goals when you join each programme.",
              icon: "✨",
            },
            {
              title: "Growing library",
              description: "Speech training today—more skills on the way.",
              icon: "🌱",
            },
          ].map((feature, i) => (
            <RevealSection
              key={feature.title}
              as='li'
              className={`reveal-stagger-${(i % 3) + 1} feature-card rounded-[1.75rem] border-2 border-persona-lavender bg-white p-6`}
            >
              <span className='flex items-center justify-center w-12 h-12 text-xl rounded-2xl bg-persona-lavender'>
                {feature.icon}
              </span>
              <h3 className='mt-4 text-lg font-bold text-persona-ink'>
                {feature.title}
              </h3>
              <p className='mt-2 text-base leading-relaxed text-persona-muted'>
                {feature.description}
              </p>
            </RevealSection>
          ))}
        </ul>
      </section>

      <section className='px-6 py-20' aria-labelledby='cta-speech-training'>
        <div className='relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] px-8 py-14 text-center md:px-16'>
          <div
            className='absolute inset-0 bg-gradient-to-br from-persona-purple via-persona-purple-hover to-persona-purple-dark'
            aria-hidden
          />
          <div
            className='absolute w-40 h-40 rounded-full pointer-events-none card-pattern -right-8 -top-8 bg-persona-yellow/20 blur-2xl'
            aria-hidden
          />
          <div className='relative z-10'>
            <h2
              id='cta-speech-training'
              className='text-3xl font-extrabold text-white md:text-4xl'
            >
              Start with{" "}
              <span className='text-4xl font-accent text-persona-yellow md:text-5xl'>
                speech training
              </span>
            </h2>
            <p className='max-w-lg mx-auto mt-4 text-base text-white/90'>
              Speakly is our first Persona skill—pace, clarity, and delivery
              with assessor feedback. Create an account and choose how many days
              you want to train.
            </p>
            <div className='flex flex-wrap items-center justify-center gap-4 mt-8'>
              <Link
                to='/speakly/register'
                className='text-base no-underline group btn-cta-light'
              >
                <span className='px-2 text-persona-purple'>Get started</span>
                <span className='btn-cta-icon' aria-hidden>
                  <svg
                    viewBox='0 0 20 20'
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2.5'
                  >
                    <path
                      d='M4 10h12M11 5l5 5-5 5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
              </Link>
              <Link
                to='/speakly/welcome'
                className='no-underline btn-cta-outline'
              >
                Learn about Speakly
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className='px-6 py-10 text-sm text-center border-t border-persona-lavender-deep bg-white/80 text-persona-muted backdrop-blur-sm'>
        <div className='flex justify-center mb-3'>
          <PersonaBrand size='sm' />
        </div>
        <p>
          © {new Date().getFullYear()} Persona · Self-development, one skill at
          a time
        </p>
      </footer>
    </div>
  );
}
