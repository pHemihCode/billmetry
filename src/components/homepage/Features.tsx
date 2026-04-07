function Features() {
    const features = [
  {
    icon: '⚡',
    title: 'Instant payment links',
    desc: 'Every invoice gets a Flutterwave-powered link. Clients pay in USD, GBP, EUR or NGN — you settle to your Nigerian bank.',
  },
  {
    icon: '✉',
    title: 'Automated follow-ups',
    desc: 'Overdue reminders sent at 1, 3 and 7 days automatically. No more awkward WhatsApp chases.',
  },
  {
    icon: '📄',
    title: 'Professional PDFs',
    desc: 'Branded invoices generated instantly with your logo and business details baked in.',
  },
  {
    icon: '🌍',
    title: 'Multi-currency',
    desc: 'Bill in NGN, USD, GBP or EUR. Foreign clients pay with any Visa or Mastercard — no friction.',
  },
  {
    icon: '📊',
    title: 'Dashboard analytics',
    desc: 'See what you\'ve earned, what\'s outstanding and what\'s overdue — all in one place.',
  },
  {
    icon: '🔒',
    title: 'Secure & private',
    desc: 'Row-level security on every record. Your client data is yours and only yours.',
  },
]
 return (
     <section id="features" className="py-20 md:py-28 px-5 md:px-8 bg-[#060A16]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 md:mb-16 text-center">
          <div className="mono text-xs text-blue-400 tracking-widest uppercase mb-4">Features</div>
          <h2 className="heading text-3xl md:text-5xl font-extrabold text-white">Everything a freelancer needs</h2>
        </div>
        {/* 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" >
          {features.map(f => (
            <div key={f.title} className="feature-card rounded-2xl p-6 md:p-7" style={{borderRadius:'10px'}}>
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="heading text-white font-bold mb-2 text-base">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Features