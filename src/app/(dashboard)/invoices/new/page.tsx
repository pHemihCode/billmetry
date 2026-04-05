import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoiceBuilder from '@/components/dashboard/Invoice/InvoiceBuilder'
import PlanGate from '@/components/ui/PlanGate'

async function getNextInvoiceNumber(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return 'INV-0001'
  const match = data.invoice_number.match(/(\d+)$/)
  if (!match) return 'INV-0001'
  const next = parseInt(match[1], 10) + 1
  return `INV-${String(next).padStart(4, '0')}`
}

export default async function NewInvoicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── Plan check — server side ────────────────────────────────────────────────
  // Get plan and monthly invoice count in parallel
  const [profileRes, countRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('plan, default_currency')
      .eq('id', user.id)
      .single(),

    supabase
      .rpc('get_monthly_invoice_count', { p_user_id: user.id }),
  ])

  const plan       = profileRes.data?.plan ?? 'free'
  const monthCount = countRes.data ?? 0
  const atLimit    = plan === 'free' && monthCount >= 3

  // ── Clients ─────────────────────────────────────────────────────────────────
  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, name, email')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('name')

  const clients = clientsData ?? []

  if (clients.length === 0) {
    redirect('/clients/new?from=invoice')
  }

  const nextInvoiceNumber = await getNextInvoiceNumber(user.id, supabase)

  // ── Render ──────────────────────────────────────────────────────────────────
  // PlanGate shows the upgrade modal if atLimit.
  // When not at limit, renders children normally.

  return (
    <PlanGate
      allowed={!atLimit}
      reason="invoice_limit"
      plan={plan}
      usage={{ current: monthCount, limit: plan === 'free' ? 3 : null }}
    >
      <InvoiceBuilder
        clients={clients}
        defaultCurrency={profileRes.data?.default_currency ?? 'NGN'}
        nextInvoiceNumber={nextInvoiceNumber}
      />
    </PlanGate>
  )
}