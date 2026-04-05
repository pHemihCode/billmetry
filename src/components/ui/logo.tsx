// src/components/ui/Logo.tsx
// Use this everywhere instead of the text-based wordmark.
// <LogoIcon size={28} />          — just the icon (sidebar, favicon)
// <LogoFull width={160} />        — icon + wordmark (nav, auth pages)

interface LogoIconProps {
  size?: number
  className?: string
}

interface LogoFullProps {
  width?: number
  dark?: boolean  
  className?: string
}

// ── The icon mark ─────────────────────────────────────────────────────────────
// B letterform + rising metric bars — "Bill" + "Metry" in one mark

export function LogoIcon({ size = 32, className }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Blue rounded square background */}
      <rect width="44" height="44" rx="10" fill="#2563EB"/>

      {/* B letterform — vertical spine */}
      <rect x="11" y="10" width="5" height="24" rx="2" fill="white"/>
      {/* Top horizontal bar */}
      <rect x="15" y="10" width="10" height="4.5" rx="2" fill="white"/>
      {/* Middle horizontal bar */}
      <rect x="15" y="19.5" width="12" height="4" rx="2" fill="white"/>
      {/* Bottom horizontal bar */}
      <rect x="15" y="29.5" width="10" height="4.5" rx="2" fill="white"/>
      {/* Top curve cap (right of B) */}
      <rect x="23" y="10" width="4" height="8" rx="2" fill="white"/>
      {/* Bottom curve cap (right of B) */}
      <rect x="23" y="29" width="4" height="9" rx="2" fill="white"/>

      {/* Rising metric bars — the "Metry" part */}
      <rect x="29" y="28" width="4" height="6"  rx="1.5" fill="rgba(255,255,255,0.35)"/>
      <rect x="34" y="22" width="4" height="12" rx="1.5" fill="rgba(255,255,255,0.6)"/>

    </svg>
  )
}

// ── Full wordmark (icon + text) ───────────────────────────────────────────────

export function LogoFull({ width = 180, dark = true, className }: LogoFullProps) {
  const wordColor   = dark ? 'white'   : '#0F172A'
  const metryColor  = dark ? '#60A5FA' : '#2563EB'

  // Proportional height based on icon being 44px tall at the base scale
  const scale  = width / 220
  const height = Math.round(44 * scale)

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 220 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Icon mark */}
      <rect width="44" height="44" rx="10" fill="#2563EB"/>
      <rect x="11" y="10" width="5"  height="24"  rx="2"   fill="white"/>
      <rect x="15" y="10" width="10" height="4.5" rx="2"   fill="white"/>
      <rect x="15" y="19.5" width="12" height="4" rx="2"   fill="white"/>
      <rect x="15" y="29.5" width="10" height="4.5" rx="2" fill="white"/>
      <rect x="23" y="10" width="4" height="8"  rx="2"     fill="white"/>
      <rect x="23" y="29" width="4" height="9"  rx="2"     fill="white"/>
      <rect x="29" y="28" width="4" height="6"  rx="1.5"   fill="rgba(255,255,255,0.35)"/>
      <rect x="34" y="22" width="4" height="12" rx="1.5"   fill="rgba(255,255,255,0.6)"/>
      

      {/* Wordmark */}
      <text
        x="54" y="29"
        fontFamily="Georgia, serif"
        fontSize="22"
        fontWeight="700"
        fill={wordColor}
        letterSpacing="-0.5"
      >
        Bill
      </text>
      <text
        x="95" y="29"
        fontFamily="Georgia, serif"
        fontSize="22"
        fontWeight="400"
        fill={metryColor}
        letterSpacing="-0.5"
      >
        Metry
      </text>
    </svg>
  )
}