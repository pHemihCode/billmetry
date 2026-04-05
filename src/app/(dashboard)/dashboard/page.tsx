import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { formatCurrency, fmtDate } from '@/lib/format'

type Invoice = {
  id: string
  invoice_number: string
  status: string
  total: number
  currency: string
  due_date: string
  created_at: string
  clients: { name: string } | { name: string }[] | null
}

// Groups invoices by currency, returns array sorted by total desc
function groupByCurrency(invoices: Invoice[]): { currency: string; value: number }[] {
  const map: Record<string, number> = {}
  for (const inv of invoices) {
    map[inv.currency] = (map[inv.currency] ?? 0) + inv.total
  }
  return Object.entries(map)
    .map(([currency, value]) => ({ currency, value }))
    .sort((a, b) => b.value - a.value)
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <h3 className="text-white font-bold text-lg mb-2"
        style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
        Create your first invoice
      </h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
        Add a client, build your first invoice and send a payment link — all in under 2 minutes.
      </p>
      <Link href="/invoices/new"
        className="flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl"
        style={{ background: 'linear-gradient(90deg, #1D4ED8, #2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create invoice
      </Link>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: invoicesData } = await supabase
    .from('invoices')
    .select(`id, invoice_number, status, total, currency, due_date, created_at, clients(name)`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const invoices: Invoice[] = invoicesData ?? []

  // Grouped by currency for each stat
  const paidInvoices        = invoices.filter(i => i.status === 'paid')
  const outstandingInvoices = invoices.filter(i => ['sent', 'viewed'].includes(i.status))
  const overdueInvoices     = invoices.filter(i => i.status === 'overdue')
  const recentInvoices      = invoices.slice(0, 8)

  const icons = {
    invoiced: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
    collected: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    outstanding: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    overdue: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Stats grid — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total invoiced"
          amounts={groupByCurrency(invoices)}
          sub="all time"
          accent="blue"
          icon={icons.invoiced}
        />
        <StatsCard
          label="Collected"
          amounts={groupByCurrency(paidInvoices)}
          sub="paid invoices"
          accent="green"
          icon={icons.collected}
        />
        <StatsCard
          label="Outstanding"
          amounts={groupByCurrency(outstandingInvoices)}
          sub="awaiting payment"
          accent="amber"
          icon={icons.outstanding}
        />
        <StatsCard
          label="Overdue"
          amounts={[]}
          count={String(overdueInvoices.length)}
          sub={overdueInvoices.length === 1 ? 'invoice' : 'invoices'}
          accent="red"
          icon={icons.overdue}
        />
      </div>

      {/* Recent invoices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white"
            style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
            Recent invoices
          </h2>
          {invoices.length > 0 && (
            <Link href="/invoices"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
              View all →
            </Link>
          )}
        </div>

        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
            borderColor: 'rgba(255,255,255,0.06)',
          }}
        >
          {invoices.length === 0 ? (
            <EmptyState />
          ) : (
            <>
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

              {recentInvoices.map((inv, i) => {
                const clientRaw  = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients
                const clientName = (clientRaw as { name: string } | null)?.name ?? '—'
                const isLast     = i === recentInvoices.length - 1

                return (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="grid grid-cols-12 px-5 py-4 border-b items-center hover:bg-white/2 transition-colors group"
                    style={{ borderColor: isLast ? 'transparent' : 'rgba(255,255,255,0.04)' }}
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
                    <span className="col-span-2 text-xs text-slate-500">{fmtDate(inv.due_date)}</span>
                    <span
                      className="col-span-2 text-sm font-semibold text-right text-white"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                  </Link>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}