import { Link } from 'react-router-dom';
import AppLogo from '../AppLogo';

export default function PersonaAuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="persona-app flex min-h-screen font-sans text-persona-ink">
      {/* Brand panel */}
      <aside className="relative hidden w-[42%] shrink-0 overflow-hidden bg-gradient-to-br from-persona-purple-dark via-persona-purple to-[#0B2C1F] lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-persona-yellow/25 blur-[80px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-1/3 h-64 w-64 rounded-full bg-persona-lavender/30 blur-[70px]"
          aria-hidden
        />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
          <p className="font-display text-3xl font-normal leading-tight text-white xl:text-4xl">
            One account. Every skill you decide to master.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            Train your voice—speech, singing, public speaking, voice overs—or your design
            craft, one focused exercise per day.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              'Join as a student or an assessor',
              'Answer a few questions about your goals or expertise',
              'Get a daily programme—or your review dashboard',
            ].map((item, i) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-persona-yellow text-xs font-bold text-persona-ink">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/10 px-10 py-8 xl:px-14">
          <AppLogo variant="logo" size="md" linkTo="/" className="brightness-0 invert" />
          <p className="mt-2 text-sm text-white/60">
            Provn · Self-development, one skill at a time
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex min-h-screen flex-1 flex-col bg-gradient-to-b from-persona-lavender/60 via-white to-persona-cream">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <AppLogo variant="logo" size="sm" linkTo="/" />
          <Link
            to="/"
            className="text-sm font-semibold text-persona-muted hover:text-persona-purple"
          >
            Home
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-lg">
            <h1 className="font-display text-3xl font-normal tracking-tight text-persona-ink md:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base leading-relaxed text-persona-muted">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-6 text-center text-sm text-persona-muted">{footer}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
