import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { phases } from './phases';
import { useSpeechTrainingProgress } from '../../hooks/useSpeechTrainingProgress';
import { getNextAllowedDay, isDayLocked } from '../../lib/speechTrainingProgress';
import DayRecorder from './components/DayRecorder';

const phaseLabels = { 1: 'The Brake', 2: 'The Shape', 3: 'The Platform' };

const typePills = {
  Awareness: 'bg-amber-50 text-amber-700',
  Articulation: 'bg-orange-50 text-taskly-peach-text',
  Pacing: 'bg-violet-50 text-violet-700',
  Rhythm: 'bg-rose-50 text-rose-600',
  Muscle: 'bg-sky-50 text-sky-700',
  Reflection: 'bg-yellow-50 text-yellow-800',
  Clarity: 'bg-emerald-50 text-emerald-700',
  Structure: 'bg-fuchsia-50 text-fuchsia-700',
  Emotion: 'bg-orange-50 text-orange-700',
  Flow: 'bg-cyan-50 text-cyan-700',
  Feedback: 'bg-lime-50 text-lime-700',
  Review: 'bg-amber-50 text-amber-800',
  Delivery: 'bg-violet-50 text-violet-700',
  Impact: 'bg-teal-50 text-teal-700',
  Physical: 'bg-stone-100 text-stone-700',
  Spontaneity: 'bg-red-50 text-red-600',
  Expression: 'bg-indigo-50 text-indigo-700',
  Performance: 'bg-pink-50 text-pink-700',
};

function CheckIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DayIcon({ type }) {
  const icons = {
    Awareness: '🎯',
    Articulation: '🗣️',
    Pacing: '⏱️',
    Rhythm: '🎵',
    Muscle: '💪',
    Reflection: '📝',
    Clarity: '💡',
    Structure: '📐',
    Emotion: '❤️',
    Flow: '〰️',
    Feedback: '👂',
    Review: '🔍',
    Delivery: '🎤',
    Impact: '⚡',
    Physical: '🧍',
    Spontaneity: '🎲',
    Expression: '✨',
    Performance: '🌟',
  };
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-soft">
      {icons[type] || '📋'}
    </span>
  );
}

function ProgressRing({ pct }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative h-24 w-24">
      <svg className="-rotate-90" viewBox="0 0 88 88" aria-hidden>
        <circle cx="44" cy="44" r={r} fill="none" stroke="#F0F0F0" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="#F5D76E"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-taskly-ink">{pct}%</span>
        <span className="text-[10px] uppercase tracking-wider text-taskly-muted">done</span>
      </div>
    </div>
  );
}

function DayGrid({ completed, activeDay, onSelectDay }) {
  const allDays = phases.flatMap((p) => p.days);
  return (
    <div className="mt-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-taskly-muted">
        21-day track
      </p>
      <div className="grid grid-cols-7 gap-1.5">
        {allDays.map((d) => {
          const done = completed[d.day];
          const locked = isDayLocked(d.day, completed);
          const isActive = activeDay?.day === d.day;
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => onSelectDay(d)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                done
                  ? 'bg-taskly-yellow text-taskly-ink'
                  : isActive
                    ? 'bg-taskly-ink text-white ring-2 ring-taskly-yellow ring-offset-1'
                    : locked
                      ? 'bg-neutral-100 text-neutral-300'
                      : 'bg-white text-taskly-muted hover:bg-neutral-100'
              }`}
              title={
                locked
                  ? `Day ${d.day} — complete Day ${d.day - 1} first`
                  : `Day ${d.day}: ${d.title}`
              }
            >
              {done ? <CheckIcon className="h-3.5 w-3.5" /> : locked ? '🔒' : d.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayDetail({
  day,
  phase,
  completed,
  recording,
  canRecord,
  uploading,
  locked,
  onBack,
  onSaveRecording,
  onClearProgress,
}) {
  const isDone = completed[day.day];
  const pill = typePills[day.type] || 'bg-taskly-peach text-taskly-peach-text';

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-1 text-sm font-medium text-taskly-muted transition hover:text-taskly-ink"
      >
        <span aria-hidden>‹</span> Back to schedule
      </button>

      <article className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className={`p-8 ${isDone ? 'bg-taskly-yellow' : 'bg-white'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${pill}`}
              >
                {day.type}
              </span>
              <p className="mt-3 text-sm font-medium text-taskly-muted">
                Day {day.day} · {phaseLabels[phase.id]}
              </p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-taskly-ink">
                {day.title}
              </h2>
              <p className="mt-2 text-sm text-taskly-muted">{day.duration}</p>
            </div>
            <DayIcon type={day.type} />
          </div>
        </div>

        <div className="space-y-5 p-8">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-taskly-muted">
              Today&apos;s practice
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-taskly-ink/90">
              {day.description}
            </p>
          </section>

          <section className="rounded-2xl bg-taskly-surface p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-taskly-peach-text">
              The exercise
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-taskly-ink/80">{day.exercise}</p>
          </section>

          <section className="rounded-2xl border border-taskly-border p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Why this works
            </h3>
            <p className="mt-2 text-sm italic leading-relaxed text-taskly-muted">{day.why}</p>
          </section>

          <section className="border-l-4 border-taskly-yellow pl-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-taskly-muted">
              Coach&apos;s tip
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-taskly-ink/75">{day.tip}</p>
          </section>

          <DayRecorder
            dayNum={day.day}
            recording={recording}
            canRecord={canRecord}
            uploading={uploading}
            locked={locked}
            lockedReason={
              locked
                ? `Complete Day ${day.day - 1} before you can record Day ${day.day}.`
                : undefined
            }
            onSaveRecording={onSaveRecording}
            onClearProgress={onClearProgress}
          />
        </div>
      </article>
    </div>
  );
}

export default function SpeechTraining() {
  const [activePhase, setActivePhase] = useState(0);
  const [activeDay, setActiveDay] = useState(null);
  const {
    completed,
    recordings,
    saveRecording,
    clearDayProgress,
    uploadingDay,
    loading,
    syncError,
    isSynced,
    canRecord,
  } = useSpeechTrainingProgress();

  const phase = phases[activePhase];
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPct = Math.round((completedCount / 21) * 100);

  const currentDayNum = useMemo(() => getNextAllowedDay(completed), [completed]);

  const findDayGlobally = (dayNum) => {
    for (const p of phases) {
      const found = p.days.find((d) => d.day === dayNum);
      if (found) return { day: found, phase: p };
    }
    return null;
  };

  const handleSelectDay = (day) => {
    const phaseIndex = phases.findIndex((p) => p.days.some((d) => d.day === day.day));
    if (phaseIndex >= 0) setActivePhase(phaseIndex);
    setActiveDay(day);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white font-sans text-taskly-muted">
        Loading your progress…
      </div>
    );
  }

  const detailPhase =
    activeDay && phases.find((p) => p.days.some((d) => d.day === activeDay.day));

  return (
    <div className="min-h-screen bg-white font-sans text-taskly-ink">
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col lg:flex-row">
        {/* Left sidebar */}
        <aside className="w-full shrink-0 border-b border-taskly-border bg-white p-6 lg:w-72 lg:border-b-0 lg:border-r lg:p-8">
          <Link to="/" className="mb-8 flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-taskly-yellow text-lg font-bold text-taskly-ink">
              +
            </span>
            <span className="text-xl font-bold text-taskly-ink">speakly</span>
          </Link>

          <p className="text-xs font-semibold uppercase tracking-wider text-taskly-muted">
            Phases
          </p>
          <ul className="mt-3 space-y-2">
            {phases.map((p, i) => {
              const phaseDone = p.days.filter((d) => completed[d.day]).length;
              const isActive = activePhase === i && !activeDay;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhase(i);
                      setActiveDay(null);
                    }}
                    className={`w-full rounded-2xl p-4 text-left transition ${
                      isActive
                        ? 'bg-taskly-yellow shadow-soft'
                        : 'bg-taskly-surface hover:bg-neutral-100'
                    }`}
                  >
                    <p className="text-xs font-medium text-taskly-muted">{p.subtitle}</p>
                    <p className="mt-0.5 font-semibold text-taskly-ink">{phaseLabels[p.id]}</p>
                    <p className="mt-1 text-xs text-taskly-muted">
                      {phaseDone}/{p.days.length} days
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          <DayGrid
            completed={completed}
            activeDay={activeDay}
            onSelectDay={(d) => {
              const match = findDayGlobally(d.day);
              if (match) handleSelectDay(match.day);
            }}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-10">
          {activeDay && detailPhase ? (
            <DayDetail
              day={activeDay}
              phase={detailPhase}
              completed={completed}
              recording={recordings[activeDay.day]}
              canRecord={canRecord}
              uploading={uploadingDay === activeDay.day}
              locked={isDayLocked(activeDay.day, completed)}
              onBack={() => setActiveDay(null)}
              onSaveRecording={saveRecording}
              onClearProgress={clearDayProgress}
            />
          ) : (
            <>
              <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  <span className="text-taskly-muted">Phase schedule — </span>
                  <span className="text-taskly-yellow">{phase.subtitle}</span>
                </h1>
                <p className="mt-2 max-w-lg text-sm text-taskly-muted">{phase.tagline}</p>
              </header>

              <ul className="space-y-3">
                {phase.days.map((day) => {
                  const isDone = completed[day.day];
                  const isCurrent = day.day === currentDayNum;
                  const locked = isDayLocked(day.day, completed);
                  const pill = typePills[day.type] || 'bg-taskly-peach text-taskly-peach-text';

                  return (
                    <li key={day.day}>
                      <button
                        type="button"
                        onClick={() => setActiveDay(day)}
                        className={`group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${
                          isDone
                            ? 'bg-taskly-yellow shadow-soft hover:bg-taskly-yellow-hover'
                            : isCurrent
                              ? 'border-2 border-taskly-yellow bg-white shadow-card'
                              : locked
                                ? 'border border-dashed border-neutral-200 bg-neutral-50 opacity-70'
                                : 'border border-taskly-border bg-white shadow-soft hover:border-taskly-yellow/50 hover:shadow-card'
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isDone
                              ? 'bg-white/80 text-taskly-ink'
                              : 'bg-taskly-surface text-taskly-muted group-hover:bg-taskly-yellow/30'
                          }`}
                        >
                          {isDone ? (
                            <CheckIcon className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-bold">{day.day}</span>
                          )}
                        </span>

                        {!isDone && <DayIcon type={day.type} />}

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-taskly-ink">{day.title}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${pill}`}
                            >
                              {day.type}
                            </span>
                            <span className="text-xs text-taskly-muted">{day.duration}</span>
                            {isCurrent && (
                              <span className="rounded-full bg-taskly-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                Up next
                              </span>
                            )}
                            {locked && (
                              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                                Locked
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-taskly-muted opacity-0 transition group-hover:opacity-100">
                          ›
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-8 text-center text-xs text-taskly-muted">
                Tap a day to open exercises and record your practice.
              </p>
            </>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="w-full shrink-0 border-t border-taskly-border bg-taskly-surface/50 p-6 lg:w-64 lg:border-l lg:border-t-0 lg:p-8">
          <div className="rounded-3xl bg-white p-6 shadow-card">
            <p className="text-sm font-semibold text-taskly-ink">Your progress</p>
            <div className="mt-4 flex justify-center">
              <ProgressRing pct={progressPct} />
            </div>
            <p className="mt-3 text-center text-sm text-taskly-muted">
              <span className="font-bold text-taskly-ink">{completedCount}</span> of 21 days
              complete
            </p>
          </div>

          <div className="mt-4 rounded-3xl bg-white p-5 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wider text-taskly-muted">
              Phase goal
            </p>
            <p className="mt-2 text-sm leading-relaxed text-taskly-ink/80">{phase.goal}</p>
          </div>

          {currentDayNum && !activeDay && (
            <div className="mt-4 rounded-3xl bg-taskly-yellow p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-taskly-ink/60">
                Focus today
              </p>
              <p className="mt-1 text-lg font-bold text-taskly-ink">Day {currentDayNum}</p>
              <button
                type="button"
                onClick={() => {
                  const match = findDayGlobally(currentDayNum);
                  if (match) handleSelectDay(match.day);
                }}
                className="mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-taskly-ink text-white transition hover:scale-105"
                aria-label="Open current day"
              >
                →
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-[11px] text-taskly-muted">
            {canRecord
              ? 'Recordings saved to Firebase Storage'
              : isSynced
                ? 'Progress synced — add Storage for recordings'
                : 'Saved locally'}
          </p>
          {syncError && (
            <p className="mt-2 text-center text-[11px] text-red-500">{syncError}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
