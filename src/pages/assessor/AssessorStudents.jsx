import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProgressRing from "../../components/persona/ProgressRing";
import TaskDrawer from "../../components/persona/TaskDrawer";
import { PERSONA_SKILLS } from "../../config/personaSkills";
import SubmissionReviewPanel from "./SubmissionReviewPanel";

const SKILL_BY_ID = Object.fromEntries(PERSONA_SKILLS.map((s) => [s.id, s]));

const TASK_STATUS_ICON = {
  approved: "✓",
  pending: "⏳",
  changes_requested: "↺",
};

function StudentCard({ learner, pendingCount, onClick }) {
  const skill = SKILL_BY_ID[learner.skillId];
  const total = learner.tasks?.length ?? 0;
  const done = learner.tasks?.filter((t) => t.completed).length ?? 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        className='flex flex-col items-start w-full h-full gap-3 p-5 text-left transition bg-white border-2 rounded-3xl border-persona-border hover:border-persona-purple hover:shadow-soft'
      >
        <div className='flex items-center justify-between w-full'>
          <p className='text-base font-bold text-persona-ink'>
            {learner.answers?.name || "Learner"}
          </p>
          {pendingCount > 0 && (
            <span className='rounded-full bg-persona-purple px-2.5 py-0.5 text-[11px] font-bold text-white'>
              {pendingCount} awaiting
            </span>
          )}
        </div>
        <p className='text-xs font-medium text-persona-muted'>{skill?.name || learner.skillId}</p>
        <div className='flex items-center gap-3 mt-auto'>
          <ProgressRing value={percent} size={32} stroke={3} />
          <span className='text-xs text-persona-muted'>
            {done} of {total} tasks · 🔥 {learner.streak?.current ?? 0}
          </span>
        </div>
      </button>
    </li>
  );
}

function LearnerTaskList({ tasks, onSelectTask }) {
  return (
    <ul className='space-y-2'>
      {tasks.map((task) => (
        <li key={task.day}>
          <button
            type='button'
            onClick={() => task.submission && onSelectTask(task)}
            disabled={!task.submission}
            className='flex items-center justify-between w-full gap-3 p-3 text-left transition border rounded-xl border-persona-border disabled:opacity-50 enabled:hover:border-persona-purple'
          >
            <span className='text-sm font-semibold text-persona-ink'>
              Day {task.day} · {task.title}
            </span>
            <span className='text-xs font-bold text-persona-muted'>
              {task.submission ? TASK_STATUS_ICON[task.submission.status] : ""}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function AssessorStudents() {
  const { learners, loading, reload } = useOutletContext();
  const [openLearner, setOpenLearner] = useState(null);
  const [openTask, setOpenTask] = useState(null);

  if (loading) {
    return <p className='text-persona-muted'>Loading your students…</p>;
  }

  return (
    <div>
      <h1 className='text-3xl font-normal tracking-tight font-display'>Students</h1>

      {learners.length === 0 ? (
        <p className='mt-6 text-persona-muted'>
          No students have picked you as their assessor yet.
        </p>
      ) : (
        <ul className='grid grid-cols-1 gap-5 mt-8 sm:grid-cols-2 lg:grid-cols-3'>
          {learners.map((learner) => (
            <StudentCard
              key={`${learner.uid}-${learner.skillId}`}
              learner={learner}
              pendingCount={
                learner.tasks?.filter((t) => t.submission?.status === "pending").length ?? 0
              }
              onClick={() => setOpenLearner(learner)}
            />
          ))}
        </ul>
      )}

      {openLearner && !openTask && (
        <TaskDrawer
          eyebrow={SKILL_BY_ID[openLearner.skillId]?.name || openLearner.skillId}
          title={openLearner.answers?.name || "Learner"}
          onClose={() => setOpenLearner(null)}
        >
          <LearnerTaskList tasks={openLearner.tasks} onSelectTask={setOpenTask} />
        </TaskDrawer>
      )}

      {openLearner && openTask && (
        <TaskDrawer
          eyebrow={`Day ${openTask.day}`}
          title={openTask.title}
          onClose={() => setOpenTask(null)}
        >
          <SubmissionReviewPanel
            learner={openLearner}
            task={openTask}
            onReviewed={async () => {
              await reload();
              setOpenTask(null);
              setOpenLearner(null);
            }}
          />
        </TaskDrawer>
      )}
    </div>
  );
}
