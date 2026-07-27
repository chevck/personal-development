import { useEffect, useState } from "react";

/** Animated completion ring—fills from 0 to `value` on mount. */
export default function ProgressRing({ value = 0, size = 56, stroke = 5 }) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(value));
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className='-rotate-90'
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='currentColor'
        className='text-persona-border'
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill='none'
        stroke='currentColor'
        className='text-persona-purple task-ring-fill'
        strokeWidth={stroke}
        strokeLinecap='round'
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
