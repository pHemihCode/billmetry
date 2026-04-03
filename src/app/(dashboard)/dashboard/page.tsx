import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import StatusBadge from '@/components/dashboard/StatusBadge'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency = 'NGN') {
  const symbols: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }
  const sym = symbols[currency] ?? currency + ' '
  return `${sym}${amount.toLocaleString('en-NG', { minimumFractionDigits: 0 })}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Illustration */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <h3
        className="text-white font-bold text-lg mb-2"
        style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
      >
        Create your first invoice
      </h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
        Add a client, build your first invoice and send a payment link — all in under 2 minutes.
      </p>
      <Link
        href="/invoices/new"
        className="flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl transition-all"
        style={{ background: 'linear-gradient(90deg, #1D4ED8, #2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create invoice
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all invoices for this user in one query
  const { data: invoicesData } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, total, currency, due_date, created_at,
      clients ( name )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    const invoices = invoicesData ?? []

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalInvoiced  = invoices.reduce((s, inv) => s + inv.total, 0)
  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalOutstanding = invoices
    .filter(i => ['sent', 'viewed'].includes(i.status))
    .reduce((s, i) => s + i.total, 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length
  const recentInvoices = invoices.slice(0, 8)

  // ── Stat icons ──────────────────────────────────────────────────────────────
  const icons = {
    invoiced: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    collected: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    outstanding: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    overdue: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total invoiced"
          value={formatCurrency(totalInvoiced)}
          sub="all time"
          accent="blue"
          icon={icons.invoiced}
        />
        <StatsCard
          label="Collected"
          value={formatCurrency(totalCollected)}
          sub="paid invoices"
          accent="green"
          icon={icons.collected}
        />
        <StatsCard
          label="Outstanding"
          value={formatCurrency(totalOutstanding)}
          sub="awaiting payment"
          accent="amber"
          icon={icons.outstanding}
        />
        <StatsCard
          label="Overdue"
          value={String(overdueCount)}
          sub={overdueCount === 1 ? 'invoice' : 'invoices'}
          accent="red"
          icon={icons.overdue}
        />
      </div>

      {/* Recent invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-sm font-semibold text-white"
            style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
          >
            Recent invoices
          </h2>
          {invoices.length > 0 && (
            <Link href="/invoices" className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
              View all →
            </Link>
          )}
        </div>

        {invoices.length === 0 ? (
          <div
            className="rounded-2xl border"
            style={{
              background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <EmptyState />
          </div>
        ) : (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-12 px-5 py-3 border-b text-xs font-medium text-slate-600 uppercase tracking-wider"
              style={{ borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono), monospace' }}
            >
              <span className="col-span-3">Invoice</span>
              <span className="col-span-3">Client</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Due</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>

            {/* Rows */}
            {recentInvoices.map((inv, i) => {
              const clientRaw = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients
              const clientName = (clientRaw as { name: string } | null)?.name ?? '—'

              return (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="grid grid-cols-12 px-5 py-4 border-b items-center hover:bg-white/2 transition-colors group"
                  style={{ borderColor: i === recentInvoices.length - 1 ? 'transparent' : 'rgba(255,255,255,0.04)' }}
                >
                  <span
                    className="col-span-3 text-sm font-medium text-white group-hover:text-blue-300 transition-colors"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {inv.invoice_number}
                  </span>
                  <span className="col-span-3 text-sm text-slate-400 truncate pr-2">{clientName}</span>
                  <span className="col-span-2">
                    <StatusBadge status={inv.status as any} size="sm" />
                  </span>
                  <span className="col-span-2 text-xs text-slate-500">
                    {formatDate(inv.due_date)}
                  </span>
                  <span
                    className="col-span-2 text-sm font-semibold text-right text-white"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {formatCurrency(inv.total, inv.currency)}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}