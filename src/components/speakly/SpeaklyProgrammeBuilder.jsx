import { useEffect, useMemo, useState } from 'react';
import AppLogo from '../AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import {
  SPEAKLY_ROLE_ASSESSOR,
  SPEAKLY_ROLE_LEARNER,
} from '../../config/speaklyRegistration';

const LEARNER_QUESTS = [
  { label: 'Decoding your speaking goals', icon: '🎯' },
  { label: 'Mapping your real-world stages', icon: '🌍' },
  { label: 'Forging daily voice quests', icon: '⚔️' },
  { label: 'Tuning clarity milestones', icon: '🎤' },
  { label: 'Sealing your personalised programme', icon: '✨' },
];

const ASSESSOR_QUESTS = [
  { label: 'Verifying your credentials', icon: '📜' },
  { label: 'Preparing your review workspace', icon: '🔍' },
  { label: 'Unlocking the assessor dashboard', icon: '🛡️' },
];

function QuestRow({ quest, index, unlocked, active, complete }) {
  return (
    <li
      className={`programme-builder-quest flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-500 ${
        complete
          ? 'bg-white/90 shadow-[0_4px_20px_rgba(217,93,57,0.15)]'
          : active
            ? 'bg-white/70 ring-2 ring-speakly-coral/40'
            : unlocked
              ? 'bg-white/40'
              : 'bg-white/20 opacity-60'
      }`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-transform duration-500 ${
          complete ? 'programme-builder-pop scale-110 bg-speakly-coral text-white' : 'bg-speakly-coral-light'
        }`}
        aria-hidden
      >
        {complete ? '✓' : quest.icon}
      </span>
      <span className="flex-1 text-sm font-semibold text-speakly-ink">{quest.label}</span>
      {active && !complete && (
        <span className="programme-builder-pulse h-2 w-2 rounded-full bg-speakly-coral" aria-hidden />
      )}
    </li>
  );
}

export default function SpeaklyProgrammeBuilder({
  userName,
  programDuration,
  role = SPEAKLY_ROLE_LEARNER,
  complete = false,
  error = null,
  onFinished,
  subtitle,
  autoEnter = false,
  manualContinue = false,
}) {
  const quests = role === SPEAKLY_ROLE_ASSESSOR ? ASSESSOR_QUESTS : LEARNER_QUESTS;
  const [progress, setProgress] = useState(0);
  const [celebrating, setCelebrating] = useState(false);

  const ready = complete && celebrating;
  const continueLabel =
    role === SPEAKLY_ROLE_ASSESSOR
      ? 'Go to assessor dashboard'
      : 'Start my programme';

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
    }, autoEnter ? 450 : 2200);

    return () => clearTimeout(timer);
  }, [autoEnter, complete, celebrating, manualContinue, onFinished]);

  const headline =
    role === SPEAKLY_ROLE_ASSESSOR
      ? 'Setting up your assessor hub'
      : `Building your ${programDuration}-day speaking quest`;

  const defaultSubtitle =
    role === SPEAKLY_ROLE_ASSESSOR
      ? 'We are wiring up your review tools—almost ready to welcome learners.'
      : 'Every day is a new level. We are crafting exercises from what you told us.';

  return (
    <div className="speakly-app programme-builder relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#2a1812] via-[#3d2218] to-[#1c1c1c] px-6 py-12 font-speakly text-white">
      <div
        className="programme-builder-orb pointer-events-none absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-speakly-coral/30 blur-[100px]"
        aria-hidden
      />
      <div
        className="programme-builder-orb-alt pointer-events-none absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-speakly-coral/20 blur-[90px]"
        aria-hidden
      />

      {celebrating && (
        <div className="programme-builder-confetti pointer-events-none absolute inset-0" aria-hidden />
      )}

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <AppLogo
            projectId={SPEECH_TRAINING_PROJECT_ID}
            variant="icon"
            size="lg"
            className="brightness-0 invert programme-builder-float"
          />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-speakly-coral/90">
            {celebrating ? 'Quest complete' : 'Speakly forge'}
          </p>
          <h1 className="font-display mt-2 text-3xl font-normal leading-tight md:text-4xl">
            {celebrating
              ? `You're in, ${userName?.split(' ')[0] || 'speaker'}!`
              : headline}
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-white/70">
            {celebrating
              ? role === SPEAKLY_ROLE_ASSESSOR
                ? 'Your assessor dashboard is ready. Let us go.'
                : 'Your personalised programme is locked and loaded. Time to speak with intention.'
              : subtitle || defaultSubtitle}
          </p>
        </div>

        <div
          className={`rounded-3xl border border-white/10 bg-white/10 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md ${
            celebrating ? 'programme-builder-glow' : ''
          }`}
        >
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/60">
            <span>{celebrating ? 'Level unlocked' : 'XP progress'}</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="relative h-4 overflow-hidden rounded-full bg-white/15">
            <div
              className="programme-builder-xp absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-speakly-coral-dark via-speakly-coral to-[#ffb89a]"
              style={{ width: `${progress}%` }}
            />
            <div className="programme-builder-shimmer absolute inset-0 rounded-full" aria-hidden />
          </div>

          <div className="mt-6 flex justify-center gap-1.5" aria-hidden>
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="programme-builder-wave w-1 rounded-full bg-speakly-coral/80"
                style={{
                  height: `${12 + (index % 5) * 6}px`,
                  animationDelay: `${index * 0.07}s`,
                }}
              />
            ))}
          </div>

          <ul className="mt-6 space-y-2">
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
            <p className="mt-4 rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          {!ready && !error && !manualContinue && (
            <p className="mt-5 text-center text-xs text-white/50">
              Hang tight—this usually takes a few seconds.
            </p>
          )}

          {manualContinue && !error && (
            <button
              type="button"
              disabled={!complete}
              onClick={() => onFinished?.()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-speakly-coral py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(217,93,57,0.35)] transition hover:bg-speakly-coral-hover disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/45 disabled:shadow-none"
            >
              {complete ? continueLabel : 'Continue'}
            </button>
          )}

          {manualContinue && !complete && !error && (
            <p className="mt-3 text-center text-xs text-white/50">
              Your programme unlocks here when it&apos;s ready.
            </p>
          )}
        </div>

        {role === SPEAKLY_ROLE_LEARNER && programDuration && !celebrating && (
          <p className="mt-6 text-center font-display text-lg text-white/40">
            {programDuration} days · {Math.ceil(programDuration / 7)} weeks · infinite reps
          </p>
        )}
      </div>
    </div>
  );
}
