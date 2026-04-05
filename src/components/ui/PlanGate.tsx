// src/components/ui/PlanGate.tsx
// Server Component — renders either the upgrade wall or children.
// Used on pages and features that require a paid plan.

import Link from 'next/link'

interface PlanGateProps {
  allowed:  boolean
  reason:   'invoice_limit' | 'analytics' | 'branding'
  plan:     string
  usage?:   { current: number; limit: number | null }
  children: React.ReactNode
}

const walls = {
  invoice_limit: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
    title: 'Invoice limit reached',
    desc:  "You've created all 3 free invoices for this month. Upgrade to Pro for unlimited invoices, automated payment links, and overdue reminders.",
  },
  analytics: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
    title: 'Analytics is a Pro feature',
    desc:  'Unlock revenue charts, top client rankings, and payment performance data. Upgrade to Pro or Business.',
  },
  branding: {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Remove BillMetry branding',
    desc:  'Send fully branded invoices with no BillMetry footer. Available on Pro and Business plans.',
  },
}

export default function PlanGate({ allowed, reason, plan, usage, children }: PlanGateProps) {
  if (allowed) return <>{children}</>

  const wall = walls[reason]

  return (
    <div className="max-w-lg mx-auto py-8">
      <div
        className="rounded-2xl border p-10 text-center"
        style={{
          background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          {wall.icon}
        </div>

        {/* Title */}
        <h2
          className="text-xl font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
        >
          {wall.title}
        </h2>

        {/* Description */}
        <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          {wall.desc}
        </p>

        {/* Usage bar for invoice limit */}
        {usage && usage.limit !== null && (
          <div className="mb-6 max-w-xs mx-auto">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-500">This month's usage</span>
              <span
                className="font-semibold"
                style={{ fontFamily: 'var(--font-mono), monospace', color: '#F87171' }}
              >
                {usage.current} / {usage.limit}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min((usage.current / usage.limit) * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #EF4444, #F87171)',
                }}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href="/settings#billing"
          className="inline-flex items-center gap-2 text-sm font-bold text-white px-8 py-3.5 rounded-xl transition-all"
          style={{
            background: 'linear-gradient(90deg, #1D4ED8, #2563EB)',
            boxShadow: '0 0 0 1px rgba(96,165,250,0.2)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Upgrade to Pro — ₦3,500/month
        </Link>

        <p className="mt-4 text-xs text-slate-600">
          Current plan: <span className="capitalize">{plan}</span>
        </p>
      </div>
    </div>
  )
}