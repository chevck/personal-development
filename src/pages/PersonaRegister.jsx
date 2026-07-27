import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { signOut } from "firebase/auth";
import PersonaAuthLayout from "../components/persona/PersonaAuthLayout";
import PersonaAuthRedirect from "../components/persona/PersonaAuthRedirect";
import {
  FieldLabel,
  inputClassName,
  OtherField,
  PillGroup,
  StepProgress,
  toggleInList,
} from "../components/persona/QuestionSteps";
import ProvnBuilderScreen from "../components/persona/ProvnBuilderScreen";
import {
  getSkillTrack,
  PERSONA_ASSESSOR_TRACKS,
  PERSONA_EXPERIENCE_LEVELS,
  PERSONA_ROLE_ASSESSOR,
  PERSONA_ROLE_LEARNER,
  PERSONA_ROLES,
  PERSONA_TRACKS,
} from "../config/personaRegistration";
import { SPEAKLY_ASSESSOR_BACKGROUND } from "../config/speaklyRegistration";
import { ASSESSOR_QUESTS, LEARNER_QUESTS } from "../config/provnBuilderContent";
import { useAuth } from "../contexts/AuthContext";
import { auth, registerWithPassword, validatePassword } from "../firebase/auth";
import { isFirebaseConfigured } from "../firebase/config";
import {
  DEFAULT_PROGRAM_DAYS,
  MAX_PROGRAM_DAYS,
  MIN_PROGRAM_DAYS,
} from "../lib/speechTrainingProgram";
import { uploadAssessorPhoto, validateAssessorPhoto } from "../lib/personaAssessorMedia";
import { showErrorToast } from "../lib/toast";
import { createPersonaUser } from "../lib/speaklyUsers";
import {
  createPersonaAssessor,
  validateNameAndEmail,
} from "../lib/personaUsers";

const textareaClassName = `${inputClassName} resize-y`;

const ROLE_STEP = {
  id: "role",
  title: "How do you want to use Provn?",
  subtitle:
    "Join as a student to train a skill, or as an assessor to review learners' work and give feedback.",
};

const TRACK_STEP = {
  id: "track",
  title: "What would you like to train?",
  subtitle:
    "Pick your focus—your answers shape the daily programme we build for you.",
};

const ASSESSOR_TRACK_STEP = {
  id: "track",
  title: "What would you like to assess?",
  subtitle: "Pick the area where you can give learners expert feedback.",
};

const LEVEL_STEP = {
  id: "level",
  title: "What's your current level?",
  subtitle:
    "Be honest—this helps us pitch your daily programme at the right difficulty.",
};

/** Shared across every track—only the question banks differ. */
const ASSESSOR_STEPS = [
  {
    id: "qualifications",
    title: "What are your qualifications?",
    subtitle:
      "Select everything that applies—credentials, experience, or how you help people grow.",
  },
  {
    id: "assessor-focus",
    title: "What are you comfortable reviewing?",
    subtitle: "Pick the kinds of work you feel confident giving feedback on.",
  },
  {
    id: "assessor-about",
    title: "A little about you",
    subtitle:
      "Optional details help learners know who reviewed them—keep it casual.",
  },
  {
    id: "assessor-photo",
    title: "Add a profile photo",
    subtitle:
      "Learners see this when picking an assessor. PNG or JPG, up to 5MB—or skip for now and add it later.",
  },
];

const ACCOUNT_STEP = {
  id: "account",
  title: "Create your Provn account",
  subtitle: "Last step—your details to save your personalised programme.",
};

function TrackCard({
  option,
  selected,
  onSelect,
  delay,
  chooseLabel = "Choose this track",
}) {
  return (
    <button
      type='button'
      aria-pressed={selected}
      onClick={() => onSelect(option.id)}
      className={`role-card step-in w-full rounded-3xl border-2 p-6 text-left transition duration-300 ${
        selected
          ? "border-persona-purple bg-gradient-to-br from-persona-purple to-persona-purple-dark text-white shadow-[0_12px_32px_rgba(14,174,110,0.35)]"
          : "border-persona-lavender-deep bg-white hover:border-persona-purple/60 hover:shadow-soft"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
          selected ? "bg-white/20" : "bg-persona-lavender"
        }`}
      >
        {option.icon}
      </span>
      <p
        className={`mt-4 text-xl font-extrabold ${selected ? "text-white" : "text-persona-ink"}`}
      >
        {option.label}
      </p>
      <p
        className={`mt-2 text-sm leading-relaxed ${selected ? "text-white/90" : "text-persona-muted"}`}
      >
        {option.description}
      </p>
      <span
        className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${
          selected ? "text-white" : "text-persona-purple"
        }`}
      >
        {selected ? (
          <>
            <span className='flex items-center justify-center w-5 h-5 rounded-full bg-white/25'>
              ✓
            </span>
            Selected
          </>
        ) : (
          chooseLabel
        )}
      </span>
    </button>
  );
}

/**
 * Skill picker row—deliberately different from the role step's TrackCard
 * grid so the two choice screens don't look identical.
 */
function SkillOptionRow({ option, selected, onSelect, delay }) {
  return (
    <button
      type='button'
      aria-pressed={selected}
      onClick={() => onSelect(option.id)}
      className={`step-in flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition duration-300 sm:gap-5 sm:p-5 ${
        selected
          ? "border-persona-purple bg-persona-lavender/70 shadow-[0_8px_24px_rgba(14,174,110,0.18)]"
          : "border-persona-lavender-deep bg-white hover:border-persona-purple/60 hover:shadow-soft"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
          selected ? "bg-white" : "bg-persona-lavender"
        }`}
      >
        {option.icon}
      </span>
      <span className='flex-1'>
        <span className='block text-base font-extrabold text-persona-ink'>
          {option.label}
        </span>
        <span className='block mt-1 text-sm leading-relaxed text-persona-muted'>
          {option.description}
        </span>
      </span>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs transition ${
          selected
            ? "border-persona-purple bg-persona-purple text-white"
            : "border-persona-lavender-deep text-transparent"
        }`}
        aria-hidden
      >
        ✓
      </span>
    </button>
  );
}

function AccountFields({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
}) {
  return (
    <div className='space-y-5'>
      <label className='block'>
        <FieldLabel required>Full name</FieldLabel>
        <input
          type='text'
          name='name'
          autoComplete='name'
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Your name'
          className={inputClassName}
        />
      </label>

      <label className='block'>
        <FieldLabel required>Email</FieldLabel>
        <input
          type='email'
          name='email'
          autoComplete='email'
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='you@example.com'
          className={inputClassName}
        />
      </label>

      <label className='block'>
        <FieldLabel required>Password</FieldLabel>
        <div className='relative'>
          <input
            type={showPassword ? "text" : "password"}
            name='password'
            autoComplete='new-password'
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='At least 6 characters'
            className={inputClassName}
          />
          <button
            type='button'
            onClick={() => setShowPassword((v) => !v)}
            className='absolute text-xs font-semibold -translate-y-1/2 right-4 top-1/2 text-persona-muted hover:text-persona-ink'
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      <label className='block'>
        <FieldLabel required>Confirm password</FieldLabel>
        <input
          type='password'
          name='confirmPassword'
          autoComplete='new-password'
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Repeat your password'
          className={inputClassName}
        />
      </label>
    </div>
  );
}

export default function PersonaRegister() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialTrack = useMemo(() => {
    const param = searchParams.get("track");
    return getSkillTrack(param) ? param : null;
  }, [searchParams]);

  // ?role=assessor preselects the assessor path; a bare ?track= link is a
  // training CTA, so it implies the learner role.
  const initialRole = useMemo(() => {
    const param = searchParams.get("role");
    if (param === PERSONA_ROLE_ASSESSOR || param === PERSONA_ROLE_LEARNER) {
      return param;
    }
    return initialTrack ? PERSONA_ROLE_LEARNER : null;
  }, [searchParams, initialTrack]);

  const [role, setRole] = useState(initialRole);
  const [track, setTrack] = useState(initialTrack);
  const [step, setStep] = useState(initialRole ? 1 : 0);

  const [level, setLevel] = useState(null);
  const [discipline, setDiscipline] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [reasonsOther, setReasonsOther] = useState("");
  const [contexts, setContexts] = useState([]);
  const [contextsOther, setContextsOther] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [focusAreasOther, setFocusAreasOther] = useState("");
  const [endGoals, setEndGoals] = useState([]);
  const [endGoalsOther, setEndGoalsOther] = useState("");
  const [programDuration, setProgramDuration] = useState(DEFAULT_PROGRAM_DAYS);

  const [qualifications, setQualifications] = useState([]);
  const [qualificationsOther, setQualificationsOther] = useState("");
  const [assessorFocus, setAssessorFocus] = useState([]);
  const [assessorFocusOther, setAssessorFocusOther] = useState("");
  const [assessorBackground, setAssessorBackground] = useState(null);
  const [assessorBio, setAssessorBio] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [provisioning, setProvisioning] = useState(null);

  const activeTrack = useMemo(() => getSkillTrack(track), [track]);

  const steps = useMemo(() => {
    if (!role) return [ROLE_STEP];
    const trackStep =
      role === PERSONA_ROLE_ASSESSOR ? ASSESSOR_TRACK_STEP : TRACK_STEP;
    if (!activeTrack) return [ROLE_STEP, trackStep];
    if (role === PERSONA_ROLE_ASSESSOR) {
      return [ROLE_STEP, trackStep, ...ASSESSOR_STEPS, ACCOUNT_STEP];
    }
    return [
      ROLE_STEP,
      trackStep,
      LEVEL_STEP,
      ...activeTrack.learnerSteps,
      ACCOUNT_STEP,
    ];
  }, [role, activeTrack]);

  const questionOptions = activeTrack?.learnerQuestions ?? {};
  const assessorOptions = activeTrack?.assessorQuestions ?? {};

  // `submitting` keeps the freshly signed-in user on the form while their
  // profile is still being written; without it the redirect wins the race.
  if (!loading && user && !provisioning && !submitting) {
    return <PersonaAuthRedirect />;
  }

  if (provisioning) {
    const isAssessor = role === PERSONA_ROLE_ASSESSOR;
    const firstName = name?.split(" ")[0] || "there";
    const trackLabel =
      activeTrack?.label?.replace(/^Train my /i, "") || "skill";
    return (
      <ProvnBuilderScreen
        headline={
          isAssessor
            ? "Setting up your assessor hub"
            : `Building your ${trackLabel} programme`
        }
        subtitle={
          isAssessor
            ? "We are wiring up your review tools—almost ready to welcome learners."
            : "Every day is a new rep. We are crafting exercises from what you told us."
        }
        celebrateHeadline={`You're in, ${firstName}!`}
        celebrateSubtitle={
          isAssessor
            ? "Your assessor dashboard is ready. Let's go."
            : "Your personalised programme is locked and loaded."
        }
        quests={isAssessor ? ASSESSOR_QUESTS : LEARNER_QUESTS}
        footerNote={
          !isAssessor && programDuration
            ? `${programDuration} days · ${Math.ceil(programDuration / 7)} weeks · infinite reps`
            : null
        }
        complete={provisioning.complete === true}
        error={provisioning.error}
        manualContinue
        continueLabel={isAssessor ? "Verify my identity" : "View my tasks"}
        onFinished={() =>
          navigate(isAssessor ? "/assessor/verify" : "/dashboard", {
            replace: true,
          })
        }
      />
    );
  }

  const isLastStep = step === steps.length - 1;
  const current = steps[step] ?? ROLE_STEP;

  function pillStepValid(values, otherValue) {
    if (values.length === 0) return false;
    if (values.includes("other") && !otherValue.trim()) return false;
    return true;
  }

  function canContinue() {
    if (current.id === "role")
      return role === PERSONA_ROLE_LEARNER || role === PERSONA_ROLE_ASSESSOR;
    if (current.id === "track") return Boolean(activeTrack);
    if (current.id === "level") return Boolean(level);
    if (current.id === "disciplines") return Boolean(discipline);
    if (current.id === "reasons") return pillStepValid(reasons, reasonsOther);
    if (current.id === "contexts")
      return pillStepValid(contexts, contextsOther);
    if (current.id === "focus")
      return pillStepValid(focusAreas, focusAreasOther);
    if (current.id === "goals") return pillStepValid(endGoals, endGoalsOther);
    if (current.id === "qualifications")
      return pillStepValid(qualifications, qualificationsOther);
    if (current.id === "assessor-focus")
      return pillStepValid(assessorFocus, assessorFocusOther);
    if (current.id === "assessor-about") return Boolean(assessorBackground);
    // Photo is optional at sign-up—skippable, filled in later during KYC.
    return true;
  }

  // Question banks differ per role and track, so answers don't carry across.
  function resetAnswers() {
    setLevel(null);
    setDiscipline(null);
    setReasons([]);
    setReasonsOther("");
    setContexts([]);
    setContextsOther("");
    setFocusAreas([]);
    setFocusAreasOther("");
    setEndGoals([]);
    setEndGoalsOther("");
    setQualifications([]);
    setQualificationsOther("");
    setAssessorFocus([]);
    setAssessorFocusOther("");
    setAssessorBackground(null);
    setAssessorBio("");
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
  }

  function selectRole(nextRole) {
    if (nextRole !== role) {
      setTrack(null);
      resetAnswers();
      setStep(0);
    }
    setRole(nextRole);
  }

  function selectTrack(nextTrack) {
    if (nextTrack !== track) {
      resetAnswers();
      setStep(1);
    }
    setTrack(nextTrack);
  }

  function goNext() {
    if (!canContinue()) {
      if (current.id === "role") {
        showErrorToast("Choose how you want to use Provn to continue.");
      } else if (current.id === "track") {
        showErrorToast(
          role === PERSONA_ROLE_ASSESSOR
            ? "Choose what you'd like to assess to continue."
            : "Choose what you'd like to train to continue.",
        );
      } else if (current.id === "assessor-about") {
        showErrorToast("Select your experience level.");
      } else if (current.id === "disciplines") {
        showErrorToast("Select the skill you'd like to train.");
      } else {
        showErrorToast("Select at least one option to continue.");
      }
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      validateAssessorPhoto(file);
    } catch (err) {
      showErrorToast(err.message);
      return;
    }

    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  }

  async function submitLearnerRegistration() {
    const profile = {
      name,
      email,
      role: PERSONA_ROLE_LEARNER,
      track,
      level,
      discipline,
      reasonsForJoining: reasons,
      reasonsForJoiningOther: reasonsOther,
      contexts,
      contextsOther,
      focusAreas,
      focusAreasOther,
      endGoals,
      endGoalsOther,
      programDuration,
    };

    validatePassword(password, { confirm: confirmPassword });
    validateNameAndEmail(profile);

    setProvisioning({ complete: false });

    try {
      const authUser = await registerWithPassword(email, password, {
        displayName: name,
      });

      try {
        await createPersonaUser(authUser.uid, {
          ...profile,
          email: authUser.email || email,
        });
        setProvisioning({ complete: true });
      } catch (profileError) {
        if (auth) {
          await signOut(auth);
        }
        throw profileError;
      }
    } catch (err) {
      setProvisioning(null);
      throw err;
    }
  }

  async function submitAssessorRegistration() {
    const profile = {
      name,
      email,
      role: PERSONA_ROLE_ASSESSOR,
      track,
      qualifications,
      qualificationsOther,
      assessorFocus,
      assessorFocusOther,
      assessorBackground,
      assessorBio,
    };

    validatePassword(password, { confirm: confirmPassword });
    validateNameAndEmail(profile);

    setProvisioning({ complete: false });

    try {
      const authUser = await registerWithPassword(email, password, {
        displayName: name,
      });

      try {
        // The photo is optional at sign-up, so only upload it if they
        // actually picked one—uploads need the auth uid, so this only
        // happens once the account itself exists (same "roll back on any
        // failure" guarantee as the profile write below). The rest of KYC
        // (ID, mentoring charge) is collected later, after they're signed in.
        const photoUrl = photoFile
          ? await uploadAssessorPhoto(authUser.uid, photoFile)
          : null;

        await createPersonaAssessor(authUser.uid, {
          ...profile,
          email: authUser.email || email,
          photoUrl,
        });
        setProvisioning({ complete: true });
      } catch (profileError) {
        if (auth) {
          await signOut(auth);
        }
        throw profileError;
      }
    } catch (err) {
      setProvisioning(null);
      throw err;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    console.log("valuess", {
      discipline,
      track,
      contexts,
      reasons,
      focusAreas,
      endGoals,
      programDuration,
    });
    if (!isLastStep) {
      goNext();
      return;
    }

    setSubmitting(true);

    try {
      if (role === PERSONA_ROLE_ASSESSOR) {
        await submitAssessorRegistration();
      } else {
        await submitLearnerRegistration();
      }
    } catch (err) {
      showErrorToast(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const continueLabel =
    current.id === "role" && !role
      ? "Select an option"
      : current.id === "track" && !track
        ? "Select a track"
        : isLastStep
          ? submitting
            ? "Creating account…"
            : "Create account now"
          : "Continue";

  return (
    <PersonaAuthLayout
      title={current.title}
      subtitle={current.subtitle}
      footer={
        <>
          Have an account?{" "}
          <Link
            to='/login'
            className='font-bold text-persona-ink underline-offset-2 hover:underline'
          >
            Sign in
          </Link>
        </>
      }
    >
      {!isFirebaseConfigured ? (
        <p className='px-4 py-3 text-sm rounded-2xl bg-amber-50 text-amber-900'>
          Firebase is not configured. Add your Firebase keys to{" "}
          <code>.env</code> and restart the dev server.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <StepProgress current={step} total={steps.length} />

          <div
            key={`${role ?? "none"}-${track ?? "none"}-${current.id}`}
            className='space-y-5 step-in'
          >
            {current.id === "role" && (
              <div className='grid gap-4 sm:grid-cols-2'>
                {PERSONA_ROLES.map((option, index) => (
                  <TrackCard
                    key={option.id}
                    option={option}
                    selected={role === option.id}
                    onSelect={selectRole}
                    delay={index * 0.08}
                    chooseLabel='Choose this role'
                  />
                ))}
              </div>
            )}

            {current.id === "track" && (
              <div className='grid gap-3'>
                {(role === PERSONA_ROLE_ASSESSOR
                  ? PERSONA_ASSESSOR_TRACKS
                  : PERSONA_TRACKS
                ).map((option, index) => (
                  <SkillOptionRow
                    key={option.id}
                    option={option}
                    selected={track === option.id}
                    onSelect={selectTrack}
                    delay={index * 0.08}
                  />
                ))}
              </div>
            )}

            {current.id === "level" && (
              <PillGroup
                options={PERSONA_EXPERIENCE_LEVELS}
                values={level ? [level] : []}
                onToggle={(id) => setLevel(id)}
              />
            )}

            {current.id === "disciplines" && (
              <PillGroup
                options={questionOptions.disciplines}
                values={discipline ? [discipline] : []}
                onToggle={(id) => setDiscipline(id)}
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
                  <FieldLabel required>How long is your programme?</FieldLabel>
                  <p className='mt-1 text-xs text-persona-muted'>
                    One exercise per calendar day, between {MIN_PROGRAM_DAYS}{" "}
                    and {MAX_PROGRAM_DAYS} days.
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

            {current.id === "qualifications" && (
              <div>
                <PillGroup
                  options={assessorOptions.qualifications}
                  values={qualifications}
                  onToggle={(id) =>
                    setQualifications((prev) => toggleInList(prev, id))
                  }
                />
                <OtherField
                  show={qualifications.includes("other")}
                  label='Describe your qualification'
                  value={qualificationsOther}
                  onChange={setQualificationsOther}
                />
              </div>
            )}

            {current.id === "assessor-focus" && (
              <div>
                <PillGroup
                  options={assessorOptions.focus}
                  values={assessorFocus}
                  onToggle={(id) =>
                    setAssessorFocus((prev) => toggleInList(prev, id))
                  }
                />
                <OtherField
                  show={assessorFocus.includes("other")}
                  label='What else do you review?'
                  value={assessorFocusOther}
                  onChange={setAssessorFocusOther}
                />
              </div>
            )}

            {current.id === "assessor-about" && (
              <div className='space-y-6'>
                <div>
                  <FieldLabel required>Your experience level</FieldLabel>
                  <p className='mt-1 mb-3 text-xs text-persona-muted'>
                    Choose the one that fits best.
                  </p>
                  <PillGroup
                    options={SPEAKLY_ASSESSOR_BACKGROUND}
                    values={assessorBackground ? [assessorBackground] : []}
                    onToggle={(id) => setAssessorBackground(id)}
                  />
                </div>

                <div className='pt-6 border-t border-persona-lavender-deep/40'>
                  <FieldLabel>Anything else we should know?</FieldLabel>
                  <p className='mt-1 text-xs text-persona-muted'>
                    e.g. languages you work in, industries you know, or your
                    review style.
                  </p>
                  <textarea
                    rows={4}
                    value={assessorBio}
                    onChange={(e) => setAssessorBio(e.target.value)}
                    placeholder='Optional — a few sentences is plenty.'
                    className={textareaClassName}
                  />
                </div>
              </div>
            )}

            {current.id === "assessor-photo" && (
              <div className='flex flex-col items-center gap-5 text-center'>
                <span className='flex items-center justify-center overflow-hidden text-3xl font-bold rounded-full h-28 w-28 bg-persona-lavender text-persona-purple-dark'>
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt='Your profile preview'
                      className='object-cover w-full h-full'
                    />
                  ) : (
                    "📷"
                  )}
                </span>
                <label className='inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition bg-white border-2 rounded-2xl cursor-pointer border-persona-lavender-deep text-persona-purple-dark hover:border-persona-purple'>
                  {photoFile ? "Choose a different photo" : "Choose a photo"}
                  <input
                    type='file'
                    accept='image/png,image/jpeg'
                    onChange={handlePhotoChange}
                    className='sr-only'
                  />
                </label>
                <p className='text-xs text-persona-muted'>
                  PNG or JPG, up to 5MB—or skip this and continue.
                </p>
              </div>
            )}

            {current.id === "account" && (
              <AccountFields
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
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
              disabled={
                submitting ||
                (current.id === "role" && !role) ||
                (current.id === "track" && !track)
              }
              className='flex flex-1 items-center justify-center gap-3 rounded-2xl bg-persona-purple py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(14,174,110,0.35)] transition hover:bg-persona-purple-hover disabled:opacity-50'
            >
              {isLastStep ? (
                <>
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-black/20'>
                    →
                  </span>
                  {continueLabel}
                </>
              ) : (
                <>
                  {continueLabel}
                  <span className='flex items-center justify-center w-8 h-8 rounded-full bg-white/20'>
                    →
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </PersonaAuthLayout>
  );
}
