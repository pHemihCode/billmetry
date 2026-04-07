import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// ─── Plan config ──────────────────────────────────────────────────────────────

const plans = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    desc: 'For freelancers just getting started.',
    features: [
      '3 invoices per month',
      '1 client',
      'PDF downloads',
      'Manual payment tracking',
      'BillMetry branding on invoices',
    ],
    highlight: false,
    isFree: true,
  },
  {
    name: 'Pro',
    price: '₦3,500',
    period: 'per month',
    desc: 'For active freelancers billing regularly.',
    features: [
      'Unlimited invoices',
      'Unlimited clients',
      'Flutterwave payment links',
      'Automated overdue reminders',
      'Multi-currency billing',
      'Email delivery',
      'Invoice activity timeline',
      'Remove BillMetry branding',
    ],
    highlight: true,
    isFree: false,
  },
  {
    name: 'Business',
    price: '₦8,000',
    period: 'per month',
    desc: 'For power users and small agencies.',
    features: [
      'Everything in Pro',
      'Recurring invoices',
      'Client payment portal',
      'Revenue analytics & reports',
      'Expense tracking',
      'Priority support',
    ],
    highlight: false,
    isFree: false,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, full_name, business_name')
    .eq('id', user.id)
    .single()

  // Monthly invoice count for usage display
  const { data: countData } = await supabase
    .rpc('get_monthly_invoice_count', { p_user_id: user.id })

  const currentPlan  = (profile?.plan ?? 'free') as string
  const invoiceCount = countData ?? 0
  const displayName  = profile?.business_name ?? profile?.full_name ?? 'your account'

  const planColors: Record<string, { text: string; bg: string; border: string }> = {
    free:     { text: '#94A3B8', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.2)'  },
    pro:      { text: '#60A5FA', bg: 'rgba(37,99,235,0.12)',   border: 'rgba(96,165,250,0.25)'  },
    business: { text: '#A78BFA', bg: 'rgba(124,58,237,0.12)', border: 'rgba(167,139,250,0.25)' },
  }
  const pc = planColors[currentPlan] ?? planColors.free

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Current plan banner */}
      <div
        className="rounded-2xl border p-6 flex items-start justify-between gap-6 flex-wrap"
        style={{
          background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
          borderColor: pc.border,
        }}
      >
        <div>
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-mono), monospace' }}>Current plan</p>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-2xl font-bold capitalize"
              style={{ fontFamily: 'var(--font-bricolage), sans-serif', color: pc.text }}
            >
              {currentPlan}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: pc.bg, color: pc.text, border: `1px solid ${pc.border}`, fontFamily: 'var(--font-mono), monospace' }}
            >
              ACTIVE
            </span>
          </div>
          <p className="text-slate-500 text-sm">{displayName}</p>
        </div>

        {/* Usage for free plan */}
        {currentPlan === 'free' && (
          <div className="shrink-0 min-w-45">
            <p className="text-xs text-slate-500 mb-2">Invoices this month</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-bold text-lg"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>
                {invoiceCount}
              </span>
              <span className="text-slate-600 text-sm">/ 3</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((invoiceCount / 3) * 100, 100)}%`,
                  background: invoiceCount >= 3 ? '#EF4444' : '#2563EB',
                }}
              />
            </div>
            {invoiceCount >= 3 && (
              <p className="text-red-400 text-xs mt-1.5">Limit reached — upgrade to continue</p>
            )}
          </div>
        )}

        {/* Manage subscription for paid plans */}
        {currentPlan !== 'free' && (
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-2">Need to make changes?</p>
            <a
              href="mailto:billing@billmetry.ng"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Contact billing support →
            </a>
          </div>
        )}
      </div>

      {/* Plan comparison */}
      <div>
        <h2
          className="text-sm font-semibold text-white mb-4"
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
        >
          {currentPlan === 'free' ? 'Upgrade your plan' : 'All plans'}
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const isCurrentPlan = plan.name.toLowerCase() === currentPlan
            const isDowngrade   = (
              (currentPlan === 'business' && plan.name === 'Pro') ||
              (currentPlan !== 'free' && plan.isFree)
            )

            return (
              <div
                key={plan.name}
                className="relative rounded-2xl p-6 flex flex-col"
                style={
                  plan.highlight && !isCurrentPlan
                    ? {
                        background: 'linear-gradient(150deg, #1E40AF 0%, #2563EB 55%, #1D4ED8 100%)',
                        boxShadow: '0 0 0 1px rgba(96,165,250,0.28), 0 24px 60px rgba(29,78,216,0.22)',
                      }
                    : isCurrentPlan
                    ? {
                        background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
                        border: `1px solid ${pc.border}`,
                        boxShadow: `0 0 0 1px ${pc.border}`,
                      }
                    : {
                        background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }
                }
              >
                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: '#060A16',
                      color: pc.text,
                      border: `1px solid ${pc.border}`,
                      fontFamily: 'var(--font-mono), monospace',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    CURRENT PLAN
                  </div>
                )}

                {/* Most popular badge */}
                {plan.highlight && !isCurrentPlan && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: '#060A16',
                      color: '#93C5FD',
                      border: '1px solid rgba(96,165,250,0.25)',
                      fontFamily: 'var(--font-mono), monospace',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-5 mt-2">
                  <div
                    className="text-xs font-semibold tracking-widest uppercase mb-2"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      color: plan.highlight && !isCurrentPlan ? '#BFDBFE' : '#64748B',
                    }}
                  >
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className="text-3xl font-bold"
                      style={{ fontFamily: 'var(--font-mono), monospace', color: '#F1F5F9' }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500">/{plan.period}</span>
                  </div>
                  <p className="text-xs text-slate-500">{plan.desc}</p>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                      <span className="text-slate-400">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div
                    className="text-center text-xs py-2.5 rounded-xl font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B' }}
                  >
                    Your current plan
                  </div>
                ) : isDowngrade ? (
                  <div
                    className="text-center text-xs py-2.5 rounded-xl"
                    style={{ color: '#475569' }}
                  >
                    —
                  </div>
                ) : (
                  // Real upgrade — in production this calls your Flutterwave subscription API
                  // For now links to a contact/waitlist email
                  <a
                    href={`mailto:billing@billmetry.ng?subject=Upgrade to ${plan.name}&body=Hi, I'd like to upgrade my BillMetry account (${user.email}) to the ${plan.name} plan.`}
                    className="block text-center text-xs font-bold py-2.5 rounded-xl transition-all hover:scale-[1.02]"
                    style={
                      plan.highlight
                        ? { background: 'white', color: '#1D4ED8' }
                        : { border: '1px solid rgba(96,165,250,0.25)', color: '#60A5FA' }
                    }
                  >
                    Upgrade to {plan.name} →
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <h2 className="text-sm font-semibold text-white mb-4"
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
          Billing FAQ
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'When does my free invoice limit reset?',
              a: 'Free plan limits reset on the 1st of every month. You get 3 fresh invoices each month.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. Email billing@billmetry.ng and we\'ll cancel your subscription immediately. You keep access until the end of your billing period.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept card payments, bank transfer, and USSD via Flutterwave. NGN payments only for subscriptions.',
            },
          ].map(item => (
            <div key={item.q} className="border-b pb-4 last:border-0 last:pb-0"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-sm font-medium text-white mb-1.5">{item.q}</p>
              <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}