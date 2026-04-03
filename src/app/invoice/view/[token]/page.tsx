import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// ─── This page is publicly accessible — no auth check.
// The middleware.ts matcher already excludes /invoice/view/* from auth.
// The invoice is looked up by a public_token column (add this to your schema).
//
// IMPORTANT: Run this SQL in Supabase to add the token column:
//   alter table public.invoices add column if not exists public_token text unique;
//   create index if not exists invoices_public_token_idx on public.invoices(public_token);
//
// When an invoice is created, generate a token:
//   import { randomBytes } from 'crypto'
//   const token = randomBytes(20).toString('hex')
// Store it on the invoice row. Share /invoice/view/{token} with the client.

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sym: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }

function fmt(n: number, currency: string) {
  return `${sym[currency] ?? ''}${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ─── Status badge (plain HTML — no Tailwind classes for this public page) ────

function PublicStatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    draft:   { bg: 'rgba(100,116,139,0.12)', text: '#94A3B8' },
    sent:    { bg: 'rgba(37,99,235,0.12)',   text: '#60A5FA' },
    viewed:  { bg: 'rgba(124,58,237,0.12)',  text: '#A78BFA' },
    paid:    { bg: 'rgba(16,185,129,0.1)',   text: '#34D399' },
    overdue: { bg: 'rgba(239,68,68,0.1)',    text: '#F87171' },
  }
  const c = colors[status] ?? colors.sent
  return (
    <span
      className="inline-block text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
      style={{ background: c.bg, color: c.text, fontFamily: 'var(--font-mono), monospace' }}
    >
      {status}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Use service role (no user session on this public page)
  // We query by public_token — no user_id filter needed since token is secret
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, currency,
      subtotal, tax_rate, tax_amount, total,
      due_date, created_at, notes, payment_link,
      clients ( name, email, country ),
      invoice_items ( description, quantity, rate, amount ),
      profiles ( business_name, full_name, email, phone, address, logo_url )
    `)
    .eq('public_token', token)
    .single()

  if (!invoice) notFound()

  const clientRaw  = Array.isArray(invoice.clients)  ? invoice.clients[0]  : invoice.clients
  const profileRaw = Array.isArray(invoice.profiles) ? invoice.profiles[0] : invoice.profiles
  const items      = Array.isArray(invoice.invoice_items) ? invoice.invoice_items : []

  const client  = clientRaw  as { name: string; email: string; country: string | null } | null
  const profile = profileRaw as { business_name: string | null; full_name: string; email: string; phone: string | null; logo_url: string | null } | null

  const businessName = profile?.business_name ?? profile?.full_name ?? 'Your freelancer'
  const isOverdue    = invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()
  const displayStatus = isOverdue && invoice.status !== 'paid' ? 'overdue' : invoice.status

  return (
    <div className="min-h-screen bg-[#060A16] text-white py-12 px-4">

      {/* Branded header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <Link href="/" className="inline-block mb-6">
          <span
            className="text-sm font-semibold text-blue-400 tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            BillMetry
          </span>
        </Link>
      </div>

      {/* Invoice card */}
      <div
        className="max-w-2xl mx-auto rounded-2xl border overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(13,21,39,0.95), rgba(8,14,28,0.98))',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 0 0 1px rgba(37,99,235,0.1), 0 32px 80px rgba(5,10,25,0.6)',
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-6 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div>
            <p
              className="text-xs text-slate-500 mb-1 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Invoice
            </p>
            <p
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              {invoice.invoice_number}
            </p>
          </div>
          <PublicStatusBadge status={displayStatus} />
        </div>

        {/* From / To */}
        <div
          className="grid grid-cols-2 gap-6 px-8 py-6 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <div>
            <p
              className="text-xs text-slate-600 uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              From
            </p>
            <p className="text-sm font-semibold text-white">{businessName}</p>
            {profile?.email && <p className="text-xs text-slate-500">{profile.email}</p>}
          </div>
          <div>
            <p
              className="text-xs text-slate-600 uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              To
            </p>
            <p className="text-sm font-semibold text-white">{client?.name ?? '—'}</p>
            {client?.email   && <p className="text-xs text-slate-500">{client.email}</p>}
            {client?.country && <p className="text-xs text-slate-600">{client.country}</p>}
          </div>
        </div>

        {/* Dates */}
        <div
          className="grid grid-cols-2 gap-6 px-8 py-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}
        >
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>Issue date</p>
            <p className="text-sm text-slate-300">{fmtDate(invoice.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>Due date</p>
            <p className="text-sm" style={{ color: isOverdue ? '#F87171' : '#CBD5E1' }}>
              {fmtDate(invoice.due_date)}
              {isOverdue && ' (overdue)'}
            </p>
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 py-6">
          <div
            className="grid gap-1 mb-3 text-xs font-medium text-slate-600 uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 50px 90px 90px', fontFamily: 'var(--font-mono), monospace' }}
          >
            <span>Description</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>

          {items.map((item, i) => (
            <div
              key={i}
              className="grid items-center gap-1 py-3 border-b"
              style={{ gridTemplateColumns: '1fr 50px 90px 90px', borderColor: 'rgba(255,255,255,0.04)' }}
            >
              <span className="text-sm text-slate-300">{item.description}</span>
              <span className="text-sm text-slate-500 text-center"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{item.quantity}</span>
              <span className="text-sm text-slate-400 text-right"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{fmt(item.rate, invoice.currency)}</span>
              <span className="text-sm text-white text-right"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{fmt(item.amount, invoice.currency)}</span>
            </div>
          ))}

          {/* Totals */}
          <div className="mt-5 space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                {fmt(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            {invoice.tax_rate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax ({invoice.tax_rate}%)</span>
                <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {fmt(invoice.tax_amount, invoice.currency)}
                </span>
              </div>
            )}
            <div
              className="flex justify-between font-bold text-base pt-3 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <span className="text-white">Total</span>
              <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                {fmt(invoice.total, invoice.currency)}
              </span>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div
              className="mt-6 p-4 rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <p className="text-xs text-slate-600 uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>Notes</p>
              <p className="text-sm text-slate-400 leading-relaxed">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Pay button */}
        {invoice.status !== 'paid' && invoice.payment_link && (
          <div
            className="px-8 py-6 border-t"
            style={{ borderColor: 'rgba(37,99,235,0.15)', background: 'rgba(37,99,235,0.04)' }}
          >
            <p className="text-sm text-slate-400 mb-4 text-center">
              Pay securely with your card or bank transfer.
            </p>
            <a
              href={invoice.payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full font-bold text-white py-4 rounded-xl text-sm"
              style={{
                background: 'linear-gradient(90deg, #1D4ED8 0%, #3B82F6 50%, #2563EB 100%)',
                backgroundSize: '200% auto',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Pay {fmt(invoice.total, invoice.currency)} now →
            </a>
            <p className="text-xs text-slate-600 text-center mt-3">
              Secured by Flutterwave · Visa, Mastercard, bank transfer accepted
            </p>
          </div>
        )}

        {/* Paid confirmation */}
        {invoice.status === 'paid' && (
          <div
            className="px-8 py-6 border-t flex items-center justify-center gap-3"
            style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.05)' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-green-400">
              This invoice has been paid. Thank you!
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p className="text-xs text-slate-700">
          Powered by{' '}
          <Link href="/" className="text-blue-500 hover:text-blue-400 transition-colors">
            BillMetry
          </Link>
          {' '}· Professional invoicing for African freelancers
        </p>
      </div>
    </div>
  )
}