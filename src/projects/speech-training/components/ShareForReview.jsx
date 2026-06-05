import { useEffect, useMemo, useState } from 'react';
import {
  buildAssessUrlFromSubmissionDocId,
  buildSpeaklyRecordingDisplayUrl,
  buildSpeaklyRecordingUrl,
  createAssessmentSubmission,
} from '../../../lib/speechTrainingAssessments';
import { formatAssessLinkDisplay } from '../../../lib/formatLinkDisplay';
import { getUserId } from '../../../lib/userId';

export default function ShareForReview({
  day,
  recording,
  assessment,
  shareCode,
  disabled,
}) {
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [error, setError] = useState(null);

  const recordingNum = assessment?.lastRecordingNum || recording?.recordingNum || null;

  const recordingUrl = useMemo(() => {
    if (recording?.playbackUrl) return recording.playbackUrl;
    if (shareCode && recordingNum) {
      return buildSpeaklyRecordingUrl(shareCode, day.day, recordingNum);
    }
    return null;
  }, [recording?.playbackUrl, shareCode, recordingNum, day.day]);

  const recordingDisplay = useMemo(() => {
    if (!recordingNum) return null;
    return buildSpeaklyRecordingDisplayUrl(day.day, recordingNum);
  }, [day.day, recordingNum]);

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

  const handleCopy = async (url, key) => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setError('Could not copy link. Select and copy it manually.');
    }
  };

  if (!recording?.downloadUrl) return null;

  const assessmentSameAsRecording =
    shareUrl && recordingUrl && shareUrl === recordingUrl;

  return (
    <section className="card-speakly p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
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
        {recordingUrl && recordingDisplay && (
          <div className="rounded-xl bg-speakly-coral-light p-3">
            <p className="mb-2 text-sm font-semibold text-taskly-muted">Recording link</p>
            <a
              href={recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={recordingUrl}
              className="block truncate text-sm font-medium text-speakly-coral hover:underline"
            >
              {recordingDisplay}
            </a>
            <button
              type="button"
              onClick={() => handleCopy(recordingUrl, 'recording')}
              className="btn-speakly-secondary mt-3 w-full"
            >
              {copiedKey === 'recording' ? 'Copied!' : 'Copy recording link'}
            </button>
          </div>
        )}

        {shareUrl && !assessmentSameAsRecording && (
          <div className="rounded-xl bg-speakly-coral-light p-3">
            <p className="mb-2 text-sm font-semibold text-taskly-muted">Assessment link</p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={shareUrl}
              className="block truncate text-sm font-medium text-speakly-coral hover:underline"
            >
              {formatAssessLinkDisplay(shareUrl)}
            </a>
            <button
              type="button"
              onClick={() => handleCopy(shareUrl, 'assessment')}
              className="btn-speakly-secondary mt-3 w-full"
            >
              {copiedKey === 'assessment' ? 'Copied!' : 'Copy assessment link'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleShare}
          disabled={disabled || sharing || !recordingUrl}
          className="btn-speakly-primary w-full disabled:opacity-50"
        >
          {sharing
            ? 'Creating link…'
            : shareUrl
              ? 'Request assessment on this recording'
              : 'Share for assessment'}
        </button>
      </div>
    </section>
  );
}
