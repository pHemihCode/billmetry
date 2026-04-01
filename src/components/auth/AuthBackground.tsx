export default function AuthBackground() {
  return (
    <>
      {/* Aurora blob */}
      <div
        className="auth-aurora absolute pointer-events-none"
        style={{
          top: '40%', left: '50%',
          width: '700px', height: '550px',
          background: 'conic-gradient(from 0deg, rgba(29,78,216,0.2), rgba(96,165,250,0.1), rgba(37,99,235,0.16), rgba(99,102,241,0.08), rgba(29,78,216,0.2))',
          filter: 'blur(80px)',
          borderRadius: '42% 58% 52% 48% / 48% 52% 60% 40%',
        }}
      />
      {/* Noise */}
      <svg className="noise-overlay" xmlns="http://www.w3.org/2000/svg">
        <filter id="auth-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#auth-noise)" />
      </svg>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.055,
        }}
      />
      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.3), transparent)' }}
      />
    </>
  )
}