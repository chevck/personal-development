import { Link } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
import { projects } from '../config/projects';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-taskly-ink">
      <header className="border-b border-taskly-border px-6 py-14 text-center">
        <AppLogo variant="logo" size="lg" className="mx-auto mb-4" />
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Personal growth projects
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-taskly-muted">
          Structured programmes you can track over time. Pick a project to begin.
        </p>
      </header>

      <main className="mx-auto grid max-w-2xl gap-4 p-6">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={project.path}
            className="group block rounded-3xl border border-taskly-border bg-white p-6 no-underline shadow-soft transition hover:border-persona-taupe/30 hover:shadow-card"
          >
            <AppLogo projectId={project.id} variant="logo" size="sm" className="mb-4" />
            <span className="text-xs font-semibold uppercase tracking-wider text-taskly-muted">
              {project.tag}
            </span>
            <h2 className="mt-2 text-2xl font-bold group-hover:text-taskly-peach-text">
              {project.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-taskly-muted">
              {project.description}
            </p>
          </Link>
        ))}
      </main>
    </div>
  );
}
