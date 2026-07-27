export default function StreakBadge({ current, longest }) {
  return (
    <div className='flex items-center gap-3 px-5 py-3 bg-white border rounded-2xl shadow-soft border-persona-border'>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-xl bg-persona-lavender text-xl ${
          current > 0 ? "task-glow" : ""
        }`}
      >
        🔥
      </span>
      <div>
        <p className='text-lg font-bold leading-none text-persona-ink'>
          {current} day{current === 1 ? "" : "s"}
        </p>
        <p className='mt-1 text-xs text-persona-muted'>
          {longest > current ? `Best streak: ${longest} days` : "Current streak"}
        </p>
      </div>
    </div>
  );
}
