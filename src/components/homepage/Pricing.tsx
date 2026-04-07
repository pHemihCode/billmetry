
interface PricingProps {
  isLoggedIn: boolean
}
 
const plans = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    desc: 'For freelancers just getting started.',
    ctaLoggedOut: 'Start free',
    ctaLoggedIn:  'Go to dashboard',
    hrefLoggedOut: '/signup',
    hrefLoggedIn:  '/dashboard',
    highlight: false,
    features: ['3 invoices per month', '1 client', 'PDF downloads', 'Manual payment tracking', 'BillMetry branding'],
  },
  {
    name: 'Pro',
    price: '₦3,500',
    period: 'per month',
    desc: 'For active freelancers billing regularly.',
    ctaLoggedOut: 'Start Pro',
    ctaLoggedIn:  'Upgrade to Pro',
    hrefLoggedOut: '/signup?plan=pro',
    hrefLoggedIn:  '/billing',
    highlight: true,
    features: ['Unlimited invoices', 'Unlimited clients', 'Flutterwave payment links', 'Automated overdue reminders', 'Multi-currency billing', 'Email delivery', 'Invoice activity timeline', 'Remove BillMetry branding'],
  },
  {
    name: 'Business',
    price: '₦8,000',
    period: 'per month',
    desc: 'For power users and small agencies.',
    ctaLoggedOut: 'Start Business',
    ctaLoggedIn:  'Upgrade to Business',
    hrefLoggedOut: '/signup?plan=business',
    hrefLoggedIn:  '/billing',
    highlight: false,
    features: ['Everything in Pro', 'Recurring invoices', 'Client payment portal', 'Revenue analytics & reports', 'Expense tracking', 'Priority support'],
  },
]
 
// Drop-in replacement for the Pricing function in landing-page.tsx
export default function Pricing({ isLoggedIn }: PricingProps) {
  return (
    <section id="pricing" className="py-28 px-6" style={{ background: '#07091A' }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <div className="mono text-xs text-blue-400 tracking-widest uppercase mb-4">Pricing</div>
          <h2 className="heading text-3xl md:text-5xl font-extrabold text-white">Simple, honest pricing</h2>
          <p className="mt-4 text-slate-500 text-sm">Start free. Upgrade when you're ready.</p>
        </div>
 
        <div className="grid md:grid-cols-3 gap-10 md:gap-5  items-stretch">
          {plans.map(plan => {
            const cta  = isLoggedIn ? plan.ctaLoggedIn  : plan.ctaLoggedOut
            const href = isLoggedIn ? plan.hrefLoggedIn : plan.hrefLoggedOut
 
            return (
              <div
                key={plan.name}
                className="relative rounded-2xl p-8 flex flex-col"
                style={plan.highlight ? {
                  background: 'linear-gradient(150deg,#1E40AF 0%,#2563EB 55%,#1D4ED8 100%)',
                  boxShadow: '0 0 0 1px rgba(96,165,250,0.28),0 32px 80px rgba(29,78,216,0.28)', borderRadius:'10px'
                } : {
                  background: 'linear-gradient(145deg,#0D1527 0%,#080E1E 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius:'10px'
                }}
              >
                {plan.highlight && (
                  <div
                    className="mono absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: '#060A16', color: '#93C5FD', border: '1px solid rgba(96,165,250,0.25)' }}
                  >
                    MOST POPULAR
                  </div>
                )}
 
                <div className="mb-6">
                  <div className={`mono text-xs font-semibold tracking-widest uppercase mb-3 ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="mono text-4xl font-bold">{plan.price}</span>
                    <span className={`text-xs ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>/{plan.period}</span>
                  </div>
                  <p className={`text-sm ${plan.highlight ? 'text-blue-100/80' : 'text-slate-500'}`}>{plan.desc}</p>
                </div>
 
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <span className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-blue-400'}`}>✓</span>
                      <span className={plan.highlight ? 'text-blue-50/90' : 'text-slate-400'}>{f}</span>
                    </li>
                  ))}
                </ul>
 
                <a
                  href={href}
                  className={`mono text-sm font-semibold text-center py-3.5 rounded-full transition-all hover:scale-[1.03] block ${
                    plan.highlight
                      ? 'bg-white text-blue-700 hover:bg-blue-50'
                      : 'border border-blue-500/25 text-blue-300 hover:border-blue-400/50 hover:text-blue-200'
                  }`}
                >
                  {cta}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
 