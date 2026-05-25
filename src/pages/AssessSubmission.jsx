import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import SpeaklyLogo from '../components/SpeaklyLogo';
import { db, isFirebaseConfigured } from '../firebase/config';
import {
  resolveSubmissionDocId,
  submitAssessmentReview,
} from '../lib/speechTrainingAssessments';

function formatDuration(ms) {
  if (!ms) return null;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const SUBMISSIONS_PATH = 'projects/speech-training/submissions';

export default function AssessSubmission() {
  const params = useParams();
  const submissionDocId = useMemo(
    () =>
      resolveSubmissionDocId({
        shareId: params.shareId,
        userCode: params.userCode,
        daySegment: params.daySegment,
        recordingSegment: params.recordingSegment,
      }),
    [params.shareId, params.userCode, params.daySegment, params.recordingSegment]
  );

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessorName, setAssessorName] = useState('');
  const [score, setScore] = useState(7);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured || !db) {
      setError('Firebase is not configured.');
      setLoading(false);
      return undefined;
    }

    if (!submissionDocId) {
      setError('This assessment link is invalid or has expired.');
      setLoading(false);
      return undefined;
    }

    const ref = doc(db, SUBMISSIONS_PATH, submissionDocId);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setError('This assessment link is invalid or has expired.');
          setSubmission(null);
        } else {
          const data = { id: snap.id, ...snap.data() };
          setSubmission(data);
          setError(null);
          if (data.status === 'reviewed') {
            setSubmitted(true);
          } else if (data.status === 'superseded') {
            setError('This link is no longer active. The student shared a newer recording.');
          }
        }
        setLoading(false);
      },
      () => {
        setError('Could not load submission.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [submissionDocId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const review = await submitAssessmentReview(submissionDocId, {
        score,
        comment,
        assessorName,
      });
      setSubmission((prev) => ({ ...prev, status: 'reviewed', review }));
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="speakly-app flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-6 font-speakly">
        <SpeaklyLogo variant="icon" size="lg" />
        <p className="text-lg text-taskly-muted">Loading submission…</p>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="speakly-app flex min-h-screen items-center justify-center bg-white p-6 font-speakly">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  const review = submission?.review;
  const isClosed =
    submission?.status === 'reviewed' ||
    submission?.status === 'superseded' ||
    submitted;

  return (
    <div className="speakly-app min-h-screen bg-white font-speakly text-taskly-ink">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <SpeaklyLogo variant="logo" size="md" className="mb-6" />
        <p className="text-sm font-semibold uppercase tracking-wider text-taskly-muted">
          Assessment
        </p>
        <h1 className="mt-2 text-4xl font-bold text-taskly-ink">
          Day {submission.dayNum}: {submission.dayTitle}
        </h1>
        <p className="mt-2 text-base text-taskly-muted">
          {submission.dayType} · {submission.duration}
        </p>

        <p className="mt-4 rounded-xl bg-taskly-surface px-4 py-3 text-sm text-taskly-muted">
          Only one assessor can submit a review on this link. If the student shared it with
          several people, the first submission closes it for everyone else.
        </p>

        <section className="mt-8 rounded-3xl bg-taskly-surface p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-taskly-muted">
            The exercise
          </h2>
          <p className="mt-2 text-base leading-relaxed">{submission.exercise}</p>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-card">
          <h2 className="text-sm font-bold uppercase tracking-wider text-taskly-ink">
            Student recording
          </h2>
          {submission.recording?.durationMs != null && (
            <p className="mt-1 text-sm text-taskly-muted">
              Duration: {formatDuration(submission.recording.durationMs)}
            </p>
          )}
          <audio
            controls
            src={submission.recording?.downloadUrl}
            className="mt-4 w-full"
            preload="metadata"
          >
            <track kind="captions" />
          </audio>
        </section>

        {isClosed && review ? (
          <section
            className={`mt-6 rounded-3xl p-6 ${
              review.requiresRedo
                ? 'border-2 border-red-300 bg-red-50'
                : 'border border-emerald-200 bg-emerald-50'
            }`}
          >
            <p className="text-sm font-bold uppercase tracking-wider">
              {review.requiresRedo ? 'Redo requested' : 'Review submitted'}
            </p>
            <p className="mt-2 text-base text-taskly-muted">
              Reviewed by <strong>{review.assessorName}</strong>
            </p>
            <p className="mt-2 text-lg">
              Score: <strong>{review.score}/10</strong>
            </p>
            {review.comment && (
              <p className="mt-3 text-base leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
            )}
            {review.requiresRedo && (
              <p className="mt-3 text-base font-semibold text-red-800">
                Scores below 5 automatically require the student to record again.
              </p>
            )}
          </section>
        ) : submission?.status === 'superseded' ? (
          <section className="mt-6 rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
            <p className="text-base text-taskly-muted">
              This link has been replaced by a newer recording from the student.
            </p>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 rounded-3xl bg-white p-6 shadow-card"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-taskly-ink">
              Your assessment
            </h2>

            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-base text-red-600">{error}</p>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-taskly-muted">Your name (optional)</span>
              <input
                type="text"
                value={assessorName}
                onChange={(e) => setAssessorName(e.target.value)}
                placeholder="Coach, teacher, mentor…"
                className="mt-2 w-full rounded-xl border border-taskly-border px-4 py-3 text-base outline-none focus:border-taskly-yellow"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-taskly-muted">
                Score (1–10, below 5 requires redo)
              </span>
              <div className="mt-3 flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="flex-1 accent-taskly-yellow"
                />
                <span className="w-12 text-center text-2xl font-bold">{score}</span>
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-taskly-muted">Feedback (optional)</span>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="What went well? What should they practice?"
                className="mt-2 w-full rounded-xl border border-taskly-border px-4 py-3 text-base outline-none focus:border-taskly-yellow"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-taskly-yellow py-3.5 text-base font-bold text-taskly-ink transition hover:brightness-95 disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
