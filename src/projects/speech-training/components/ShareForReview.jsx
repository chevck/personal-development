import { useMemo, useState } from 'react';
import {
  buildSpeaklyRecordingDisplayUrl,
  buildSpeaklyRecordingUrl,
  createAssessmentSubmission,
} from '../../../lib/speechTrainingAssessments';
import { getUserId } from '../../../lib/userId';

export default function ShareForReview({
  day,
  recording,
  assessment,
  shareCode,
  disabled,
}) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const recordingNum = assessment?.lastRecordingNum || recording?.recordingNum || null;

  const shareUrl = useMemo(() => {
    if (recording?.playbackUrl) return recording.playbackUrl;
    if (shareCode && recordingNum) {
      return buildSpeaklyRecordingUrl(shareCode, day.day, recordingNum);
    }
    return null;
  }, [recording?.playbackUrl, shareCode, recordingNum, day.day]);

  const shareDisplay = useMemo(() => {
    if (!recordingNum) return null;
    return buildSpeaklyRecordingDisplayUrl(day.day, recordingNum);
  }, [day.day, recordingNum]);

  const handleConfirmShared = async () => {
    setError(null);
    setSharing(true);
    try {
      await createAssessmentSubmission({
        userId: getUserId(),
        dayNum: day.day,
        day,
        recording,
      });
    } catch (err) {
      setError(err.message || 'Could not update share status.');
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

  const awaitingConfirmation = assessment?.status === 'awaiting_share';

  return (
    <section className="card-speakly p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
        Share for assessment
      </h3>
      <p className="mt-1 text-base text-taskly-muted">
        One link for listening and assessor review. Copy it and send to your coach or mentor.
        Only the first person to submit a review on this link counts.
      </p>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-base text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {shareUrl && shareDisplay && (
          <div className="rounded-xl bg-speakly-coral-light p-3">
            <p className="mb-2 text-sm font-semibold text-taskly-muted">Your link</p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={shareUrl}
              className="block truncate text-sm font-medium text-speakly-coral hover:underline"
            >
              {shareDisplay}
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="btn-speakly-secondary mt-3 w-full"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        )}

        {awaitingConfirmation && (
          <button
            type="button"
            onClick={handleConfirmShared}
            disabled={disabled || sharing || !shareUrl}
            className="btn-speakly-primary w-full disabled:opacity-50"
          >
            {sharing ? 'Updating…' : "I've shared this with my assessor"}
          </button>
        )}
      </div>
    </section>
  );
}
