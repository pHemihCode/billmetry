import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsCard from '@/components/dashboard/StatsCard'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { formatCurrency, fmtDate } from '@/lib/format'

type Invoice = {
  id: string; invoice_number: string; status: string
  total: number; currency: string; due_date: string
  created_at: string; clients: { name: string } | { name: string }[] | null
}

function groupByCurrency(invoices: Invoice[]) {
  const map: Record<string, number> = {}
  for (const inv of invoices) map[inv.currency] = (map[inv.currency] ?? 0) + inv.total
  return Object.entries(map).map(([currency, value]) => ({ currency, value })).sort((a, b) => b.value - a.value)
}

function clientName(inv: Invoice) {
  const raw = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients
  return (raw as { name: string } | null)?.name ?? '—'
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </div>
      <h3 className="text-white font-bold text-base mb-2" style={{ fontFamily: 'var(--font-bricolage),sans-serif' }}>
        No invoices yet
      </h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-5">
        Create your first invoice and send a payment link in under 2 minutes.
      </p>
      <Link href="/invoices/new"
        className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl"
        style={{ background: 'linear-gradient(90deg,#1D4ED8,#2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
    .select('id, invoice_number, status, total, currency, due_date, created_at, clients(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const invoices: Invoice[]         = invoicesData ?? []
  const paidInvoices                = invoices.filter(i => i.status === 'paid')
  const outstandingInvoices         = invoices.filter(i => ['sent','viewed'].includes(i.status))
  const overdueInvoices             = invoices.filter(i => i.status === 'overdue')
  const recentInvoices              = invoices.slice(0, 6)

  const statIcon = (path: string) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path}/>
    </svg>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Stats — 2×2 on mobile, 4 across on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <StatsCard label="Total invoiced" amounts={groupByCurrency(invoices)} sub="all time" accent="blue"
          icon={statIcon('M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6')} />
        <StatsCard label="Collected" amounts={groupByCurrency(paidInvoices)} sub="paid" accent="green"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>} />
        <StatsCard label="Outstanding" amounts={groupByCurrency(outstandingInvoices)} sub="pending" accent="amber"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
        <StatsCard label="Overdue" amounts={[]} count={String(overdueInvoices.length)}
          sub={overdueInvoices.length === 1 ? 'invoice' : 'invoices'} accent="red"
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>} />
      </div>

      {/* ── Recent invoices ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'var(--font-bricolage),sans-serif' }}>
            Recent invoices
          </h2>
          {invoices.length > 0 && (
            <Link href="/invoices" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</Link>
          )}
        </div>

        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'linear-gradient(145deg,rgba(13,21,39,0.9),rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>

          {invoices.length === 0 ? <EmptyState /> : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                {/* Header row */}
                <div className="flex items-center px-5 py-3 border-b text-xs font-medium text-slate-600 uppercase tracking-wider gap-4"
                  style={{ borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono),monospace' }}>
                  <span className="w-28 shrink-0">Invoice</span>
                  <span className="flex-1">Client</span>
                  <span className="w-24 shrink-0">Status</span>
                  <span className="w-24 shrink-0">Due</span>
                  <span className="w-24 shrink-0 text-right">Amount</span>
                </div>
                {recentInvoices.map((inv, i) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`}
                    className="flex items-center px-5 py-3.5 border-b hover:bg-white/2 transition-colors group gap-4"
                    style={{ borderColor: i === recentInvoices.length - 1 ? 'transparent' : 'rgba(255,255,255,0.04)' }}>
                    <span className="w-28 shrink-0 text-sm font-medium text-white group-hover:text-blue-300 transition-colors truncate"
                      style={{ fontFamily: 'var(--font-mono),monospace' }}>
                      {inv.invoice_number}
                    </span>
                    <span className="flex-1 text-sm text-slate-400 truncate">{clientName(inv)}</span>
                    <span className="w-24 shrink-0">
                      <StatusBadge status={inv.status as any} size="sm" />
                    </span>
                    <span className="w-24 shrink-0 text-xs text-slate-500">{fmtDate(inv.due_date)}</span>
                    <span className="w-24 shrink-0 text-sm font-semibold text-right text-white"
                      style={{ fontFamily: 'var(--font-mono),monospace' }}>
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Mobile card list */}
              <div className="md:hidden">
                {recentInvoices.map((inv, i) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`}
                    className="flex justify-between px-4 py-4 border-b hover:bg-white/2 transition-colors"
                    style={{ borderColor: i === recentInvoices.length - 1 ? 'transparent' : 'rgba(255,255,255,0.05)' }}>
                    {/* Left side */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate"
                          style={{ fontFamily: 'var(--font-mono),monospace' }}>
                          {inv.invoice_number}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{clientName(inv)}</p>
                        <StatusBadge status={inv.status as any} size="sm" />
                      </div>
                    </div>
                    {/* Right side */}
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-white" style={{ fontFamily: 'var(--font-mono),monospace' }}>
                        {formatCurrency(inv.total, inv.currency)}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">{fmtDate(inv.due_date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}