// app/invoice/view/demo/page.tsx
// Public demo page — no auth required.
// Linked from landing page "See demo invoice →" button.

import Link from 'next/link'

const demo = {
  number:        'INV-0042',
  businessName:  'Femi Akintan Design',
  businessEmail: 'femi@billmetry.ng',
  businessCity:  'Lagos, Nigeria',
  clientName:    'Acme Corp',
  clientEmail:   'accounts@acmecorp.com',
  clientCountry: 'United States',
  issueDate:     '1 December 2025',
  dueDate:       '15 January 2026',
  items: [
    { description: 'Brand identity design',      qty: 1, rate: 800,  amount: 800  },
    { description: 'Website UI/UX design',        qty: 1, rate: 1200, amount: 1200 },
    { description: 'Social media kit (10 posts)', qty: 1, rate: 350,  amount: 350  },
    { description: 'Revision rounds',             qty: 3, rate: 50,   amount: 150  },
  ],
  subtotal:  2500,
  total:     2500,
  notes:     'Payment due within 30 days. Bank transfer and card payments accepted. Late payments subject to a 2% monthly fee.',
}

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
}

// ─── Section divider ──────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.055)', margin: '0 0' }} />
}

// ─── Label + value pair ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{
        fontSize: 10, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        fontFamily: 'var(--font-mono), monospace', marginBottom: 5,
      }}>
        {label}
      </p>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoInvoicePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#060A16', color: 'white', fontFamily: 'var(--font-dm-sans), sans-serif' }}>

      {/* ── Top CTA banner ──────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg,#1E3A8A,#1D4ED8)',
        borderBottom: '1px solid rgba(96,165,250,0.25)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* BillMetry logo mark */}
          <svg width="22" height="22" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="44" height="44" rx="10" fill="rgba(255,255,255,0.15)"/>
            <rect x="11" y="10" width="5" height="24" rx="2" fill="white"/>
            <rect x="15" y="10" width="10" height="4.5" rx="2" fill="white"/>
            <rect x="15" y="19.5" width="12" height="4" rx="2" fill="white"/>
            <rect x="15" y="29.5" width="10" height="4.5" rx="2" fill="white"/>
            <rect x="23" y="10" width="4" height="8" rx="2" fill="white"/>
            <rect x="23" y="29" width="4" height="9" rx="2" fill="white"/>
            <rect x="29" y="28" width="4" height="6" rx="1.5" fill="rgba(255,255,255,0.5)"/>
            <rect x="34" y="22" width="4" height="12" rx="1.5" fill="rgba(255,255,255,0.7)"/>
            <rect x="39" y="16" width="4" height="18" rx="1.5" fill="white"/>
          </svg>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.3 }}>
              This is a demo invoice
            </p>
            <p style={{ fontSize: 11, color: 'rgba(147,197,253,0.85)', margin: 0, lineHeight: 1.3 }}>
              Create and send invoices like this for free with BillMetry
            </p>
          </div>
        </div>
        <Link href="/signup" style={{
          background: 'white', color: '#1D4ED8',
          fontSize: 12, fontWeight: 700, padding: '8px 18px',
          borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          Start free →
        </Link>
      </div>

      {/* ── Invoice card ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: '28px auto', padding: '0 16px 48px' }}>
        <div style={{
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(37,99,235,0.12), 0 32px 80px rgba(5,10,25,0.7)',
          background: '#0B1120',
        }}>

          {/* ── Card header ─────────────────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #0F1D3A 0%, #0B1526 100%)',
            padding: '28px 28px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}>
            {/* Business name / brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                {/* Avatar circle */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>
                  FA
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>
                    {demo.businessName}
                  </p>
                  <p style={{ fontSize: 11, color: '#64748B', margin: '2px 0 0' }}>
                    {demo.businessCity}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice number + status */}
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontSize: 10, color: '#475569', textTransform: 'uppercase',
                letterSpacing: '0.1em', fontFamily: 'var(--font-mono), monospace',
                margin: '0 0 4px',
              }}>
                Invoice
              </p>
              <p style={{
                fontSize: 22, fontWeight: 800, color: '#F1F5F9', margin: '0 0 8px',
                fontFamily: 'var(--font-mono), monospace', letterSpacing: '-0.03em',
              }}>
                {demo.number}
              </p>
              <span style={{
                display: 'inline-block', fontSize: 10, fontWeight: 700,
                padding: '4px 10px', borderRadius: 999,
                background: 'rgba(37,99,235,0.15)',
                border: '1px solid rgba(96,165,250,0.25)',
                color: '#93C5FD',
                fontFamily: 'var(--font-mono), monospace',
                letterSpacing: '0.06em',
              }}>
                AWAITING PAYMENT
              </span>
            </div>
          </div>

          {/* ── From / To / Dates ───────────────────────────────────────────── */}
          <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
            {/* From + To — responsive: row on desktop, stack on mobile */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 20 }}>
              <Field label="From">
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: '0 0 2px' }}>
                  {demo.businessName}
                </p>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{demo.businessEmail}</p>
              </Field>
              <Field label="Bill to">
                <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: '0 0 2px' }}>
                  {demo.clientName}
                </p>
                <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{demo.clientEmail}</p>
                <p style={{ fontSize: 12, color: '#475569', margin: '2px 0 0' }}>{demo.clientCountry}</p>
              </Field>
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              <Field label="Issue date">
                <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0 }}>{demo.issueDate}</p>
              </Field>
              <Field label="Due date">
                <p style={{ fontSize: 13, color: '#CBD5E1', margin: 0 }}>{demo.dueDate}</p>
              </Field>
            </div>
          </div>

          {/* ── Line items ──────────────────────────────────────────────────── */}
          <div style={{ padding: '22px 28px' }}>

            {/* Desktop header row — hidden on very small screens */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 48px 88px 88px',
              gap: 8, marginBottom: 8,
              fontSize: 10, fontWeight: 600, color: '#475569',
              textTransform: 'uppercase', letterSpacing: '0.09em',
              fontFamily: 'var(--font-mono), monospace',
            }}>
              <span>Description</span>
              <span style={{ textAlign: 'center' }}>Qty</span>
              <span style={{ textAlign: 'right' }}>Rate</span>
              <span style={{ textAlign: 'right' }}>Amount</span>
            </div>

            {/* Item rows */}
            {demo.items.map((item, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 48px 88px 88px',
                gap: 8,
                padding: '11px 0',
                borderBottom: i < demo.items.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 13, color: '#CBD5E1' }}>{item.description}</span>
                <span style={{ fontSize: 13, color: '#64748B', textAlign: 'center', fontFamily: 'var(--font-mono), monospace' }}>
                  {item.qty}
                </span>
                <span style={{ fontSize: 13, color: '#94A3B8', textAlign: 'right', fontFamily: 'var(--font-mono), monospace' }}>
                  {fmt(item.rate)}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', textAlign: 'right', fontFamily: 'var(--font-mono), monospace' }}>
                  {fmt(item.amount)}
                </span>
              </div>
            ))}

            {/* Totals block */}
            <div style={{
              marginTop: 20, paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{ maxWidth: 240, marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Subtotal</span>
                  <span style={{ fontSize: 13, color: '#E2E8F0', fontFamily: 'var(--font-mono), monospace' }}>
                    {fmt(demo.subtotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#64748B' }}>Tax</span>
                  <span style={{ fontSize: 13, color: '#64748B', fontFamily: 'var(--font-mono), monospace' }}>$0.00</span>
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 12, marginTop: 4,
                  borderTop: '1.5px solid rgba(255,255,255,0.12)',
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>Total due</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#60A5FA', fontFamily: 'var(--font-mono), monospace' }}>
                    {fmt(demo.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div style={{
              marginTop: 20, padding: '14px 16px', borderRadius: 12,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px', fontFamily: 'var(--font-mono), monospace' }}>
                Notes
              </p>
              <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: 0 }}>{demo.notes}</p>
            </div>
          </div>

          {/* ── Pay CTA ─────────────────────────────────────────────────────── */}
          <div style={{
            padding: '22px 28px 28px',
            borderTop: '1px solid rgba(37,99,235,0.2)',
            background: 'rgba(37,99,235,0.04)',
          }}>
            <Link href="/signup" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'linear-gradient(90deg,#1D4ED8,#3B82F6)',
              color: 'white', fontWeight: 700, fontSize: 15,
              padding: '16px 24px', borderRadius: 14,
              textDecoration: 'none', width: '100%', boxSizing: 'border-box',
              boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
            }}>
              Pay {fmt(demo.total)} now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>

            {/* Trust badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
              {[
                { icon: '🔒', text: 'Secure payment' },
                { icon: '💳', text: 'Card & bank transfer' },
                { icon: '⚡', text: 'Instant confirmation' },
              ].map(b => (
                <span key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#475569' }}>
                  <span style={{ fontSize: 13 }}>{b.icon}</span>
                  {b.text}
                </span>
              ))}
            </div>

            <p style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginTop: 12 }}>
              Demo only — this is a preview.{' '}
              <Link href="/signup" style={{ color: '#60A5FA', textDecoration: 'none' }}>
                Sign up free
              </Link>
              {' '}to create real invoices.
            </p>
          </div>

        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="44" height="44" rx="10" fill="#2563EB"/>
              <rect x="11" y="10" width="5" height="24" rx="2" fill="white"/>
              <rect x="15" y="10" width="10" height="4.5" rx="2" fill="white"/>
              <rect x="15" y="19.5" width="12" height="4" rx="2" fill="white"/>
              <rect x="15" y="29.5" width="10" height="4.5" rx="2" fill="white"/>
              <rect x="23" y="10" width="4" height="8" rx="2" fill="white"/>
              <rect x="23" y="29" width="4" height="9" rx="2" fill="white"/>
              <rect x="29" y="28" width="4" height="6" rx="1.5" fill="rgba(255,255,255,0.5)"/>
              <rect x="34" y="22" width="4" height="12" rx="1.5" fill="rgba(255,255,255,0.7)"/>
              <rect x="39" y="16" width="4" height="18" rx="1.5" fill="white"/>
            </svg>
            <span style={{ fontSize: 12, color: '#475569' }}>
              Powered by{' '}
              <span style={{ color: '#2563EB', fontWeight: 600 }}>BillMetry</span>
              {' '}· Professional invoicing for African freelancers
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}