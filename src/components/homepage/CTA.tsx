import Link from "next/link";

function CTA() {
return (
    <section className="py-20 md:py-28 px-5 md:px-8 relative overflow-hidden bg-[#060A16]">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 70% 65% at 50% 50%,rgba(37,99,235,0.1) 0%,transparent 70%)' }} />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="heading font-extrabold text-white mb-5" style={{ fontSize:'clamp(2rem,6vw,3.75rem)', letterSpacing:'-0.025em' }}>
          Ready to get paid{' '}
          <span className="gradient-text">on your terms?</span>
        </h2>
        <p className="text-slate-400 mb-8 md:mb-10 text-base md:text-lg leading-relaxed">
          Join freelancers who stopped chasing payments and started closing them.
        </p>
        <Link href="/signup"
          className="shimmer inline-flex items-center gap-2 font-bold text-white px-10 py-4 md:px-12 md:py-5 rounded-full text-sm md:text-base">
          Create your free account →
        </Link>
        <p className="mono mt-5 text-xs text-slate-600 tracking-widest">
          NO CREDIT CARD · SETUP IN UNDER 2 MINUTES
        </p>
      </div>
    </section>
  )
}
export default CTA