import { useState } from 'react';
import { buildAssessUrl, createAssessmentSubmission } from '../../../lib/speechTrainingAssessments';
import { getUserId } from '../../../lib/userId';

export default function ShareForReview({ day, recording, disabled }) {
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleShare = async () => {
    setError(null);
    setSharing(true);
    try {
      const shareId = await createAssessmentSubmission({
        userId: getUserId(),
        dayNum: day.day,
        day,
        recording,
      });
      setShareUrl(buildAssessUrl(shareId));
    } catch (err) {
      setError(err.message || 'Could not create share link.');
    } finally {
      setSharing(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy link. Select and copy it manually.');
    }
  };

  if (!recording?.downloadUrl) return null;

  return (
    <section className="rounded-2xl border border-taskly-border bg-white p-5 shadow-soft">
      <h3 className="text-sm font-bold uppercase tracking-wider text-taskly-ink">
        Share for assessment
      </h3>
      <p className="mt-1 text-base text-taskly-muted">
        Send your recording to one assessor. Only the first person to submit a review on this link
        counts — if you share the same link widely, once one review is in, the link closes for
        everyone else.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-base text-red-600" role="alert">
          {error}
        </p>
      )}

      {!shareUrl && (
        <button
          type="button"
          onClick={handleShare}
          disabled={disabled || sharing}
          className="mt-4 w-full rounded-2xl border-2 border-taskly-yellow bg-taskly-yellow/30 py-3.5 text-base font-bold text-taskly-ink transition hover:bg-taskly-yellow disabled:opacity-50"
        >
          {sharing ? 'Creating link…' : 'Create assessment link'}
        </button>
      )}

      {shareUrl && (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-taskly-surface p-3">
            <p className="mb-2 text-sm font-semibold text-taskly-muted">Assessment link</p>
            <p className="break-all text-sm text-taskly-ink">{shareUrl}</p>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="w-full rounded-2xl bg-taskly-ink py-3.5 text-base font-bold text-white transition hover:bg-neutral-800"
          >
            {copied ? 'Copied!' : 'Copy link for assessor'}
          </button>
        </div>
      )}
    </section>
  );
}
