import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

const STATUS_STYLES = {
  locked: "border-dashed border-persona-border bg-persona-surface/50 opacity-70",
  actionable: "border-persona-purple bg-white shadow-[0_8px_30px_rgba(14,174,110,0.15)] task-glow",
  submitted: "border-persona-lavender-deep bg-persona-lavender/40",
  complete: "border-persona-border bg-white",
};

const STATUS_BADGES = {
  locked: { label: "Locked", className: "bg-persona-surface text-persona-muted" },
  actionable: { label: "Up next", className: "bg-persona-purple text-white" },
  submitted: { label: "Pending review", className: "bg-persona-lavender text-persona-purple-dark" },
  complete: { label: "Reviewed", className: "bg-green-50 text-green-700" },
};

function StatusIcon({ status, day }) {
  if (status === "complete" || status === "submitted") {
    return (
      <span className='flex items-center justify-center w-9 h-9 text-white rounded-full shrink-0 bg-persona-purple'>
        ✓
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className='flex items-center justify-center text-sm border rounded-full shrink-0 h-9 w-9 border-persona-border text-persona-muted'>
        🔒
      </span>
    );
  }
  return (
    <span className='flex items-center justify-center text-sm font-bold border-2 rounded-full shrink-0 h-9 w-9 border-persona-purple text-persona-purple'>
      {day}
    </span>
  );
}

export default function TaskCard({ task, status, index = 0, onClick, statusLabel }) {
  const [ref, visible] = useRevealOnScroll({ threshold: 0.05 });
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.locked;

  return (
    <li ref={ref}>
      <button
        type='button'
        onClick={onClick}
        className={`task-card ${visible ? "task-card-in" : "opacity-0"} flex h-full w-full flex-col items-start gap-3 rounded-3xl border-2 p-5 text-left ${STATUS_STYLES[status] ?? STATUS_STYLES.locked}`}
        style={{ animationDelay: visible ? `${Math.min(index, 10) * 0.05}s` : undefined }}
      >
        <div className='flex items-start justify-between w-full gap-3'>
          <p className='text-xs font-bold uppercase tracking-wide text-persona-muted'>
            Day {task.day}
          </p>
          <StatusIcon status={status} day={task.day} />
        </div>
        <h3 className='text-base font-bold leading-snug text-persona-ink'>{task.title}</h3>
        <p className='text-sm leading-relaxed text-persona-muted line-clamp-2'>
          {task.description}
        </p>
        <span
          className={`mt-auto rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.className}`}
        >
          {statusLabel ?? badge.label}
        </span>
      </button>
    </li>
  );
}
