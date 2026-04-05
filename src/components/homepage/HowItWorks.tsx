import Link from "next/link"

export default function HowItWorks() {
    const steps = [
    {
      num: '01',
      title: 'Add your client',
      desc: 'Enter their name, email, and country. Takes 20 seconds.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Build your invoice',
      desc: 'Add line items, set a due date, choose currency. Auto-calculates totals.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="8" y1="13" x2="16" y2="13"/>
          <line x1="8" y1="17" x2="16" y2="17"/>
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Send & get paid',
      desc: 'Client clicks a payment link and pays with card. You get notified instantly.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
  ]
 return (
    <section id="how-it-works" className="py-28 px-6 relative" style={{ background:'#07091A' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 60% 40% at 50% 0%,rgba(37,99,235,0.07) 0%,transparent 70%)' }} />
 
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <div className="mono text-xs text-blue-400 tracking-widest uppercase mb-4">How it works</div>
          <h2 className="heading text-3xl md:text-5xl font-extrabold text-white mb-3">Three steps to getting paid</h2>
          <p className="text-slate-500 text-sm">From zero to payment received in under 5 minutes.</p>
        </div>
 
        {/* Steps — each is a full card, no connector line that looks bad */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="step-card rounded-2xl p-8 flex flex-col">
              {/* Icon in blue circle */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shrink-0"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}
              >
                {step.icon}
              </div>
 
              {/* Step number */}
              <div className="mono text-xs text-slate-700 tracking-widest uppercase mb-2">
                Step {step.num}
              </div>
 
              <h3 className="heading text-white font-bold text-lg mb-3">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-1">{step.desc}</p>
 
              {/* Arrow indicator except last */}
              {i < steps.length - 1 && (
                <div className="hidden md:none" />
              )}
            </div>
          ))}
        </div>
 
        <div className="mt-14 text-center">
          <Link href="/signup"
            className="inline-flex items-center gap-2 text-sm font-semibold border p-4 rounded-full border-blue-950 text-white hover:text-blue-300 transition-colors">
            Create your first invoice now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}