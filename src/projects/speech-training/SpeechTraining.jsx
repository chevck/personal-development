import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLogo from '../../components/AppLogo';
import { useAuth } from '../../contexts/AuthContext';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import { phases } from './phases';
import { useSpeechTrainingProgress } from '../../hooks/useSpeechTrainingProgress';
import {
  getDayLockMessage,
  getNextAllowedDay,
  getWaitingForNextDayMessage,
  isDayLocked,
} from '../../lib/speechTrainingProgress';
import DayRecorder from './components/DayRecorder';
import ShareForReview from './components/ShareForReview';
import AssessmentFeedback from './components/AssessmentFeedback';
import { THEME_PALETTE } from '../../config/themePalette';

const phaseLabels = { 1: "The Brake", 2: "The Shape", 3: "The Platform" };

const typePills = {
  Awareness: "bg-amber-50 text-amber-700",
  Articulation: "bg-orange-50 text-taskly-peach-text",
  Pacing: "bg-violet-50 text-violet-700",
  Rhythm: "bg-rose-50 text-rose-600",
  Muscle: "bg-sky-50 text-sky-700",
  Reflection: "bg-yellow-50 text-yellow-800",
  Clarity: "bg-emerald-50 text-emerald-700",
  Structure: "bg-fuchsia-50 text-fuchsia-700",
  Emotion: "bg-orange-50 text-orange-700",
  Flow: "bg-cyan-50 text-cyan-700",
  Feedback: "bg-lime-50 text-lime-700",
  Review: "bg-amber-50 text-amber-800",
  Delivery: "bg-violet-50 text-violet-700",
  Impact: "bg-teal-50 text-teal-700",
  Physical: "bg-stone-100 text-stone-700",
  Spontaneity: "bg-red-50 text-red-600",
  Expression: "bg-indigo-50 text-indigo-700",
  Performance: "bg-pink-50 text-pink-700",
};

function CheckIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox='0 0 20 20'
      fill='currentColor'
      aria-hidden
    >
      <path
        fillRule='evenodd'
        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
        clipRule='evenodd'
      />
    </svg>
  );
}

function ThemePicker({ themeId, onSave }) {
  const [pendingId, setPendingId] = useState(themeId);
  const [open, setOpen] = useState(false);
  const isDirty = pendingId !== themeId;
  const activeTheme =
    THEME_PALETTE.find((t) => t.id === pendingId) || THEME_PALETTE[0];

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-taskly-border bg-white px-3 py-2.5 text-left transition hover:border-brand/60"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3">
          <span
            className="h-6 w-6 rounded-full border border-black/5 shadow-soft"
            style={{ backgroundColor: `rgb(${activeTheme.brand})` }}
            aria-hidden
          />
          <span className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-taskly-muted">
              Theme color
            </span>
            <span className="text-sm font-semibold text-taskly-ink">
              {activeTheme.label}
            </span>
          </span>
        </span>
        <svg
          className={`h-4 w-4 text-taskly-muted transition ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-taskly-border bg-white p-3 shadow-soft">
          <ul className="grid grid-cols-2 gap-2">
            {THEME_PALETTE.map((t) => {
              const isPending = t.id === pendingId;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setPendingId(t.id)}
                    aria-pressed={isPending}
                    className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition ${
                      isPending
                        ? 'border-transparent shadow-soft'
                        : 'border-taskly-border bg-white hover:border-brand/40'
                    }`}
                    style={
                      isPending
                        ? {
                            backgroundColor: `rgb(${t.brand})`,
                            color: `rgb(${t.ink})`,
                          }
                        : undefined
                    }
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isPending ? 'border-white/40' : 'border-black/5'
                      }`}
                      style={{ backgroundColor: `rgb(${t.brand})` }}
                      aria-hidden
                    >
                      {isPending && (
                        <CheckIcon className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <span className="text-sm font-semibold">{t.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setPendingId(themeId)}
              disabled={!isDirty}
              className="text-xs font-semibold text-taskly-muted underline-offset-2 hover:text-taskly-ink hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => {
                onSave(pendingId);
                setOpen(false);
              }}
              disabled={!isDirty}
              className="rounded-full bg-taskly-ink px-4 py-1.5 text-xs font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDirty ? 'Save theme' : 'Saved'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DayIcon({ type }) {
  const icons = {
    Awareness: "🎯",
    Articulation: "🗣️",
    Pacing: "⏱️",
    Rhythm: "🎵",
    Muscle: "💪",
    Reflection: "📝",
    Clarity: "💡",
    Structure: "📐",
    Emotion: "❤️",
    Flow: "〰️",
    Feedback: "👂",
    Review: "🔍",
    Delivery: "🎤",
    Impact: "⚡",
    Physical: "🧍",
    Spontaneity: "🎲",
    Expression: "✨",
    Performance: "🌟",
  };
  return (
    <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-soft'>
      {icons[type] || "📋"}
    </span>
  );
}

function ProgressRing({ pct }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className='relative h-24 w-24'>
      <svg className='-rotate-90' viewBox='0 0 88 88' aria-hidden>
        <circle
          cx='44'
          cy='44'
          r={r}
          fill='none'
          stroke='#F0F0F0'
          strokeWidth='8'
        />
        <circle
          cx='44'
          cy='44'
          r={r}
          fill='none'
          stroke='#F5D76E'
          strokeWidth='8'
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={offset}
          className='transition-all duration-500'
        />
      </svg>
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <span className='text-2xl font-bold text-taskly-ink'>{pct}%</span>
        <span className='text-xs uppercase tracking-wider text-taskly-muted'>
          done
        </span>
      </div>
    </div>
  );
}

function DayGrid({
  completed,
  assessments,
  programStartDate,
  now,
  activeDay,
  onSelectDay,
}) {
  const allDays = phases.flatMap((p) => p.days);
  return (
    <div className='mt-4'>
      <p className='mb-3 text-sm font-semibold uppercase tracking-wider text-taskly-muted'>
        21-day track
      </p>
      <div className='grid grid-cols-7 gap-1.5'>
        {allDays.map((d) => {
          const done = completed[d.day] && !assessments?.[d.day]?.requiresRedo;
          const locked = isDayLocked(
            d.day,
            completed,
            assessments,
            programStartDate,
            now,
          );
          const lockMessage = locked
            ? getDayLockMessage(
                d.day,
                completed,
                assessments,
                programStartDate,
                now,
              )
            : null;
          const isActive = activeDay?.day === d.day;
          return (
            <button
              key={d.day}
              type='button'
              onClick={() => onSelectDay(d)}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                done
                  ? "bg-brand text-brand-ink"
                  : isActive
                    ? "bg-taskly-ink text-white ring-2 ring-brand ring-offset-1"
                    : locked
                      ? "bg-neutral-100 text-neutral-300"
                      : "bg-white text-taskly-muted hover:bg-neutral-100"
              }`}
              title={locked ? lockMessage : `Day ${d.day}: ${d.title}`}
            >
              {done ? (
                <CheckIcon className='h-3.5 w-3.5' />
              ) : locked ? (
                "🔒"
              ) : (
                d.day
              )}
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
  assessment,
  canRecord,
  uploading,
  locked,
  lockedReason,
  onBack,
  onSaveRecording,
  onClearProgress,
}) {
  const isDone = completed[day.day] && !assessment?.requiresRedo;
  const pill = typePills[day.type] || "bg-taskly-peach text-taskly-peach-text";

  return (
    <div>
      <button
        type='button'
        onClick={onBack}
        className='mb-6 flex items-center gap-1 text-base font-medium text-taskly-muted transition hover:text-taskly-ink'
      >
        <span aria-hidden>‹</span> Back to schedule
      </button>

      <article className='overflow-hidden rounded-3xl bg-white shadow-card'>
        <div className={`p-8 ${isDone ? "bg-brand" : "bg-white"}`}>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${pill}`}
              >
                {day.type}
              </span>
              <p className={`mt-3 text-base font-medium ${isDone ? 'text-brand-ink/80' : 'text-taskly-muted'}`}>
                Day {day.day} · {phaseLabels[phase.id]}
              </p>
              <h2 className={`mt-1 text-4xl font-bold tracking-tight ${isDone ? 'text-brand-ink' : 'text-taskly-ink'}`}>
                {day.title}
              </h2>
              <p className={`mt-2 text-base ${isDone ? 'text-brand-ink/80' : 'text-taskly-muted'}`}>{day.duration}</p>
            </div>
            <DayIcon type={day.type} />
          </div>
        </div>

        <div className='space-y-5 p-8'>
          <section>
            <h3 className='text-sm font-bold uppercase tracking-wider text-taskly-muted'>
              Today&apos;s practice
            </h3>
            <p className='mt-2 text-lg leading-relaxed text-taskly-ink/90'>
              {day.description}
            </p>
          </section>

          <section className='rounded-2xl bg-taskly-surface p-5'>
            <h3 className='text-sm font-bold uppercase tracking-wider text-taskly-peach-text'>
              The exercise
            </h3>
            <p className='mt-2 text-base leading-relaxed text-taskly-ink/80'>
              {day.exercise}
            </p>
          </section>

          <section className='rounded-2xl border border-taskly-border p-5'>
            <h3 className='text-sm font-bold uppercase tracking-wider text-violet-600'>
              Why this works
            </h3>
            <p className='mt-2 text-base italic leading-relaxed text-taskly-muted'>
              {day.why}
            </p>
          </section>

          <section className='border-l-4 border-brand pl-4'>
            <h3 className='text-sm font-bold uppercase tracking-wider text-taskly-muted'>
              Coach&apos;s tip
            </h3>
            <p className='mt-2 text-base leading-relaxed text-taskly-ink/75'>
              {day.tip}
            </p>
          </section>

          <DayRecorder
            dayNum={day.day}
            recording={recording}
            isApproved={isDone}
            canRecord={canRecord}
            uploading={uploading}
            locked={locked}
            lockedReason={locked ? lockedReason : undefined}
            onSaveRecording={onSaveRecording}
            onClearProgress={onClearProgress}
          />

          <AssessmentFeedback assessment={assessment} />

          <ShareForReview
            day={day}
            recording={recording}
            assessment={assessment}
            disabled={uploading}
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
    assessments,
    saveRecording,
    clearDayProgress,
    uploadingDay,
    loading,
    syncError,
    isSynced,
    canRecord,
    programStartDate,
    now,
    themeId,
    setThemeColor,
  } = useSpeechTrainingProgress();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const phase = phases[activePhase];
  const completedCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= 21; d += 1) {
      if (completed[d] && !assessments[d]?.requiresRedo) count += 1;
    }
    return count;
  }, [completed, assessments]);
  const progressPct = Math.round((completedCount / 21) * 100);

  const currentDayNum = useMemo(
    () => getNextAllowedDay(completed, assessments, programStartDate, now),
    [completed, assessments, programStartDate, now],
  );

  const waitingMessage = useMemo(
    () =>
      getWaitingForNextDayMessage(
        completed,
        assessments,
        programStartDate,
        now,
      ),
    [completed, assessments, programStartDate, now],
  );

  const findDayGlobally = (dayNum) => {
    for (const p of phases) {
      const found = p.days.find((d) => d.day === dayNum);
      if (found) return { day: found, phase: p };
    }
    return null;
  };

  const handleSelectDay = (day) => {
    const phaseIndex = phases.findIndex((p) =>
      p.days.some((d) => d.day === day.day),
    );
    if (phaseIndex >= 0) setActivePhase(phaseIndex);
    setActiveDay(day);
  };

  if (loading) {
    return (
      <div className='speakly-app flex min-h-screen flex-col items-center justify-center gap-4 bg-white font-speakly text-lg text-taskly-muted'>
        <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="icon" size="xl" />
        <p>Loading your progress…</p>
      </div>
    );
  }

  const detailPhase =
    activeDay &&
    phases.find((p) => p.days.some((d) => d.day === activeDay.day));

  return (
    <div className='speakly-app min-h-screen bg-white font-speakly text-taskly-ink'>
      <div className='mx-auto flex min-h-screen max-w-[1280px] flex-col lg:flex-row'>
        {/* Left sidebar */}
        <aside className='w-full shrink-0 border-b border-taskly-border bg-white p-6 lg:w-72 lg:border-b-0 lg:border-r lg:p-8'>
          <AppLogo
            projectId={SPEECH_TRAINING_PROJECT_ID}
            variant="logo"
            size="lg"
            linkTo="/"
            className="mb-6 h-[4rem]"
          />

          {user?.email && (
            <div className='mb-6 rounded-2xl bg-taskly-surface px-4 py-3'>
              <p className='text-xs font-semibold uppercase tracking-wider text-taskly-muted'>
                Your account
              </p>
              <p className='mt-1 truncate text-sm font-medium text-taskly-ink'>
                {user.email}
              </p>
              <ThemePicker themeId={themeId} onSave={setThemeColor} />
              <button
                type='button'
                onClick={async () => {
                  await signOut();
                  navigate("/speech-training/login");
                }}
                className='mt-2 text-sm font-semibold text-taskly-peach-text hover:underline'
              >
                Sign out
              </button>
            </div>
          )}

          <p className='text-sm font-semibold uppercase tracking-wider text-taskly-muted'>
            Phases
          </p>
          <ul className='mt-3 space-y-2'>
            {phases.map((p, i) => {
              const phaseDone = p.days.filter(
                (d) => completed[d.day] && !assessments[d.day]?.requiresRedo,
              ).length;
              const isActive = activePhase === i && !activeDay;
              return (
                <li key={p.id}>
                  <button
                    type='button'
                    onClick={() => {
                      setActivePhase(i);
                      setActiveDay(null);
                    }}
                    className={`w-full rounded-2xl p-4 text-left transition ${
                      isActive
                        ? "bg-brand shadow-soft"
                        : "bg-taskly-surface hover:bg-neutral-100"
                    }`}
                  >
                    <p className={`text-sm font-medium ${isActive ? 'text-brand-ink/80' : 'text-taskly-muted'}`}>
                      {p.subtitle}
                    </p>
                    <p className={`mt-0.5 text-lg font-semibold ${isActive ? 'text-brand-ink' : 'text-taskly-ink'}`}>
                      {phaseLabels[p.id]}
                    </p>
                    <p className={`mt-1 text-sm ${isActive ? 'text-brand-ink/80' : 'text-taskly-muted'}`}>
                      {phaseDone}/{p.days.length} days
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          <DayGrid
            completed={completed}
            assessments={assessments}
            programStartDate={programStartDate}
            now={now}
            activeDay={activeDay}
            onSelectDay={(d) => {
              const match = findDayGlobally(d.day);
              if (match) handleSelectDay(match.day);
            }}
          />
        </aside>

        {/* Main content */}
        <main className='flex-1 p-6 lg:p-10'>
          {activeDay && detailPhase ? (
            <DayDetail
              day={activeDay}
              phase={detailPhase}
              completed={completed}
              recording={recordings[activeDay.day]}
              assessment={assessments[activeDay.day]}
              canRecord={canRecord}
              uploading={uploadingDay === activeDay.day}
              locked={isDayLocked(
                activeDay.day,
                completed,
                assessments,
                programStartDate,
                now,
              )}
              lockedReason={getDayLockMessage(
                activeDay.day,
                completed,
                assessments,
                programStartDate,
                now,
              )}
              onBack={() => setActiveDay(null)}
              onSaveRecording={saveRecording}
              onClearProgress={clearDayProgress}
            />
          ) : (
            <>
              <header className='mb-8'>
                <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>
                  <span className='text-taskly-muted'>Phase schedule — </span>
                  <span className='text-brand'>{phase.subtitle}</span>
                </h1>
                <p className='mt-2 max-w-lg text-base text-taskly-muted'>
                  {phase.tagline}
                </p>
              </header>

              <ul className='space-y-3'>
                {phase.days.map((day) => {
                  const isDone =
                    completed[day.day] && !assessments[day.day]?.requiresRedo;
                  const isCurrent = day.day === currentDayNum;
                  const locked = isDayLocked(
                    day.day,
                    completed,
                    assessments,
                    programStartDate,
                    now,
                  );
                  const pill =
                    typePills[day.type] ||
                    "bg-taskly-peach text-taskly-peach-text";

                  return (
                    <li key={day.day}>
                      <button
                        type='button'
                        onClick={() => setActiveDay(day)}
                        className={`group flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${
                          isDone
                            ? "bg-brand shadow-soft hover:bg-brand-hover"
                            : isCurrent
                              ? "border-2 border-brand bg-white shadow-card"
                              : locked
                                ? "border border-dashed border-neutral-200 bg-neutral-50 opacity-70"
                                : "border border-taskly-border bg-white shadow-soft hover:border-brand/50 hover:shadow-card"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            isDone
                              ? "bg-white/80 text-taskly-ink"
                              : "bg-taskly-surface text-taskly-muted group-hover:bg-brand/30"
                          }`}
                        >
                          {isDone ? (
                            <CheckIcon className='h-5 w-5' />
                          ) : (
                            <span className='text-base font-bold'>
                              {day.day}
                            </span>
                          )}
                        </span>

                        {!isDone && <DayIcon type={day.type} />}

                        <div className='min-w-0 flex-1'>
                          <p className={`text-lg font-semibold ${isDone ? 'text-brand-ink' : 'text-taskly-ink'}`}>
                            {day.title}
                          </p>
                          <div className='mt-1.5 flex flex-wrap items-center gap-2'>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pill}`}
                            >
                              {day.type}
                            </span>
                            <span className='text-sm text-taskly-muted'>
                              {day.duration}
                            </span>
                            {isCurrent && (
                              <span className='rounded-full bg-taskly-ink px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white'>
                                Up next
                              </span>
                            )}
                            {locked && (
                              <span className='rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-neutral-500'>
                                Locked
                              </span>
                            )}
                          </div>
                        </div>

                        <span className='text-taskly-muted opacity-0 transition group-hover:opacity-100'>
                          ›
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <p className='mt-8 text-center text-sm text-taskly-muted'>
                Tap a day to open exercises and record your practice.
              </p>
            </>
          )}
        </main>

        {/* Right sidebar */}
        <aside className='w-full shrink-0 border-t border-taskly-border bg-taskly-surface/50 p-6 lg:w-64 lg:border-l lg:border-t-0 lg:p-8'>
          <div className='rounded-3xl bg-white p-6 shadow-card'>
            <p className='text-base font-semibold text-taskly-ink'>
              Your progress
            </p>
            <div className='mt-4 flex justify-center'>
              <ProgressRing pct={progressPct} />
            </div>
            <p className='mt-3 text-center text-base text-taskly-muted'>
              <span className='font-bold text-taskly-ink'>
                {completedCount}
              </span>{" "}
              of 21 days complete
            </p>
          </div>

          <div className='mt-4 rounded-3xl bg-white p-5 shadow-soft'>
            <p className='text-sm font-bold uppercase tracking-wider text-taskly-muted'>
              Phase goal
            </p>
            <p className='mt-2 text-base leading-relaxed text-taskly-ink/80'>
              {phase.goal}
            </p>
          </div>

          {waitingMessage && !activeDay && (
            <div className='mt-4 rounded-3xl border border-brand/60 bg-brand/25 p-5'>
              <p className='text-sm font-bold uppercase tracking-wider text-taskly-ink/60'>
                Well done today
              </p>
              <p className='mt-2 text-base leading-relaxed text-taskly-ink'>
                {waitingMessage}
              </p>
            </div>
          )}

          {currentDayNum && !activeDay && !waitingMessage && (
            <div className='mt-4 rounded-3xl bg-brand p-5'>
              <p className='text-sm font-bold uppercase tracking-wider text-taskly-ink/60'>
                Focus today
              </p>
              <p className='mt-1 text-xl font-bold text-taskly-ink'>
                Day {currentDayNum}
              </p>
              <button
                type='button'
                onClick={() => {
                  const match = findDayGlobally(currentDayNum);
                  if (match) handleSelectDay(match.day);
                }}
                className='mt-3 flex h-11 w-11 items-center justify-center rounded-full bg-taskly-ink text-white transition hover:scale-105'
                aria-label='Open current day'
              >
                →
              </button>
            </div>
          )}

          <p className='mt-6 text-center text-xs text-taskly-muted'>
            {canRecord
              ? "Recordings saved to Firebase Storage"
              : isSynced
                ? "Progress synced — add Storage for recordings"
                : "Saved locally"}
          </p>
          {syncError && (
            <p className='mt-2 text-center text-xs text-red-500'>{syncError}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
