import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import TaskDrawer from "../../components/persona/TaskDrawer";
import { summarizeAssignedLearners } from "../../lib/personaSkillProgress";
import SubmissionReviewPanel from "./SubmissionReviewPanel";

function StatCard({ label, value, sub, comingSoon }) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        comingSoon
          ? "border-dashed border-persona-border bg-persona-surface/50"
          : "border-persona-border bg-white shadow-soft"
      }`}
    >
      <p className='text-xs font-bold uppercase tracking-wide text-persona-muted'>{label}</p>
      <p className='mt-2 text-3xl font-bold tracking-tight text-persona-ink'>{value}</p>
      {sub && <p className='mt-1 text-xs text-persona-muted'>{sub}</p>}
    </div>
  );
}

function SubmissionRow({ entry, onClick }) {
  const { learner, task } = entry;
  const date = task.submission.submittedAt || task.submission.reviewedAt;
  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        className='flex items-center justify-between w-full gap-4 p-4 text-left transition bg-white border rounded-2xl border-persona-border hover:border-persona-purple'
      >
        <div>
          <p className='text-sm font-bold text-persona-ink'>{learner.answers?.name || "Learner"}</p>
          <p className='text-xs text-persona-muted'>
            Day {task.day} · {task.title}
          </p>
        </div>
        <span className='text-xs font-medium text-persona-muted'>
          {date ? new Date(date).toLocaleDateString() : ""}
        </span>
      </button>
    </li>
  );
}

export default function AssessorOverview() {
  const { learners, loading, reload } = useOutletContext();
  const [openEntry, setOpenEntry] = useState(null);

  if (loading) {
    return <p className='text-persona-muted'>Loading your overview…</p>;
  }

  const { studentCount, hoursReviewing, awaitingReview, pendingResponse } =
    summarizeAssignedLearners(learners);

  return (
    <div>
      <h1 className='text-3xl font-normal tracking-tight font-display'>Overview</h1>

      <div className='grid grid-cols-2 gap-5 mt-8 lg:grid-cols-4'>
        <StatCard label='Amount earned' value='—' sub='Coming soon' comingSoon />
        <StatCard label='Amount withdrawn' value='—' sub='Coming soon' comingSoon />
        <StatCard label='Students' value={studentCount} />
        <StatCard label='Hours spent reviewing' value={hoursReviewing} />
      </div>

      <section className='mt-10'>
        <h2 className='text-lg font-bold tracking-tight text-persona-ink'>
          Awaiting your review
          {awaitingReview.length > 0 && (
            <span className='ml-2 text-sm font-medium text-persona-muted'>
              ({awaitingReview.length})
            </span>
          )}
        </h2>
        {awaitingReview.length === 0 ? (
          <p className='mt-3 text-sm text-persona-muted'>Nothing waiting on you right now.</p>
        ) : (
          <ul className='mt-3 space-y-2'>
            {awaitingReview.map((entry) => (
              <SubmissionRow
                key={`${entry.learner.uid}-${entry.learner.skillId}-${entry.task.day}`}
                entry={entry}
                onClick={() => setOpenEntry(entry)}
              />
            ))}
          </ul>
        )}
      </section>

      <section className='mt-10'>
        <h2 className='text-lg font-bold tracking-tight text-persona-ink'>
          Pending response
          {pendingResponse.length > 0 && (
            <span className='ml-2 text-sm font-medium text-persona-muted'>
              ({pendingResponse.length})
            </span>
          )}
        </h2>
        {pendingResponse.length === 0 ? (
          <p className='mt-3 text-sm text-persona-muted'>No one owes you a resubmission.</p>
        ) : (
          <ul className='mt-3 space-y-2'>
            {pendingResponse.map((entry) => (
              <SubmissionRow
                key={`${entry.learner.uid}-${entry.learner.skillId}-${entry.task.day}`}
                entry={entry}
                onClick={() => setOpenEntry(entry)}
              />
            ))}
          </ul>
        )}
      </section>

      {openEntry && (
        <TaskDrawer
          eyebrow={`Day ${openEntry.task.day}`}
          title={openEntry.task.title}
          onClose={() => setOpenEntry(null)}
        >
          <SubmissionReviewPanel
            learner={openEntry.learner}
            task={openEntry.task}
            onReviewed={async () => {
              await reload();
              setOpenEntry(null);
            }}
          />
        </TaskDrawer>
      )}
    </div>
  );
}
