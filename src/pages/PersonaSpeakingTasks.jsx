import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import ProgressRing from "../components/persona/ProgressRing";
import TaskCard from "../components/persona/TaskCard";
import TaskDrawer from "../components/persona/TaskDrawer";
import { useAuth } from "../contexts/AuthContext";
import { useSpeaklyProgramme } from "../hooks/useSpeaklyProgramme";
import { useSpeechTrainingProgress } from "../hooks/useSpeechTrainingProgress";
import { getProgramWeeks } from "../lib/speechTrainingProgram";
import { getNextAllowedDay, isDayComplete } from "../lib/speechTrainingProgress";
import AssessmentFeedback from "../projects/speech-training/components/AssessmentFeedback";

function SpeakingTaskDetail({ day, status, assessment, onClose }) {
  return (
    <TaskDrawer eyebrow={`Day ${day.day} · ${day.type}`} title={day.title} onClose={onClose}>
      <p className='text-sm leading-relaxed text-persona-ink'>{day.description}</p>

      {day.exercise && (
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wide text-persona-muted'>
            Exercise
          </h3>
          <p className='mt-1 text-sm leading-relaxed text-persona-ink'>{day.exercise}</p>
        </div>
      )}

      {day.why && (
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wide text-persona-muted'>
            Why it matters
          </h3>
          <p className='mt-1 text-sm leading-relaxed text-persona-ink'>{day.why}</p>
        </div>
      )}

      {day.tip && (
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wide text-persona-muted'>Tip</h3>
          <p className='mt-1 text-sm leading-relaxed text-persona-ink'>{day.tip}</p>
        </div>
      )}

      {status === "locked" ? (
        <p className='px-4 py-3 text-sm rounded-2xl bg-persona-surface text-persona-muted'>
          This day isn&apos;t open yet.
        </p>
      ) : (
        <>
          {assessment && <AssessmentFeedback assessment={assessment} />}
          <Link
            to='/speakly'
            className='flex items-center justify-center w-full gap-2 py-3.5 text-sm font-bold text-white transition rounded-2xl bg-persona-purple hover:bg-persona-purple-hover'
          >
            {status === "complete" ? "Review in Speakly" : "Record your response"}
            <span aria-hidden>→</span>
          </Link>
        </>
      )}
    </TaskDrawer>
  );
}

export default function PersonaSpeakingTasks() {
  const { user, loading: authLoading } = useAuth();
  const { loading: programmeLoading, phases } = useSpeaklyProgramme();
  const {
    completed,
    assessments,
    programStartDate,
    programDuration,
    now,
    loading: progressLoading,
  } = useSpeechTrainingProgress();
  const [openDay, setOpenDay] = useState(null);

  if (!authLoading && !user) {
    return <Navigate to='/login' replace />;
  }

  const loading = authLoading || programmeLoading || progressLoading;
  const weeks = getProgramWeeks(programDuration, phases);
  const days = weeks.flatMap((week) => week.days);
  const nextAllowedDay = getNextAllowedDay(
    completed,
    assessments,
    programStartDate,
    now,
    programDuration,
  );

  function statusFor(day) {
    if (isDayComplete(day.day, completed, assessments)) return "complete";
    if (day.day === nextAllowedDay) return "actionable";
    return "locked";
  }

  const completedCount = days.filter((d) => isDayComplete(d.day, completed, assessments)).length;
  const percentComplete = days.length > 0 ? Math.round((completedCount / days.length) * 100) : 0;
  const openTaskDay = days.find((d) => d.day === openDay) ?? null;

  return (
    <div className='task-board min-h-screen font-sans persona-app bg-gradient-to-b from-persona-lavender/40 via-white to-persona-cream text-persona-ink'>
      <header className='border-b border-persona-border bg-white/70 px-6 py-4 backdrop-blur'>
        <div className='flex items-center justify-between mx-auto max-w-5xl'>
          <AppLogo variant='logo' size='sm' linkTo='/dashboard' />
          <Link
            to='/dashboard'
            className='text-sm font-semibold transition text-persona-muted hover:text-persona-purple'
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className='max-w-5xl px-6 py-12 mx-auto'>
        {loading ? (
          <p className='mt-10 text-persona-muted'>Loading your tasks…</p>
        ) : (
          <>
            <div className='flex flex-wrap items-center justify-between gap-6'>
              <div>
                <p className='text-sm font-bold uppercase tracking-widest text-persona-purple'>
                  Speakly
                </p>
                <h1 className='mt-2 text-3xl font-normal tracking-tight font-display md:text-4xl'>
                  Your speaking tasks
                </h1>
              </div>

              <div className='flex items-center gap-3 px-5 py-3 bg-white border rounded-2xl shadow-soft border-persona-border'>
                <ProgressRing value={percentComplete} size={44} stroke={4} />
                <div>
                  <p className='text-lg font-bold leading-none text-persona-ink'>
                    {percentComplete}%
                  </p>
                  <p className='mt-1 text-xs text-persona-muted'>
                    {completedCount} of {days.length} days
                  </p>
                </div>
              </div>
            </div>

            <ul className='grid grid-cols-1 gap-5 mt-8 sm:grid-cols-2 lg:grid-cols-3'>
              {days.map((day, index) => (
                <TaskCard
                  key={day.day}
                  task={day}
                  status={statusFor(day)}
                  index={index}
                  onClick={() => setOpenDay(day.day)}
                />
              ))}
            </ul>
          </>
        )}
      </main>

      {openTaskDay && (
        <SpeakingTaskDetail
          day={openTaskDay}
          status={statusFor(openTaskDay)}
          assessment={assessments[openTaskDay.day]}
          onClose={() => setOpenDay(null)}
        />
      )}
    </div>
  );
}
