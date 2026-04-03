import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoiceBuilder from '@/components/dashboard/Invoice/InvoiceBuilder'

// Generates the next invoice number: finds the highest existing number
// and increments it. Falls back to INV-0001.
async function getNextInvoiceNumber(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
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

  // Fetch active clients for the selector
  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, name, email')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('name')

  const clients = clientsData ?? []

  // Get profile for default currency
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_currency')
    .eq('id', user.id)
    .single()

  const nextInvoiceNumber = await getNextInvoiceNumber(user.id, supabase)

  // If no clients yet, nudge them to add one first
  if (clients.length === 0) {
    redirect('/clients/new?from=invoice')
  }

  return (
    <InvoiceBuilder
      clients={clients}
      defaultCurrency={profile?.default_currency ?? 'NGN'}
      nextInvoiceNumber={nextInvoiceNumber}
    />
  )
}