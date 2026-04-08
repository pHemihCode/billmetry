"use client"
import Link from 'next/link'
import StatusBadge from '@/components/dashboard/StatusBadge'
import SendInvoiceButton from '@/components/dashboard/Invoice/SendInvoiceButton'
import DownloadPDFButton from '@/components/dashboard/Invoice/DownloadPDFButton'
const currencySymbols: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }
function fmt(amount: number, currency: string) {
  const sym = currencySymbols[currency] ?? ''
  return `${sym}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
}

const eventConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  created:       { label: 'Invoice created',        color: '#60A5FA', icon: '📄' },
  sent:          { label: 'Invoice sent to client',  color: '#A78BFA', icon: '✉' },
  viewed:        { label: 'Client viewed invoice',   color: '#FBBF24', icon: '👁' },
  paid:          { label: 'Payment received',        color: '#34D399', icon: '✓'  },
  overdue:       { label: 'Invoice became overdue',  color: '#F87171', icon: '⚠'  },
  reminder_sent: { label: 'Reminder sent to client', color: '#94A3B8', icon: '🔔' },
}

type Client = { id: string; name: string; email: string; phone: string | null; address: string | null; country: string | null; } | null;
type InvoiceItem = { description: string; quantity: number; rate: number; amount: number; };
type ActivityEvent = { id: string; event: string; note: string | null; created_at: string; };
type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  due_date: string;
  notes: string | null;
  payment_link: string | null;
  paid_at: string | null;
};

interface InvoiceDetailViewProps {
  invoice: Invoice;
  items: InvoiceItem[];
  client: Client;
  activity: ActivityEvent[];
  isOverdue: boolean;
  id: string;
}

const InvoiceDetailView = ({ invoice,
  items,
  client,
  activity,
  isOverdue,
  id,}: InvoiceDetailViewProps) => {
  return (
   <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/invoices" className="text-slate-500 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold text-xl"
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

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/invoices/${id}/edit`}
            className="text-sm text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border border-white/8 hover:border-white/15 transition-all">
            Edit
          </Link>
          {/* SendInvoiceButton is a client component — handles the API call */}
          {invoice.status !== 'paid' && (
            <SendInvoiceButton invoiceId={id} currentPaymentLink={invoice.payment_link} />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Main invoice card ── */}
        <div className="lg:col-span-2 rounded-2xl border overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-4 p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div>
              <p className="text-xs text-slate-600 font-medium uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>From</p>
              <p className="text-sm text-white font-medium">Your business</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium uppercase tracking-widest mb-2"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>To</p>
              {client ? (
                <Link href={`/clients/${client.id}`} className="hover:text-blue-300 transition-colors">
                  <p className="text-sm text-white font-medium">{client.name}</p>
                  <p className="text-xs text-slate-500">{client.email}</p>
                  {client.country && <p className="text-xs text-slate-600">{client.country}</p>}
                </Link>
              ) : <p className="text-sm text-slate-500">—</p>}
            </div>
          </div>

          {/* Line items */}
          <div className="p-6">
            <div className="grid gap-1 mb-3 text-xs font-medium text-slate-600 uppercase tracking-wider"
              style={{ gridTemplateColumns: '1fr 60px 100px 100px', fontFamily: 'var(--font-mono), monospace' }}>
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Amount</span>
            </div>

            <div className="space-y-1 mb-6">
              {items.map((item, i) => (
                <div key={i} className="grid items-center gap-1 py-2.5 border-b"
                  style={{ gridTemplateColumns: '1fr 60px 100px 100px', borderColor: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-sm text-slate-300">{item.description}</span>
                  <span className="text-sm text-slate-500 text-center"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}>{item.quantity}</span>
                  <span className="text-sm text-slate-400 text-right"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}>{fmt(item.rate, invoice.currency)}</span>
                  <span className="text-sm text-white text-right"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}>{fmt(item.amount, invoice.currency)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 max-w-xs ml-auto">
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
              <div className="flex justify-between text-base font-bold pt-2 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <span className="text-white">Total</span>
                <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {fmt(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-slate-600 uppercase tracking-widest mb-2 font-medium"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}>Notes</p>
                <p className="text-sm text-slate-400 leading-relaxed">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: payment link + activity ── */}
        <div className="space-y-4">

          {/* Payment link card */}
          {invoice.payment_link && invoice.status !== 'paid' && (
            <div className="rounded-2xl border p-5"
              style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(96,165,250,0.18)' }}>
              <p className="text-xs text-blue-300 font-medium mb-2 uppercase tracking-widest"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>Payment link</p>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">Share this link with your client so they can pay.</p>
              <div className="flex items-center gap-2 bg-white/4 rounded-xl px-3 py-2 border border-white/8">
                <span className="text-xs text-slate-400 truncate flex-1">{invoice.payment_link}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(invoice.payment_link!)}
                  className="text-blue-400 hover:text-blue-300 transition-colors shrink-0 text-xs font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          {/* Activity log */}
          <div className="rounded-2xl border p-5"
            style={{ background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-4"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>Activity</p>

            {activity.length === 0 ? (
              <p className="text-xs text-slate-600">No activity yet.</p>
            ) : (
              <div className="space-y-4">
                {activity.map((event, i) => {
                  const cfg = eventConfig[event.event] ?? { label: event.event, color: '#94A3B8', icon: '•' }
                  return (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0"
                          style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                          <span style={{ fontSize: '10px' }}>{cfg.icon}</span>
                        </div>
                        {i < activity.length - 1 && (
                          <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.05)', minHeight: '16px' }} />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-xs font-medium text-white">{cfg.label}</p>
                        {event.note && <p className="text-xs text-slate-500 mt-0.5">{event.note}</p>}
                        <p className="text-xs text-slate-700 mt-0.5"
                          style={{ fontFamily: 'var(--font-mono), monospace' }}>
                          {new Date(event.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
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

export default InvoiceDetailView