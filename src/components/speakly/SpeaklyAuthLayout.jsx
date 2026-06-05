import { Link } from 'react-router-dom';
import AppLogo from '../AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import SpeaklyWaveformDecor from './SpeaklyWaveformDecor';

export default function SpeaklyAuthLayout({
  title,
  subtitle,
  children,
  footer,
}) {
  return (
    <div className="speakly-app flex min-h-screen font-speakly text-speakly-ink">
      {/* Brand panel — logo orange on deep neutral */}
      <aside className="relative hidden w-[42%] shrink-0 overflow-hidden bg-gradient-to-br from-[#2a1812] via-[#3d2218] to-[#1c1c1c] lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-speakly-coral/35 blur-[80px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-1/3 h-64 w-64 rounded-full bg-speakly-coral/20 blur-[70px]"
          aria-hidden
        />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 xl:px-14">
          <p className="font-display text-3xl font-normal leading-tight text-white xl:text-4xl">
            Speak with intention in the world&apos;s most trusted conversations.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            A flexible programme (7–60 days) to slow down, articulate clearly, and build
            confidence—one exercise per calendar day.
          </p>
          <SpeaklyWaveformDecor className="absolute bottom-24 left-8 right-8" />
        </div>

        <div className="relative z-10 border-t border-white/10 px-10 py-8 xl:px-14">
          <AppLogo
            projectId={SPEECH_TRAINING_PROJECT_ID}
            variant="logo"
            size="md"
            linkTo="/"
            className="brightness-0 invert"
          />
          <p className="mt-2 text-sm text-white/60">Speak With Intention · 7–60 day training</p>
        </div>
      </aside>

      {/* Form panel */}
      <div className="flex min-h-screen flex-1 flex-col bg-gradient-to-b from-speakly-coral-light via-white to-speakly-coral-muted/40">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <AppLogo
            projectId={SPEECH_TRAINING_PROJECT_ID}
            variant="logo"
            size="sm"
            linkTo="/"
          />
          <Link
            to="/"
            className="text-sm font-semibold text-taskly-muted hover:text-speakly-coral"
          >
            Home
          </Link>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-lg">
            <h1 className="font-display text-3xl font-normal tracking-tight text-speakly-ink md:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base leading-relaxed text-taskly-muted">{subtitle}</p>
            )}
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-sm text-taskly-muted">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
