import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import AppLogo from "../../components/AppLogo";
import {
  FieldLabel,
  PillGroup,
  inputClassName,
} from "../../components/persona/QuestionSteps";
import {
  MAX_MENTORING_CHARGE,
  PERSONA_CURRENCIES,
  PERSONA_ROLE_ASSESSOR,
} from "../../config/personaRegistration";
import { useAuth } from "../../contexts/AuthContext";
import {
  uploadAssessorIdDocument,
  validateAssessorIdDocument,
} from "../../lib/personaAssessorMedia";
import { getPersonaUser, submitAssessorKyc } from "../../lib/personaUsers";
import { showErrorToast } from "../../lib/toast";

/**
 * Shown once, right after an assessor signs up (and reachable again later
 * from the "unverified" banner)—collects the rest of KYC that sign-up
 * skipped: government ID and mentoring charge. Skippable; skipping just
 * leaves the account unverified until they come back to it.
 */
export default function AssessorVerify() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [personaProfile, setPersonaProfile] = useState(null);
  const [checking, setChecking] = useState(true);
  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const [mentoringCharge, setMentoringCharge] = useState("");
  const [mentoringCurrency, setMentoringCurrency] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.uid) return;
      const profile = await getPersonaUser(user.uid);
      if (!cancelled) {
        setPersonaProfile(profile);
        setChecking(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  if (!authLoading && !user) {
    return <Navigate to='/login' replace />;
  }

  if (checking || !personaProfile) {
    return (
      <div className='flex items-center justify-center min-h-screen font-sans persona-app text-persona-muted'>
        <p>Loading…</p>
      </div>
    );
  }

  if (personaProfile.role !== PERSONA_ROLE_ASSESSOR) {
    return <Navigate to='/dashboard' replace />;
  }

  // Already submitted (or approved)—nothing left to do here.
  if (personaProfile.kycStatus !== "unverified") {
    return <Navigate to='/assessor' replace />;
  }

  function handleIdDocumentChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      validateAssessorIdDocument(file);
    } catch (err) {
      showErrorToast(err.message);
      return;
    }

    setIdDocumentFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!idDocumentFile || !mentoringCurrency || !mentoringCharge) {
      showErrorToast(
        "Upload your ID, set your mentoring charge, and pick a currency to continue.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const idDocumentUrl = await uploadAssessorIdDocument(
        user.uid,
        idDocumentFile,
      );
      await submitAssessorKyc(user.uid, {
        idDocumentUrl,
        mentoringCharge,
        mentoringCurrency,
      });
      navigate("/assessor", { replace: true });
    } catch (err) {
      showErrorToast(err.message || "Couldn't submit your KYC—try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='min-h-screen font-sans persona-app bg-gradient-to-b from-persona-lavender/40 via-white to-persona-cream text-persona-ink'>
      <header className='px-6 py-4 border-b border-persona-border bg-white/70 backdrop-blur'>
        <div className='max-w-2xl mx-auto'>
          <AppLogo variant='logo' size='sm' />
        </div>
      </header>

      <main className='max-w-2xl px-6 py-12 mx-auto'>
        <p className='text-sm font-bold tracking-widest uppercase text-persona-purple'>
          Verify your identity
        </p>
        <h1 className='mt-2 text-3xl font-normal tracking-tight font-display md:text-4xl'>
          Finish setting up your assessor account
        </h1>
        <p className='max-w-xl mt-2 text-base leading-relaxed text-persona-muted'>
          We manually review every assessor before they appear to learners.
          Upload an ID and set your mentoring charge—or skip this for now and
          come back to it anytime.
        </p>

        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          <div>
            <FieldLabel required>Government-issued ID</FieldLabel>
            <p className='mt-1 mb-3 text-xs text-persona-muted'>
              PDF, PNG, or JPG, up to 8MB. Used only to verify your identity.
            </p>
            <label className='inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition bg-white border-2 rounded-2xl cursor-pointer border-persona-lavender-deep text-persona-purple-dark hover:border-persona-purple'>
              {idDocumentFile ? "Choose a different file" : "Upload your ID"}
              <input
                type='file'
                accept='application/pdf,image/png,image/jpeg'
                onChange={handleIdDocumentChange}
                className='sr-only'
              />
            </label>
            {idDocumentFile && (
              <p className='mt-2 text-xs font-semibold text-persona-ink'>
                {idDocumentFile.name}
              </p>
            )}
          </div>

          <div className='pt-6 border-t border-persona-lavender-deep/40'>
            <FieldLabel required>What do you charge for mentoring?</FieldLabel>
            <p className='mt-1 text-xs text-persona-muted'>
              Up to {MAX_MENTORING_CHARGE.toLocaleString()} in your chosen
              currency.
            </p>
            <input
              type='number'
              min={1}
              max={MAX_MENTORING_CHARGE}
              value={mentoringCharge}
              onChange={(e) => setMentoringCharge(e.target.value)}
              placeholder='e.g. 150'
              className={`${inputClassName} mt-3`}
            />
          </div>

          <div>
            <FieldLabel required>Currency</FieldLabel>
            <div className='mt-2'>
              <PillGroup
                options={PERSONA_CURRENCIES}
                values={mentoringCurrency ? [mentoringCurrency] : []}
                onToggle={(id) => setMentoringCurrency(id)}
              />
            </div>
          </div>

          <div className='flex items-center gap-3 pt-4'>
            <button
              type='button'
              onClick={() => navigate("/assessor", { replace: true })}
              disabled={submitting}
              className='px-6 py-4 text-base font-bold transition bg-white border-2 rounded-2xl border-persona-lavender-deep text-persona-purple-dark hover:border-persona-purple hover:bg-persona-lavender/50 disabled:opacity-60'
            >
              Skip for now
            </button>
            <button
              type='submit'
              disabled={submitting}
              className='flex flex-1 items-center justify-center gap-3 rounded-2xl bg-persona-purple py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(14,174,110,0.35)] transition hover:bg-persona-purple-hover disabled:opacity-50'
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
