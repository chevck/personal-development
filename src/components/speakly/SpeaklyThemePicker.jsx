import { THEME_PALETTE } from '../../config/themePalette';

export default function SpeaklyThemePicker({ themeId, onChange, disabled = false }) {
  return (
    <section>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">
        Accent colour
      </p>
      <div className="flex flex-wrap gap-2">
        {THEME_PALETTE.map((theme) => {
          const selected = themeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(theme.id)}
              aria-label={theme.label}
              aria-pressed={selected}
              title={theme.label}
              className={`h-8 w-8 rounded-full border-2 transition disabled:opacity-50 ${
                selected
                  ? 'scale-110 border-white shadow-[0_0_0_2px_rgba(255,255,255,0.35)]'
                  : 'border-white/25 hover:border-white/60'
              }`}
              style={{ backgroundColor: `rgb(${theme.brand})` }}
            />
          );
        })}
      </div>
    </section>
  );
}
