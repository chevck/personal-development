export default function AssessmentFeedback({ assessment }) {
  if (!assessment) return null;

  const {
    status,
    latestScore,
    latestComment,
    latestReviewedAt,
    assessorName,
    requiresRedo,
  } = assessment;

  if (status === 'awaiting_share') {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-amber-800">
          Recording saved — share for review
        </p>
        <p className="mt-2 text-base text-amber-900/80">
          Your recording is saved but this day is not complete yet. Copy your link below and send
          it to an assessor — they can listen and review from the same URL. You need a score of 5
          or above to complete the day.
        </p>
      </section>
    );
  }

  if (status === 'pending_review') {
    return (
      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-sky-800">
          Awaiting assessment
        </p>
        <p className="mt-2 text-base text-sky-900/80">
          Your recording has been shared. Only one assessor can review this link. Waiting for their
          score — you need 5 or above to complete the day.
        </p>
      </section>
    );
  }

  if (status === 'redo_required' || requiresRedo) {
    return (
      <section className="rounded-2xl border-2 border-red-300 bg-red-50 p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-red-700">
          Redo required
        </p>
        <p className="mt-2 text-base text-red-900/90">
          Score: <strong>{latestScore}/10</strong>
          {assessorName ? ` · from ${assessorName}` : ''}
        </p>
        {latestComment && (
          <p className="mt-3 rounded-xl bg-white/70 p-3 text-base leading-relaxed text-red-900/80">
            &ldquo;{latestComment}&rdquo;
          </p>
        )}
        <p className="mt-3 text-base font-semibold text-red-800">
          Scores below 5 require a new recording. Record again and share when ready.
        </p>
        {latestReviewedAt && (
          <p className="mt-2 text-sm text-red-700/70">
            Reviewed {new Date(latestReviewedAt).toLocaleString()}
          </p>
        )}
      </section>
    );
  }

  if (status === 'approved' || latestScore != null) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-emerald-800">
          Assessment passed
        </p>
        <p className="mt-2 text-base text-emerald-900/90">
          Score: <strong>{latestScore}/10</strong>
          {assessorName ? ` · from ${assessorName}` : ''}
        </p>
        {latestComment && (
          <p className="mt-3 rounded-xl bg-white/70 p-3 text-base leading-relaxed text-emerald-900/80">
            &ldquo;{latestComment}&rdquo;
          </p>
        )}
        {latestReviewedAt && (
          <p className="mt-2 text-sm text-emerald-700/70">
            Reviewed {new Date(latestReviewedAt).toLocaleString()}
          </p>
        )}
      </section>
    );
  }

  return null;
}
