import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import { PERSONA_SKILLS } from "../config/personaSkills";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

const navLinks = [
  { label: "Skills", href: "#skills" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Why Provn", href: "#why" },
  { label: "Waitlist", href: "#waitlist" },
];

const HERO_DISCIPLINES = [
  "Speech",
  "Public speaking",
  "Singing",
  "Voice overs",
  "UI/UX",
  "Graphics",
  "Illustration",
];

const STATS = [
  { value: "7–60", label: "Days per programme" },
  { value: "2", label: "Skill tracks live" },
  { value: "1", label: "Exercise per day" },
  { value: "Human", label: "Assessor feedback" },
];

const EQ_BARS = [10, 22, 16, 30, 20, 38, 26, 44, 30, 36, 22, 28, 18, 24];

const steps = [
  {
    step: "01",
    title: "Create your account",
    body: "Register on Provn and pick a track—train your voice or your design skills, or join as an assessor to review learners' work.",
  },
  {
    step: "02",
    title: "Answer a few questions",
    body: "Tell us your goals, where you'll use the skill, and how long you want to train. Your programme is built around your answers.",
  },
  {
    step: "03",
    title: "Practise daily",
    body: "One focused exercise per calendar day for 7–60 days, with progress you can see and feedback from real assessors.",
  },
];

/* ----- Minimal stroke icons ----- */

function Icon({ children, className = "w-5 h-5" }) {
  return (
    <svg
      viewBox='0 0 24 24'
      className={className}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden
    >
      {children}
    </svg>
  );
}

function IconPen({ className }) {
  return (
    <Icon className={className}>
      <path d='M12 19l7-7 3 3-7 7-3-3z' />
      <path d='M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z' />
      <path d='M2 2l7.586 7.586' />
      <circle cx='11' cy='11' r='2' />
    </Icon>
  );
}

function IconPencil({ className }) {
  return (
    <Icon className={className}>
      <path d='M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' />
    </Icon>
  );
}

function IconCalendar({ className }) {
  return (
    <Icon className={className}>
      <rect x='3' y='4' width='18' height='18' rx='2' />
      <path d='M16 2v4M8 2v4M3 10h18' />
    </Icon>
  );
}

function IconTarget({ className }) {
  return (
    <Icon className={className}>
      <circle cx='12' cy='12' r='9' />
      <circle cx='12' cy='12' r='5' />
      <circle cx='12' cy='12' r='1' />
    </Icon>
  );
}

function IconChart({ className }) {
  return (
    <Icon className={className}>
      <path d='M3 3v18h18' />
      <path d='M7 15l4-5 3 3 5-6' />
    </Icon>
  );
}

function IconClock({ className }) {
  return (
    <Icon className={className}>
      <circle cx='12' cy='12' r='9' />
      <path d='M12 7v5l3 2' />
    </Icon>
  );
}

function IconSparkles({ className }) {
  return (
    <Icon className={className}>
      <path d='M12 4l1.7 4.3L18 10l-4.3 1.7L12 16l-1.7-4.3L6 10l4.3-1.7L12 4z' />
      <path d='M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z' />
    </Icon>
  );
}

function IconMic({ className }) {
  return (
    <Icon className={className}>
      <rect x='9' y='2' width='6' height='12' rx='3' />
      <path d='M5 10a7 7 0 0 0 14 0' />
      <path d='M12 19v3M8 22h8' />
    </Icon>
  );
}

function IconSeedling({ className }) {
  return (
    <Icon className={className}>
      <path d='M12 22v-8' />
      <path d='M12 14c0-4 3-7 8-7 0 4-3 7-8 7z' />
      <path d='M12 12c0-3.5-2.5-6-7-6 0 3.5 2.5 6 7 6z' />
    </Icon>
  );
}

function IconArrowRight({ className = "w-4 h-4" }) {
  return (
    <Icon className={className}>
      <path d='M4 12h16M13 5l7 7-7 7' />
    </Icon>
  );
}

function IconCheck({ className = "w-4 h-4" }) {
  return (
    <Icon className={className}>
      <path d='M4 12l5 5L20 6' />
    </Icon>
  );
}

function IconFlame({ className }) {
  return (
    <Icon className={className}>
      <path d='M12 22c4.4 0 7-2.8 7-6.5 0-3-1.8-4.9-3.2-6.4C14.6 7.8 14 6.5 14 4c-3.2 1.4-5 4-5 7-1-1-1.5-2-1.5-3.5C5.7 9 5 11 5 13.5 5 19.2 7.6 22 12 22z' />
    </Icon>
  );
}

const FEATURES = [
  {
    title: "Flexible length",
    description: "7–60 days per skill—one exercise per calendar day.",
    icon: IconCalendar,
  },
  {
    title: "Deep focus",
    description: "One skill at a time so practice stays meaningful.",
    icon: IconTarget,
  },
  {
    title: "Clear progress",
    description: "Weeks, days, and next steps always in view.",
    icon: IconChart,
  },
  {
    title: "Steady pacing",
    description: "A calendar rhythm that prevents burnout.",
    icon: IconClock,
  },
  {
    title: "Personalised",
    description: "Programmes shaped by your goals from day one.",
    icon: IconSparkles,
  },
  {
    title: "Growing library",
    description: "Voice and design today—more skills on the way.",
    icon: IconSeedling,
  },
];

const SKILL_ICONS = {
  "speech-training": IconMic,
  design: IconPen,
  "content-creation": IconPencil,
};

function PersonaBrand({ size = "md" }) {
  return (
    <Link
      to='/'
      className='inline-flex items-center gap-2.5 no-underline'
      aria-label='Provn — home'
    >
      <AppLogo
        variant='logo'
        size={size === "sm" ? "sm" : "md"}
        className='rounded-lg'
      />
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

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <RevealSection className='max-w-2xl'>
      {eyebrow && (
        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-persona-purple'>
          {eyebrow}
        </p>
      )}
      <h2 className='mt-3 text-3xl font-bold tracking-tight text-persona-ink md:text-4xl'>
        {title}
      </h2>
      {sub && (
        <p className='mt-4 text-base leading-relaxed text-persona-muted md:text-lg'>
          {sub}
        </p>
      )}
    </RevealSection>
  );
}

function ProgressRing({ value = 62, size = 44, stroke = 5 }) {
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
        stroke='#E9E6F0'
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='#0EAE6E'
        strokeWidth={stroke}
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

function PreviewStat({ children }) {
  return (
    <div className='flex items-center gap-3 p-4 bg-white border rounded-xl border-persona-border'>
      {children}
    </div>
  );
}

function ProductPreview() {
  return (
    <div className='relative w-full max-w-4xl mx-auto mt-16 hero-in hero-in-delay-4'>
      <div
        className='pointer-events-none absolute -inset-x-8 -top-10 bottom-10 -z-10 rounded-[2.5rem] bg-gradient-to-b from-persona-lavender/50 to-transparent blur-2xl'
        aria-hidden
      />
      <div className='overflow-hidden rounded-2xl border border-persona-border bg-white shadow-[0_1px_2px_rgba(23,19,31,0.06),0_24px_64px_-16px_rgba(23,19,31,0.14)]'>
        <div className='flex items-center gap-2 px-5 py-3 border-b border-persona-border bg-persona-surface/60'>
          <span
            className='h-2.5 w-2.5 rounded-full bg-persona-border'
            aria-hidden
          />
          <span
            className='h-2.5 w-2.5 rounded-full bg-persona-border'
            aria-hidden
          />
          <span
            className='h-2.5 w-2.5 rounded-full bg-persona-border'
            aria-hidden
          />
          <span className='ml-3 text-xs font-medium text-persona-muted'>
            persona · daily practice
          </span>
        </div>

        <div className='grid gap-6 p-6 md:grid-cols-[1.5fr_1fr] md:p-8'>
          <div className='p-5 border rounded-xl border-persona-border md:p-6'>
            <div className='flex items-center justify-between gap-3'>
              <div className='flex items-center gap-3'>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg bg-persona-lavender'>
                  <AppLogo variant='icon' size='sm' className='w-5 h-5' />
                </span>
                <div>
                  <p className='text-sm font-semibold text-persona-ink'>
                    Voice track
                  </p>
                  <p className='text-xs text-persona-muted'>Day 3 of 21</p>
                </div>
              </div>
              <span className='rounded-full bg-persona-lavender px-2.5 py-1 text-xs font-semibold text-persona-purple-dark'>
                Today
              </span>
            </div>

            <h3 className='mt-5 text-lg font-bold tracking-tight text-persona-ink'>
              Pace &amp; clarity drill
            </h3>
            <p className='mt-1 text-sm leading-relaxed text-persona-muted'>
              Read aloud, slow down on key words, and record your take.
            </p>

            <div className='mt-5 flex h-14 items-end justify-center gap-1.5 rounded-lg bg-persona-surface px-4 py-3'>
              {EQ_BARS.map((h, i) => (
                <span
                  key={i}
                  className='w-1 rounded-full eq-bar bg-persona-purple/70'
                  style={{
                    height: `${h * 0.8}px`,
                    animationDelay: `${i * 0.07}s`,
                  }}
                />
              ))}
            </div>

            <div className='flex items-center justify-between mt-5'>
              <span className='flex items-center gap-3'>
                <span className='flex items-center justify-center w-10 h-10 text-white rounded-full bg-persona-purple'>
                  <svg
                    viewBox='0 0 24 24'
                    className='w-4 h-4'
                    fill='currentColor'
                    aria-hidden
                  >
                    <path d='M8 5v14l11-7z' />
                  </svg>
                </span>
                <span className='text-sm font-medium text-persona-ink'>
                  Record your take
                </span>
              </span>
              <span className='text-xs font-medium text-persona-muted'>
                2:40
              </span>
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <PreviewStat>
              <span className='relative inline-flex shrink-0'>
                <ProgressRing value={62} />
                <span className='absolute inset-0 flex items-center justify-center text-[10px] font-bold text-persona-purple'>
                  62%
                </span>
              </span>
              <div>
                <p className='text-xs text-persona-muted'>Programme</p>
                <p className='text-sm font-semibold text-persona-ink'>
                  On track
                </p>
              </div>
            </PreviewStat>

            <PreviewStat>
              <span className='flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-persona-lavender text-persona-purple'>
                <IconFlame className='w-5 h-5' />
              </span>
              <div>
                <p className='text-xs text-persona-muted'>Streak</p>
                <p className='text-sm font-semibold text-persona-ink'>5 days</p>
              </div>
            </PreviewStat>

            <PreviewStat>
              <span className='flex items-center justify-center w-10 h-10 text-green-600 rounded-lg shrink-0 bg-green-50'>
                <IconCheck className='w-5 h-5' />
              </span>
              <div>
                <p className='text-xs text-persona-muted'>Assessor feedback</p>
                <p className='text-sm font-semibold text-persona-ink'>
                  Scored 8/10
                </p>
              </div>
            </PreviewStat>

            <div className='p-4 mt-auto rounded-xl bg-persona-surface'>
              <p className='text-xs leading-relaxed text-persona-muted'>
                “Great pacing on the second read—keep landing those pauses.”
              </p>
              <p className='mt-2 text-xs font-semibold text-persona-ink'>
                — Your assessor
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillCard({ skill, index }) {
  const [ref, visible] = useRevealOnScroll({ threshold: 0.1 });
  const available = skill.status === "available";
  const FallbackIcon = SKILL_ICONS[skill.id] || IconSparkles;

  const body = (
    <>
      <div className='flex items-start justify-between gap-3'>
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            available
              ? "bg-persona-lavender text-persona-purple"
              : "bg-persona-surface text-persona-muted"
          }`}
        >
          <FallbackIcon className='w-5 h-5' />
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            available
              ? "bg-green-50 text-green-700"
              : "bg-persona-surface text-persona-muted"
          }`}
        >
          {skill.tag}
        </span>
      </div>

      <h3
        className={`mt-5 text-xl font-bold tracking-tight ${
          available ? "text-persona-ink" : "text-persona-muted"
        }`}
      >
        {skill.title}
      </h3>
      <p className='mt-2 text-sm leading-relaxed text-persona-muted'>
        {skill.description}
      </p>

      {skill.highlights?.length > 0 && (
        <ul className='flex flex-wrap gap-2 mt-4'>
          {skill.highlights.map((item) => (
            <li
              key={item}
              className='rounded-full border border-persona-border px-2.5 py-1 text-xs font-medium text-persona-muted'
            >
              {item}
            </li>
          ))}
        </ul>
      )}

      <div className='flex items-center justify-between pt-6 mt-auto'>
        <span className='text-xs font-medium text-persona-muted'>
          {skill.durationLabel}
        </span>
        {available ? (
          <span className='inline-flex items-center gap-1.5 text-sm font-semibold text-persona-purple'>
            {skill.ctaLabel || `Explore ${skill.name}`}
            <IconArrowRight />
          </span>
        ) : (
          <span className='text-xs font-medium text-persona-muted'>
            Not available yet
          </span>
        )}
      </div>
    </>
  );

  return (
    <li
      ref={ref}
      className={`reveal reveal-stagger-${(index % 3) + 1} ${visible ? "is-visible" : ""}`}
    >
      {available ? (
        <Link
          to={skill.registerPath}
          className='flex flex-col h-full no-underline bg-white border card-lift rounded-2xl border-persona-border p-7'
        >
          {body}
        </Link>
      ) : (
        <div className='flex flex-col h-full border border-dashed rounded-2xl border-persona-border bg-persona-surface/50 p-7'>
          {body}
        </div>
      )}
    </li>
  );
}

export default function PersonaLanding() {
  return (
    <div className='min-h-screen font-sans antialiased bg-white persona-landing text-persona-ink'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b border-persona-border bg-white/85 backdrop-blur-lg'>
        <div className='flex items-center justify-between h-16 max-w-6xl gap-6 px-6 mx-auto'>
          <PersonaBrand />
          <nav className='items-center hidden gap-7 md:flex' aria-label='Main'>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className='text-sm font-medium transition text-persona-muted hover:text-persona-ink'
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className='flex items-center gap-3 shrink-0'>
            <Link
              to='/login'
              className='hidden text-sm font-medium transition text-persona-muted hover:text-persona-ink sm:inline'
            >
              Sign in
            </Link>
            <Link to='/register' className='btn-primary !px-4 !py-2'>
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className='relative px-6 pt-20 pb-20 overflow-hidden md:pt-28'>
        <div
          className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(14,174,110,0.10),transparent),radial-gradient(ellipse_40%_35%_at_80%_10%,rgba(52,194,137,0.07),transparent)]'
          aria-hidden
        />
        <div className='max-w-3xl mx-auto text-center'>
          <span className='hero-in hero-in-delay-1 inline-flex items-center gap-2 rounded-full border border-persona-border bg-white px-3.5 py-1.5 text-xs font-semibold text-persona-muted shadow-soft'>
            <span
              className='h-1.5 w-1.5 rounded-full bg-persona-purple'
              aria-hidden
            />
            Voice &amp; design training — now enrolling
          </span>

          <h1 className='hero-in hero-in-delay-2 mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-persona-ink sm:text-5xl md:text-6xl'>
            The skills you want,
            <br />
            built{" "}
            <span className='text-transparent bg-gradient-to-r from-persona-purple to-persona-violet bg-clip-text'>
              one day at a time
            </span>
          </h1>

          <p className='max-w-xl mx-auto mt-6 text-lg leading-relaxed hero-in hero-in-delay-3 text-persona-muted'>
            Provn turns self-development into a daily programme. Create an
            account, choose to train your voice or your design skills, and get
            one focused exercise every day for 7–60 days.
          </p>

          <div className='flex flex-wrap items-center justify-center gap-3 hero-in hero-in-delay-3 mt-9'>
            <Link
              to='/register'
              className='btn-primary !px-7 !py-3.5 !text-base'
            >
              Create your account
              <IconArrowRight />
            </Link>
            <a
              href='#skills'
              className='btn-secondary !px-7 !py-3.5 !text-base'
            >
              Browse skills
            </a>
          </div>

          <p className='mt-5 text-sm hero-in hero-in-delay-4 text-persona-muted'>
            Coach, vocalist, or working designer?{" "}
            <Link
              to='/register?role=assessor'
              className='font-semibold text-persona-purple underline-offset-4 hover:underline'
            >
              Join as an assessor
            </Link>
          </p>

          <ul className='flex flex-wrap items-center justify-center mt-10 text-xs font-medium hero-in hero-in-delay-4 gap-x-3 gap-y-2 text-persona-muted'>
            {HERO_DISCIPLINES.map((item, i) => (
              <li key={item} className='flex items-center gap-3'>
                {i > 0 && (
                  <span
                    className='w-1 h-1 rounded-full bg-persona-border'
                    aria-hidden
                  />
                )}
                {item}
              </li>
            ))}
          </ul>
        </div>

        <ProductPreview />
      </section>

      {/* Stats strip */}
      <section className='px-6 border-y border-persona-border bg-persona-surface/60'>
        <ul className='grid max-w-4xl grid-cols-2 py-10 mx-auto divide-persona-border sm:grid-cols-4 sm:divide-x'>
          {STATS.map((stat) => (
            <li key={stat.label} className='px-6 py-2 text-center'>
              <p className='text-2xl font-bold tracking-tight text-persona-ink'>
                {stat.value}
              </p>
              <p className='mt-1 text-xs font-medium text-persona-muted'>
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Skills */}
      <section id='skills' className='px-6 py-24'>
        <div className='max-w-6xl mx-auto'>
          <SectionHeading
            eyebrow='Skills library'
            title='Choose what to work on'
            sub='Each skill is a guided programme with daily exercises. Voice and design training are open today; content creation is on the way.'
          />
          <ul className='grid items-stretch gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3'>
            {PERSONA_SKILLS.map((skill, index) => (
              <SkillCard key={skill.id} skill={skill} index={index} />
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section
        id='how-it-works'
        className='px-6 py-24 border-y border-persona-border bg-persona-surface/60'
      >
        <div className='max-w-6xl mx-auto'>
          <SectionHeading
            eyebrow='How it works'
            title='From sign-up to habit in three steps'
          />
          <ol className='grid gap-10 mt-12 md:grid-cols-3'>
            {steps.map((item, i) => (
              <RevealSection
                key={item.step}
                as='li'
                className={`reveal-stagger-${i + 1}`}
              >
                <span className='inline-flex items-center justify-center px-3 text-sm font-bold bg-white border rounded-lg h-9 border-persona-border text-persona-purple'>
                  {item.step}
                </span>
                <h3 className='mt-4 text-lg font-bold tracking-tight text-persona-ink'>
                  {item.title}
                </h3>
                <p className='mt-2 text-sm leading-relaxed text-persona-muted'>
                  {item.body}
                </p>
              </RevealSection>
            ))}
          </ol>
        </div>
      </section>

      {/* Why Provn */}
      <section id='why' className='px-6 py-24'>
        <div className='max-w-6xl mx-auto'>
          <SectionHeading
            eyebrow='Why Provn'
            title='Built for lasting growth'
            sub='Everything about Provn is designed to make daily practice stick.'
          />
          <ul className='grid mt-12 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3'>
            {FEATURES.map((feature, i) => (
              <RevealSection
                key={feature.title}
                as='li'
                className={`reveal-stagger-${(i % 3) + 1}`}
              >
                <span className='flex items-center justify-center w-10 h-10 rounded-lg bg-persona-lavender text-persona-purple'>
                  <feature.icon className='w-5 h-5' />
                </span>
                <h3 className='mt-4 text-base font-bold text-persona-ink'>
                  {feature.title}
                </h3>
                <p className='mt-1.5 text-sm leading-relaxed text-persona-muted'>
                  {feature.description}
                </p>
              </RevealSection>
            ))}
          </ul>
        </div>
      </section>

      {/* Waitlist */}
      <section id='waitlist' className='px-6 pb-24'>
        <RevealSection className='max-w-6xl mx-auto'>
          <div className='flex flex-col items-start justify-between gap-6 p-8 border rounded-2xl border-persona-border bg-persona-surface/60 md:flex-row md:items-center md:p-10'>
            <div className='max-w-xl'>
              <h2 className='text-xl font-bold tracking-tight text-persona-ink md:text-2xl'>
                Don&apos;t see your skill yet?
              </h2>
              <p className='mt-2 text-sm leading-relaxed text-persona-muted md:text-base'>
                Tell us what you want to learn, how you want to stay
                accountable, and what you&apos;d pay—help shape what we build
                next.
              </p>
            </div>
            <Link to='/waitlist' className='btn-secondary shrink-0 !bg-white'>
              Join the waitlist
              <IconArrowRight />
            </Link>
          </div>
        </RevealSection>
      </section>

      {/* CTA */}
      <section className='px-6 pb-24'>
        <RevealSection className='max-w-6xl mx-auto'>
          <div className='relative px-8 py-16 overflow-hidden text-center rounded-3xl bg-gradient-to-br from-persona-purple via-persona-purple to-persona-purple-dark md:py-20'>
            <div
              className='pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(255,255,255,0.14),transparent)]'
              aria-hidden
            />
            <h2 className='relative text-3xl font-bold tracking-tight text-white md:text-4xl'>
              Start training today
            </h2>
            <p className='relative max-w-xl mx-auto mt-4 text-base leading-relaxed text-white/80'>
              Pick your track—voice or design—answer a few questions, and get a
              daily programme built around your goals.
            </p>
            <div className='relative flex flex-wrap items-center justify-center gap-3 mt-8'>
              <Link
                to='/register'
                className='btn-light !px-7 !py-3.5 !text-base'
              >
                Create your account
                <IconArrowRight />
              </Link>
              <Link
                to='/register?role=assessor'
                className='text-sm font-semibold transition text-white/85 underline-offset-4 hover:text-white hover:underline'
              >
                Join as an assessor
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className='px-6 py-12 border-t border-persona-border bg-persona-surface/60'>
        <div className='flex flex-col items-start justify-between max-w-6xl gap-8 mx-auto md:flex-row md:items-center'>
          <div>
            <PersonaBrand size='sm' />
            <p className='mt-3 text-sm text-persona-muted'>
              Self-development, one skill at a time.
            </p>
          </div>
          <nav
            className='flex flex-wrap items-center text-sm font-medium gap-x-6 gap-y-2 text-persona-muted'
            aria-label='Footer'
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className='transition hover:text-persona-ink'
              >
                {link.label}
              </a>
            ))}
            <Link to='/login' className='transition hover:text-persona-ink'>
              Sign in
            </Link>
            <Link
              to='/register'
              className='font-semibold text-persona-purple hover:underline'
            >
              Get started
            </Link>
          </nav>
        </div>
        <p className='max-w-6xl mx-auto mt-10 text-xs text-persona-muted'>
          © {new Date().getFullYear()} Provn
        </p>
      </footer>
    </div>
  );
}
