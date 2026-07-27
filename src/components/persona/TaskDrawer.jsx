/** Generic slide-in detail panel shared by every skill's task board. */
export default function TaskDrawer({ title, eyebrow, badge, onClose, children }) {
  return (
    <>
      <div
        className='fixed inset-0 z-40 task-backdrop bg-persona-ink/40'
        onClick={onClose}
        aria-hidden
      />
      <aside
        className='fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col overflow-y-auto border-l border-persona-border bg-white shadow-2xl task-drawer-panel'
        role='dialog'
        aria-label={`${title} details`}
      >
        <div className='flex items-start justify-between gap-4 p-6 border-b border-persona-border'>
          <div>
            {eyebrow && (
              <p className='text-xs font-bold uppercase tracking-wide text-persona-purple'>
                {eyebrow}
              </p>
            )}
            <h2 className='mt-1 text-xl font-bold text-persona-ink'>{title}</h2>
            {badge}
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close details'
            className='flex items-center justify-center w-8 h-8 text-lg transition rounded-full shrink-0 text-persona-muted hover:bg-persona-surface'
          >
            ×
          </button>
        </div>

        <div className='flex-1 p-6 space-y-6'>{children}</div>
      </aside>
    </>
  );
}
