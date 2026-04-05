export default function Logo({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  // Proportions tuned for optical balance — gem slightly smaller than cap height,
  // separator 60% of text height, gap tighter on small to feel cohesive
  const dimensions = {
    small: { gem: 17, text: 'text-[17px]', gap: 'gap-[5px]', sepH: 13, sepGap: 'gap-[5px]' },
    default: { gem: 24, text: 'text-[24px]', gap: 'gap-[8px]', sepH: 18, sepGap: 'gap-[8px]' },
    large: { gem: 30, text: 'text-[30px]', gap: 'gap-[10px]', sepH: 22, sepGap: 'gap-[10px]' },
  }

  const d = dimensions[size]

  return (
    <span className={`inline-flex items-center ${d.gap}`}>
      {/* ◆ Diamond mark — rotated square with 3-facet depth system */}
      <svg
        width={d.gem}
        height={d.gem}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <defs>
          <linearGradient id="rl-left" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
          <linearGradient id="rl-right" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
        </defs>

        {/* Base diamond — full shape in mid-ruby */}
        <path d="M20 2L38 20L20 38L2 20Z" fill="#be123c" />

        {/* Left facet — lighter gradient for light-source effect */}
        <path d="M20 2L2 20L20 38Z" fill="url(#rl-left)" />

        {/* Right facet — darker gradient for shadow side */}
        <path d="M20 2L38 20L20 38Z" fill="url(#rl-right)" />

        {/* Top-left highlight — simulates light catch on gem surface */}
        <path d="M20 2L2 20L20 20Z" fill="#f43f5e" opacity="0.25" />

        {/* Inner facet table — subtle geometric detail */}
        <path
          d="M20 9L11 20L20 31L29 20Z"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.5"
          opacity="0.15"
        />

        {/* Crown sparkle — tiny highlight near top */}
        <path d="M17 11L20 5L23 11Z" fill="#ffffff" opacity="0.1" />
      </svg>

      {/* Separator — 1px vertical rule, fades at top and bottom */}
      <span
        className="block flex-shrink-0"
        style={{
          width: 1,
          height: d.sepH,
          background: 'linear-gradient(180deg, transparent 0%, #d4d4d4 30%, #d4d4d4 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Wordmark — DM Serif Display via font-serif class
          "Ruby" in near-black for authority, "Law" in ruby red for brand identity.
          Negative letter-spacing for a tight, premium logotype feel.
          Font-weight 600 (semibold) avoids the heaviness of bold on serif faces. */}
      <span
        className={`font-serif ${d.text} leading-none`}
        style={{
          fontWeight: 600,
          letterSpacing: '-0.025em',
        }}
      >
        <span style={{ color: '#18181b' }}>Ruby</span>
        <span style={{ color: '#be123c', marginLeft: '0.03em' }}>Law</span>
      </span>
    </span>
  )
}
