import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import { StarIcon } from "../components/persona/StarRating";
import { PERSONA_SKILLS } from "../config/personaSkills";
import { useAuth } from "../contexts/AuthContext";
import { showErrorToast } from "../lib/toast";
import { listAssessorsForTrack } from "../lib/personaAssessorDirectory";
import {
  assignSkillAssessor,
  getSkillProgress,
} from "../lib/personaSkillProgress";
import {
  assignProgrammeAssessor,
  getProvnProgramme,
} from "../lib/provnProgrammes";

const SKILL_BY_ID = Object.fromEntries(PERSONA_SKILLS.map((s) => [s.id, s]));

function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const YEARS_EXPERIENCE_PATTERN = /year/i;

/** Pulls the numeric-years bucket out of backgroundLabels—that field can also hold "volunteer"/"paid" labels, which aren't years. */
function yearsExperienceLabel(backgroundLabels) {
  return backgroundLabels?.find((label) => YEARS_EXPERIENCE_PATTERN.test(label)) ?? null;
}

function TagList({ items, emptyLabel }) {
  if (!items || items.length === 0) {
    return <p className='text-sm text-persona-muted'>{emptyLabel}</p>;
  }
  return (
    <ul className='flex flex-wrap gap-2'>
      {items.map((item) => (
        <li
          key={item}
          className='px-3 py-1 text-xs font-semibold rounded-full bg-persona-lavender text-persona-purple-dark'
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function AssessorCard({ assessor, selected, onClick }) {
  const rating =
    assessor.ratingCount > 0 ? assessor.ratingSum / assessor.ratingCount : null;
  const years = yearsExperienceLabel(assessor.backgroundLabels);

  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        aria-pressed={selected}
        className={`group flex h-full w-full flex-col overflow-hidden rounded-3xl border bg-white text-left shadow-card transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(14,174,110,0.16)] ${
          selected
            ? "border-persona-purple ring-2 ring-persona-purple/30"
            : "border-persona-border"
        }`}
      >
        <div className='relative w-full overflow-hidden aspect-square bg-persona-lavender'>
          {assessor.photoUrl ? (
            <img
              src={assessor.photoUrl}
              alt={assessor.name}
              className='object-cover w-full h-full transition duration-500 group-hover:scale-105'
            />
          ) : (
            <div className='flex items-center justify-center w-full h-full text-4xl font-bold text-persona-purple-dark'>
              {initials(assessor.name)}
            </div>
          )}
          <div className='absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-persona-ink/80 via-persona-ink/5 to-transparent' />
          {rating != null && (
            <span className='absolute flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full shadow-soft top-3 right-3 bg-white/95 text-persona-ink'>
              <StarIcon className='w-3.5 h-3.5 text-persona-purple' />
              {rating.toFixed(1)}
            </span>
          )}
          <p className='absolute text-base font-bold text-white bottom-3 left-4 right-4 line-clamp-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]'>
            {assessor.name}
          </p>
        </div>

        <div className='flex flex-col flex-1 gap-3 p-4'>
          <div className='flex items-center justify-between gap-2 text-xs font-semibold text-persona-muted'>
            <span>
              {assessor.studentsCount > 0
                ? `${assessor.studentsCount} mentored`
                : "New assessor"}
            </span>
            {years && <span>{years}</span>}
          </div>

          {assessor.qualificationLabels?.length > 0 && (
            <p className='text-xs text-persona-muted line-clamp-1'>
              {assessor.qualificationLabels.join(" · ")}
            </p>
          )}

          {assessor.focusLabels?.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {assessor.focusLabels.slice(0, 2).map((label) => (
                <span
                  key={label}
                  className='rounded-full bg-persona-surface px-2.5 py-0.5 text-[11px] font-semibold text-persona-muted'
                >
                  {label}
                </span>
              ))}
              {assessor.focusLabels.length > 2 && (
                <span className='rounded-full bg-persona-surface px-2.5 py-0.5 text-[11px] font-semibold text-persona-muted'>
                  +{assessor.focusLabels.length - 2}
                </span>
              )}
            </div>
          )}

          <span className='pt-1 mt-auto text-xs font-bold text-persona-purple'>
            {selected ? "Viewing details" : "View details"}
          </span>
        </div>
      </button>
    </li>
  );
}

function AssessorDrawer({ assessor, onClose, onConfirmed }) {
  const [confirming, setConfirming] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setConfirming(false);
  }, [assessor?.uid]);

  async function handleConfirm() {
    setAssigning(true);
    try {
      await onConfirmed(assessor);
    } catch (err) {
      showErrorToast(err.message || "Couldn't assign that assessor—try again.");
      setAssigning(false);
    }
  }

  const rating =
    assessor.ratingCount > 0 ? assessor.ratingSum / assessor.ratingCount : null;
  const years = yearsExperienceLabel(assessor.backgroundLabels);

  return (
    <>
      <div
        className='fixed inset-0 z-40 bg-persona-ink/40'
        onClick={onClose}
        aria-hidden
      />
      <aside
        className='fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-md overflow-y-auto bg-white border-l shadow-2xl border-persona-border'
        role='dialog'
        aria-label={`${assessor.name} details`}
      >
        <div className='relative w-full overflow-hidden h-56 shrink-0 bg-persona-lavender'>
          {assessor.photoUrl ? (
            <img
              src={assessor.photoUrl}
              alt={assessor.name}
              className='object-cover w-full h-full'
            />
          ) : (
            <div className='flex items-center justify-center w-full h-full text-6xl font-bold text-persona-purple-dark'>
              {initials(assessor.name)}
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-persona-ink/80 via-persona-ink/10 to-transparent' />
          <button
            type='button'
            onClick={onClose}
            aria-label='Close details'
            className='absolute flex items-center justify-center text-lg text-white transition rounded-full top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur hover:bg-black/50'
          >
            ×
          </button>
          <div className='absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5'>
            <div>
              <h2 className='text-xl font-bold text-white drop-shadow'>
                {assessor.name}
              </h2>
              <p className='text-xs font-semibold text-white/80'>Assessor</p>
            </div>
            {rating != null && (
              <span className='flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-persona-ink shadow-soft shrink-0'>
                <StarIcon className='w-4 h-4 text-persona-purple' />
                {rating.toFixed(1)}
                <span className='font-semibold text-persona-muted'>
                  ({assessor.ratingCount})
                </span>
              </span>
            )}
          </div>
        </div>

        <div className='grid grid-cols-3 gap-3 p-5 border-b border-persona-border'>
          <div className='p-3 text-center border rounded-2xl border-persona-border bg-persona-surface/60'>
            <p className='text-lg font-bold text-persona-ink'>
              {assessor.studentsCount > 0 ? assessor.studentsCount : "New"}
            </p>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-persona-muted'>
              Mentored
            </p>
          </div>
          <div className='p-3 text-center border rounded-2xl border-persona-border bg-persona-surface/60'>
            <p className='text-lg font-bold text-persona-ink'>
              {rating != null ? rating.toFixed(1) : "—"}
            </p>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-persona-muted'>
              Rating
            </p>
          </div>
          <div className='p-3 text-center border rounded-2xl border-persona-border bg-persona-surface/60'>
            <p className='text-lg font-bold leading-tight text-persona-ink'>
              {years ?? "—"}
            </p>
            <p className='text-[11px] font-semibold uppercase tracking-wide text-persona-muted'>
              Experience
            </p>
          </div>
        </div>

        <div className='flex-1 p-6 space-y-6'>
          <section>
            <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
              Expertise
            </h3>
            <div className='mt-2'>
              <TagList
                items={assessor.qualificationLabels}
                emptyLabel='No qualifications listed.'
              />
            </div>
          </section>

          <section>
            <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
              Reviews best
            </h3>
            <div className='mt-2'>
              <TagList
                items={assessor.focusLabels}
                emptyLabel='No focus areas listed.'
              />
            </div>
          </section>

          <section>
            <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
              Experience level
            </h3>
            <div className='mt-2'>
              <TagList
                items={assessor.backgroundLabels}
                emptyLabel='No experience details listed.'
              />
            </div>
          </section>

          <section>
            <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
              About
            </h3>
            <p className='mt-2 text-sm leading-relaxed text-persona-ink'>
              {assessor.bio?.trim() || "This assessor hasn't added a bio yet."}
            </p>
          </section>

          {assessor.mentoringCharge != null && (
            <section>
              <h3 className='text-xs font-bold tracking-wide uppercase text-persona-muted'>
                Mentoring charge
              </h3>
              <p className='mt-2 text-sm font-semibold leading-relaxed text-persona-ink'>
                {assessor.mentoringCharge.toLocaleString()}{" "}
                {assessor.mentoringCurrency}
              </p>
            </section>
          )}
        </div>

        <div className='p-6 border-t border-persona-border bg-persona-surface/60'>
          {!confirming ? (
            <button
              type='button'
              onClick={() => setConfirming(true)}
              className='flex items-center justify-center w-full gap-2 py-4 text-base font-bold text-white transition rounded-2xl bg-persona-purple hover:bg-persona-purple-hover'
            >
              Select this assessor
            </button>
          ) : (
            <div className='space-y-3'>
              <p className='text-sm font-semibold text-center text-persona-ink'>
                This can&apos;t be changed later. Assign {assessor.name} as your
                assessor?
              </p>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => setConfirming(false)}
                  disabled={assigning}
                  className='flex-1 py-3 text-sm font-bold transition bg-white border-2 rounded-2xl border-persona-lavender-deep text-persona-purple-dark hover:border-persona-purple disabled:opacity-60'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={handleConfirm}
                  disabled={assigning}
                  className='flex-1 py-3 text-sm font-bold text-white transition rounded-2xl bg-persona-purple hover:bg-persona-purple-hover disabled:opacity-60'
                >
                  {assigning ? "Assigning…" : "Confirm"}
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default function PersonaAssessorPicker() {
  const { skillId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const skill = SKILL_BY_ID[skillId];

  console.log({ skillId, skill });

  // Tasks (and so the assessor to assign) can come from either the older
  // client-generated flow (`persona_skill_progress`) or the Provn
  // task-generation backend (`provn_programmes`)—check both, same as the
  // tasks page itself.
  const [progress, setProgress] = useState(null);
  const [programme, setProgramme] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [assessors, setAssessors] = useState(null);
  const [selectedUid, setSelectedUid] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.uid) return;
      try {
        const [progressData, programmeData] = await Promise.all([
          getSkillProgress(user.uid, skillId),
          getProvnProgramme(user.uid, skillId),
        ]);
        console.log({ progressData, programmeData });
        if (cancelled) return;
        if (!progressData && !programmeData) {
          setNotFound(true);
          return;
        }
        setProgress(progressData);
        setProgramme(progressData ? null : programmeData);
        const list = await listAssessorsForTrack(
          progressData?.track ?? programmeData?.track,
        );
        console.log({ list });
        if (!cancelled) setAssessors(list);
      } catch {
        if (!cancelled)
          showErrorToast("We couldn't load assessors. Please try again.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, skillId]);

  async function handleConfirmed(assessor) {
    if (progress) {
      await assignSkillAssessor(user.uid, skillId, {
        assessorId: assessor.uid,
        assessorName: assessor.name,
      });
    } else {
      await assignProgrammeAssessor(programme.id, {
        assessorId: assessor.uid,
        assessorName: assessor.name,
      });
    }
    navigate(`/skills/${skillId}`, { replace: true });
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

  if (progress?.assignedAssessorId || programme?.assignedAssessorId) {
    return <Navigate to={`/skills/${skillId}`} replace />;
  }

  const selectedAssessor =
    assessors?.find((a) => a.uid === selectedUid) ?? null;

  return (
    <div className='min-h-screen font-sans persona-app bg-gradient-to-b from-persona-lavender/40 via-white to-persona-cream text-persona-ink'>
      <header className='px-6 py-4 border-b border-persona-border bg-white/70 backdrop-blur'>
        <div className='flex items-center justify-between max-w-6xl mx-auto'>
          <AppLogo variant='logo' size='sm' linkTo='/dashboard' />
          <Link
            to={`/skills/${skillId}`}
            className='text-sm font-semibold transition text-persona-muted hover:text-persona-purple'
          >
            Back to tasks
          </Link>
        </div>
      </header>

      <main className='max-w-6xl px-6 py-12 mx-auto'>
        <p className='text-sm font-bold tracking-widest uppercase text-persona-purple'>
          {skill.name}
        </p>
        <h1 className='mt-2 text-3xl font-normal tracking-tight font-display md:text-4xl'>
          Choose your assessor
        </h1>
        <p className='max-w-xl mt-2 text-base leading-relaxed text-persona-muted'>
          Tap a card to see their expertise and background. Once you confirm,
          your assessor can&apos;t be changed—take your time.
        </p>

        {assessors === null ? (
          <p className='mt-10 text-persona-muted'>Loading assessors…</p>
        ) : assessors.length === 0 ? (
          <div className='p-8 mt-10 bg-white border rounded-3xl border-persona-border'>
            <p className='text-persona-muted'>
              No assessors have joined this track yet—check back soon.
            </p>
          </div>
        ) : (
          <ul className='grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {assessors.map((assessor) => (
              <AssessorCard
                key={assessor.uid}
                assessor={assessor}
                selected={selectedUid === assessor.uid}
                onClick={() =>
                  setSelectedUid((prev) =>
                    prev === assessor.uid ? null : assessor.uid,
                  )
                }
              />
            ))}
          </ul>
        )}
      </main>

      {selectedAssessor && (
        <AssessorDrawer
          assessor={selectedAssessor}
          onClose={() => setSelectedUid(null)}
          onConfirmed={handleConfirmed}
        />
      )}
    </div>
  );
}
