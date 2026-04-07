export default function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="10" fill="#2563EB"/>
      <rect x="11" y="10" width="5" height="24" rx="2" fill="white"/>
      <rect x="15" y="10" width="10" height="4.5" rx="2" fill="white"/>
      <rect x="15" y="19.5" width="12" height="4" rx="2" fill="white"/>
      <rect x="15" y="29.5" width="10" height="4.5" rx="2" fill="white"/>
      <rect x="23" y="10" width="4" height="8" rx="2" fill="white"/>
      <rect x="23" y="29" width="4" height="9" rx="2" fill="white"/>
      <rect x="29" y="28" width="4" height="6" rx="1.5" fill="rgba(255,255,255,0.38)"/>
      <rect x="34" y="22" width="4" height="12" rx="1.5" fill="rgba(255,255,255,0.65)"/>
      <rect x="39" y="16" width="4" height="18" rx="1.5" fill="white"/>
    </svg>
  )
}