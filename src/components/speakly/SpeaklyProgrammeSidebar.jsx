import { useMemo } from 'react';
import {
  getDayLockMessage,
  getWeekLabel,
  isDayLocked,
} from '../../lib/speechTrainingProgress';
import SpeaklyThemePicker from './SpeaklyThemePicker';

function CheckIcon({ className = 'h-3.5 w-3.5' }) {
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

function ProgressRing({ pct }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="-rotate-90" viewBox="0 0 72 72" aria-hidden>
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          className="stroke-white/20"
          strokeWidth="6"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          className="stroke-speakly-coral transition-all duration-500"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{pct}%</span>
      </div>
    </div>
  );
}

function WeekDayStrip({
  week,
  completed,
  assessments,
  programStartDate,
  now,
  programDuration,
  currentDayNum,
  activeDay,
  onSelectDay,
}) {
  if (!week) return null;

  return (
    <div className="flex justify-between gap-1">
      {week.days.map((d) => {
        const done = completed[d.day] && !assessments?.[d.day]?.requiresRedo;
        const locked = isDayLocked(
          d.day,
          completed,
          assessments,
          programStartDate,
          now,
          programDuration,
        );
        const lockMessage = locked
          ? getDayLockMessage(
              d.day,
              completed,
              assessments,
              programStartDate,
              now,
              programDuration,
            )
          : null;
        const isSelected = activeDay?.day === d.day;
        const isCurrentTask = d.day === currentDayNum;

        return (
          <button
            key={d.day}
            type="button"
            onClick={() => onSelectDay(d)}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition ${
              done
                ? 'bg-speakly-coral text-white'
                : isSelected
                  ? 'bg-white text-speakly-ink ring-2 ring-speakly-coral ring-offset-1 ring-offset-[#2a1812]'
                  : isCurrentTask
                    ? 'bg-white/90 text-speakly-ink ring-2 ring-white ring-offset-1 ring-offset-[#2a1812]'
                    : locked
                      ? 'bg-white/5 text-white/25'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
            title={
              locked
                ? lockMessage
                : isCurrentTask
                  ? `Day ${d.day} (up next): ${d.title}`
                  : `Day ${d.day}: ${d.title}`
            }
          >
            {done ? <CheckIcon /> : locked ? '·' : d.day}
          </button>
        );
      })}
    </div>
  );
}

export default function SpeaklyProgrammeSidebar({
  progressPct,
  completedCount,
  programDuration,
  programWeeks,
  activeWeekIndex,
  shownWeekIndex,
  activeDay,
  activeWeekPhase,
  phaseLabels,
  completed,
  assessments,
  programStartDate,
  now,
  currentDayNum,
  user,
  onSignOut,
  onSelectWeek,
  onSelectDay,
  canRecord,
  isSynced,
  syncError,
  themeId,
  onThemeChange,
  savingTheme,
}) {
  const displayWeekIndex = useMemo(() => {
    if (activeDay?.day) {
      return Math.min(Math.floor((activeDay.day - 1) / 7), programWeeks.length - 1);
    }
    return shownWeekIndex;
  }, [activeDay, shownWeekIndex, programWeeks.length]);

  const displayWeek = programWeeks[displayWeekIndex];

  return (
    <div className="space-y-5 pb-2">
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <ProgressRing pct={progressPct} />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Programme
          </p>
          <p className="mt-0.5 text-xl font-bold text-white">
            {completedCount}
            <span className="text-base font-semibold text-white/60"> / {programDuration}</span>
          </p>
          <p className="mt-0.5 text-xs text-white/50">days complete</p>
        </div>
      </div>

      {user?.email && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="min-w-0 truncate text-sm text-white/80">{user.email}</p>
          <button
            type="button"
            onClick={onSignOut}
            className="shrink-0 text-sm font-semibold text-speakly-coral hover:text-white"
          >
            Sign out
          </button>
        </div>
      )}

      {onThemeChange && (
        <SpeaklyThemePicker
          themeId={themeId}
          onChange={onThemeChange}
          disabled={savingTheme}
        />
      )}

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          Weeks
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {programWeeks.map((week) => {
            const isActiveTaskWeek = week.weekIndex === activeWeekIndex;
            const isViewing = week.weekIndex === displayWeekIndex;
            const weekDone = week.days.filter(
              (d) => completed[d.day] && !assessments[d.day]?.requiresRedo,
            ).length;

            return (
              <button
                key={week.weekIndex}
                type="button"
                onClick={() => onSelectWeek(week.weekIndex)}
                aria-current={isViewing ? 'true' : undefined}
                className={`shrink-0 rounded-2xl px-3 py-2 text-left transition ${
                  isViewing
                    ? 'bg-gradient-to-br from-speakly-coral to-speakly-coral-dark text-white shadow-[0_6px_18px_rgba(217,93,57,0.35)]'
                    : isActiveTaskWeek
                      ? 'bg-white/12 text-white ring-1 ring-speakly-coral/50'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <p className="text-xs font-bold">{getWeekLabel(week.weekIndex)}</p>
                <p className={`text-[10px] ${isViewing ? 'text-white/80' : 'text-white/50'}`}>
                  {weekDone}/{week.days.length}
                  {isActiveTaskWeek ? ' · task' : ''}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {displayWeek && (
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
              {getWeekLabel(displayWeek.weekIndex)} · {displayWeek.subtitle}
            </p>
            {displayWeek.weekIndex === activeWeekIndex && (
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-speakly-coral">
                Active
              </span>
            )}
          </div>
          <p className="mb-3 text-sm font-semibold text-white/90">
            {phaseLabels[displayWeek.phase.id]}
          </p>
          <WeekDayStrip
            week={displayWeek}
            completed={completed}
            assessments={assessments}
            programStartDate={programStartDate}
            now={now}
            programDuration={programDuration}
            currentDayNum={currentDayNum}
            activeDay={activeDay}
            onSelectDay={onSelectDay}
          />
        </section>
      )}

      {activeWeekPhase && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-white/50">Phase goal</p>
          <p className="mt-2 text-sm leading-relaxed text-white/75">{activeWeekPhase.goal}</p>
        </section>
      )}

      <p className="text-xs text-white/35">
        {canRecord
          ? 'Recordings saved to Firebase Storage'
          : isSynced
            ? 'Progress synced — add Storage for recordings'
            : 'Saved locally'}
        {syncError && <span className="mt-1 block text-red-400">{syncError}</span>}
      </p>
    </div>
  );
}
