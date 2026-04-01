import Link from "next/link";

function CTA() {
return (
    <section className="py-28 px-6 relative overflow-hidden bg-[#060A16]">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(37,99,235,0.1) 0%, transparent 70%)" }} />
      <svg className="absolute inset-0 w-full h-full opacity-[0.1] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <filter id="n2">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#n2)"/>
      </svg>
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="heading text-4xl md:text-6xl font-extrabold text-white mb-6">
          Ready to get paid{" "}
          <span className="gradient-text">on your terms?</span>
        </h2>
        <p className="text-slate-400 mb-10 text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
          Join freelancers who stopped chasing payments and started closing them.
        </p>
        <Link href="/signup"
          className="shimmer-btn inline-flex items-center gap-2 font-bold text-white px-12 py-5 rounded-full text-base border border-blue-500/25 hover:border-blue-400/50 hover:text-blue-200">
          Create your free account →
        </Link>
        <p className="mono mt-6 text-xs text-slate-600 tracking-widest">
          NO CREDIT CARD · SETUP IN UNDER 2 MINUTES
        </p>
      </div>
    </section>
  );
}
export default CTA