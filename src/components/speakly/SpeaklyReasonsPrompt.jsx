import { useState } from 'react';
import AppLogo from '../AppLogo';
import { SPEECH_TRAINING_PROJECT_ID } from '../../config/projects';
import { SPEAKLY_REASONS } from '../../config/speaklyRegistration';
import { updateLearnerReasons } from '../../lib/speaklyUsers';

const inputClassName =
  'mt-1.5 w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-base text-speakly-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-speakly-coral-ring/80 transition focus:ring-2 focus:ring-speakly-coral';

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
    <span className="pill-in-wrap inline-flex" style={{ animationDelay: `${delay}s` }}>
      <button
        type="button"
        aria-pressed={selected}
        onClick={handleClick}
        onAnimationEnd={() => setPopping(false)}
        className={`pill ${selected ? 'pill-selected' : 'pill-idle'} ${
          popping && selected ? 'pill-pop' : ''
        }`}
      >
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition ${
            selected
              ? 'border-white bg-white/20 text-white'
              : 'border-speakly-coral-ring text-transparent'
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

export default function SpeaklyReasonsPrompt({ uid, userName, onComplete }) {
  const [reasonsForJoining, setReasonsForJoining] = useState([]);
  const [reasonsForJoiningOther, setReasonsForJoiningOther] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const firstName = userName?.split(/[\s._-]+/)[0] || 'there';
  const canContinue =
    reasonsForJoining.length > 0 &&
    (!reasonsForJoining.includes('other') || reasonsForJoiningOther.trim().length > 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const updated = await updateLearnerReasons(uid, {
        reasonsForJoining,
        reasonsForJoiningOther,
      });
      onComplete(updated);
    } catch (err) {
      setError(err.message || 'Could not save your choices.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="speakly-app fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4 font-speakly backdrop-blur-sm">
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-gradient-to-b from-speakly-coral-light via-white to-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reasons-prompt-title"
      >
        <div className="border-b border-speakly-coral-ring/50 px-6 py-5">
          <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="logo" size="sm" />
          <h2
            id="reasons-prompt-title"
            className="font-display mt-4 text-2xl font-normal tracking-tight text-speakly-ink md:text-3xl"
          >
            What&apos;s bringing you to Speakly?
          </h2>
          <p className="mt-2 text-base text-taskly-muted">
            Hi {firstName} — pick anything that resonates so we can tailor your experience. Choose
            as many as you like.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6">
          <div className="flex flex-wrap gap-2.5">
            {SPEAKLY_REASONS.map((option, index) => (
              <Pill
                key={option.id}
                option={option}
                selected={reasonsForJoining.includes(option.id)}
                onToggle={(id) => setReasonsForJoining((prev) => toggleInList(prev, id))}
                delay={index * 0.03}
              />
            ))}
          </div>

          {reasonsForJoining.includes('other') && (
            <label className="step-in mt-5 block">
              <span className="text-sm font-bold text-speakly-ink">Tell us in a few words</span>
              <input
                type="text"
                value={reasonsForJoiningOther}
                onChange={(e) => setReasonsForJoiningOther(e.target.value)}
                placeholder="What's on your mind?"
                className={inputClassName}
                autoFocus
              />
            </label>
          )}

          {error && (
            <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !canContinue}
            className="btn-speakly-primary mt-6 w-full disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Continue to my programme'}
          </button>
        </form>
      </div>
    </div>
  );
}
