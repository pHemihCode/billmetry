import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnalyticsCharts from '@/components/dashboard/AnalyticsCharts'
import PlanGate from '@/components/ui/PlanGate'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string) {
  const [year, month] = key.split('-')
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-NG', {
    month: 'short', year: '2-digit',
  })
}

// Generate last N months as keys, so chart always shows a full range
function lastNMonths(n: number): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all invoices with client name
   const [profileRes, invoicesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single(),
 
    supabase
      .from('invoices')
      .select(`
        id, status, total, currency, created_at, paid_at, due_date,
        clients ( name )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ])

 const plan     = (profileRes.data?.plan ?? 'free') as string
  const invoices = invoicesRes.data ?? []

  // ── Monthly revenue chart data (last 6 months) ───────────────────────────
  const months = lastNMonths(6)

  const monthlyMap: Record<string, { invoiced: number; collected: number }> = {}
  months.forEach(m => { monthlyMap[m] = { invoiced: 0, collected: 0 } })

  invoices.forEach(inv => {
    const created = monthKey(inv.created_at)
    if (monthlyMap[created]) {
      monthlyMap[created].invoiced += inv.total
    }
    if (inv.status === 'paid' && inv.paid_at) {
      const paid = monthKey(inv.paid_at)
      if (monthlyMap[paid]) {
        monthlyMap[paid].collected += inv.total
      }
    }
  })

  const chartData = months.map(m => ({
    month:     monthLabel(m),
    invoiced:  Math.round(monthlyMap[m].invoiced),
    collected: Math.round(monthlyMap[m].collected),
  }))

  // ── Top clients by revenue ───────────────────────────────────────────────
  const clientMap: Record<string, { name: string; total: number; paid: number; count: number }> = {}
  invoices.forEach(inv => {
    const clientRaw  = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients
    const clientName = (clientRaw as { name: string } | null)?.name ?? 'Unknown'
    if (!clientMap[clientName]) {
      clientMap[clientName] = { name: clientName, total: 0, paid: 0, count: 0 }
    }
    clientMap[clientName].total += inv.total
    clientMap[clientName].count += 1
    if (inv.status === 'paid') clientMap[clientName].paid += inv.total
  })

  const topClients = Object.values(clientMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // ── Summary stats ────────────────────────────────────────────────────────
  const totalInvoiced  = invoices.reduce((s, i) => s + i.total, 0)
  const totalCollected = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalOverdue   = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0)
  const collectionRate = totalInvoiced > 0
    ? Math.round((totalCollected / totalInvoiced) * 100)
    : 0

  // ── Average payment time ─────────────────────────────────────────────────
  const paidInvoices = invoices.filter(i => i.status === 'paid' && i.paid_at)
  const avgPaymentDays = paidInvoices.length > 0
    ? Math.round(
        paidInvoices.reduce((s, i) => {
          const created = new Date(i.created_at).getTime()
          const paid    = new Date(i.paid_at!).getTime()
          return s + (paid - created) / (1000 * 60 * 60 * 24)
        }, 0) / paidInvoices.length
      )
    : null

  // ── Status breakdown ─────────────────────────────────────────────────────
  const statusBreakdown = [
    { name: 'Paid',     value: invoices.filter(i => i.status === 'paid').length,    color: '#34D399' },
    { name: 'Sent',     value: invoices.filter(i => i.status === 'sent').length,    color: '#60A5FA' },
    { name: 'Draft',    value: invoices.filter(i => i.status === 'draft').length,   color: '#64748B' },
    { name: 'Overdue',  value: invoices.filter(i => i.status === 'overdue').length, color: '#F87171' },
    { name: 'Viewed',   value: invoices.filter(i => i.status === 'viewed').length,  color: '#A78BFA' },
  ].filter(s => s.value > 0)

  return (
     <PlanGate allowed={plan !== 'free'} reason="analytics" plan={plan}>

       <AnalyticsCharts
         chartData={chartData}
         topClients={topClients}
         statusBreakdown={statusBreakdown}
         summary={{
           totalInvoiced,
           totalCollected,
           totalOverdue,
           collectionRate,
           avgPaymentDays,
           totalCount: invoices.length,
         }}
         />
     </PlanGate>
  )
}