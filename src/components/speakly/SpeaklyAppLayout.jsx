import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import SpeaklyWaveformDecor from './SpeaklyWaveformDecor';

export default function SpeaklyAppLayout({ sidebar, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="speakly-app flex min-h-screen flex-col font-speakly text-speakly-ink lg:flex-row-reverse">
      {/* Main work area — always first in the DOM for accessibility; full width on mobile */}
      <div className="flex min-h-screen flex-1 flex-col bg-gradient-to-b from-speakly-coral-light via-white to-speakly-coral-muted/40">
        <main className="flex flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-8 xl:px-16">
          <div className="mx-auto w-full max-w-3xl flex-1 pb-20 lg:pb-0">{children}</div>
        </main>
      </div>

      {/* Mobile programme drawer */}
      <div className="lg:hidden">
        {mobileNavOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            aria-label="Close programme navigation"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
        <aside
          className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[min(85vh,32rem)] flex-col rounded-t-3xl bg-gradient-to-br from-[#2a1812] via-[#3d2218] to-[#1c1c1c] shadow-[0_-8px_40px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
            mobileNavOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
          }`}
          aria-hidden={!mobileNavOpen}
        >
          <div className="relative shrink-0 border-b border-white/10 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white/80">Programme navigation</p>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>
          <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            {sidebar}
          </div>
        </aside>

        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gradient-to-r from-speakly-coral to-speakly-coral-dark px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(217,93,57,0.45)] transition hover:brightness-105 active:scale-[0.98]"
        >
          <span aria-hidden>☰</span>
          Programme
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="relative hidden w-full shrink-0 flex-col bg-gradient-to-br from-[#2a1812] via-[#3d2218] to-[#1c1c1c] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[20rem] xl:w-[22rem]">
        <div
          className="pointer-events-none absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-speakly-coral/35 blur-[80px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 bottom-1/3 h-64 w-64 rounded-full bg-speakly-coral/20 blur-[70px]"
          aria-hidden
        />

        <div className="relative z-10 shrink-0 border-b border-white/10 px-5 py-4 lg:px-6 lg:py-5">
          <div className="flex items-center justify-between gap-3">
            <AppLogo
              projectId={SPEECH_TRAINING_PROJECT_ID}
              variant="logo"
              size="md"
              linkTo="/"
              className="brightness-0 invert"
            />
            <Link
              to="/"
              className="text-sm font-semibold text-white/60 transition hover:text-white"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 lg:px-6 lg:py-6">
          {sidebar}
        </div>

        <div className="relative z-10 shrink-0 border-t border-white/10 px-6 py-5">
          <SpeaklyWaveformDecor className="mb-3 w-full" />
          <p className="text-xs text-white/45">Speak With Intention · Persona</p>
        </div>
      </aside>
    </div>
  );
}
