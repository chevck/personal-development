import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import AppLogo from '../components/AppLogo';
import RecordingPlayer from '../components/RecordingPlayer';
import SpeaklyWaveformDecor from '../components/speakly/SpeaklyWaveformDecor';
import { SPEECH_TRAINING_PROJECT_ID } from '../config/projects';
import { db, isFirebaseConfigured } from '../firebase/config';
import {
  resolveSubmissionDocId,
  submissionAcceptsReview,
  submitAssessmentReview,
} from '../lib/speechTrainingAssessments';

const inputClassName =
  'mt-2 w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-base text-speakly-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-speakly-coral-ring/80 transition focus:ring-2 focus:ring-speakly-coral';

function formatDuration(ms) {
  if (!ms) return null;
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function LearnerContextSection({ submission }) {
  const reasons = Array.isArray(submission?.learnerReasons)
    ? submission.learnerReasons.filter(Boolean)
    : [];
  const contexts = Array.isArray(submission?.learnerSpeakingContexts)
    ? submission.learnerSpeakingContexts.filter(Boolean)
    : [];

  if (reasons.length === 0 && contexts.length === 0) return null;

  return (
    <section className="space-y-4 rounded-2xl border border-speakly-coral-ring bg-white p-4 sm:p-5">
      {reasons.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
            Why they&apos;re using Speakly
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-full bg-speakly-coral-light px-3 py-1.5 text-sm font-medium text-speakly-coral-dark"
              >
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {contexts.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
            Where they want to speak better
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {contexts.map((context) => (
              <li
                key={context}
                className="rounded-full bg-speakly-coral-light px-3 py-1.5 text-sm font-medium text-speakly-coral-dark"
              >
                {context}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-taskly-muted">
        Context from the learner — use this to tailor your feedback.
      </p>
    </section>
  );
}

const SUBMISSIONS_PATH = 'projects/speech-training/submissions';

export default function AssessSubmission() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const submissionDocId = useMemo(
    () =>
      resolveSubmissionDocId({
        shareId: params.shareId,
        userCode: params.userCode,
        daySegment: params.daySegment,
        recordingSegment: params.recordingSegment,
        recordingNum: params.recordingNum,
        shareCode: searchParams.get('c'),
      }),
    [
      params.shareId,
      params.userCode,
      params.daySegment,
      params.recordingSegment,
      params.recordingNum,
      searchParams,
    ],
  );

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assessorName, setAssessorName] = useState('');
  const [score, setScore] = useState(null);
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
      },
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
      <div className="speakly-app flex min-h-screen flex-col items-center justify-center gap-5 bg-gradient-to-b from-speakly-coral-light via-white to-speakly-coral-muted/40 p-6 font-speakly">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span
            className="app-loader-ring absolute inset-0 rounded-[1.4rem] border-2 border-speakly-coral/50"
            aria-hidden
          />
          <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="icon" size="lg" />
        </div>
        <p className="text-base font-semibold text-taskly-muted">Loading submission…</p>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="speakly-app flex min-h-screen items-center justify-center bg-gradient-to-b from-speakly-coral-light via-white to-speakly-coral-muted/40 p-6 font-speakly">
        <div className="card-speakly max-w-md p-8 text-center">
          <p className="text-lg text-red-600">{error}</p>
          <Link
            to="/speakly/welcome"
            className="btn-speakly-primary mt-6 inline-flex"
          >
            About Speakly
          </Link>
        </div>
      </div>
    );
  }

  const review = submission?.review;
  const isClosed =
    submission?.status === 'reviewed' || submission?.status === 'superseded' || submitted;
  const isScoreSelected = Number.isFinite(score);
  const attemptLabel =
    submission?.recordingNum > 1 ? ` · Attempt ${submission.recordingNum}` : '';
  const acceptsReview = submissionAcceptsReview(submission);

  return (
    <div className="speakly-app min-h-screen bg-gradient-to-b from-speakly-coral-light via-white to-speakly-coral-muted/40 font-speakly text-speakly-ink">
      <header className="border-b border-speakly-coral-ring/40 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 sm:gap-4">
          <AppLogo projectId={SPEECH_TRAINING_PROJECT_ID} variant="logo" size="md" linkTo="/" />
          <Link
            to="/speakly/welcome"
            className="shrink-0 text-xs font-semibold text-taskly-muted hover:text-speakly-coral sm:text-sm"
          >
            About Speakly
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="dash-in card-speakly overflow-hidden">
          <div className="bg-gradient-to-br from-speakly-coral to-speakly-coral-dark p-5 text-white sm:p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80 sm:text-sm">
              Speakly practice review
            </p>
            <h1 className="font-display mt-2 text-2xl font-normal tracking-tight sm:text-3xl md:text-4xl">
              Day {submission.dayNum}: {submission.dayTitle}
            </h1>
            <p className="mt-2 text-sm text-white/85 sm:text-base">
              {submission.dayType} · {submission.duration}
              {attemptLabel}
            </p>
            {submission.learnerName && (
              <p className="mt-3 text-sm text-white/90 sm:text-base">
                From <strong>{submission.learnerName}</strong>
              </p>
            )}
          </div>

          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 md:p-8">
            <p className="rounded-2xl bg-speakly-coral-light px-4 py-3 text-sm text-speakly-coral-dark">
              Listen to the recording below, then submit your assessment. Only one assessor can
              review this link — the first submission closes it for everyone else.
            </p>

            <LearnerContextSection submission={submission} />

            {submission.description && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
                  Today&apos;s practice
                </h2>
                <p className="mt-2 text-base leading-relaxed text-speakly-ink/90">
                  {submission.description}
                </p>
              </section>
            )}

            <section className="rounded-2xl bg-speakly-coral-light p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
                The exercise
              </h2>
              <p className="mt-2 text-base leading-relaxed text-speakly-ink/90">
                {submission.exercise}
              </p>
            </section>

            <section className="card-speakly border p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
                Student recording
              </h2>
              {submission.recording?.durationMs != null && (
                <p className="mt-1 text-sm text-taskly-muted">
                  Duration: {formatDuration(submission.recording.durationMs)}
                </p>
              )}
              <RecordingPlayer
                className="mt-4"
                src={submission.recording?.downloadUrl}
                mimeType={submission.recording?.mimeType}
                autoPlay
              />
            </section>

            {isClosed && review ? (
              <section
                className={`rounded-2xl p-6 ${
                  review.requiresRedo
                    ? 'border-2 border-red-300 bg-red-50'
                    : 'border-2 border-emerald-200 bg-emerald-50'
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
                    Scores below 5 require the student to record again.
                  </p>
                )}
              </section>
            ) : submission?.status === 'superseded' ? (
              <section className="rounded-2xl border-2 border-speakly-coral-ring bg-white p-6">
                <p className="text-base text-taskly-muted">
                  This link has been replaced by a newer recording from the student.
                </p>
              </section>
            ) : acceptsReview ? (
              <form onSubmit={handleSubmit} className="space-y-6 border-t border-speakly-coral-ring/50 pt-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-speakly-coral-dark">
                  Your assessment
                </h2>

                {error && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <label className="block">
                  <span className="text-sm font-bold text-speakly-ink">Your name (optional)</span>
                  <input
                    type="text"
                    value={assessorName}
                    onChange={(e) => setAssessorName(e.target.value)}
                    placeholder="Coach, teacher, mentor…"
                    className={inputClassName}
                  />
                </label>

                <div>
                  <span className="text-sm font-bold text-speakly-ink">Score (1–10)</span>
                  <p className="mt-1 text-sm text-taskly-muted">
                    Scores below 5 require the student to record again.
                  </p>
                  <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                      const selected = score === n;
                      const isRedo = n < 5;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setScore(n)}
                          className={`flex h-11 items-center justify-center rounded-2xl text-base font-bold tabular-nums transition ${
                            selected
                              ? isRedo
                                ? 'bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,0.35)]'
                                : n === 5
                                  ? 'bg-amber-400 text-speakly-ink shadow-[0_4px_12px_rgba(251,191,36,0.35)]'
                                  : 'bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)]'
                              : 'border-2 border-speakly-coral-ring bg-white text-speakly-ink hover:border-speakly-coral hover:bg-speakly-coral-light'
                          }`}
                          aria-pressed={selected}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-bold text-speakly-ink">Feedback (optional)</span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="What went well? What should they practice?"
                    className={`${inputClassName} resize-y`}
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting || !isScoreSelected}
                  className="btn-speakly-primary w-full disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit review'}
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <SpeaklyWaveformDecor className="w-full max-w-xs opacity-40" />
          <p className="text-xs text-taskly-muted">Speak With Intention · Provn</p>
        </div>
      </main>
    </div>
  );
}
