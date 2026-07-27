export function StarIcon({ className = "w-4 h-4", filled = true }) {
  return (
    <svg
      viewBox='0 0 20 20'
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke='currentColor'
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden
    >
      <path d='M10 1.5l2.46 5.18 5.54.7-4.06 3.9.98 5.6L10 14.9l-4.92 2.98.98-5.6-4.06-3.9 5.54-.7z' />
    </svg>
  );
}

/** Read-only star display for an average rating (1–5) plus optional review count. */
export function StarRatingDisplay({ average, count, size = "w-4 h-4" }) {
  const rounded = Math.round(average);
  return (
    <div
      className='flex items-center gap-1.5'
      role='img'
      aria-label={`${average.toFixed(1)} out of 5 stars${
        count != null ? ` from ${count} rating${count === 1 ? "" : "s"}` : ""
      }`}
    >
      <div className='flex text-persona-purple'>
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon key={i} filled={i <= rounded} className={size} />
        ))}
      </div>
      <span className='text-xs font-bold text-persona-ink'>{average.toFixed(1)}</span>
      {count != null && (
        <span className='text-xs text-persona-muted'>
          ({count})
        </span>
      )}
    </div>
  );
}
