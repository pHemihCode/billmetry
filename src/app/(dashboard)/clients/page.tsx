import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyClients() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h3 className="text-white font-bold text-lg mb-2"
        style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
        Add your first client
      </h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-6">
        Clients are linked to invoices. Add a client before creating your first invoice.
      </p>
      <Link href="/clients/new"
        className="flex items-center gap-2 text-sm font-semibold text-white px-6 py-3 rounded-xl"
        style={{ background: 'linear-gradient(90deg, #1D4ED8, #2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add client
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, name, email, phone, country, is_archived, created_at')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  const clients = clientsData ?? []

  // Count invoices per client
  const { data: invoiceCounts } = await supabase
    .from('invoices')
    .select('client_id')
    .eq('user_id', user.id)

  const countMap = (invoiceCounts ?? []).reduce<Record<string, number>>((acc, inv) => {
    acc[inv.client_id] = (acc[inv.client_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto">

      {/* Page actions */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {clients.length} {clients.length === 1 ? 'client' : 'clients'}
        </p>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl"
          style={{ background: 'linear-gradient(90deg, #1D4ED8, #2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border"
          style={{ background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>
          <EmptyClients />
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>

          {/* Header row */}
          <div className="grid grid-cols-12 px-5 py-3 border-b text-xs font-medium text-slate-600 uppercase tracking-wider"
            style={{ borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono), monospace' }}>
            <span className="col-span-4">Name</span>
            <span className="col-span-4">Email</span>
            <span className="col-span-2">Country</span>
            <span className="col-span-2 text-right">Invoices</span>
          </div>

          {/* Rows */}
          {clients.map((client, i) => {
            const initials = client.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
            const invoiceCount = countMap[client.id] ?? 0
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="grid grid-cols-12 px-5 py-4 border-b items-center hover:bg-white/2 transition-colors group"
                style={{ borderColor: i === clients.length - 1 ? 'transparent' : 'rgba(255,255,255,0.04)' }}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)' }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{client.name}</p>
                    {client.phone && <p className="text-xs text-slate-600">{client.phone}</p>}
                  </div>
                </div>
                <span className="col-span-4 text-sm text-slate-400 truncate pr-4">{client.email}</span>
                <span className="col-span-2 text-sm text-slate-500">{client.country || '—'}</span>
                <span className="col-span-2 text-sm text-right font-medium"
                  style={{ fontFamily: 'var(--font-mono), monospace', color: invoiceCount > 0 ? '#60A5FA' : '#475569' }}>
                  {invoiceCount}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}