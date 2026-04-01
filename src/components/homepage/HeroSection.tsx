import Link from "next/link";

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden bg-[#060A16]">
 
      {/* Aurora blob */}
      <div
        className="aurora-blob absolute pointer-events-none"
        style={{
          top: "35%", left: "50%",
          width: "860px", height: "680px",
          background: "conic-gradient(from 0deg, rgba(29,78,216,0.22), rgba(96,165,250,0.12), rgba(37,99,235,0.18), rgba(99,102,241,0.1), rgba(29,78,216,0.22))",
          filter: "blur(72px)",
          borderRadius: "42% 58% 52% 48% / 48% 52% 60% 40%",
        }}
      />
 
      {/* SVG noise */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.14] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <filter id="n1">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#n1)"/>
      </svg>
 
      {/* Dot grid */}
      <div
        className="grid-fade absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.45) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
 
      {/* Top edge glow */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent)" }}
      />
 
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
 
        <div className="fade-up inline-flex items-center gap-2.5 border border-blue-500/20 rounded-full px-5 py-2 mb-8"
          style={{ background: "rgba(37,99,235,0.08)" }}>
          <span className="pulse-dot w-2 h-2 rounded-full bg-blue-400 inline-block flex-shrink-0" />
          <span className="mono text-xs text-blue-300 tracking-widest uppercase">Built for Nigerian freelancers</span>
        </div>
 
        <h1 className="heading fade-up-1 text-5xl md:text-[72px] font-extrabold text-white leading-[1.04] mb-6">
          Get paid faster.{" "}
          <span className="gradient-text">From anywhere.</span>
        </h1>
 
        <p className="fade-up-2 text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
          Create professional invoices, send payment links your clients can pay
          with any card — and receive money directly to your Nigerian bank account.
        </p>
 
        <div className="fade-up-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup"
            className="shimmer-btn w-full sm:w-auto text-sm font-bold text-white px-9 py-4 rounded-full">
            Start free — no card needed
          </Link>
          <Link href="/invoice/view/demo"
            className="w-full sm:w-auto text-sm font-medium text-slate-300 px-9 py-4 rounded-full border border-white/10 hover:border-blue-400/35 hover:text-white transition-all duration-200">
            See demo invoice →
          </Link>
        </div>
      </div>
 
      {/* Floating invoice card */}
      <div className="bob relative z-10 mt-20 w-full max-w-lg mx-auto">
        <div className="card-shadow rounded-2xl p-6 text-left"
          style={{ background: "linear-gradient(145deg, #0D1527 0%, #0A1020 100%)", border: "1px solid rgba(255,255,255,0.07)" }}>
 
          {/* Fake window dots */}
          <div className="flex items-center gap-1.5 mb-5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.55)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(234,179,8,0.55)" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(34,197,94,0.55)" }} />
          </div>
 
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="mono text-xs text-slate-500 mb-1 tracking-widest">INVOICE</div>
              <div className="mono text-white font-semibold text-lg">#INV-0042</div>
            </div>
            <span className="mono text-xs px-3 py-1.5 rounded-full"
              style={{ background: "rgba(37,99,235,0.13)", border: "1px solid rgba(96,165,250,0.22)", color: "#93C5FD" }}>
              AWAITING PAYMENT
            </span>
          </div>
 
          <div className="flex justify-between text-sm mb-6">
            <div>
              <div className="mono text-xs text-slate-600 mb-1 tracking-wide">FROM</div>
              <div className="text-white font-medium">Femi Akintan</div>
              <div className="text-slate-500 text-xs">Brand & Web Design</div>
            </div>
            <div className="text-right">
              <div className="mono text-xs text-slate-600 mb-1 tracking-wide">TO</div>
              <div className="text-white font-medium">Acme Corp, USA</div>
              <div className="text-slate-500 text-xs">Due Jan 15, 2026</div>
            </div>
          </div>
 
          <div className="h-px mb-5"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)" }} />
 
          <div className="flex items-center justify-between">
            <div>
              <div className="mono text-xs text-slate-600 mb-1 tracking-widest">TOTAL DUE</div>
              <div className="mono text-2xl font-bold text-white">$1,200.00</div>
            </div>
            <div className="shimmer-btn text-sm font-bold text-white px-7 py-3 rounded-full cursor-pointer select-none">
              Pay now →
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection