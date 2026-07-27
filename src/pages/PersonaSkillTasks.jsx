import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import ProgressRing from "../components/persona/ProgressRing";
import { StarIcon } from "../components/persona/StarRating";
import StreakBadge from "../components/persona/StreakBadge";
import TaskCard from "../components/persona/TaskCard";
import TaskDrawer from "../components/persona/TaskDrawer";
import { PERSONA_SKILLS } from "../config/personaSkills";
import { SPEECH_TRAINING_PROJECT_ID } from "../config/projects";
import { useAuth } from "../contexts/AuthContext";
import { hasRatedAssessor, rateAssessor } from "../lib/personaAssessorDirectory";
import {
  MAX_SUBMISSION_IMAGES,
  normalizeSubmissionLink,
  uploadTaskSubmissionImage,
} from "../lib/personaTaskSubmissions";
import { getSkillProgress, submitSkillTask } from "../lib/personaSkillProgress";
import {
  getProvnProgramme,
  startProgrammeTraining,
  submitProgrammeTask,
} from "../lib/provnProgrammes";
import { showErrorToast } from "../lib/toast";
import PersonaSpeakingTasks from "./PersonaSpeakingTasks";

const SKILL_BY_ID = Object.fromEntries(PERSONA_SKILLS.map((s) => [s.id, s]));

function AssessorGate({ skillId }) {
  return (
    <div className='flex flex-col items-start justify-between gap-4 p-6 mt-8 border rounded-3xl border-persona-purple/30 bg-persona-lavender/50 md:flex-row md:items-center md:p-8'>
      <div>
        <h2 className='text-lg font-bold tracking-tight text-persona-ink'>
          Pick an assessor to unlock your tasks
        </h2>
        <p className='mt-2 text-sm leading-relaxed text-persona-muted'>
          Your tasks are ready, but you need an assessor assigned before you can
          start—they&apos;ll be the one reviewing your work. This choice is
          permanent, so take a look before you decide.
        </p>
      </div>
      <Link
        to={`/skills/${skillId}/assessors`}
        className='inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white transition rounded-2xl bg-persona-purple shadow-[0_4px_20px_rgba(14,174,110,0.35)] hover:bg-persona-purple-hover shrink-0'
      >
        Select assessors
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

/**
 * Link + one-or-more-images submission form, shared by both task flows
 * (`persona_skill_progress` and `provn_programmes`). `onUpload`/`onSubmit`
 * are the only flow-specific bits—everything else (image previews before
 * sending, validation, the button) is identical either way.
 */
function SubmissionForm({ onUpload, onSubmit, onSubmitted }) {
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleFiles(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    const room = MAX_SUBMISSION_IMAGES - images.length;
    if (room <= 0) {
      showErrorToast(`You can attach up to ${MAX_SUBMISSION_IMAGES} images.`);
      return;
    }

    const accepted = files.slice(0, room).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...accepted]);
  }

  function removeImage(index) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedLink = normalizeSubmissionLink(link);
    if (!normalizedLink && images.length === 0) {
      showErrorToast("Add a link or at least one image before sending.");
      return;
    }

    setSubmitting(true);
    try {
      setUploading(true);
      const uploaded = await Promise.all(
        images.map((image) => onUpload(image.file)),
      );
      setUploading(false);

      const result = await onSubmit({
        link: normalizedLink,
        imageUrls: uploaded.map((u) => u.downloadUrl),
        note: note.trim(),
      });
      onSubmitted(result);
    } catch (err) {
      showErrorToast(err.message || "Couldn't send your submission—try again.");
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <label className='block'>
        <span className='text-sm font-bold text-persona-ink'>
          Link to your work
        </span>
        <input
          type='text'
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder='figma.com/file/…'
          className='mt-1.5 w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-persona-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-persona-lavender-deep transition focus:ring-2 focus:ring-persona-purple'
        />
      </label>

      <div>
        <span className='text-sm font-bold text-persona-ink'>Images</span>
        <div className='flex flex-wrap gap-3 mt-2'>
          {images.map((image, index) => (
            <div key={image.previewUrl} className='relative w-20 h-20'>
              <img
                src={image.previewUrl}
                alt=''
                className='object-cover w-full h-full border rounded-xl border-persona-border'
              />
              <button
                type='button'
                onClick={() => removeImage(index)}
                aria-label='Remove image'
                className='absolute flex items-center justify-center w-5 h-5 text-xs text-white rounded-full -right-2 -top-2 bg-persona-ink'
              >
                ×
              </button>
            </div>
          ))}
          {images.length < MAX_SUBMISSION_IMAGES && (
            <label className='flex items-center justify-center w-20 h-20 transition border-2 border-dashed cursor-pointer rounded-xl border-persona-lavender-deep text-persona-muted hover:border-persona-purple hover:text-persona-purple'>
              <span className='text-2xl leading-none'>+</span>
              <input
                type='file'
                accept='image/*'
                multiple
                onChange={handleFiles}
                className='sr-only'
              />
            </label>
          )}
        </div>
      </div>

      <label className='block'>
        <span className='text-sm font-bold text-persona-ink'>
          Note (optional)
        </span>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='Anything your assessor should know…'
          className='mt-1.5 w-full resize-y rounded-2xl border-0 bg-white px-4 py-3 text-sm text-persona-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-persona-lavender-deep transition focus:ring-2 focus:ring-persona-purple'
        />
      </label>

      <button
        type='submit'
        disabled={submitting}
        className='flex items-center justify-center w-full gap-2 py-3.5 text-sm font-bold text-white transition rounded-2xl bg-persona-purple hover:bg-persona-purple-hover disabled:opacity-60'
      >
        {uploading
          ? "Uploading images…"
          : submitting
            ? "Sending…"
            : "Send to assessor"}
      </button>
    </form>
  );
}

/** One-time star-rating prompt, shown once a task is approved; hides itself once this learner has rated this assessor. */
function RateAssessorPrompt({ assessorId, learnerUid }) {
  const [status, setStatus] = useState("checking");
  const [hoverValue, setHoverValue] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!assessorId || !learnerUid) return;
    hasRatedAssessor(assessorId, learnerUid).then((rated) => {
      if (!cancelled) setStatus(rated ? "rated" : "unrated");
    });
    return () => {
      cancelled = true;
    };
  }, [assessorId, learnerUid]);

  async function handleRate(score) {
    setStatus("submitting");
    try {
      await rateAssessor(assessorId, learnerUid, score);
      setStatus("rated");
    } catch (err) {
      showErrorToast(err.message || "Couldn't send your rating—try again.");
      setStatus("unrated");
    }
  }

  if (status === "checking" || status === "rated" || !assessorId) return null;

  return (
    <div className='p-4 border rounded-2xl border-persona-border bg-persona-surface/60'>
      <p className='text-sm font-bold text-persona-ink'>Rate your assessor</p>
      <p className='mt-1 text-xs text-persona-muted'>
        How was their feedback on this task?
      </p>
      <div
        className='flex items-center gap-1 mt-3'
        onMouseLeave={() => setHoverValue(0)}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type='button'
            disabled={status === "submitting"}
            onMouseEnter={() => setHoverValue(value)}
            onClick={() => handleRate(value)}
            aria-label={`Rate ${value} out of 5 stars`}
            className='p-0.5 text-persona-purple transition disabled:opacity-50'
          >
            <StarIcon filled={value <= hoverValue} className='w-6 h-6' />
          </button>
        ))}
      </div>
    </div>
  );
}

function SubmissionSummary({ task, assessorId, learnerUid }) {
  const { submission } = task;
  return (
    <div className='space-y-5'>
      <span className='inline-flex items-center gap-1.5 rounded-full bg-persona-lavender px-3 py-1 text-xs font-bold text-persona-purple-dark'>
        {submission.status === "approved" ? "Approved" : "Pending review"}
      </span>

      {submission.link && (
        <div>
          <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
            Link
          </h3>
          <a
            href={submission.link}
            target='_blank'
            rel='noreferrer'
            className='block mt-1 text-sm font-semibold break-all text-persona-purple hover:underline'
          >
            {submission.link}
          </a>
        </div>
      )}

      {submission.imageUrls?.length > 0 && (
        <div>
          <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
            Images
          </h3>
          <div className='flex flex-wrap gap-3 mt-2'>
            {submission.imageUrls.map((url) => (
              <a key={url} href={url} target='_blank' rel='noreferrer'>
                <img
                  src={url}
                  alt=''
                  className='object-cover w-20 h-20 border rounded-xl border-persona-border'
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {submission.note && (
        <div>
          <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
            Note
          </h3>
          <p className='mt-1 text-sm leading-relaxed text-persona-ink'>
            {submission.note}
          </p>
        </div>
      )}

      {submission.status === "approved" && (
        <RateAssessorPrompt assessorId={assessorId} learnerUid={learnerUid} />
      )}
    </div>
  );
}

function TaskDetailDrawer({
  uid,
  skillId,
  assessorId,
  task,
  status,
  onClose,
  onSubmitted,
}) {
  return (
    <TaskDrawer
      eyebrow={`Day ${task.day}`}
      title={task.title}
      onClose={onClose}
    >
      <p className='text-sm leading-relaxed text-persona-ink'>
        {task.description}
      </p>

      {status === "locked" && (
        <p className='px-4 py-3 text-sm rounded-2xl bg-persona-surface text-persona-muted'>
          Finish your current task first to unlock this one.
        </p>
      )}

      {status === "actionable" && (
        <>
          {task.submission?.status === "changes_requested" && (
            <div className='p-4 border rounded-2xl border-amber-200 bg-amber-50'>
              <p className='text-xs font-bold tracking-wide uppercase text-amber-800'>
                Your assessor asked for changes
              </p>
              {task.submission.reviewComment && (
                <p className='mt-2 text-sm leading-relaxed text-amber-900/90'>
                  {task.submission.reviewComment}
                </p>
              )}
            </div>
          )}
          <SubmissionForm
            onUpload={(file) => uploadTaskSubmissionImage(uid, skillId, task.day, file)}
            onSubmit={(payload) => submitSkillTask(uid, skillId, task.day, payload)}
            onSubmitted={onSubmitted}
          />
        </>
      )}

      {(status === "submitted" || status === "complete") && task.submission && (
        <SubmissionSummary task={task} assessorId={assessorId} learnerUid={uid} />
      )}
    </TaskDrawer>
  );
}

const PROGRAMME_STATUS_STYLES = {
  locked:
    "border-dashed border-persona-border bg-persona-surface/50 opacity-70",
  actionable:
    "border-persona-purple bg-white shadow-[0_8px_30px_rgba(14,174,110,0.15)]",
};

function ProgrammeTaskCard({ task, index, status, onClick }) {
  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        className={`flex h-full w-full flex-col items-start gap-3 rounded-3xl border-2 p-6 text-left transition hover:-translate-y-0.5 ${
          PROGRAMME_STATUS_STYLES[status] ?? PROGRAMME_STATUS_STYLES.locked
        }`}
      >
        <div className='flex items-center justify-between w-full gap-3'>
          <span className='inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-persona-purple/10 text-persona-purple'>
            Day {task.id ?? index + 1}
          </span>
          {status === "locked" && (
            <span
              className='flex items-center justify-center w-6 h-6 text-xs border rounded-full border-persona-border text-persona-muted'
              aria-hidden
            >
              🔒
            </span>
          )}
        </div>
        <h3 className='text-lg font-bold tracking-tight text-persona-ink'>
          {task.title}
        </h3>
        {task.subtitle && (
          <p className='text-sm leading-relaxed text-persona-muted line-clamp-2'>
            {task.subtitle}
          </p>
        )}
      </button>
    </li>
  );
}

function ProgrammeTaskDrawer({
  uid,
  skillId,
  programmeId,
  task,
  index,
  status,
  onClose,
  onSubmitted,
}) {
  return (
    <TaskDrawer
      eyebrow={`Day ${task.id ?? index + 1}`}
      title={task.title}
      onClose={onClose}
    >
      {task.subtitle && (
        <p className='text-sm leading-relaxed text-persona-ink'>
          {task.subtitle}
        </p>
      )}
      {task.goal && (
        <div>
          <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
            Goal
          </h3>
          <p className='mt-1 text-sm leading-relaxed text-persona-ink'>
            {task.goal}
          </p>
        </div>
      )}

      {status === "locked" && (
        <p className='px-4 py-3 text-sm rounded-2xl bg-persona-surface text-persona-muted'>
          This unlocks once you reach it in the programme.
        </p>
      )}

      {status === "actionable" && (
        <SubmissionForm
          onUpload={(file) =>
            uploadTaskSubmissionImage(uid, skillId, task.id, file)
          }
          onSubmit={(payload) =>
            submitProgrammeTask(programmeId, task.id, payload)
          }
          onSubmitted={onSubmitted}
        />
      )}

      {status === "submitted" && task.submission && (
        <SubmissionSummary task={task} />
      )}
    </TaskDrawer>
  );
}

function StartTrainingCard({ assessorName, onStart, starting }) {
  return (
    <div className='flex flex-col items-start justify-between gap-4 p-6 mt-8 border rounded-3xl border-persona-purple/30 bg-persona-lavender/50 md:flex-row md:items-center md:p-8'>
      <div>
        <h2 className='text-lg font-bold tracking-tight text-persona-ink'>
          Ready when you are
        </h2>
        <p className='mt-2 text-sm leading-relaxed text-persona-muted'>
          {assessorName} is set as your assessor. Your tasks stay locked until
          you start training.
        </p>
      </div>
      <button
        type='button'
        onClick={onStart}
        disabled={starting}
        className='inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white transition rounded-2xl bg-persona-purple shadow-[0_4px_20px_rgba(14,174,110,0.35)] hover:bg-persona-purple-hover disabled:opacity-60 shrink-0'
      >
        {starting ? "Starting…" : "Start training"}
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}

/**
 * A programme generated by the Provn task-generation backend. Everything
 * stays locked until an assessor is assigned (permanent, same rule as the
 * other flow) and training is explicitly started; only the first task then
 * unlocks, and submitting it shows a read-only summary in its place—there's
 * no assessor-review workflow for these yet, so it doesn't advance further.
 */
function ProgrammeView({ programme, skill, skillId, uid, onProgrammeChange }) {
  const tasks = Array.isArray(programme.tasks) ? programme.tasks : [];
  const [openIndex, setOpenIndex] = useState(null);
  const [starting, setStarting] = useState(false);
  const openTask = openIndex != null ? tasks[openIndex] : null;

  const hasAssessor = Boolean(programme.assignedAssessorId);
  const trainingStarted = Boolean(programme.trainingStarted);

  function statusFor(index) {
    if (tasks[index]?.submission) return "submitted";
    return trainingStarted && index === 0 ? "actionable" : "locked";
  }

  function handleTaskSubmitted(updatedTasks) {
    onProgrammeChange({ ...programme, tasks: updatedTasks });
    setOpenIndex(null);
  }

  async function handleStartTraining() {
    setStarting(true);
    try {
      await startProgrammeTraining(programme.id);
      onProgrammeChange({ ...programme, trainingStarted: true });
    } catch (err) {
      showErrorToast(err.message || "Couldn't start training—try again.");
    } finally {
      setStarting(false);
    }
  }

  return (
    <>
      <div className='flex flex-wrap items-center justify-between gap-6'>
        <div>
          <p className='text-sm font-bold tracking-widest uppercase text-persona-purple'>
            {programme.skill || skill.name}
          </p>
          <h1 className='mt-2 text-3xl font-normal tracking-tight font-display md:text-4xl'>
            Your tasks
          </h1>
        </div>

        {hasAssessor && (
          <div className='flex items-center gap-3 px-5 py-3 bg-white border rounded-2xl shadow-soft border-persona-border'>
            <span className='flex items-center justify-center w-10 h-10 text-lg rounded-xl bg-persona-lavender'>
              ✓
            </span>
            <div>
              <p className='text-sm font-bold text-persona-ink'>
                {programme.assignedAssessorName}
              </p>
              <p className='text-xs text-persona-muted'>Your assessor</p>
            </div>
          </div>
        )}
      </div>

      {(programme.programmeDuration || tasks.length > 0) && (
        <p className='mt-2 text-sm text-persona-muted'>
          {programme.programmeDuration
            ? `${programme.programmeDuration} days · `
            : ""}
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </p>
      )}
      {/* {programme.encouragementNote && (
        <p className='max-w-2xl mt-4 text-base italic leading-relaxed text-persona-muted'>
          “{programme.encouragementNote}”
        </p>
      )} */}

      {!hasAssessor && <AssessorGate skillId={skillId} />}
      {hasAssessor && !trainingStarted && (
        <StartTrainingCard
          assessorName={programme.assignedAssessorName}
          onStart={handleStartTraining}
          starting={starting}
        />
      )}

      <ul className='grid grid-cols-1 gap-5 mt-10 sm:grid-cols-2 lg:grid-cols-3'>
        {tasks.map((task, index) => (
          <ProgrammeTaskCard
            key={task.id ?? index}
            task={task}
            index={index}
            status={statusFor(index)}
            onClick={() => setOpenIndex(index)}
          />
        ))}
      </ul>

      {openTask && (
        <ProgrammeTaskDrawer
          uid={uid}
          skillId={skillId}
          programmeId={programme.id}
          task={openTask}
          index={openIndex}
          status={statusFor(openIndex)}
          onClose={() => setOpenIndex(null)}
          onSubmitted={handleTaskSubmitted}
        />
      )}
    </>
  );
}

export default function PersonaSkillTasks() {
  const { skillId } = useParams();
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState(null);
  const [programme, setProgramme] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [openDay, setOpenDay] = useState(null);

  const skill = SKILL_BY_ID[skillId];

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.uid) return;
      try {
        // Tasks can live in either the older client-generated flow
        // (`persona_skill_progress`) or the newer Provn task-generation
        // backend (`provn_programmes`)—check both.
        const [progressData, programmeData] = await Promise.all([
          getSkillProgress(user.uid, skillId),
          getProvnProgramme(user.uid, skillId),
        ]);
        if (cancelled) return;
        if (progressData) {
          setProgress(progressData);
        } else if (programmeData) {
          setProgramme(programmeData);
        } else {
          setNotFound(true);
        }
      } catch {
        if (!cancelled)
          showErrorToast("We couldn't load your tasks. Please try again.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, skillId]);

  if (skillId === SPEECH_TRAINING_PROJECT_ID) {
    return <PersonaSpeakingTasks />;
  }

  if (!loading && !user) {
    return <Navigate to='/login' replace />;
  }

  if (!skill) {
    return <Navigate to='/dashboard' replace />;
  }

  if (notFound) {
    return <Navigate to={`/skills/${skillId}/setup`} replace />;
  }

  const hasAssessor = Boolean(progress?.assignedAssessorId);
  const firstIncompleteDay =
    progress?.tasks?.find((t) => !t.completed)?.day ?? null;
  const completedCount =
    progress?.tasks?.filter((t) => t.completed).length ?? 0;
  const totalCount = progress?.tasks?.length ?? 0;
  const percentComplete =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const openTask = progress?.tasks?.find((t) => t.day === openDay) ?? null;

  function statusFor(task) {
    if (task.completed) return task.submission ? "submitted" : "complete";
    if (hasAssessor && task.day === firstIncompleteDay) return "actionable";
    return "locked";
  }

  return (
    <div className='min-h-screen font-sans task-board persona-app bg-gradient-to-b from-persona-lavender/40 via-white to-persona-cream text-persona-ink'>
      <header className='px-6 py-4 border-b border-persona-border bg-white/70 backdrop-blur'>
        <div className='flex items-center justify-between max-w-5xl mx-auto'>
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
        {!progress && !programme ? (
          <p className='mt-10 text-persona-muted'>Loading your tasks…</p>
        ) : programme ? (
          <ProgrammeView
            programme={programme}
            skill={skill}
            skillId={skillId}
            uid={user.uid}
            onProgrammeChange={setProgramme}
          />
        ) : (
          <>
            <div className='flex flex-wrap items-center justify-between gap-6'>
              <div>
                <p className='text-sm font-bold tracking-widest uppercase text-persona-purple'>
                  {skill.name}
                </p>
                <h1 className='mt-2 text-3xl font-normal tracking-tight font-display md:text-4xl'>
                  Your tasks
                </h1>
              </div>

              <div className='flex flex-wrap items-center gap-4'>
                <StreakBadge
                  current={progress.streak?.current ?? 0}
                  longest={progress.streak?.longest ?? 0}
                />
                <div className='flex items-center gap-3 px-5 py-3 bg-white border rounded-2xl shadow-soft border-persona-border'>
                  <ProgressRing value={percentComplete} size={44} stroke={4} />
                  <div>
                    <p className='text-lg font-bold leading-none text-persona-ink'>
                      {percentComplete}%
                    </p>
                    <p className='mt-1 text-xs text-persona-muted'>
                      {completedCount} of {totalCount} done
                    </p>
                  </div>
                </div>
                {hasAssessor && (
                  <div className='flex items-center gap-3 px-5 py-3 bg-white border rounded-2xl shadow-soft border-persona-border'>
                    <span className='flex items-center justify-center w-10 h-10 text-lg rounded-xl bg-persona-lavender'>
                      ✓
                    </span>
                    <div>
                      <p className='text-sm font-bold text-persona-ink'>
                        {progress.assignedAssessorName}
                      </p>
                      <p className='text-xs text-persona-muted'>
                        Your assessor
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!hasAssessor && <AssessorGate skillId={skillId} />}

            <ul className='grid grid-cols-1 gap-5 mt-8 sm:grid-cols-2 lg:grid-cols-3'>
              {progress.tasks.map((task, index) => {
                const status = statusFor(task);
                return (
                  <TaskCard
                    key={task.day}
                    task={task}
                    status={status}
                    index={index}
                    onClick={() => setOpenDay(task.day)}
                  />
                );
              })}
            </ul>
          </>
        )}
      </main>

      {openTask && (
        <TaskDetailDrawer
          uid={user.uid}
          skillId={skillId}
          assessorId={progress.assignedAssessorId}
          task={openTask}
          status={statusFor(openTask)}
          onClose={() => setOpenDay(null)}
          onSubmitted={({ tasks, streak }) => {
            setProgress((prev) => ({ ...prev, tasks, streak }));
            setOpenDay(null);
          }}
        />
      )}
    </div>
  );
}
