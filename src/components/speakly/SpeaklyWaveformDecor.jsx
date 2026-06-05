export default function SpeaklyWaveformDecor({ className = '' }) {
  return (
    <svg
      className={`h-16 w-auto opacity-50 ${className}`}
      viewBox="0 0 400 48"
      fill="none"
      aria-hidden
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
        <rect
          key={i}
          x={i * 28 + 8}
          y={24 - (8 + (i % 5) * 4)}
          width="6"
          height={16 + (i % 5) * 8}
          rx="3"
          fill="currentColor"
          className="text-speakly-coral"
        />
      ))}
    </svg>
  );
}
