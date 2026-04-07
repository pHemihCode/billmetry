'use client'

import Link from 'next/link'

// ─── Props ────────────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  isOpen:   boolean
  onClose:  () => void
  reason:   'invoice_limit' | 'analytics' | 'branding'
}

// ─── Copy per reason ──────────────────────────────────────────────────────────

const copy = {
  invoice_limit: {
    icon:  '📄',
    title: 'Invoice limit reached',
    desc:  "You've used all 3 free invoices this month. Upgrade to Pro for unlimited invoices, payment links, and automated reminders.",
  },
  analytics: {
    icon:  '📊',
    title: 'Analytics is a Pro feature',
    desc:  'Unlock revenue charts, top client rankings, and payment performance insights with a Pro or Business plan.',
  },
  branding: {
    icon:  '✦',
    title: 'Remove BillMetry branding',
    desc:  'Send invoices with your own branding — no "Powered by BillMetry" footer — on Pro and Business plans.',
  },
}

const plans = [
  {
    name:    'Pro',
    price:   '₦3,500',
    period:  '/month',
    highlight: true,
    href:    '/settings#billing',
    features: [
      'Unlimited invoices',
      'Flutterwave payment links',
      'Automated overdue reminders',
      'Multi-currency billing',
      'Analytics & reports',
      'Remove branding',
    ],
  },
  {
    name:    'Business',
    price:   '₦8,000',
    period:  '/month',
    highlight: false,
    href:    '/settings#billing',
    features: [
      'Everything in Pro',
      'Recurring invoices',
      'Client payment portal',
      'Expense tracking',
      'Priority support',
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  if (!isOpen) return null

  const { icon, title, desc } = copy[reason]

  return (
    // Backdrop — uses normal flow div with min-height so iframe doesn't collapse
    <div
      onClick={onClose}
      style={{
        position:        'fixed',
        inset:           0,
        background:      'rgba(0,0,0,0.7)',
        zIndex:          1000,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '16px',
        backdropFilter:  'blur(4px)',
      }}
    >
      {/* Modal card */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:   'linear-gradient(145deg, #0D1527, #080E1E)',
          border:       '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          padding:      '32px',
          maxWidth:     '520px',
          width:        '100%',
          boxShadow:    '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,99,235,0.1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>{icon}</div>
          <h2 style={{
            fontSize: '20px', fontWeight: 700, color: '#F1F5F9',
            margin: '0 0 8px', fontFamily: 'var(--font-bricolage), sans-serif',
          }}>
            {title}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
            {desc}
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          {plans.map(plan => (
            <div
              key={plan.name}
              style={{
                padding:      '18px',
                borderRadius: '14px',
                border:       plan.highlight
                  ? '1px solid rgba(96,165,250,0.35)'
                  : '1px solid rgba(255,255,255,0.07)',
                background:   plan.highlight
                  ? 'linear-gradient(145deg, rgba(37,99,235,0.2), rgba(37,99,235,0.08))'
                  : 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <p style={{
                  fontSize: '11px', fontWeight: 600, color: plan.highlight ? '#60A5FA' : '#64748B',
                  margin: '0 0 6px', fontFamily: 'monospace', letterSpacing: '0.07em', textTransform: 'uppercase',
                }}>
                  {plan.name}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  <span style={{ fontSize: '22px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'monospace' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
                    <span style={{ color: plan.highlight ? '#60A5FA' : '#475569', marginTop: '1px', flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link
            href="/billing"
            onClick={onClose}
            style={{
              display: 'block', textAlign: 'center',
              background: 'linear-gradient(90deg, #1D4ED8, #2563EB)',
              color: 'white', fontWeight: 700, fontSize: '14px',
              padding: '13px', borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 0 0 1px rgba(96,165,250,0.2)',
            }}
          >
            Upgrade now →
          </Link>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#475569', fontSize: '13px', padding: '8px',
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}