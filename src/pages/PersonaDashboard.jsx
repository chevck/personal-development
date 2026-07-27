import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLogo from "../components/AppLogo";
import { PERSONA_ROLE_ASSESSOR } from "../config/personaRegistration";
import { PERSONA_SKILLS } from "../config/personaSkills";
import { SKILLS_WITH_GUIDED_SETUP } from "../config/personaSkillTasks";
import { useAuth } from "../contexts/AuthContext";
import { getUserSkillSubscriptions } from "../lib/personaDashboard";
import { showErrorToast } from "../lib/toast";

function SubscribedSkillCard({ subscription }) {
  const { skill, role, taskPath } = subscription;
  const isAssessor = role === PERSONA_ROLE_ASSESSOR;

  console.log({ subscription });

  const body = (
    <>
      <div className='flex items-start justify-between gap-4'>
        <span className='flex items-center justify-center w-12 h-12 text-2xl rounded-2xl bg-persona-lavender'>
          {skill.icon}
        </span>
        <span className='px-3 py-1 text-xs font-bold rounded-full bg-persona-purple/10 text-persona-purple'>
          {isAssessor ? "Assessing" : "Training"}
        </span>
      </div>
      <h3 className='mt-5 text-xl font-bold tracking-tight text-persona-ink'>
        {skill.name}
      </h3>
      <p className='mt-2 text-sm leading-relaxed text-persona-muted'>
        {skill.description}
      </p>
      <p className='flex items-center gap-2 mt-5 text-sm font-bold'>
        {taskPath ? (
          <span className='text-persona-purple'>
            {isAssessor ? "Review submissions" : "View your tasks"}
            <span aria-hidden> →</span>
          </span>
        ) : (
          <span className='text-persona-muted'>Daily tasks coming soon</span>
        )}
      </p>
    </>
  );

  if (!taskPath) {
    return (
      <li className='bg-white border rounded-3xl border-persona-border p-7 opacity-80'>
        {body}
      </li>
    );
  }

  return (
    <li>
      <Link
        to={taskPath}
        className='block h-full rounded-3xl border border-persona-border bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:border-persona-purple hover:shadow-[0_8px_30px_rgba(14,174,110,0.15)]'
        aria-label={`Open your ${skill.name} tasks`}
      >
        {body}
      </Link>
    </li>
  );
}

function ExploreSkillCard({ skill }) {
  const comingSoon = skill.status !== "available";

  return (
    <li
      className={`rounded-3xl border border-dashed border-persona-border bg-persona-surface/60 p-7 ${
        comingSoon ? "opacity-70" : ""
      }`}
    >
      <div className='flex items-start justify-between gap-4'>
        <span className='flex items-center justify-center w-12 h-12 text-2xl bg-white rounded-2xl'>
          {skill.icon}
        </span>
        <span className='px-3 py-1 text-xs font-semibold bg-white rounded-full text-persona-muted'>
          {skill.tag ?? "Coming soon"}
        </span>
      </div>
      <h3 className='mt-5 text-xl font-bold tracking-tight text-persona-ink'>
        {skill.name}
      </h3>
      <p className='mt-2 text-sm leading-relaxed text-persona-muted'>
        {skill.description}
      </p>
      {comingSoon ? (
        <p className='mt-5 text-sm font-bold text-persona-muted'>Coming soon</p>
      ) : (
        <Link
          to={
            SKILLS_WITH_GUIDED_SETUP.has(skill.id)
              ? `/skills/${skill.id}/setup`
              : skill.registerPath
          }
          className='inline-flex items-center gap-2 mt-5 text-sm font-bold text-persona-purple underline-offset-4 hover:underline'
        >
          Add this skill
          <span aria-hidden>→</span>
        </Link>
      )}
    </li>
  );
}

export default function PersonaDashboard() {
  const { user, signOut } = useAuth();
  const [subscriptions, setSubscriptions] = useState(null);
  const [displayName, setDisplayName] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getUserSkillSubscriptions(user?.uid);
        if (cancelled) return;
        setSubscriptions(result.subscriptions);
        setDisplayName(result.displayName);
      } catch {
        if (!cancelled) {
          showErrorToast("We couldn't load your skills. Please try again.");
          setSubscriptions([]);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const loading = subscriptions === null;
  const subscribedIds = new Set(
    (subscriptions ?? []).map((s) => s.skill?.id).filter(Boolean),
  );
  const exploreSkills = PERSONA_SKILLS.filter((s) => !subscribedIds.has(s.id));
  const firstName = displayName?.trim().split(/\s+/)[0] ?? null;

  return (
    <div className='min-h-screen font-sans persona-app bg-gradient-to-b from-persona-lavender/40 via-white to-persona-cream text-persona-ink'>
      <header className='px-6 py-4 border-b border-persona-border bg-white/70 backdrop-blur'>
        <div className='flex items-center justify-between max-w-6xl mx-auto'>
          <AppLogo variant='logo' size='sm' linkTo='/dashboard' />
          <button
            type='button'
            onClick={signOut}
            className='text-sm font-semibold transition text-persona-muted hover:text-persona-purple'
          >
            Sign out
          </button>
        </div>
      </header>

      <main className='max-w-6xl px-6 py-12 mx-auto'>
        <p className='text-sm font-bold tracking-widest uppercase text-persona-purple'>
          Your dashboard
        </p>
        <h1 className='mt-2 text-3xl font-normal tracking-tight font-display md:text-4xl'>
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className='max-w-xl mt-2 text-base leading-relaxed text-persona-muted'>
          Pick up where you left off—open a skill to see your daily tasks.
        </p>

        {loading ? (
          <p className='mt-10 text-persona-muted'>Loading your skills…</p>
        ) : (
          <>
            <section aria-labelledby='your-skills' className='mt-10'>
              <h2 id='your-skills' className='text-lg font-bold tracking-tight'>
                Your skills
              </h2>
              {subscriptions.length === 0 ? (
                <div className='p-8 mt-4 bg-white border rounded-3xl border-persona-border'>
                  <p className='text-persona-muted'>
                    You&apos;re not subscribed to any skills yet.
                  </p>
                  <Link
                    to='/register'
                    className='inline-flex items-center gap-2 mt-4 text-sm font-bold text-persona-purple underline-offset-4 hover:underline'
                  >
                    Choose your first skill
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              ) : (
                <ul className='grid items-stretch gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3'>
                  {subscriptions.map((subscription) => (
                    <SubscribedSkillCard
                      key={subscription.skill.id}
                      subscription={subscription}
                    />
                  ))}
                </ul>
              )}
            </section>

            {exploreSkills.length > 0 && (
              <section aria-labelledby='explore-skills' className='mt-14'>
                <h2
                  id='explore-skills'
                  className='text-lg font-bold tracking-tight'
                >
                  Explore more skills
                </h2>
                <ul className='grid items-stretch gap-6 mt-4 md:grid-cols-2 lg:grid-cols-3'>
                  {exploreSkills.map((skill) => (
                    <ExploreSkillCard key={skill.id} skill={skill} />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
