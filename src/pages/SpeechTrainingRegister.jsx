import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import SpeaklyAuthLayout from "../components/speakly/SpeaklyAuthLayout";
import SpeaklyAuthRedirect from "../components/speakly/SpeaklyAuthRedirect";
import SpeaklyProgrammeBuilder from "../components/speakly/SpeaklyProgrammeBuilder";
import {
  SPEAKLY_ASSESSOR_BACKGROUND,
  SPEAKLY_ASSESSOR_FOCUS,
  SPEAKLY_ASSESSOR_QUALIFICATIONS,
  SPEAKLY_END_GOALS,
  SPEAKLY_FOCUS_AREAS,
  SPEAKLY_REASONS,
  SPEAKLY_SPEAKING_CONTEXTS,
  SPEAKLY_ROLE_ASSESSOR,
  SPEAKLY_ROLE_LEARNER,
  SPEAKLY_ROLES,
} from "../config/speaklyRegistration";
import { useAuth } from "../contexts/AuthContext";
import { auth, registerWithPassword, validatePassword } from "../firebase/auth";
import { isFirebaseConfigured } from "../firebase/config";
import {
  DEFAULT_PROGRAM_DAYS,
  MAX_PROGRAM_DAYS,
  MIN_PROGRAM_DAYS,
} from "../lib/speechTrainingProgram";
import { waitForSpeaklyProgramme } from "../lib/speaklyProgrammes";
import {
  createSpeaklyUser,
  validateRegistrationProfile,
} from "../lib/speaklyUsers";

const inputClassName =
  "mt-1.5 w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-base text-speakly-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-speakly-coral-ring/80 transition focus:ring-2 focus:ring-speakly-coral";

const textareaClassName =
  "mt-1.5 w-full resize-y rounded-2xl border-0 bg-white px-4 py-3.5 text-base text-speakly-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-speakly-coral-ring/80 transition focus:ring-2 focus:ring-speakly-coral";

const ROLE_STEP = {
  id: "role",
  title: "How do you want to use Speakly?",
  subtitle:
    "Pick the role that fits you—you can always sign up separately later for the other.",
};

const LEARNER_STEPS = [
  {
    id: "reasons",
    title: "What's bringing you to Speakly?",
    subtitle:
      "Pick anything that resonates—no need to overthink it. Choose as many as you like.",
  },
  {
    id: "contexts",
    title: "Where do you want to speak better?",
    subtitle:
      "Choose the settings that matter most to you—work, social, presentations, and more.",
  },
  {
    id: "focus",
    title: "What would you like to work on?",
    subtitle: "These shape the exercises we focus on. Select all that apply.",
  },
  {
    id: "goals",
    title: "Where do you want to end up?",
    subtitle: "Tell us your goals and how long you want to train.",
  },
  {
    id: "account",
    title: "Create your account",
    subtitle: "Last step—your details to save your personalised programme.",
  },
];

const ASSESSOR_STEPS = [
  {
    id: "qualifications",
    title: "What are your qualifications?",
    subtitle:
      "Select everything that applies—credentials, experience, or how you help people speak.",
  },
  {
    id: "assessor-focus",
    title: "What are you comfortable reviewing?",
    subtitle:
      "Pick the kinds of practice you feel confident giving feedback on.",
  },
  {
    id: "assessor-about",
    title: "A little about you",
    subtitle:
      "Optional details help learners know who reviewed them—keep it casual.",
  },
  {
    id: "account",
    title: "Create your assessor account",
    subtitle: "Almost done—set your login details.",
  },
];

function FieldLabel({ children, required }) {
  return (
    <span className='text-sm font-bold text-taskly-ink'>
      {children}
      {required && <span className='text-red-500'> *</span>}
    </span>
  );
}

function toggleInList(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

function Pill({ option, selected, onToggle, delay }) {
  const [popping, setPopping] = useState(false);

  function handleClick() {
    if (!selected) setPopping(true);
    onToggle(option.id);
  }

  return (
    <span
      className='inline-flex pill-in-wrap'
      style={{ animationDelay: `${delay}s` }}
    >
      <button
        type='button'
        aria-pressed={selected}
        onClick={handleClick}
        onAnimationEnd={() => setPopping(false)}
        className={`pill ${selected ? "pill-selected" : "pill-idle"} ${
          popping && selected ? "pill-pop" : ""
        }`}
      >
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition ${
            selected
              ? "border-white bg-white/20 text-white"
              : "border-speakly-coral-ring text-transparent"
          }`}
          aria-hidden
        >
          ✓
        </span>
        {option.label}
      </button>
    </span>
  );
}

function PillGroup({ options, values, onToggle }) {
  return (
    <div className='flex flex-wrap gap-2.5'>
      {options.map((option, index) => (
        <Pill
          key={option.id}
          option={option}
          selected={values.includes(option.id)}
          onToggle={onToggle}
          delay={index * 0.03}
        />
      ))}
    </div>
  );
}

function RoleCard({ option, selected, onSelect, delay }) {
  return (
    <button
      type='button'
      aria-pressed={selected}
      onClick={() => onSelect(option.id)}
      className={`role-card step-in w-full rounded-3xl border-2 p-6 text-left transition duration-300 ${
        selected
          ? "border-speakly-coral bg-gradient-to-br from-speakly-coral to-speakly-coral-dark text-white shadow-[0_12px_32px_rgba(217,93,57,0.35)]"
          : "border-speakly-coral-ring bg-white hover:border-speakly-coral/60 hover:shadow-soft"
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${
          selected ? "bg-white/20" : "bg-speakly-coral-light"
        }`}
      >
        {option.icon}
      </span>
      <p
        className={`mt-4 text-xl font-extrabold ${selected ? "text-white" : "text-speakly-ink"}`}
      >
        {option.label}
      </p>
      <p
        className={`mt-2 text-sm leading-relaxed ${selected ? "text-white/90" : "text-taskly-muted"}`}
      >
        {option.description}
      </p>
      <span
        className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${
          selected ? "text-white" : "text-speakly-coral"
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
          "Choose this role"
        )}
      </span>
    </button>
  );
}

function OtherField({ show, label, value, onChange }) {
  if (!show) return null;
  return (
    <label className='block mt-4 step-in'>
      <FieldLabel required>{label}</FieldLabel>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Tell us in a few words…'
        className={inputClassName}
        autoFocus
      />
    </label>
  );
}

function StepProgress({ current, total }) {
  return (
    <div className='mb-8'>
      <div className='flex items-center justify-between text-xs font-semibold text-taskly-muted'>
        <span>
          Step {current + 1} of {total}
        </span>
        <span>{Math.round(((current + 1) / total) * 100)}%</span>
      </div>
      <div className='mt-2 flex gap-1.5'>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= current ? "bg-speakly-coral" : "bg-speakly-coral-ring/60"
            }`}
          />
        ))}
      </div>
    </div>
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
            className='absolute text-xs font-semibold -translate-y-1/2 right-4 top-1/2 text-taskly-muted hover:text-taskly-ink'
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

export default function SpeechTrainingRegister() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(null);

  const [reasonsForJoining, setReasonsForJoining] = useState([]);
  const [reasonsForJoiningOther, setReasonsForJoiningOther] = useState("");
  const [speakingContexts, setSpeakingContexts] = useState([]);
  const [speakingContextsOther, setSpeakingContextsOther] = useState("");
  const [focusAreas, setFocusAreas] = useState([]);
  const [focusAreasOther, setFocusAreasOther] = useState("");
  const [endGoals, setEndGoals] = useState([]);
  const [endGoalsOther, setEndGoalsOther] = useState("");
  const [programDuration, setProgramDuration] = useState(DEFAULT_PROGRAM_DAYS);

  const [qualifications, setQualifications] = useState([]);
  const [qualificationsOther, setQualificationsOther] = useState("");
  const [assessorFocus, setAssessorFocus] = useState([]);
  const [assessorFocusOther, setAssessorFocusOther] = useState("");
  const [assessorBackground, setAssessorBackground] = useState([]);
  const [assessorBio, setAssessorBio] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [provisioning, setProvisioning] = useState(null);

  const steps = useMemo(() => {
    if (role === SPEAKLY_ROLE_ASSESSOR) {
      return [ROLE_STEP, ...ASSESSOR_STEPS];
    }
    if (role === SPEAKLY_ROLE_LEARNER) {
      return [ROLE_STEP, ...LEARNER_STEPS];
    }
    return [ROLE_STEP];
  }, [role]);

  const profile = useMemo(() => {
    const base = { name, email, role };
    if (role === SPEAKLY_ROLE_ASSESSOR) {
      return {
        ...base,
        qualifications,
        qualificationsOther,
        assessorFocus,
        assessorFocusOther,
        assessorBackground,
        assessorBio,
      };
    }
    return {
      ...base,
      role: SPEAKLY_ROLE_LEARNER,
      reasonsForJoining,
      reasonsForJoiningOther,
      speakingContexts,
      speakingContextsOther,
      focusAreas,
      focusAreasOther,
      endGoals,
      endGoalsOther,
      programDuration,
    };
  }, [
    name,
    email,
    role,
    reasonsForJoining,
    reasonsForJoiningOther,
    speakingContexts,
    speakingContextsOther,
    focusAreas,
    focusAreasOther,
    endGoals,
    endGoalsOther,
    programDuration,
    qualifications,
    qualificationsOther,
    assessorFocus,
    assessorFocusOther,
    assessorBackground,
    assessorBio,
  ]);

  if (!loading && user && !provisioning) {
    return <SpeaklyAuthRedirect />;
  }

  if (provisioning) {
    const destination =
      role === SPEAKLY_ROLE_ASSESSOR ? "/speakly/assessor" : "/speakly";

    return (
      <SpeaklyProgrammeBuilder
        userName={name}
        programDuration={programDuration}
        role={role || SPEAKLY_ROLE_LEARNER}
        complete={provisioning.complete === true}
        error={provisioning.error}
        manualContinue
        onFinished={() => {
          navigate(destination, {
            replace: true,
            state: { fromRegistration: true },
          });
        }}
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
      return role === SPEAKLY_ROLE_LEARNER || role === SPEAKLY_ROLE_ASSESSOR;
    if (current.id === "reasons")
      return pillStepValid(reasonsForJoining, reasonsForJoiningOther);
    if (current.id === "contexts")
      return pillStepValid(speakingContexts, speakingContextsOther);
    if (current.id === "focus")
      return pillStepValid(focusAreas, focusAreasOther);
    if (current.id === "goals") return pillStepValid(endGoals, endGoalsOther);
    if (current.id === "qualifications") {
      return pillStepValid(qualifications, qualificationsOther);
    }
    if (current.id === "assessor-focus") {
      return pillStepValid(assessorFocus, assessorFocusOther);
    }
    if (current.id === "assessor-about") {
      return assessorBackground.length > 0;
    }
    return true;
  }

  function selectRole(nextRole) {
    if (nextRole !== role) {
      setStep(0);
    }
    setRole(nextRole);
    setError(null);
  }

  function goNext() {
    setError(null);
    if (!canContinue()) {
      if (current.id === "role") {
        setError("Choose learner or assessor to continue.");
      } else if (current.id === "assessor-about") {
        setError("Select at least one background option.");
      } else {
        setError("Select at least one option to continue.");
      }
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isLastStep) {
      goNext();
      return;
    }

    setSubmitting(true);
    setError(null);
    setProvisioning({ complete: false });

    try {
      validatePassword(password, { confirm: confirmPassword });
      validateRegistrationProfile(profile);

      const authUser = await registerWithPassword(email, password, {
        displayName: name,
      });

      try {
        await createSpeaklyUser(authUser.uid, {
          ...profile,
          email: authUser.email || email,
        });

        if (role === SPEAKLY_ROLE_LEARNER) {
          await waitForSpeaklyProgramme(authUser.uid, {
            intervalMs: 600,
            maxAttempts: 25,
          });
        }

        setProvisioning({ complete: true });
      } catch (profileError) {
        if (auth) {
          await signOut(auth);
        }
        setProvisioning(null);
        throw profileError;
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setProvisioning(null);
    } finally {
      setSubmitting(false);
    }
  }

  const continueLabel =
    current.id === "role" && !role
      ? "Select a role"
      : isLastStep
        ? submitting
          ? "Creating account…"
          : "Create account now"
        : "Continue";

  return (
    <SpeaklyAuthLayout
      title={current.title}
      subtitle={current.subtitle}
      footer={
        <>
          Have an account?{" "}
          <Link
            to='/speakly/login'
            className='font-bold text-taskly-ink underline-offset-2 hover:underline'
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
            key={`${role ?? "none"}-${current.id}`}
            className='space-y-5 step-in'
          >
            {current.id === "role" && (
              <div className='grid gap-4 sm:grid-cols-2'>
                {SPEAKLY_ROLES.map((option, index) => (
                  <RoleCard
                    key={option.id}
                    option={option}
                    selected={role === option.id}
                    onSelect={selectRole}
                    delay={index * 0.08}
                  />
                ))}
              </div>
            )}

            {current.id === "reasons" && (
              <div>
                <PillGroup
                  options={SPEAKLY_REASONS}
                  values={reasonsForJoining}
                  onToggle={(id) =>
                    setReasonsForJoining((prev) => toggleInList(prev, id))
                  }
                />
                <OtherField
                  show={reasonsForJoining.includes("other")}
                  label='Tell us your reason'
                  value={reasonsForJoiningOther}
                  onChange={setReasonsForJoiningOther}
                />
              </div>
            )}

            {current.id === "contexts" && (
              <div>
                <PillGroup
                  options={SPEAKLY_SPEAKING_CONTEXTS}
                  values={speakingContexts}
                  onToggle={(id) =>
                    setSpeakingContexts((prev) => toggleInList(prev, id))
                  }
                />
                <OtherField
                  show={speakingContexts.includes("other")}
                  label='Which setting?'
                  value={speakingContextsOther}
                  onChange={setSpeakingContextsOther}
                />
              </div>
            )}

            {current.id === "focus" && (
              <div>
                <PillGroup
                  options={SPEAKLY_FOCUS_AREAS}
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
                  <p className='mt-1 mb-3 text-xs text-taskly-muted'>
                    Select all that apply.
                  </p>
                  <PillGroup
                    options={SPEAKLY_END_GOALS}
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

                <div className='pt-6 border-t border-speakly-coral-ring/40'>
                  <FieldLabel required>How long is your programme?</FieldLabel>
                  <p className='mt-1 text-xs text-taskly-muted'>
                    One exercise per calendar day, between {MIN_PROGRAM_DAYS}{" "}
                    and {MAX_PROGRAM_DAYS} days.
                  </p>
                  <div className='px-4 py-5 mt-4 rounded-2xl bg-speakly-coral-muted/50'>
                    <div className='flex items-center justify-between gap-4'>
                      <span className='text-4xl font-medium font-display text-speakly-coral'>
                        {programDuration}
                      </span>
                      <span className='text-sm font-semibold text-speakly-coral-dark'>
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
                      className='w-full mt-4 accent-speakly-coral'
                      aria-valuemin={MIN_PROGRAM_DAYS}
                      aria-valuemax={MAX_PROGRAM_DAYS}
                      aria-valuenow={programDuration}
                    />
                    <div className='flex justify-between mt-2 text-xs font-semibold text-taskly-muted'>
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
                  options={SPEAKLY_ASSESSOR_QUALIFICATIONS}
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
                  options={SPEAKLY_ASSESSOR_FOCUS}
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
                  <p className='mt-1 mb-3 text-xs text-taskly-muted'>
                    Select all that fit.
                  </p>
                  <PillGroup
                    options={SPEAKLY_ASSESSOR_BACKGROUND}
                    values={assessorBackground}
                    onToggle={(id) =>
                      setAssessorBackground((prev) => toggleInList(prev, id))
                    }
                  />
                </div>

                <div className='pt-6 border-t border-speakly-coral-ring/40'>
                  <FieldLabel>Anything else we should know?</FieldLabel>
                  <p className='mt-1 text-xs text-taskly-muted'>
                    e.g. languages you assess in, industries you work with, or
                    your review style.
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

          {error && (
            <p
              className='px-4 py-3 mt-5 text-sm text-red-700 rounded-2xl bg-red-50'
              role='alert'
            >
              {error}
            </p>
          )}

          <div className='flex items-center gap-3 mt-8'>
            {step > 0 && (
              <button
                type='button'
                onClick={goBack}
                className='px-6 py-4 text-base font-bold transition bg-white border-2 rounded-2xl border-speakly-coral-ring text-speakly-coral-dark hover:border-speakly-coral hover:bg-speakly-coral-light'
              >
                Back
              </button>
            )}
            <button
              type='submit'
              disabled={submitting || (current.id === "role" && !role)}
              className='flex flex-1 items-center justify-center gap-3 rounded-2xl bg-speakly-coral py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(217,93,57,0.35)] transition hover:bg-speakly-coral-hover disabled:opacity-50'
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
    </SpeaklyAuthLayout>
  );
}
