import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function EmptyClients() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <h3 className="text-white font-bold text-base mb-2" style={{ fontFamily: 'var(--font-bricolage),sans-serif' }}>
        Add your first client
      </h3>
      <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-5">
        Clients are linked to invoices. Add one before creating your first invoice.
      </p>
      <Link href="/clients/new"
        className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl"
        style={{ background: 'linear-gradient(90deg,#1D4ED8,#2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add client
      </Link>
    </div>
  )
}

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, name, email, phone, country, created_at')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('name')

  const clients = clientsData ?? []

  const { data: invoiceCounts } = await supabase
    .from('invoices')
    .select('client_id')
    .eq('user_id', user.id)

  const countMap = (invoiceCounts ?? []).reduce<Record<string, number>>((acc, inv) => {
    acc[inv.client_id] = (acc[inv.client_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {clients.length} {clients.length === 1 ? 'client' : 'clients'}
        </p>
        <Link href="/clients/new"
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl"
          style={{ background: 'linear-gradient(90deg,#1D4ED8,#2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add client
        </Link>
      </div>

      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'linear-gradient(145deg,rgba(13,21,39,0.9),rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>

        {clients.length === 0 ? <EmptyClients /> : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <div className="flex items-center px-5 py-3 border-b text-xs font-medium text-slate-600 uppercase tracking-wider gap-4"
                style={{ borderColor: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono),monospace' }}>
                <span className="flex-1">Name</span>
                <span className="w-48 flex-shrink-0">Email</span>
                <span className="w-28 flex-shrink-0">Country</span>
                <span className="w-20 flex-shrink-0 text-right">Invoices</span>
              </div>

              {clients.map((client, i) => {
                const initials     = client.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                const invoiceCount = countMap[client.id] ?? 0
                return (
                  <Link key={client.id} href={`/clients/${client.id}`}
                    className="flex items-center px-5 py-3.5 border-b hover:bg-white/[0.02] transition-colors group gap-4"
                    style={{ borderColor: i === clients.length - 1 ? 'transparent' : 'rgba(255,255,255,0.04)' }}>
                    {/* Name + avatar */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                        style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)' }}>
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                          {client.name}
                        </p>
                        {client.phone && (
                          <p className="text-xs text-slate-600 truncate">{client.phone}</p>
                        )}
                      </div>
                    </div>
                    <span className="w-48 flex-shrink-0 text-sm text-slate-400 truncate">{client.email}</span>
                    <span className="w-28 flex-shrink-0 text-sm text-slate-500">{client.country || '—'}</span>
                    <span className="w-20 flex-shrink-0 text-sm font-medium text-right"
                      style={{ fontFamily: 'var(--font-mono),monospace', color: invoiceCount > 0 ? '#60A5FA' : '#475569' }}>
                      {invoiceCount}
                    </span>
                  </Link>
                )
              })}
            </div>

            {/* Mobile card list */}
            <div className="md:hidden">
              {clients.map((client, i) => {
                const initials     = client.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
                const invoiceCount = countMap[client.id] ?? 0
                return (
                  <Link key={client.id} href={`/clients/${client.id}`}
                    className="flex items-center gap-3 px-4 py-4 border-b hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor: i === clients.length - 1 ? 'transparent' : 'rgba(255,255,255,0.05)' }}>
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)' }}>
                      {initials}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{client.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{client.email}</p>
                    </div>
                    {/* Invoice count + chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {invoiceCount > 0 && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ background: 'rgba(37,99,235,0.12)', color: '#60A5FA', fontFamily: 'var(--font-mono),monospace' }}>
                          {invoiceCount}
                        </span>
                      )}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}