export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="37" height="37" rx="9" fill="#0b1c31" />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      {/* hexagonal cell */}
      <path
        d="M20 7.5 30 13.25 30 24.75 20 30.5 10 24.75 10 13.25 Z"
        stroke="#38bdf8"
        strokeWidth="1.4"
        fill="rgba(56,189,248,0.08)"
      />
      {/* atoms */}
      <circle cx="20" cy="19" r="2.6" fill="#7dd3fc" />
      <circle cx="20" cy="19" r="0.7" fill="#0b1c31" />
      <circle cx="10" cy="13.25" r="1.6" fill="#f8fafc" />
      <circle cx="30" cy="13.25" r="1.6" fill="#f8fafc" />
      <circle cx="10" cy="24.75" r="1.6" fill="#f8fafc" />
      <circle cx="30" cy="24.75" r="1.6" fill="#f8fafc" />
      {/* central vertical bonds */}
      <line
        x1="20"
        y1="16.4"
        x2="20"
        y2="21.6"
        stroke="#38bdf8"
        strokeWidth="0.8"
        opacity="0.6"
      />
    </svg>
  );
}
