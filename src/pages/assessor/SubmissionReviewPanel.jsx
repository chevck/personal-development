import { useRef, useState } from "react";
import { reviewSkillSubmission } from "../../lib/personaSkillProgress";
import { showErrorToast } from "../../lib/toast";

const STATUS_LABEL = {
  pending: "Awaiting your review",
  approved: "Approved",
  changes_requested: "Changes requested",
};

export default function SubmissionReviewPanel({ learner, task, onReviewed }) {
  const { submission } = task;
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(null);
  const reviewStartedAt = useRef(Date.now());

  async function handleDecision(outcome) {
    setSubmitting(outcome);
    try {
      const reviewDurationSeconds = Math.round((Date.now() - reviewStartedAt.current) / 1000);
      await reviewSkillSubmission(learner.uid, learner.skillId, task.day, {
        outcome,
        comment: comment.trim(),
        reviewDurationSeconds,
      });
      onReviewed();
    } catch (err) {
      showErrorToast(err.message || "Couldn't submit your review—try again.");
      setSubmitting(null);
    }
  }

  const isPending = submission.status === "pending";

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-bold text-persona-ink'>{learner.answers?.name || "Learner"}</p>
          <p className='text-xs text-persona-muted'>Day {task.day} · {task.title}</p>
        </div>
        <span className='rounded-full bg-persona-lavender px-3 py-1 text-xs font-bold text-persona-purple-dark'>
          {STATUS_LABEL[submission.status] || submission.status}
        </span>
      </div>

      {submission.link && (
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wide text-persona-muted'>Link</h3>
          <a
            href={submission.link}
            target='_blank'
            rel='noreferrer'
            className='block mt-1 text-sm font-semibold break-all text-persona-purple hover:underline'
          >
            {submission.link}
          </a>
        </div>
      )}

      {submission.imageUrls?.length > 0 && (
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wide text-persona-muted'>Images</h3>
          <div className='flex flex-wrap gap-3 mt-2'>
            {submission.imageUrls.map((url) => (
              <a key={url} href={url} target='_blank' rel='noreferrer'>
                <img
                  src={url}
                  alt=''
                  className='object-cover w-24 h-24 border rounded-xl border-persona-border'
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {submission.note && (
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wide text-persona-muted'>
            Learner&apos;s note
          </h3>
          <p className='mt-1 text-sm leading-relaxed text-persona-ink'>{submission.note}</p>
        </div>
      )}

      {isPending ? (
        <div className='pt-2 space-y-4 border-t border-persona-border'>
          <label className='block'>
            <span className='text-sm font-bold text-persona-ink'>Feedback (optional)</span>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='What should they know?'
              className='mt-1.5 w-full resize-y rounded-2xl border-0 bg-white px-4 py-3 text-sm text-persona-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-persona-lavender-deep transition focus:ring-2 focus:ring-persona-purple'
            />
          </label>

          <div className='flex gap-3'>
            <button
              type='button'
              onClick={() => handleDecision("changes_requested")}
              disabled={submitting !== null}
              className='flex-1 py-3 text-sm font-bold transition bg-white border-2 rounded-2xl border-persona-lavender-deep text-persona-purple-dark hover:border-persona-purple disabled:opacity-60'
            >
              {submitting === "changes_requested" ? "Sending…" : "Request changes"}
            </button>
            <button
              type='button'
              onClick={() => handleDecision("approved")}
              disabled={submitting !== null}
              className='flex-1 py-3 text-sm font-bold text-white transition rounded-2xl bg-persona-purple hover:bg-persona-purple-hover disabled:opacity-60'
            >
              {submitting === "approved" ? "Approving…" : "Approve"}
            </button>
          </div>
        </div>
      ) : (
        <div className='pt-2 border-t border-persona-border'>
          {submission.reviewComment && (
            <>
              <h3 className='text-xs font-bold uppercase tracking-wide text-persona-muted'>
                Your feedback
              </h3>
              <p className='mt-1 text-sm leading-relaxed text-persona-ink'>
                {submission.reviewComment}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
