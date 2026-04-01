export default function HowItWorks() {
    const steps = [
  { n: '01', title: 'Add your client', desc: 'Name, email, country. Takes 20 seconds.' },
  { n: '02', title: 'Build the invoice', desc: 'Add line items, set a due date, pick a currency.' },
  { n: '03', title: 'Send & get paid', desc: 'Client gets an email with a direct payment link. You get notified the moment money lands.' },
]
  return (
    <section id="how-it-works" className="py-28 px-6 relative" style={{ background: "#07091A" }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.07) 0%, transparent 70%)" }} />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <div className="mono text-xs text-blue-400 tracking-widest uppercase mb-4">How it works</div>
          <h2 className="heading text-3xl md:text-5xl font-extrabold text-white">
            From invoice to payment
            <br />
            <span className="text-slate-500 font-semibold text-3xl md:text-4xl">in three steps</span>
          </h2>
        </div>
 
        <div className="grid md:grid-cols-3 gap-5 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.35), rgba(129,140,248,0.35), rgba(96,165,250,0.35), transparent)" }} />
          {steps.map((s) => (
            <div key={s.n} className="step-card rounded-2xl p-8">
              <div className="mono w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-blue-300 mb-6 flex-shrink-0"
                style={{ border: "1px solid rgba(37,99,235,0.35)", background: "rgba(37,99,235,0.1)" }}>
                {s.n}
              </div>
              <h3 className="heading text-white font-bold text-lg mb-3">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}