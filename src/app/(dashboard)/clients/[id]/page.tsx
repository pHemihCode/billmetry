import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/dashboard/StatusBadge'
import ClientForm from '@/components/dashboard/Invoice/ClientForm'
import { formatCurrency, fmtDate } from '@/lib/format'

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientInvoice = {
  id: string
  invoice_number: string
  status: string
  total: number
  currency: string
  due_date: string
  created_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <p
        className="text-xs text-slate-600 uppercase tracking-wider mb-0.5"
        style={{ fontFamily: 'var(--font-mono), monospace' }}
      >
        {label}
      </p>
      <p className="text-sm text-slate-300">{value}</p>
    </div>
  )
}

// Groups invoices by currency and sums — returns "₦50,000 · $800"
function sumByCurrency(invoices: ClientInvoice[]): string {
  if (invoices.length === 0) return formatCurrency(0, 'NGN')
  const map: Record<string, number> = {}
  for (const inv of invoices) {
    map[inv.currency] = (map[inv.currency] ?? 0) + inv.total
  }
  return Object.entries(map)
    .map(([currency, total]) => formatCurrency(total, currency))
    .join(' · ')
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, email, phone, address, country, is_archived, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!client) notFound()

  const { data: invoicesData } = await supabase
    .from('invoices')
    .select('id, invoice_number, status, total, currency, due_date, created_at')
    .eq('client_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const invoices: ClientInvoice[] = invoicesData ?? []

  // Stats — grouped by currency so mixed invoices display correctly
  const paidInvoices        = invoices.filter(i => i.status === 'paid')
  const outstandingInvoices = invoices.filter(i => ['sent', 'viewed'].includes(i.status))

  const initials = client.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <Link
        href="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        All clients
      </Link>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Client card */}
          <div
            className="rounded-2xl border p-6"
            style={{
              background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-base font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)' }}
              >
                {initials}
              </div>
              <div>
                <p
                  className="text-base font-bold text-white"
                  style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
                >
                  {client.name}
                </p>
                <p className="text-xs text-slate-500">
                  Client since {fmtDate(client.created_at)}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <InfoRow label="Email"   value={client.email} />
              <InfoRow label="Phone"   value={client.phone} />
              <InfoRow label="Country" value={client.country} />
              <InfoRow label="Address" value={client.address} />
            </div>
          </div>

          {/* Stats — each uses the actual currency of the invoices */}
          <div
            className="rounded-2xl border p-5 space-y-3"
            style={{
              background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            {[
              { label: 'Total billed',  value: sumByCurrency(invoices),            color: '#60A5FA' },
              { label: 'Collected',     value: sumByCurrency(paidInvoices),        color: '#34D399' },
              { label: 'Outstanding',   value: sumByCurrency(outstandingInvoices), color: '#FBBF24' },
              { label: 'Invoices sent', value: String(invoices.length),            color: '#A78BFA' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: 'var(--font-mono), monospace', color: stat.color }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Quick action */}
          <Link
            href={`/invoices/new?clientId=${client.id}`}
            className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-white py-3 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(90deg, #1D4ED8, #2563EB)',
              boxShadow: '0 0 0 1px rgba(96,165,250,0.2)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New invoice for {client.name.split(' ')[0]}
          </Link>
        </div>

        {/* ── Right column — invoice history ── */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <h2
                className="text-sm font-semibold text-white"
                style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
              >
                Invoice history
              </h2>
              <span
                className="text-xs text-slate-600"
                style={{ fontFamily: 'var(--font-mono), monospace' }}
              >
                {invoices.length} total
              </span>
            </div>

            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <p className="text-slate-500 text-sm mb-4">No invoices for this client yet.</p>
                <Link
                  href={`/invoices/new?clientId=${client.id}`}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Create first invoice →
                </Link>
              </div>
            ) : (
              <>
                <div
                  className="grid grid-cols-12 px-5 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider border-b"
                  style={{
                    borderColor: 'rgba(255,255,255,0.04)',
                    fontFamily: 'var(--font-mono), monospace',
                  }}
                >
                  <span className="col-span-4">Invoice</span>
                  <span className="col-span-3">Status</span>
                  <span className="col-span-3">Due</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>

                {invoices.map((inv, i) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="grid grid-cols-12 px-5 py-4 items-center border-b hover:bg-white/2 transition-colors group"
                    style={{
                      borderColor: i === invoices.length - 1 ? 'transparent' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <span
                      className="col-span-4 text-sm font-medium text-white group-hover:text-blue-300 transition-colors"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {inv.invoice_number}
                    </span>
                    <span className="col-span-3">
                      <StatusBadge status={inv.status as any} size="sm" />
                    </span>
                    <span className="col-span-3 text-xs text-slate-500">
                      {fmtDate(inv.due_date)}
                    </span>
                    {/* formatCurrency always uses inv.currency — never hardcoded */}
                    <span
                      className="col-span-2 text-sm font-semibold text-right text-white"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      {formatCurrency(inv.total, inv.currency)}
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Edit form */}
          <div className="mt-4">
            <p
              className="text-xs text-slate-600 uppercase tracking-wider mb-3 px-1"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Edit client
            </p>
            <ClientForm
              mode="edit"
              initialData={{
                id:      client.id,
                name:    client.name,
                email:   client.email,
                phone:   client.phone   ?? '',
                address: client.address ?? '',
                country: client.country ?? '',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}