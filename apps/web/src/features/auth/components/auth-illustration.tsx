/**
 * Decorative auth illustration (custom, brand-themed). A stand-in for the
 * licensed isometric artwork — a tilted analytics dashboard with floating cards.
 */
export function AuthIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 420"
      className={className}
      fill="none"
      role="img"
      aria-label="Rocket analytics dashboard"
    >
      {/* Decorative blobs on the panel */}
      <circle cx="70" cy="80" r="46" fill="#ffffff" opacity="0.08" />
      <circle cx="420" cy="360" r="60" fill="#ffffff" opacity="0.06" />
      <circle cx="430" cy="70" r="10" fill="#ffffff" opacity="0.25" />
      <circle cx="60" cy="330" r="7" fill="#ffffff" opacity="0.25" />
      <circle cx="400" cy="200" r="5" fill="#F7A35C" opacity="0.9" />

      {/* Ground shadow */}
      <ellipse cx="248" cy="372" rx="170" ry="22" fill="#000000" opacity="0.12" />

      <g transform="rotate(-6 248 210)">
        {/* Main dashboard window */}
        <rect x="96" y="70" width="304" height="212" rx="16" fill="#ffffff" />
        <rect x="96" y="70" width="304" height="40" rx="16" fill="#ffffff" />
        <rect x="96" y="96" width="304" height="14" fill="#ffffff" />
        <circle cx="118" cy="90" r="4" fill="#F7A35C" />
        <circle cx="132" cy="90" r="4" fill="#DADFF7" />
        <circle cx="146" cy="90" r="4" fill="#DADFF7" />
        <line x1="96" y1="110" x2="400" y2="110" stroke="#EEF1FF" strokeWidth="2" />

        {/* Sidebar */}
        <rect x="96" y="110" width="56" height="172" fill="#F5F7FF" />
        <rect x="112" y="128" width="24" height="7" rx="3.5" fill="#3E4DF5" />
        <rect x="112" y="148" width="24" height="7" rx="3.5" fill="#C9CFF3" />
        <rect x="112" y="168" width="24" height="7" rx="3.5" fill="#C9CFF3" />
        <rect x="112" y="188" width="24" height="7" rx="3.5" fill="#C9CFF3" />

        {/* Stat chips */}
        <rect x="168" y="126" width="100" height="40" rx="8" fill="#EEF1FF" />
        <rect x="180" y="137" width="40" height="7" rx="3.5" fill="#3E4DF5" />
        <rect x="180" y="150" width="24" height="6" rx="3" fill="#B9C1EE" />
        <rect x="284" y="126" width="100" height="40" rx="8" fill="#FDEEE0" />
        <rect x="296" y="137" width="40" height="7" rx="3.5" fill="#F7A35C" />
        <rect x="296" y="150" width="24" height="6" rx="3" fill="#F2C9A3" />

        {/* Bar chart */}
        <rect x="168" y="182" width="124" height="86" rx="8" fill="#F9FAFF" />
        <rect x="184" y="236" width="12" height="20" rx="4" fill="#C9CFF3" />
        <rect x="206" y="222" width="12" height="34" rx="4" fill="#3E4DF5" />
        <rect x="228" y="212" width="12" height="44" rx="4" fill="#C9CFF3" />
        <rect x="250" y="226" width="12" height="30" rx="4" fill="#3E4DF5" />
        <rect x="272" y="204" width="12" height="52" rx="4" fill="#F7A35C" />

        {/* Donut */}
        <rect x="300" y="182" width="84" height="86" rx="8" fill="#F9FAFF" />
        <circle
          cx="342"
          cy="225"
          r="24"
          fill="none"
          stroke="#EEF1FF"
          strokeWidth="8"
        />
        <circle
          cx="342"
          cy="225"
          r="24"
          fill="none"
          stroke="#3E4DF5"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="110 150"
          transform="rotate(-90 342 225)"
        />
        <circle
          cx="342"
          cy="225"
          r="24"
          fill="none"
          stroke="#F7A35C"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="38 150"
          strokeDashoffset="-112"
          transform="rotate(-90 342 225)"
        />
      </g>

      {/* Floating line-chart card */}
      <g transform="rotate(-6 248 210)">
        <rect
          x="320"
          y="286"
          width="120"
          height="72"
          rx="12"
          fill="#ffffff"
        />
        <path
          d="M334 338 L354 322 L372 330 L392 306 L414 314"
          stroke="#F7A35C"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="414" cy="314" r="3.5" fill="#F7A35C" />
        <rect x="334" y="300" width="36" height="6" rx="3" fill="#E7EAF5" />
      </g>

      {/* Floating KPI card */}
      <g transform="rotate(-6 248 210)">
        <rect x="60" y="238" width="96" height="60" rx="12" fill="#3E4DF5" />
        <rect x="74" y="252" width="40" height="7" rx="3.5" fill="#ffffff" opacity="0.9" />
        <rect x="74" y="266" width="56" height="12" rx="4" fill="#ffffff" />
        <path
          d="M128 270 l8 -8 l0 8 z"
          fill="#9FE6B8"
        />
      </g>
    </svg>
  );
}
