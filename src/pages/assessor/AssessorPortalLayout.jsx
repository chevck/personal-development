import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import AppLogo from "../../components/AppLogo";
import { useAuth } from "../../contexts/AuthContext";
import { getAssignedLearners } from "../../lib/personaSkillProgress";
import { getPersonaUser } from "../../lib/personaUsers";
import { showErrorToast } from "../../lib/toast";

const NAV_ITEMS = [
  { to: "/assessor", label: "Overview", icon: "🏠", end: true },
  { to: "/assessor/students", label: "Students", icon: "🎓" },
  { to: "/assessor/settings", label: "Settings", icon: "⚙️" },
];

/** Sits above every assessor page until KYC is submitted and approved. */
function KycBanner({ kycStatus }) {
  if (kycStatus === "active") return null;

  if (kycStatus === "pending") {
    return (
      <div className='flex flex-wrap items-center justify-between gap-4 px-5 py-4 mb-8 border rounded-2xl border-amber-200 bg-amber-50'>
        <p className='text-sm font-semibold text-amber-900'>
          Your account is pending review. We&apos;ll let you know once
          it&apos;s verified.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-wrap items-center justify-between gap-4 px-5 py-4 mb-8 border rounded-2xl border-amber-200 bg-amber-50'>
      <p className='text-sm font-semibold text-amber-900'>
        Your account is unverified. Complete your KYC to appear in the
        assessor directory and start reviewing learners.
      </p>
      <Link
        to='/assessor/verify'
        className='inline-flex shrink-0 items-center justify-center rounded-xl bg-persona-ink px-5 py-2.5 text-xs font-bold text-white transition hover:bg-persona-ink/90'
      >
        Complete KYC
      </Link>
    </div>
  );
}

export default function AssessorPortalLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [personaProfile, setPersonaProfile] = useState(null);
  const [learners, setLearners] = useState(null);

  const reload = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const [profile, assigned] = await Promise.all([
        getPersonaUser(user.uid),
        getAssignedLearners(user.uid),
      ]);
      setPersonaProfile(profile);
      setLearners(assigned);
    } catch {
      showErrorToast("We couldn't load your assessor data. Please try again.");
      setLearners([]);
    }
  }, [user?.uid]);

  useEffect(() => {
    reload();
  }, [reload]);

  if (!authLoading && !user) {
    return <Navigate to='/login' replace />;
  }

  return (
    <div className='task-board flex min-h-screen font-sans persona-app bg-persona-cream text-persona-ink'>
      <aside className='flex flex-col w-64 border-r shrink-0 border-persona-border bg-white'>
        <div className='px-6 py-5 border-b border-persona-border'>
          <AppLogo variant='logo' size='sm' linkTo='/assessor' />
          <p className='mt-2 text-xs font-bold uppercase tracking-wide text-persona-muted'>
            Assessor
          </p>
        </div>

        <nav className='flex-1 px-4 py-6 space-y-1'>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-persona-purple text-white"
                    : "text-persona-muted hover:bg-persona-lavender/60 hover:text-persona-ink"
                }`
              }
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className='px-4 py-5 border-t border-persona-border'>
          <p className='px-2 text-sm font-bold truncate text-persona-ink'>
            {personaProfile?.name || user?.displayName || "Assessor"}
          </p>
          <p className='px-2 mt-0.5 truncate text-xs text-persona-muted'>{user?.email}</p>
          <div className='flex gap-2 mt-3'>
            <NavLink
              to='/dashboard'
              className='flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold text-persona-muted transition hover:bg-persona-surface'
            >
              Back to Provn
            </NavLink>
            <button
              type='button'
              onClick={signOut}
              className='flex-1 px-3 py-2 text-xs font-bold transition rounded-xl text-persona-muted hover:bg-persona-surface'
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className='flex-1 px-8 py-10 overflow-y-auto'>
        {personaProfile && <KycBanner kycStatus={personaProfile.kycStatus} />}
        <Outlet context={{ learners, loading: learners === null, personaProfile, reload }} />
      </main>
    </div>
  );
}
