import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/dashboard/StatusBadge'
import SendInvoiceButton from '@/components/dashboard/Invoice/SendInvoiceButton'
import DownloadPDFButton from '@/components/dashboard/Invoice/DownloadPDFButton'
import CopyButton from '@/components/ui/CopyButton'
import type { InvoicePDFData } from '@/components/dashboard/Invoice/InvoicePDF'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sym: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }

function fmt(amount: number, currency: string) {
  return `${sym[currency] ?? ''}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Activity config ──────────────────────────────────────────────────────────

const eventCfg: Record<string, { label: string; color: string; icon: string }> = {
  created:       { label: 'Invoice created',        color: '#60A5FA', icon: '📄' },
  sent:          { label: 'Invoice sent to client',  color: '#A78BFA', icon: '✉'  },
  viewed:        { label: 'Client viewed invoice',   color: '#FBBF24', icon: '👁'  },
  paid:          { label: 'Payment received',        color: '#34D399', icon: '✓'  },
  overdue:       { label: 'Invoice became overdue',  color: '#F87171', icon: '⚠'  },
  reminder_sent: { label: 'Reminder sent to client', color: '#94A3B8', icon: '🔔' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all three resources in parallel for speed
  const [invoiceRes, profileRes, activityRes] = await Promise.all([
    supabase
      .from('invoices')
      .select(`
        id, invoice_number, status, currency,
        subtotal, tax_rate, tax_amount, total,
        due_date, notes, payment_link, paid_at, created_at,
        clients ( id, name, email, phone, address, country ),
        invoice_items ( description, quantity, rate, amount )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),

    // Profile is needed to fill "From" section and PDF business details
    supabase
      .from('profiles')
      .select('full_name, business_name, email, phone, address, logo_url')
      .eq('id', user.id)
      .single(),

    supabase
      .from('activity_log')
      .select('id, event, note, created_at')
      .eq('invoice_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!invoiceRes.data) notFound()

  const invoice  = invoiceRes.data
  const profile  = profileRes.data
  const activity = activityRes.data ?? []

  const clientRaw = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients
  const client    = clientRaw as {
    id: string; name: string; email: string
    phone: string | null; address: string | null; country: string | null
  } | null

  const items     = Array.isArray(invoice.invoice_items) ? invoice.invoice_items : []
  const isOverdue = invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()

  // ── Build InvoicePDFData ─────────────────────────────────────────────────
  // All fields the PDF template needs. Every value has a safe fallback so
  // the PDF never crashes even if profile or client data is incomplete.

  const pdfData: InvoicePDFData = {
    invoiceNumber:   invoice.invoice_number,
    status:          invoice.status,
    currency:        invoice.currency,
    subtotal:        invoice.subtotal,
    taxRate:         invoice.tax_rate,
    taxAmount:       invoice.tax_amount,
    total:           invoice.total,
    dueDate:         invoice.due_date,
    createdAt:       invoice.created_at,
    notes:           invoice.notes ?? null,

    // Business / freelancer info (from profiles table)
    businessName:    profile?.business_name ?? profile?.full_name ?? 'My Business',
    businessEmail:   profile?.email         ?? user.email          ?? '',
    businessPhone:   profile?.phone         ?? null,
    businessAddress: profile?.address       ?? null,
    logoUrl:         profile?.logo_url      ?? null,

    // Client info
    clientName:    client?.name    ?? 'Client',
    clientEmail:   client?.email   ?? '',
    clientPhone:   client?.phone   ?? null,
    clientAddress: client?.address ?? null,
    clientCountry: client?.country ?? null,

    // Line items
    items: items.map(item => ({
      description: item.description,
      quantity:    item.quantity,
      rate:        item.rate,
      amount:      item.amount,
    })),
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">

        {/* Left — back + title + status */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/invoices"
            className="text-slate-500 hover:text-white transition-colors shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-white font-bold text-lg md:text-xl"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>
                {invoice.invoice_number}
              </h2>
              <StatusBadge status={invoice.status as any} />
              {isOverdue && invoice.status !== 'paid' && (
                <StatusBadge status="overdue" />
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Due {fmtDate(invoice.due_date)}
              {invoice.paid_at && ` · Paid ${fmtDate(invoice.paid_at)}`}
            </p>
          </div>
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {invoice.status === 'draft' && (
            <Link href={`/invoices/${id}/edit`}
              className="text-sm text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border transition-all"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              Edit
            </Link>
          )}

          {/*
            DownloadPDFButton — the PDF is generated entirely in the browser.
            It receives the full pdfData object assembled above and
            triggers a file download when clicked.
          */}
          <DownloadPDFButton data={pdfData} />

          {invoice.status !== 'paid' && (
            <SendInvoiceButton
              invoiceId={id}
              currentPaymentLink={invoice.payment_link}
            />
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Main invoice card ── */}
        <div className="lg:col-span-2 rounded-2xl border overflow-hidden"
          style={{
            background:  'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
            borderColor: 'rgba(255,255,255,0.06)',
          }}>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4 p-5 md:p-6 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div>
              <p className="text-xs text-slate-600 font-medium uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>From</p>
              <p className="text-sm text-white font-medium">
                {profile?.business_name ?? profile?.full_name ?? 'My Business'}
              </p>
              <p className="text-xs text-slate-500">{profile?.email ?? user.email}</p>
              {profile?.address && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{profile.address}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>To</p>
              {client ? (
                <Link href={`/clients/${client.id}`} className="group block">
                  <p className="text-sm text-white font-medium group-hover:text-blue-300 transition-colors">
                    {client.name}
                  </p>
                  <p className="text-xs text-slate-500">{client.email}</p>
                  {client.country && (
                    <p className="text-xs text-slate-600 mt-0.5">{client.country}</p>
                  )}
                </Link>
              ) : (
                <p className="text-sm text-slate-500">—</p>
              )}
            </div>
          </div>

          {/* Issue / Due dates */}
          <div className="grid grid-cols-2 gap-4 px-5 md:px-6 py-4 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
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
              </p>
            </div>
          </div>

          {/* Line items */}
          <div className="p-5 md:p-6">

            {/* Table header — desktop only */}
            <div className="hidden sm:grid gap-2 mb-2 text-xs font-medium text-slate-600 uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 56px 96px 96px', fontFamily: 'var(--font-mono), monospace' }}>
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>

            <div className="space-y-0.5 mb-6">
              {items.map((item, i) => (
                <div key={i} className="py-3 border-b last:border-0"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}>

                  {/* Desktop */}
                  <div className="hidden sm:grid items-center gap-2"
                    style={{ gridTemplateColumns: '1fr 56px 96px 96px' }}>
                    <span className="text-sm text-slate-300">{item.description}</span>
                    <span className="text-sm text-slate-500 text-center"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}>
                      {item.quantity}
                    </span>
                    <span className="text-sm text-slate-400 text-right"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}>
                      {fmt(item.rate, invoice.currency)}
                    </span>
                    <span className="text-sm text-white font-medium text-right"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}>
                      {fmt(item.amount, invoice.currency)}
                    </span>
                  </div>

                  {/* Mobile — stacked */}
                  <div className="sm:hidden flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">{item.description}</p>
                      <p className="text-xs text-slate-600 mt-0.5"
                        style={{ fontFamily: 'var(--font-mono), monospace' }}>
                        {item.quantity} × {fmt(item.rate, invoice.currency)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white shrink-0"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}>
                      {fmt(item.amount, invoice.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 max-w-60 ml-auto">
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
              <div className="flex justify-between text-base font-bold pt-3 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-white">Total</span>
                <span style={{ fontFamily: 'var(--font-mono), monospace', color: '#60A5FA' }}>
                  {fmt(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-slate-600 uppercase tracking-widest mb-2 font-medium"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  Notes / payment terms
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">

          {/* Payment link */}
          {invoice.payment_link && invoice.status !== 'paid' && (
            <div className="rounded-2xl border p-5"
              style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(96,165,250,0.18)' }}>
              <p className="text-xs text-blue-300 font-semibold mb-1 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>Payment link</p>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Share this with your client to collect payment.
              </p>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 border"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-xs text-slate-500 truncate flex-1"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {invoice.payment_link}
                </span>
                {/* CopyButton is a client component — handles clipboard API */}
                <CopyButton text={invoice.payment_link} />
              </div>
            </div>
          )}

          {/* Paid badge */}
          {invoice.status === 'paid' && invoice.paid_at && (
            <div className="rounded-2xl border p-5 flex items-center gap-3"
              style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(52,211,153,0.2)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Payment received</p>
                <p className="text-xs text-slate-500 mt-0.5">{fmtDate(invoice.paid_at)}</p>
              </div>
            </div>
          )}

          {/* Activity timeline */}
          <div className="rounded-2xl border p-5"
            style={{
              background:  'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
              borderColor: 'rgba(255,255,255,0.06)',
            }}>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>Activity</p>

            {activity.length === 0 ? (
              <p className="text-xs text-slate-600">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((event, i) => {
                  const cfg = eventCfg[event.event] ?? {
                    label: event.event, color: '#94A3B8', icon: '•',
                  }
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{
                            background: `${cfg.color}18`,
                            border:     `1px solid ${cfg.color}30`,
                          }}>
                          <span style={{ fontSize: 10 }}>{cfg.icon}</span>
                        </div>
                        {i < activity.length - 1 && (
                          <div className="w-px flex-1 mt-1"
                            style={{ background: 'rgba(255,255,255,0.05)', minHeight: 12 }} />
                        )}
                      </div>
                      <div className="pb-3 flex-1 min-w-0">
                        <p className="text-xs font-medium text-white leading-tight">{cfg.label}</p>
                        {event.note && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{event.note}</p>
                        )}
                        <p className="text-xs text-slate-700 mt-1"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}>
                          {fmtDateTime(event.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}