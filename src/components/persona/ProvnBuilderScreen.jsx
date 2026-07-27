import { useEffect, useMemo, useState } from "react";
import AppLogo from "../AppLogo";

function QuestRow({ quest, index, unlocked, active, complete }) {
  return (
    <li
      className={`programme-builder-quest flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-500 ${
        complete
          ? "bg-white/90 shadow-[0_4px_20px_rgba(14,174,110,0.15)]"
          : active
            ? "bg-white/70 ring-2 ring-persona-purple/40"
            : unlocked
              ? "bg-white/40"
              : "bg-white/20 opacity-60"
      }`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform duration-500 ${
          complete
            ? "programme-builder-pop scale-110 bg-persona-purple text-white"
            : "bg-persona-lavender"
        }`}
        aria-hidden
      >
        {complete ? "✓" : quest.icon}
      </span>
      <span className='flex-1 text-sm font-semibold text-persona-ink'>
        {quest.label}
      </span>
      {active && !complete && (
        <span
          className='w-2 h-2 rounded-full programme-builder-pulse bg-persona-purple'
          aria-hidden
        />
      )}
    </li>
  );
}

/**
 * Provn's gamified "building your thing" loading screen—used for account
 * provisioning (voice programme, assessor hub) and skill-task generation.
 * Purely presentational: callers own the copy and quest list so this stays
 * reusable across contexts instead of branching internally like the old
 * Speakly-only version did.
 */
export default function ProvnBuilderScreen({
  eyebrow = "Provn forge",
  headline,
  subtitle,
  celebrateEyebrow = "Quest complete",
  celebrateHeadline,
  celebrateSubtitle,
  quests,
  footerNote,
  complete = false,
  error = null,
  onFinished,
  manualContinue = false,
  continueLabel = "Continue",
}) {
  const [progress, setProgress] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  const ready = complete && celebrating;

  const activeQuestIndex = useMemo(() => {
    if (complete) return quests.length - 1;
    const slot = Math.floor((progress / 100) * quests.length);
    return Math.min(slot, quests.length - 1);
  }, [complete, progress, quests.length]);

  useEffect(() => {
    if (complete) return undefined;

    const tick = setInterval(() => {
      setProgress((value) => {
        const bump = 1.2 + Math.random() * 2.4;
        return Math.min(value + bump, 92);
      });
    }, 320);

    return () => clearInterval(tick);
  }, [complete]);

  useEffect(() => {
    if (!complete || celebrating) return undefined;

    setProgress(100);
    setCelebrating(true);

    if (manualContinue) return undefined;

    const timer = setTimeout(() => {
      onFinished?.();
    }, 1600);

    return () => clearTimeout(timer);
  }, [complete, celebrating, manualContinue, onFinished]);

  return (
    <div className='relative flex flex-col items-center justify-center min-h-screen px-6 py-12 overflow-hidden font-sans text-white persona-app programme-builder bg-gradient-to-br from-persona-ink via-[#0B2C1F] to-persona-purple-dark'>
      <div
        className='absolute rounded-full pointer-events-none programme-builder-orb -left-24 top-1/4 h-80 w-80 bg-persona-purple/30 blur-[100px]'
        aria-hidden
      />
      <div
        className='absolute rounded-full pointer-events-none programme-builder-orb-alt -right-16 bottom-1/4 h-72 w-72 bg-persona-purple/20 blur-[90px]'
        aria-hidden
      />

      {celebrating && (
        <div
          className='absolute inset-0 pointer-events-none programme-builder-confetti'
          aria-hidden
        />
      )}

      <div className='relative z-10 w-full max-w-lg'>
        <div className='flex flex-col items-center mb-8 text-center'>
          <AppLogo
            variant='icon'
            size='lg'
            className={`brightness-0 invert ${
              celebrating ? "provn-mark-settle" : "provn-mark-spin"
            }`}
          />
          <p className='mt-6 text-xs font-bold uppercase tracking-[0.2em] text-persona-purple/90'>
            {celebrating ? celebrateEyebrow : eyebrow}
          </p>
          <h1 className='mt-2 text-3xl font-normal leading-tight font-display md:text-4xl'>
            {celebrating ? celebrateHeadline : headline}
          </h1>
          <p className='max-w-md mt-3 text-base leading-relaxed text-white/70'>
            {celebrating ? celebrateSubtitle : subtitle}
          </p>
        </div>

        <div
          className={`rounded-3xl border border-white/10 bg-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md ${
            celebrating ? "programme-builder-glow" : ""
          }`}
        >
          <div className='flex items-center justify-between mb-2 text-xs font-bold uppercase tracking-wider text-white/60'>
            <span>{celebrating ? "Level unlocked" : "Building progress"}</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className='relative h-4 overflow-hidden rounded-full bg-white/15'>
            <div
              className='absolute inset-y-0 left-0 rounded-full programme-builder-xp bg-gradient-to-r from-persona-purple-dark via-persona-purple to-persona-violet'
              style={{ width: `${progress}%` }}
            />
            <div
              className='absolute inset-0 rounded-full programme-builder-shimmer'
              aria-hidden
            />
          </div>

          <ul className='mt-6 space-y-2'>
            {quests.map((quest, index) => (
              <QuestRow
                key={quest.label}
                quest={quest}
                index={index}
                unlocked={index <= activeQuestIndex}
                active={index === activeQuestIndex && !complete && !celebrating}
                complete={complete && index <= activeQuestIndex}
              />
            ))}
          </ul>

          {error && (
            <p className='px-4 py-3 mt-4 text-sm text-red-100 bg-red-500/20 rounded-2xl'>
              {error}
            </p>
          )}

          {!ready && !error && !manualContinue && (
            <p className='mt-5 text-center text-xs text-white/50'>
              Hang tight—this usually takes a few seconds.
            </p>
          )}

          {manualContinue && !error && (
            <button
              type='button'
              disabled={!complete}
              onClick={() => onFinished?.()}
              className='flex items-center justify-center w-full gap-2 py-4 mt-6 text-base font-bold text-white transition rounded-2xl bg-persona-purple shadow-[0_4px_20px_rgba(14,174,110,0.35)] hover:bg-persona-purple-hover disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/45 disabled:shadow-none'
            >
              {complete ? continueLabel : "Continue"}
            </button>
          )}

          {manualContinue && !complete && !error && (
            <p className='mt-3 text-center text-xs text-white/50'>
              This unlocks here when it&apos;s ready.
            </p>
          )}
        </div>

        {footerNote && !celebrating && (
          <p className='mt-6 text-center font-display text-lg text-white/40'>
            {footerNote}
          </p>
        )}
      </div>
    </div>
  );
}
