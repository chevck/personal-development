import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLogo from '../../components/AppLogo';
import SpeaklyAppLayout from '../../components/speakly/SpeaklyAppLayout';
import SpeaklyProgrammeSidebar from '../../components/speakly/SpeaklyProgrammeSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import { useSpeaklyProgramme } from '../../hooks/useSpeaklyProgramme';
import { useSpeechTrainingProgress } from '../../hooks/useSpeechTrainingProgress';
import {
  findDayInProgram,
  getProgramWeeks,
} from '../../lib/speechTrainingProgram';
import {
  getActiveWeekIndex,
  getDayLockMessage,
  getNextAllowedDay,
  getWaitingForNextDayMessage,
  getWeekLabel,
  isDayLocked,
} from '../../lib/speechTrainingProgress';
import DayRecorder from './components/DayRecorder';
import ShareForReview from './components/ShareForReview';
import ShareProgressModal from './components/ShareProgressModal';
import AssessmentFeedback from './components/AssessmentFeedback';

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

function StatChip({ label, value, accent = false }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${
        accent
          ? 'border-2 border-speakly-coral/30 bg-speakly-coral-light'
          : 'card-speakly border'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-taskly-muted">
        {label}
      </p>
      <p className="mt-0.5 truncate text-lg font-bold text-speakly-ink">{value}</p>
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
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-speakly-coral-light text-lg shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {icons[type] || '📋'}
    </span>
  );
}

function DayScheduleRow({
  day,
  completed,
  assessments,
  programStartDate,
  programDuration,
  now,
  currentDayNum,
  onSelectDay,
}) {
  const isDone = completed[day.day] && !assessments[day.day]?.requiresRedo;
  const isCurrent = day.day === currentDayNum;
  const locked = isDayLocked(
    day.day,
    completed,
    assessments,
    programStartDate,
    now,
    programDuration,
  );
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelectDay(day)}
        className={`group step-in flex w-full items-center gap-3 rounded-2xl p-3 text-left transition duration-300 sm:gap-4 sm:rounded-3xl sm:p-4 ${
          isDone
            ? 'card-speakly-selected hover:brightness-105'
            : isCurrent
              ? 'card-speakly border-speakly-coral shadow-[0_8px_24px_rgba(217,93,57,0.15)]'
              : locked
                ? 'border-2 border-dashed border-speakly-coral-ring/50 bg-white/60 opacity-70'
                : 'card-speakly hover:border-speakly-coral/60 hover:shadow-[0_8px_24px_rgba(217,93,57,0.1)]'
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isDone
              ? 'bg-white/25 text-white'
              : 'bg-speakly-coral-light text-speakly-coral-dark group-hover:bg-speakly-coral/15'
          }`}
        >
          {isDone ? (
            <CheckIcon className="h-5 w-5" />
          ) : (
            <span className="text-base font-bold">{day.day}</span>
          )}
        </span>

        {!isDone && <DayIcon type={day.type} />}

        <div className="min-w-0 flex-1">
          <p
            className={`text-base font-semibold sm:text-lg ${isDone ? 'text-white' : 'text-speakly-ink'}`}
          >
            {day.title}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className={`type-pill ${isDone ? 'bg-white/20 text-white' : ''}`}>
              {day.type}
            </span>
            <span className={`text-sm ${isDone ? 'text-white/80' : 'text-taskly-muted'}`}>
              {day.duration}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-speakly-coral px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
                Up next
              </span>
            )}
            {locked && (
              <span className="rounded-full bg-speakly-coral-ring/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-taskly-muted">
                Locked
              </span>
            )}
          </div>
        </div>

        <span
          className={`hidden shrink-0 transition sm:inline ${
            isDone ? 'text-white/70 opacity-100' : 'text-speakly-coral opacity-0 group-hover:opacity-100'
          }`}
        >
          ›
        </span>
      </button>
    </li>
  );
}

function DayDetail({
  day,
  phase,
  phaseLabel,
  completed,
  recording,
  assessment,
  canRecord,
  uploading,
  locked,
  lockedReason,
  programDuration,
  completedCount,
  userName,
  shareCode,
  onBack,
  onSaveRecording,
  onClearProgress,
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const isDone = completed[day.day] && !assessment?.requiresRedo;
  return (
    <div>
      <button type="button" onClick={onBack} className="btn-speakly-ghost mb-4 sm:mb-6">
        <span aria-hidden>‹</span> Back to schedule
      </button>

      <article className="card-speakly overflow-hidden">
        <div
          className={`p-4 sm:p-6 md:p-8 ${isDone ? 'bg-gradient-to-br from-speakly-coral to-speakly-coral-dark text-white' : 'bg-white'}`}
        >
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <span className={`type-pill text-sm ${isDone ? 'bg-white/20 text-white' : ''}`}>
                {day.type}
              </span>
              <p
                className={`mt-2 text-sm font-medium sm:mt-3 sm:text-base ${isDone ? 'text-white/80' : 'text-taskly-muted'}`}
              >
                Day {day.day} · {phaseLabel}
              </p>
              <h2
                className={`font-display mt-1 text-2xl font-normal tracking-tight sm:text-3xl md:text-4xl ${isDone ? 'text-white' : 'text-speakly-ink'}`}
              >
                {day.title}
              </h2>
              <p className={`mt-2 text-sm sm:text-base ${isDone ? 'text-white/80' : 'text-taskly-muted'}`}>
                {day.duration}
              </p>
            </div>
            <DayIcon type={day.type} />
          </div>
        </div>

        <div className="space-y-4 p-4 sm:space-y-5 sm:p-6 md:p-8">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
              Today&apos;s practice
            </h3>
            <p className="mt-2 text-base leading-relaxed text-speakly-ink/90 sm:text-lg">{day.description}</p>
          </section>

          <section className="rounded-2xl bg-speakly-coral-light p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
              The exercise
            </h3>
            <p className="mt-2 text-base leading-relaxed text-speakly-ink/80">{day.exercise}</p>
          </section>

          <section className="rounded-2xl border-2 border-speakly-coral-ring p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-speakly-coral">
              Why this works
            </h3>
            <p className="mt-2 text-base italic leading-relaxed text-taskly-muted">{day.why}</p>
          </section>

          <section className="border-l-4 border-speakly-coral pl-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-taskly-muted">
              Coach&apos;s tip
            </h3>
            <p className="mt-2 text-base leading-relaxed text-speakly-ink/75">{day.tip}</p>
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
            shareCode={shareCode}
            disabled={uploading}
          />

          {isDone && (
            <section className="rounded-2xl border-2 border-speakly-coral/40 bg-gradient-to-br from-speakly-coral-light to-white p-6">
              <p className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
                Day complete
              </p>
              <p className="mt-2 text-base text-taskly-muted">
                Share your win — post the task, your comment, and progress to socials or save as an
                image.
              </p>
              <button type="button" onClick={() => setShareOpen(true)} className="btn-speakly-primary mt-4">
                <span aria-hidden>↗</span>
                Share progress
              </button>
            </section>
          )}
        </div>
      </article>

      <ShareProgressModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        day={day}
        phaseLabel={phaseLabel}
        assessment={assessment}
        programDuration={programDuration}
        completedCount={completedCount}
        userName={userName}
      />
    </div>
  );
}

export default function SpeechTraining() {
  const [activeDay, setActiveDay] = useState(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(null);
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
    shareCode,
    programStartDate,
    programDuration,
    now,
    themeId,
    setThemeColor,
    savingTheme,
  } = useSpeechTrainingProgress();
  const { loading: programmeLoading, phases: programmePhases } = useSpeaklyProgramme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const phaseLabels = useMemo(() => {
    return Object.fromEntries(
      programmePhases.map((phase) => {
        const match = phase.title?.match(/—\s*(.+)$/);
        const label = match ? match[1].trim() : phase.title || `Phase ${phase.id}`;
        return [phase.id, label];
      }),
    );
  }, [programmePhases]);

  const programWeeks = useMemo(() => {
    const duration = programDuration;
    const phases = programmePhases;
    return getProgramWeeks(duration, phases);
  }, [programDuration, programmePhases]);

  const activeWeekIndex = useMemo(() => {
    const idx = getActiveWeekIndex(
      completed,
      assessments,
      programStartDate,
      now,
      programDuration,
    );
    return Math.min(idx, Math.max(0, programWeeks.length - 1));
  }, [
    completed,
    assessments,
    programStartDate,
    now,
    programDuration,
    programWeeks.length,
  ]);

  const activeWeekPhase = programWeeks[activeWeekIndex]?.phase;

  const shownWeekIndex =
    selectedWeekIndex != null
      ? Math.min(Math.max(selectedWeekIndex, 0), programWeeks.length - 1)
      : activeWeekIndex;
  const shownWeek = programWeeks[shownWeekIndex];
  const isViewingActiveWeek = shownWeekIndex === activeWeekIndex;

  const goToWeek = (weekIndex) => {
    setActiveDay(null);
    setSelectedWeekIndex(weekIndex === activeWeekIndex ? null : weekIndex);
  };

  const completedCount = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= programDuration; d += 1) {
      if (completed[d] && !assessments[d]?.requiresRedo) count += 1;
    }
    return count;
  }, [completed, assessments, programDuration]);
  const progressPct = Math.round((completedCount / programDuration) * 100);

  const currentDayNum = useMemo(
    () =>
      getNextAllowedDay(
        completed,
        assessments,
        programStartDate,
        now,
        programDuration,
      ),
    [completed, assessments, programStartDate, now, programDuration],
  );

  const waitingMessage = useMemo(
    () =>
      getWaitingForNextDayMessage(
        completed,
        assessments,
        programStartDate,
        now,
        programDuration,
      ),
    [completed, assessments, programStartDate, now, programDuration],
  );

  const handleSelectDay = (day) => {
    setActiveDay(day);
  };

  const openCurrentDay = () => {
    if (!currentDayNum) return;
    const match = findDayInProgram(currentDayNum, programDuration);
    if (match) handleSelectDay(match.day);
  };

  const firstName = useMemo(() => {
    const base =
      user?.displayName?.trim() || (user?.email ? user.email.split('@')[0] : '');
    if (!base) return 'there';
    const first = base.split(/[\s._-]+/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }, [user]);

  const greeting = useMemo(() => {
    const h = new Date(now || Date.now()).getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, [now]);

  if (loading || programmeLoading) {
    return (
      <div className="speakly-app flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-b from-speakly-coral-light via-white to-speakly-coral-muted/40 font-speakly text-taskly-muted">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span
            className="app-loader-ring absolute inset-0 rounded-[1.4rem] border-2 border-speakly-coral/50"
            aria-hidden
          />
          <span
            className="app-loader-ring-2 absolute inset-0 rounded-[1.4rem] border-2 border-speakly-coral/40"
            aria-hidden
          />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-[1.4rem] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <AppLogo
              projectId={SPEECH_TRAINING_PROJECT_ID}
              variant="icon"
              size="lg"
              className="h-12 w-12"
            />
          </span>
        </div>
        <p className="text-base font-semibold">Loading your progress…</p>
      </div>
    );
  }

  const activeDayContext =
    activeDay && findDayInProgram(activeDay.day, programDuration);
  const detailPhase = activeDayContext?.phase;

  const sidebar = (
    <SpeaklyProgrammeSidebar
      progressPct={progressPct}
      completedCount={completedCount}
      programDuration={programDuration}
      programWeeks={programWeeks}
      activeWeekIndex={activeWeekIndex}
      shownWeekIndex={shownWeekIndex}
      activeDay={activeDay}
      activeWeekPhase={activeWeekPhase}
      phaseLabels={phaseLabels}
      completed={completed}
      assessments={assessments}
      programStartDate={programStartDate}
      now={now}
      currentDayNum={currentDayNum}
      user={user}
      onSignOut={async () => {
        await signOut();
        navigate('/speakly/login');
      }}
      onSelectWeek={goToWeek}
      onSelectDay={handleSelectDay}
      canRecord={canRecord}
      isSynced={isSynced}
      syncError={syncError}
      themeId={themeId}
      onThemeChange={setThemeColor}
      savingTheme={savingTheme}
    />
  );

  return (
    <SpeaklyAppLayout sidebar={sidebar}>
      <div key={activeDay ? `day-${activeDay.day}` : 'schedule'}>
          {activeDay && detailPhase ? (
            <div className="dash-in">
            <DayDetail
              day={activeDay}
              phase={detailPhase}
              phaseLabel={phaseLabels[detailPhase?.id] || detailPhase?.title || 'Phase'}
              completed={completed}
              recording={recordings[activeDay.day]}
              assessment={assessments[activeDay.day]}
              canRecord={canRecord}
              uploading={uploadingDay === activeDay.day}
              programDuration={programDuration}
              completedCount={completedCount}
              userName={
                user?.displayName?.trim() ||
                (user?.email ? user.email.split('@')[0] : '')
              }
              shareCode={shareCode}
              locked={isDayLocked(
                activeDay.day,
                completed,
                assessments,
                programStartDate,
                now,
                programDuration,
              )}
              lockedReason={getDayLockMessage(
                activeDay.day,
                completed,
                assessments,
                programStartDate,
                now,
                programDuration,
              )}
              onBack={() => setActiveDay(null)}
              onSaveRecording={saveRecording}
              onClearProgress={clearDayProgress}
            />
            </div>
          ) : (
            <>
              <header className="dash-in card-speakly mb-8 overflow-hidden bg-gradient-to-br from-speakly-coral-light via-white to-white p-6 md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-speakly-coral-dark">
                      {greeting}
                    </p>
                    <h1 className="font-display mt-1 text-3xl font-normal tracking-tight text-speakly-ink md:text-4xl">
                      {firstName} <span aria-hidden>👋</span>
                    </h1>
                    <p className="mt-2 max-w-lg text-base text-taskly-muted">
                      You&apos;re on{' '}
                      <span className="font-semibold text-speakly-ink">
                        {getWeekLabel(activeWeekIndex)}
                      </span>
                      {programWeeks[activeWeekIndex]?.subtitle
                        ? ` (${programWeeks[activeWeekIndex].subtitle})`
                        : ''}
                      {currentDayNum
                        ? ` — Day ${currentDayNum} is up next.`
                        : ' — you’re all caught up. Nice work!'}
                    </p>
                  </div>

                  {currentDayNum && !waitingMessage && (
                    <button
                      type="button"
                      onClick={openCurrentDay}
                      className="btn-speakly-primary w-full sm:w-auto"
                    >
                      Start Day {currentDayNum}
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        →
                      </span>
                    </button>
                  )}
                </div>

                <div className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4'>
                  <StatChip label='Progress' value={`${progressPct}%`} accent />
                  <StatChip
                    label='Completed'
                    value={`${completedCount}/${programDuration}`}
                  />
                  <StatChip
                    label='Active phase'
                    value={phaseLabels[activeWeekPhase?.id] || '—'}
                  />
                  <StatChip
                    label='Up next'
                    value={currentDayNum ? `Day ${currentDayNum}` : 'Caught up'}
                  />
                </div>
              </header>

              <div className="dash-in dash-in-2 mb-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goToWeek(shownWeekIndex - 1)}
                  disabled={shownWeekIndex === 0}
                  aria-label="Previous week"
                  className="btn-speakly-secondary flex h-11 w-11 shrink-0 items-center justify-center !px-0 !py-0 text-xl disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>

                <div className="min-w-0 flex-1 text-center">
                  <p className="truncate text-xs font-semibold uppercase tracking-wider text-speakly-coral-dark">
                    {getWeekLabel(shownWeekIndex)}
                    {shownWeek?.subtitle ? ` · ${shownWeek.subtitle}` : ''}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-taskly-muted">
                    Week {shownWeekIndex + 1} of {programWeeks.length}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => goToWeek(shownWeekIndex + 1)}
                  disabled={shownWeekIndex === programWeeks.length - 1}
                  aria-label="Next week"
                  className="btn-speakly-secondary flex h-11 w-11 shrink-0 items-center justify-center !px-0 !py-0 text-xl disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>

              {!isViewingActiveWeek && (
                <button
                  type="button"
                  onClick={() => goToWeek(activeWeekIndex)}
                  className="dash-in dash-in-2 btn-speakly-ghost mb-4"
                >
                  <span aria-hidden>↩</span> Back to active week
                </button>
              )}

              {waitingMessage && (
                <div className="dash-in dash-in-2 card-speakly mb-5 border-speakly-coral/40 bg-speakly-coral-light p-5">
                  <p className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
                    Well done today
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-speakly-ink">{waitingMessage}</p>
                </div>
              )}

              {shownWeek && (
                <section
                  key={shownWeek.weekIndex}
                  className={`dash-in dash-in-3 transition ${
                    isViewingActiveWeek
                      ? 'rounded-3xl border-2 border-speakly-coral bg-speakly-coral-light/50 p-5 md:p-6'
                      : 'card-speakly p-5 md:p-6'
                  }`}
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wider text-speakly-coral-dark">
                        {getWeekLabel(shownWeek.weekIndex)} · {shownWeek.subtitle}
                      </p>
                      <h2 className="font-display mt-1 text-2xl font-normal text-speakly-ink">
                        {phaseLabels[shownWeek.phase.id]}
                      </h2>
                      <p className="mt-1 max-w-lg text-base text-taskly-muted">
                        {shownWeek.phase.tagline}
                      </p>
                    </div>
                    {isViewingActiveWeek && (
                      <span className="rounded-full bg-speakly-coral px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        Active week
                      </span>
                    )}
                  </div>

                  <ul className='space-y-3'>
                    {shownWeek.days.map((day) => (
                      <DayScheduleRow
                        key={day.day}
                        day={day}
                        completed={completed}
                        assessments={assessments}
                        programStartDate={programStartDate}
                        programDuration={programDuration}
                        now={now}
                        currentDayNum={currentDayNum}
                        onSelectDay={setActiveDay}
                      />
                    ))}
                  </ul>
                </section>
              )}

              <p className="mt-8 text-center text-sm text-taskly-muted">
                Tap a day to open exercises and record your practice.
              </p>
            </>
          )}
      </div>
    </SpeaklyAppLayout>
  );
}
