import { useEffect, useState } from 'react';
import {
  buildAssessUrlFromSubmissionDocId,
  createAssessmentSubmission,
} from '../../../lib/speechTrainingAssessments';
import { getUserId } from '../../../lib/userId';

export default function ShareForReview({ day, recording, assessment, disabled }) {
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const existing = assessment?.pendingSubmissionId
      ? buildAssessUrlFromSubmissionDocId(assessment.pendingSubmissionId)
      : null;
    setShareUrl(existing);
  }, [assessment?.pendingSubmissionId]);

  const handleShare = async () => {
    setError(null);
    setSharing(true);
    try {
      const { url } = await createAssessmentSubmission({
        userId: getUserId(),
        dayNum: day.day,
        day,
        recording,
      });
      setShareUrl(url);
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

      <div className="mt-4 space-y-3">
        {shareUrl ? (
          <div className="rounded-xl bg-taskly-surface p-3">
            <p className="mb-2 text-sm font-semibold text-taskly-muted">Assessment link</p>
            <p className="break-all text-sm text-taskly-ink">{shareUrl}</p>
          </div>
        ) : (
          <p className="rounded-xl bg-taskly-surface p-3 text-sm text-taskly-muted">
            No assessment link yet for this recording.
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!shareUrl}
            className="w-full rounded-2xl bg-taskly-ink py-3.5 text-base font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={disabled || sharing}
            className="w-full rounded-2xl border-2 border-taskly-yellow bg-taskly-yellow/30 py-3.5 text-base font-bold text-taskly-ink transition hover:bg-taskly-yellow disabled:opacity-50"
          >
            {sharing ? 'Creating link…' : shareUrl ? 'Create new link' : 'Create assessment link'}
          </button>
        </div>
      </div>
    </section>
  );
}
