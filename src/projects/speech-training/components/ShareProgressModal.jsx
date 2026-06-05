import { useEffect, useRef, useState } from 'react';
import ShareProgressCard from './ShareProgressCard';
import {
  buildShareCaption,
  captureElementAsPng,
  downloadBlob,
  shareProgressImage,
} from '../../../lib/shareProgressImage';

export default function ShareProgressModal({
  open,
  onClose,
  day,
  phaseLabel,
  assessment,
  programDuration,
  completedCount,
  userName,
}) {
  const cardRef = useRef(null);
  const [personalComment, setPersonalComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const score = assessment?.latestScore ?? null;
  const assessorComment = assessment?.latestComment ?? '';
  const assessorName = assessment?.assessorName ?? '';

  useEffect(() => {
    if (!open) return undefined;
    setMessage(null);
    setError(null);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function exportImage() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const blob = await captureElementAsPng(cardRef.current, { scale: 1 });
      return blob;
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveImage() {
    try {
      const blob = await exportImage();
      downloadBlob(blob, `speakly-day-${day.day}-progress.png`);
      setMessage('Image saved to your downloads.');
    } catch (err) {
      setError(err.message || 'Could not save image.');
    }
  }

  async function handleShare() {
    try {
      const blob = await exportImage();
      const caption = buildShareCaption({
        userName,
        day,
        phaseLabel,
        personalComment,
        score,
        programDuration,
        completedCount,
      });
      const result = await shareProgressImage({
        blob,
        title: `Speakly — Day ${day.day} complete`,
        text: caption,
      });
      setMessage(
        result === 'shared'
          ? 'Shared successfully.'
          : 'Shared text — save the image separately if needed.',
      );
    } catch (err) {
      setError(err.message || 'Could not share.');
    }
  }

  async function handleCopyCaption() {
    setError(null);
    setMessage(null);
    try {
      const caption = buildShareCaption({
        userName,
        day,
        phaseLabel,
        personalComment,
        score,
        programDuration,
        completedCount,
      });
      await navigator.clipboard.writeText(caption);
      setMessage('Caption copied — paste it when you post.');
    } catch {
      setError('Could not copy caption.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-progress-title"
      onClick={onClose}
    >
      <div
        className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-taskly-border px-6 py-5">
          <h2 id="share-progress-title" className="text-xl font-bold text-taskly-ink">
            Share your progress
          </h2>
          <p className="mt-1 text-sm text-taskly-muted">
            Add a personal note, then save or share your Day {day.day} card.
          </p>
        </div>

        <div className="px-6 py-5">
          <div className="overflow-hidden rounded-2xl border border-taskly-border bg-taskly-surface shadow-inner">
            <div
              className="mx-auto origin-top"
              style={{ transform: 'scale(0.32)', width: 1080, height: 1080, marginBottom: -730 }}
            >
              <ShareProgressCard
                ref={cardRef}
                day={day}
                phaseLabel={phaseLabel}
                personalComment={personalComment}
                assessorComment={assessorComment}
                assessorName={assessorName}
                score={score}
                programDuration={programDuration}
                completedCount={completedCount}
                userName={userName}
              />
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-bold text-taskly-ink">Your comment</span>
            <p className="mt-0.5 text-xs text-taskly-muted">
              Optional — shows on the card and in your share caption.
            </p>
            <textarea
              rows={3}
              value={personalComment}
              onChange={(e) => setPersonalComment(e.target.value)}
              placeholder="e.g. Nailed today's pace drill — feeling more confident!"
              className="mt-2 w-full resize-y rounded-2xl border-0 bg-white px-4 py-3 text-base text-taskly-ink shadow-soft ring-1 ring-speakly-coral-ring/80 outline-none transition focus:ring-2 focus:ring-speakly-coral"
              maxLength={280}
            />
            <p className="mt-1 text-right text-xs text-taskly-muted">{personalComment.length}/280</p>
          </label>

          {error && (
            <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-taskly-border px-6 py-5 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-speakly-coral px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(217,93,57,0.35)] transition hover:bg-speakly-coral-hover disabled:opacity-50"
          >
            <span aria-hidden>↓</span>
            {busy ? 'Preparing…' : 'Save as image'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-speakly-coral bg-white px-5 py-3.5 text-sm font-bold text-speakly-coral-dark transition hover:bg-speakly-coral-light disabled:opacity-50"
          >
            <span aria-hidden>↗</span>
            Share
          </button>
          <button
            type="button"
            onClick={handleCopyCaption}
            disabled={busy}
            className="rounded-2xl px-5 py-3.5 text-sm font-semibold text-taskly-muted transition hover:bg-taskly-surface hover:text-taskly-ink disabled:opacity-50 sm:w-full"
          >
            Copy caption
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl px-5 py-3.5 text-sm font-semibold text-taskly-muted transition hover:text-taskly-ink sm:ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
