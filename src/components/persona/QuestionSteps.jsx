import { useState } from "react";

export const inputClassName =
  "mt-1.5 w-full rounded-2xl border-0 bg-white px-4 py-3.5 text-base text-persona-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] outline-none ring-1 ring-persona-lavender-deep transition focus:ring-2 focus:ring-persona-purple";

export function FieldLabel({ children, required }) {
  return (
    <span className='text-sm font-bold text-persona-ink'>
      {children}
      {required && <span className='text-red-500'> *</span>}
    </span>
  );
}

export function toggleInList(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function Pill({ option, selected, onToggle, delay }) {
  const [popping, setPopping] = useState(false);

  function handleClick() {
    if (!selected) setPopping(true);
    onToggle(option.id);
  }

  return (
    <span
      className='inline-flex pill-in-wrap'
      style={{ animationDelay: `${delay}s` }}
    >
      <button
        type='button'
        aria-pressed={selected}
        onClick={handleClick}
        onAnimationEnd={() => setPopping(false)}
        className={`pill ${selected ? "pill-selected" : "pill-idle"} ${
          popping && selected ? "pill-pop" : ""
        }`}
      >
        <span
          className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] transition ${
            selected
              ? "border-white bg-white/20 text-white"
              : "border-persona-lavender-deep text-transparent"
          }`}
          aria-hidden
        >
          ✓
        </span>
        {option.label}
      </button>
    </span>
  );
}

export function PillGroup({ options, values, onToggle }) {
  return (
    <div className='flex flex-wrap gap-2.5'>
      {options.map((option, index) => (
        <Pill
          key={option.id}
          option={option}
          selected={values.includes(option.id)}
          onToggle={onToggle}
          delay={index * 0.03}
        />
      ))}
    </div>
  );
}

export function OtherField({ show, label, value, onChange }) {
  if (!show) return null;
  return (
    <label className='block mt-4 step-in'>
      <FieldLabel required>{label}</FieldLabel>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Tell us in a few words…'
        className={inputClassName}
        autoFocus
      />
    </label>
  );
}

export function StepProgress({ current, total }) {
  return (
    <div className='mb-8'>
      <div className='flex items-center justify-between text-xs font-semibold text-persona-muted'>
        <span>
          Step {current + 1} of {total}
        </span>
        <span>{Math.round(((current + 1) / total) * 100)}%</span>
      </div>
      <div className='mt-2 flex gap-1.5'>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= current ? "bg-persona-purple" : "bg-persona-lavender-deep/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
