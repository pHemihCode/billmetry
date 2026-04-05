import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { formatCurrency, fmtDate } from '@/lib/format'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterStatus = 'all' | 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue'

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Groups by currency and returns "₦120,000 · $800" format
function sumByCurrency(invoices: Invoice[]): string {
  if (invoices.length === 0) return formatCurrency(0, 'NGN')
  const map: Record<string, number> = {}
  for (const inv of invoices) {
    map[inv.currency] = (map[inv.currency] ?? 0) + inv.total
  }
  return Object.entries(map)
    .map(([currency, total]) => formatCurrency(total, currency))
    .join(' · ')
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const tabs: { label: string; value: FilterStatus }[] = [
  { label: 'All',     value: 'all'     },
  { label: 'Draft',   value: 'draft'   },
  { label: 'Sent',    value: 'sent'    },
  { label: 'Viewed',  value: 'viewed'  },
  { label: 'Paid',    value: 'paid'    },
  { label: 'Overdue', value: 'overdue' },
]

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyInvoices({ filter }: { filter: FilterStatus }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <h3
        className="text-white font-bold text-base mb-2"
        style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
      >
        {filter === 'all' ? 'No invoices yet' : `No ${filter} invoices`}
      </h3>
      <p className="text-slate-500 text-sm mb-6">
        {filter === 'all'
          ? 'Create your first invoice to get started.'
          : `You have no invoices with status "${filter}".`}
      </p>
      {filter === 'all' && (
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl"
          style={{
            background: 'linear-gradient(90deg, #1D4ED8, #2563EB)',
            boxShadow: '0 0 0 1px rgba(96,165,250,0.2)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create invoice
        </Link>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { status: statusParam, q } = await searchParams
  const filter = (tabs.find(t => t.value === statusParam)?.value ?? 'all') as FilterStatus

  let query = supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, total, currency, due_date, created_at,
      clients ( name )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (filter !== 'all') {
    query = query.eq('status', filter)
  }

  const { data: invoicesData } = await query
  const allInvoices: Invoice[] = invoicesData ?? []

  // Search filter — applied in memory after fetch
  const invoices = q
    ? allInvoices.filter(inv => {
        const clientRaw  = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients
        const clientName = (clientRaw as { name: string } | null)?.name?.toLowerCase() ?? ''
        const term       = q.toLowerCase()
        return inv.invoice_number.toLowerCase().includes(term) || clientName.includes(term)
      })
    : allInvoices

  // Summary line — grouped by currency so mixed totals display correctly
  const paidInvoices = allInvoices.filter(i => i.status === 'paid')

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">
            {allInvoices.length} invoice{allInvoices.length !== 1 ? 's' : ''}
          </p>
          {allInvoices.length > 0 && (
            <p
              className="text-xs text-slate-600"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              {sumByCurrency(paidInvoices)} collected
            </p>
          )}
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl"
          style={{
            background: 'linear-gradient(90deg, #1D4ED8, #2563EB)',
            boxShadow: '0 0 0 1px rgba(96,165,250,0.2)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New invoice
        </Link>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1 flex-wrap">
        {tabs.map(tab => {
          const isActive = filter === tab.value
          const count    = tab.value === 'all'
            ? allInvoices.length
            : allInvoices.filter(i => i.status === tab.value).length

          return (
            <Link
              key={tab.value}
              href={tab.value === 'all' ? '/invoices' : `/invoices?status=${tab.value}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background:  isActive ? 'rgba(37,99,235,0.15)'           : 'rgba(255,255,255,0.03)',
                color:       isActive ? '#60A5FA'                         : 'rgba(148,163,184,0.7)',
                border:      isActive ? '1px solid rgba(96,165,250,0.25)' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-xs leading-none"
                  style={{
                    background: isActive ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.06)',
                    color:      isActive ? '#93C5FD'               : '#64748B',
                    fontFamily: 'var(--font-mono), monospace',
                  }}
                >
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        {invoices.length === 0 ? (
          <EmptyInvoices filter={filter} />
        ) : (
          <>
            {/* Header row */}
            <div
              className="grid grid-cols-12 px-5 py-3 border-b text-xs font-medium text-slate-600 uppercase tracking-wider"
              style={{
                borderColor: 'rgba(255,255,255,0.05)',
                fontFamily: 'var(--font-mono), monospace',
              }}
            >
              <span className="col-span-3">Invoice</span>
              <span className="col-span-3">Client</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Due date</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>

            {/* Data rows */}
            {invoices.map((inv, i) => {
              const clientRaw  = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients
              const clientName = (clientRaw as { name: string } | null)?.name ?? '—'
              const isOverdue  = inv.status !== 'paid' && new Date(inv.due_date) < new Date()
              const isLast     = i === invoices.length - 1

              return (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="grid grid-cols-12 px-5 py-4 items-center border-b hover:bg-white/[0.02] transition-colors group"
                  style={{ borderColor: isLast ? 'transparent' : 'rgba(255,255,255,0.04)' }}
                >
                  <span
                    className="col-span-3 text-sm font-medium text-white group-hover:text-blue-300 transition-colors"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {inv.invoice_number}
                  </span>
                  <span className="col-span-3 text-sm text-slate-400 truncate pr-2">
                    {clientName}
                  </span>
                  <span className="col-span-2">
                    <StatusBadge
                      status={(isOverdue ? 'overdue' : inv.status) as any}
                      size="sm"
                    />
                  </span>
                  <span
                    className="col-span-2 text-xs"
                    style={{ color: isOverdue ? '#F87171' : '#64748B' }}
                  >
                    {fmtDate(inv.due_date)}
                  </span>
                  {/* Always uses inv.currency — the actual currency of the invoice */}
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
  )
}