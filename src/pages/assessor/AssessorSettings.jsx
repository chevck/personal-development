import { useEffect, useState } from "react";
import { NavLink, Navigate, useOutletContext, useParams } from "react-router-dom";
import {
  FieldLabel,
  inputClassName,
  OtherField,
  PillGroup,
  toggleInList,
} from "../../components/persona/QuestionSteps";
import { getSkillTrack } from "../../config/personaRegistration";
import { SPEAKLY_ASSESSOR_BACKGROUND } from "../../config/speaklyRegistration";
import { changePassword } from "../../firebase/auth";
import { validateAssessorPhoto } from "../../lib/personaAssessorMedia";
import {
  updateAssessorExpertise,
  updateAssessorPhoto,
  updatePersonaUserName,
} from "../../lib/personaUsers";
import { showErrorToast, showSuccessToast } from "../../lib/toast";

const SETTINGS_TABS = [
  { id: "account", label: "Account" },
  { id: "bank", label: "Bank information" },
  { id: "expertise", label: "Expertise" },
  { id: "password", label: "Change password" },
];

function SettingsCard({ title, children }) {
  return (
    <div className='max-w-2xl p-6 mt-6 bg-white border rounded-3xl border-persona-border md:p-8'>
      {title && <h2 className='text-lg font-bold text-persona-ink'>{title}</h2>}
      <div className='mt-4'>{children}</div>
    </div>
  );
}

function PhotoField({ personaProfile, reload }) {
  const [changing, setChanging] = useState(false);

  async function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      validateAssessorPhoto(file);
    } catch (err) {
      showErrorToast(err.message);
      return;
    }

    setChanging(true);
    try {
      await updateAssessorPhoto(personaProfile.uid, file);
      await reload();
      showSuccessToast("Photo updated.");
    } catch (err) {
      showErrorToast(err.message || "Couldn't update your photo.");
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className='flex items-center gap-4'>
      <span className='flex items-center justify-center w-16 h-16 overflow-hidden text-2xl font-bold rounded-full shrink-0 bg-persona-lavender text-persona-purple-dark'>
        {personaProfile?.photoUrl ? (
          <img
            src={personaProfile.photoUrl}
            alt='Your profile'
            className='object-cover w-full h-full'
          />
        ) : (
          "📷"
        )}
      </span>
      <div>
        <label className='inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold transition bg-white border-2 rounded-2xl cursor-pointer border-persona-lavender-deep text-persona-purple-dark hover:border-persona-purple'>
          {changing ? "Uploading…" : "Change photo"}
          <input
            type='file'
            accept='image/png,image/jpeg'
            disabled={changing}
            onChange={handlePhotoChange}
            className='sr-only'
          />
        </label>
        <p className='mt-1.5 text-xs text-persona-muted'>PNG or JPG, up to 5MB.</p>
      </div>
    </div>
  );
}

function AccountTab({ personaProfile, reload }) {
  const [name, setName] = useState(personaProfile?.name || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(personaProfile?.name || "");
  }, [personaProfile?.name]);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updatePersonaUserName(personaProfile.uid, name);
      await reload();
      showSuccessToast("Saved.");
    } catch (err) {
      showErrorToast(err.message || "Couldn't save your name.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title='Account'>
      <PhotoField personaProfile={personaProfile} reload={reload} />

      <form onSubmit={handleSave} className='mt-6 space-y-5'>
        <label className='block'>
          <FieldLabel required>Full name</FieldLabel>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClassName}
          />
        </label>

        <label className='block'>
          <FieldLabel>Email</FieldLabel>
          <input
            type='email'
            value={personaProfile?.email || ""}
            disabled
            className={`${inputClassName} cursor-not-allowed opacity-70`}
          />
          <p className='mt-1.5 text-xs text-persona-muted'>
            Contact support to change your email.
          </p>
        </label>

        <button
          type='submit'
          disabled={saving}
          className='px-6 py-3 text-sm font-bold text-white transition rounded-2xl bg-persona-purple hover:bg-persona-purple-hover disabled:opacity-60'
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </SettingsCard>
  );
}

function BankTab() {
  return (
    <SettingsCard title='Bank information'>
      <div className='p-5 border border-dashed rounded-2xl border-persona-border bg-persona-surface/50'>
        <p className='text-sm font-bold text-persona-ink'>Coming soon</p>
        <p className='mt-2 text-sm leading-relaxed text-persona-muted'>
          Payouts aren&apos;t live yet, so there&apos;s nothing to connect here. We&apos;ll email
          you when assessor payouts open up and it&apos;s safe to add your bank details.
        </p>
      </div>
    </SettingsCard>
  );
}

function ExpertiseTab({ personaProfile, reload }) {
  const [qualifications, setQualifications] = useState(personaProfile?.qualifications || []);
  const [qualificationsOther, setQualificationsOther] = useState(
    personaProfile?.qualificationsOther || "",
  );
  const [assessorFocus, setAssessorFocus] = useState(personaProfile?.assessorFocus || []);
  const [assessorFocusOther, setAssessorFocusOther] = useState(
    personaProfile?.assessorFocusOther || "",
  );
  // `assessorBackground` used to be multi-select (an array)—tolerate
  // existing profiles that still are, by taking the first value.
  const initialBackground = Array.isArray(personaProfile?.assessorBackground)
    ? (personaProfile.assessorBackground[0] ?? null)
    : (personaProfile?.assessorBackground ?? null);
  const [assessorBackground, setAssessorBackground] = useState(initialBackground);
  const [assessorBio, setAssessorBio] = useState(personaProfile?.assessorBio || "");
  const [saving, setSaving] = useState(false);

  const assessorQuestions = getSkillTrack(personaProfile?.track)?.assessorQuestions ?? {};

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateAssessorExpertise(personaProfile.uid, {
        track: personaProfile.track,
        qualifications,
        qualificationsOther,
        assessorFocus,
        assessorFocusOther,
        assessorBackground,
        assessorBio,
      });
      await reload();
      showSuccessToast("Saved.");
    } catch (err) {
      showErrorToast(err.message || "Couldn't save your expertise.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title='Expertise'>
      <form onSubmit={handleSave} className='space-y-6'>
        <div>
          <FieldLabel required>Qualifications</FieldLabel>
          <div className='mt-2'>
            <PillGroup
              options={assessorQuestions.qualifications}
              values={qualifications}
              onToggle={(id) => setQualifications((prev) => toggleInList(prev, id))}
            />
          </div>
          <OtherField
            show={qualifications.includes("other")}
            label='Describe your qualification'
            value={qualificationsOther}
            onChange={setQualificationsOther}
          />
        </div>

        <div>
          <FieldLabel required>What you review best</FieldLabel>
          <div className='mt-2'>
            <PillGroup
              options={assessorQuestions.focus}
              values={assessorFocus}
              onToggle={(id) => setAssessorFocus((prev) => toggleInList(prev, id))}
            />
          </div>
          <OtherField
            show={assessorFocus.includes("other")}
            label='What else do you review?'
            value={assessorFocusOther}
            onChange={setAssessorFocusOther}
          />
        </div>

        <div>
          <FieldLabel required>Experience level</FieldLabel>
          <div className='mt-2'>
            <PillGroup
              options={SPEAKLY_ASSESSOR_BACKGROUND}
              values={assessorBackground ? [assessorBackground] : []}
              onToggle={(id) => setAssessorBackground(id)}
            />
          </div>
        </div>

        <label className='block'>
          <FieldLabel>Bio</FieldLabel>
          <textarea
            rows={4}
            value={assessorBio}
            onChange={(e) => setAssessorBio(e.target.value)}
            placeholder='A few sentences learners will see when picking an assessor.'
            className={`${inputClassName} resize-y`}
          />
        </label>

        <button
          type='submit'
          disabled={saving}
          className='px-6 py-3 text-sm font-bold text-white transition rounded-2xl bg-persona-purple hover:bg-persona-purple-hover disabled:opacity-60'
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </SettingsCard>
  );
}

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave(event) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      showErrorToast("New passwords don't match.");
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccessToast("Password updated.");
    } catch (err) {
      showErrorToast(err.message || "Couldn't update your password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsCard title='Change password'>
      <form onSubmit={handleSave} className='space-y-5'>
        <label className='block'>
          <FieldLabel required>Current password</FieldLabel>
          <input
            type='password'
            required
            minLength={6}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClassName}
          />
        </label>
        <label className='block'>
          <FieldLabel required>New password</FieldLabel>
          <input
            type='password'
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClassName}
          />
        </label>
        <label className='block'>
          <FieldLabel required>Confirm new password</FieldLabel>
          <input
            type='password'
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClassName}
          />
        </label>

        <button
          type='submit'
          disabled={saving}
          className='px-6 py-3 text-sm font-bold text-white transition rounded-2xl bg-persona-purple hover:bg-persona-purple-hover disabled:opacity-60'
        >
          {saving ? "Updating…" : "Update password"}
        </button>
      </form>
    </SettingsCard>
  );
}

export default function AssessorSettings() {
  const { tab } = useParams();
  const { personaProfile, reload } = useOutletContext();

  if (!tab) {
    return <Navigate to='/assessor/settings/account' replace />;
  }

  return (
    <div>
      <h1 className='text-3xl font-normal tracking-tight font-display'>Settings</h1>

      <div className='flex flex-wrap gap-2 mt-6'>
        {SETTINGS_TABS.map((item) => (
          <NavLink
            key={item.id}
            to={`/assessor/settings/${item.id}`}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-bold transition ${
                isActive
                  ? "bg-persona-purple text-white"
                  : "bg-white text-persona-muted border border-persona-border hover:text-persona-ink"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {!personaProfile ? (
        <p className='mt-6 text-persona-muted'>Loading…</p>
      ) : (
        <>
          {tab === "account" && <AccountTab personaProfile={personaProfile} reload={reload} />}
          {tab === "bank" && <BankTab />}
          {tab === "expertise" && (
            <ExpertiseTab personaProfile={personaProfile} reload={reload} />
          )}
          {tab === "password" && <PasswordTab />}
        </>
      )}
    </div>
  );
}
