import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import PersonaAuthLayout from "../components/persona/PersonaAuthLayout";
import {
  FieldLabel,
  OtherField,
  PillGroup,
  StepProgress,
  toggleInList,
} from "../components/persona/QuestionSteps";
import ProvnBuilderScreen from "../components/persona/ProvnBuilderScreen";
import {
  PERSONA_DESIGN_CONTEXTS,
  PERSONA_DESIGN_DISCIPLINES,
  PERSONA_DESIGN_END_GOALS,
  PERSONA_DESIGN_FOCUS_AREAS,
  PERSONA_DESIGN_REASONS,
  PERSONA_ROLE_ASSESSOR,
  PERSONA_TRACK_DESIGN,
} from "../config/personaRegistration";
import { generateSkillTasks } from "../config/personaSkillTasks";
import { useAuth } from "../contexts/AuthContext";
import { isFirebaseConfigured } from "../firebase/config";
import { createPersonaDesignUser, getPersonaUser } from "../lib/personaUsers";
import {
  createSkillProgress,
  getSkillProgress,
} from "../lib/personaSkillProgress";
import {
  DEFAULT_PROGRAM_DAYS,
  MAX_PROGRAM_DAYS,
  MIN_PROGRAM_DAYS,
} from "../lib/speechTrainingProgram";
import { showErrorToast } from "../lib/toast";
import axios from "axios";

/** Skills with a question-driven setup flow. Extend as more skills get one. */
const SETUP_CONFIG = {
  [PERSONA_TRACK_DESIGN]: {
    skillName: "design",
    questionOptions: {
      disciplines: PERSONA_DESIGN_DISCIPLINES,
      reasons: PERSONA_DESIGN_REASONS,
      contexts: PERSONA_DESIGN_CONTEXTS,
      focus: PERSONA_DESIGN_FOCUS_AREAS,
      goals: PERSONA_DESIGN_END_GOALS,
    },
  },
};

const STEPS = [
  {
    id: "disciplines",
    title: "Which design skills do you want to train?",
    subtitle:
      "UI/UX, graphics, illustration—choose every path you want to grow in.",
  },
  {
    id: "reasons",
    title: "What's bringing you to design training?",
    subtitle:
      "Pick anything that resonates—no need to overthink it. Choose as many as you like.",
  },
  {
    id: "contexts",
    title: "Where will you use your design skills?",
    subtitle:
      "Choose the settings that matter most—product work, clients, print, and more.",
  },
  {
    id: "focus",
    title: "What would you like to work on?",
    subtitle:
      "These shape the daily briefs we generate. Select all that apply.",
  },
  {
    id: "goals",
    title: "Where do you want to end up?",
    subtitle:
      "Tell us your goals and how many days you want your task list to cover.",
  },
];

const MIN_BUILD_MS = 2400;

const TASK_QUESTS = [
  { label: "Mapping your goals", icon: "🎯" },
  { label: "Sketching your daily briefs", icon: "✏️" },
  { label: "Lining up exercises", icon: "📋" },
  { label: "Calibrating difficulty", icon: "⚙️" },
  { label: "Polishing your first task", icon: "✨" },
];

function pillStepValid(values, otherValue) {
  if (values.length === 0) return false;
  if (values.includes("other") && !otherValue.trim()) return false;
  return true;
}

export default function PersonaSkillSetup() {
  const { skillId } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const config = SETUP_CONFIG[skillId];

  const [checkingExisting, setCheckingExisting] = useState(true);
  const [hasExisting, setHasExisting] = useState(false);
  const [isAssessor, setIsAssessor] = useState(false);

  const [step, setStep] = useState(0);
  const [disciplines, setDisciplines] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [reasonsOther, setReasonsOther] = useState("");
  const [contexts, setContexts] = useState([]);
  const [contextsOther, setContextsOther] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [focusAreasOther, setFocusAreasOther] = useState("");
  const [endGoals, setEndGoals] = useState([]);
  const [endGoalsOther, setEndGoalsOther] = useState("");
  const [programDuration, setProgramDuration] = useState(DEFAULT_PROGRAM_DAYS);

  const [building, setBuilding] = useState(false);
  const [buildComplete, setBuildComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkExisting() {
      if (!user?.uid || !config) {
        setCheckingExisting(false);
        return;
      }
      try {
        // Assessors can't also join a skill as a learner through this
        // flow—it would overwrite their assessor profile.
        const personaProfile = await getPersonaUser(user.uid);
        if (personaProfile?.role === PERSONA_ROLE_ASSESSOR) {
          if (!cancelled) setIsAssessor(true);
          return;
        }

        const existing = await getSkillProgress(user.uid, skillId);
        if (!cancelled && existing) setHasExisting(true);
      } finally {
        if (!cancelled) setCheckingExisting(false);
      }
    }

    checkExisting();
    return () => {
      cancelled = true;
    };
  }, [user?.uid, skillId, config]);

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;

  const questionOptions = config?.questionOptions;

  function canContinue() {
    if (!current) return false;
    if (current.id === "disciplines") return disciplines.length > 0;
    if (current.id === "reasons") return pillStepValid(reasons, reasonsOther);
    if (current.id === "contexts")
      return pillStepValid(contexts, contextsOther);
    if (current.id === "focus")
      return pillStepValid(focusAreas, focusAreasOther);
    if (current.id === "goals") return pillStepValid(endGoals, endGoalsOther);
    return true;
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function runGeneration() {
    if (!user?.uid) return;
    setBuilding(true);

    const profile = {
      name: user.displayName || "",
      email: user.email || "",
      designDisciplines: disciplines,
      reasonsForJoining: reasons,
      reasonsForJoiningOther: reasonsOther,
      designContexts: contexts,
      designContextsOther: contextsOther,
      focusAreas,
      focusAreasOther,
      endGoals,
      endGoalsOther,
      programDuration,
    };
    console.log({ profile });

    try {
      await Promise.all([
        (async () => {
          await createPersonaDesignUser(user.uid, profile);
          const tasks = await axios.post(
            "http://localhost:4200/provn-api/task",
            {
              userUid: user.uid,
              skillId,
              programDuration,
              designDisciplines: disciplines,
              reasonsForJoining: reasons,
              reasonsForJoiningOther: reasonsOther,
              designContexts: contexts,
              designContextsOther: contextsOther,
              focusAreas,
              focusAreasOther,
              endGoals,
              endGoalsOther,
            },
          );
          // const tasks = generateSkillTasks({
          //   skillId,
          //   disciplines,
          //   focusAreas,
          //   programDuration,
          // });
          // await createSkillProgress(user.uid, skillId, {
          //   track: PERSONA_TRACK_DESIGN,
          //   answers: profile,
          //   tasks,
          // });
        })(),
        new Promise((resolve) => setTimeout(resolve, MIN_BUILD_MS)),
      ]);
      setBuildComplete(true);
    } catch (err) {
      setBuilding(false);
      showErrorToast(err.message || "Something went wrong—please try again.");
    }
  }

  function goNext() {
    if (!canContinue()) {
      showErrorToast("Select at least one option to continue.");
      return;
    }
    if (isLastStep) {
      runGeneration();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  const userName = useMemo(() => user?.displayName || "", [user]);

  if (!config) {
    return <Navigate to='/dashboard' replace />;
  }

  if (!loading && !user) {
    return <Navigate to='/login' replace />;
  }

  if (checkingExisting || loading) {
    return (
      <div className='flex items-center justify-center min-h-screen font-sans persona-app text-persona-muted'>
        <p>Loading…</p>
      </div>
    );
  }

  if (isAssessor) {
    return <Navigate to='/assessor' replace />;
  }

  if (hasExisting) {
    return <Navigate to={`/skills/${skillId}`} replace />;
  }

  if (building) {
    const firstName = userName?.split(" ")[0] || "there";
    return (
      <ProvnBuilderScreen
        headline={`Building your ${config.skillName} tasks`}
        subtitle="Every day is a new rep. We're crafting exercises from what you told us."
        celebrateHeadline={`You're set, ${firstName}!`}
        celebrateSubtitle='Your daily tasks are ready. Pick an assessor and start today.'
        quests={TASK_QUESTS}
        complete={buildComplete}
        onFinished={() => navigate(`/skills/${skillId}`, { replace: true })}
      />
    );
  }

  return (
    <PersonaAuthLayout title={current.title} subtitle={current.subtitle}>
      {!isFirebaseConfigured ? (
        <p className='px-4 py-3 text-sm rounded-2xl bg-amber-50 text-amber-900'>
          Firebase is not configured. Add your Firebase keys to{" "}
          <code>.env</code> and restart the dev server.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goNext();
          }}
        >
          <StepProgress current={step} total={STEPS.length} />

          <div key={current.id} className='space-y-5 step-in'>
            {current.id === "disciplines" && (
              <PillGroup
                options={questionOptions.disciplines}
                values={disciplines}
                onToggle={(id) =>
                  setDisciplines((prev) => toggleInList(prev, id))
                }
              />
            )}

            {current.id === "reasons" && (
              <div>
                <PillGroup
                  options={questionOptions.reasons}
                  values={reasons}
                  onToggle={(id) =>
                    setReasons((prev) => toggleInList(prev, id))
                  }
                />
                <OtherField
                  show={reasons.includes("other")}
                  label='Tell us your reason'
                  value={reasonsOther}
                  onChange={setReasonsOther}
                />
              </div>
            )}

            {current.id === "contexts" && (
              <div>
                <PillGroup
                  options={questionOptions.contexts}
                  values={contexts}
                  onToggle={(id) =>
                    setContexts((prev) => toggleInList(prev, id))
                  }
                />
                <OtherField
                  show={contexts.includes("other")}
                  label='Which setting?'
                  value={contextsOther}
                  onChange={setContextsOther}
                />
              </div>
            )}

            {current.id === "focus" && (
              <div>
                <PillGroup
                  options={questionOptions.focus}
                  values={focusAreas}
                  onToggle={(id) =>
                    setFocusAreas((prev) => toggleInList(prev, id))
                  }
                />
                <OtherField
                  show={focusAreas.includes("other")}
                  label='What specifically?'
                  value={focusAreasOther}
                  onChange={setFocusAreasOther}
                />
              </div>
            )}

            {current.id === "goals" && (
              <div className='space-y-6'>
                <div>
                  <FieldLabel required>What are your end goals?</FieldLabel>
                  <p className='mt-1 mb-3 text-xs text-persona-muted'>
                    Select all that apply.
                  </p>
                  <PillGroup
                    options={questionOptions.goals}
                    values={endGoals}
                    onToggle={(id) =>
                      setEndGoals((prev) => toggleInList(prev, id))
                    }
                  />
                  <OtherField
                    show={endGoals.includes("other")}
                    label='Describe your goal'
                    value={endGoalsOther}
                    onChange={setEndGoalsOther}
                  />
                </div>

                <div className='pt-6 border-t border-persona-lavender-deep/40'>
                  <FieldLabel required>
                    How many days should your task list cover?
                  </FieldLabel>
                  <p className='mt-1 text-xs text-persona-muted'>
                    One task per calendar day, between {MIN_PROGRAM_DAYS} and{" "}
                    {MAX_PROGRAM_DAYS} days.
                  </p>
                  <div className='px-4 py-5 mt-4 rounded-2xl bg-persona-lavender/60'>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-4xl font-medium font-display text-persona-purple'>
                        {programDuration}
                      </span>
                      <span className='text-sm font-semibold text-persona-purple-dark'>
                        days
                      </span>
                    </div>
                    <input
                      type='range'
                      min={MIN_PROGRAM_DAYS}
                      max={MAX_PROGRAM_DAYS}
                      value={programDuration}
                      onChange={(e) =>
                        setProgramDuration(Number(e.target.value))
                      }
                      className='w-full mt-4 accent-persona-purple'
                      aria-valuemin={MIN_PROGRAM_DAYS}
                      aria-valuemax={MAX_PROGRAM_DAYS}
                      aria-valuenow={programDuration}
                    />
                    <div className='flex justify-between mt-2 text-xs font-semibold text-persona-muted'>
                      <span>{MIN_PROGRAM_DAYS} days</span>
                      <span>{MAX_PROGRAM_DAYS} days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className='flex items-center gap-3 mt-8'>
            {step > 0 && (
              <button
                type='button'
                onClick={goBack}
                className='px-6 py-4 text-base font-bold transition bg-white border-2 rounded-2xl border-persona-lavender-deep text-persona-purple-dark hover:border-persona-purple hover:bg-persona-lavender/50'
              >
                Back
              </button>
            )}
            <button
              type='submit'
              className='flex flex-1 items-center justify-center gap-3 rounded-2xl bg-persona-purple py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(14,174,110,0.35)] transition hover:bg-persona-purple-hover disabled:opacity-50'
            >
              {isLastStep ? "Generate my tasks" : "Continue"}
              <span className='flex items-center justify-center w-8 h-8 rounded-full bg-white/20'>
                →
              </span>
            </button>
          </div>
        </form>
      )}
    </PersonaAuthLayout>
  );
}
