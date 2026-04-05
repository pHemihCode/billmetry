import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoiceDetailView from '@/components/dashboard/Invoice/InvoiceDetailView'


// ─── Helpers ──────────────────────────────────────────────────────────────────




// ─── Activity timeline ────────────────────────────────────────────────────────



// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch invoice with client details
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, currency, subtotal, tax_rate, tax_amount,
      total, due_date, notes, payment_link, paid_at, created_at,
      clients ( id, name, email, phone, address, country ),
      invoice_items ( description, quantity, rate, amount )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) notFound()

  // Fetch activity log
  const { data: activityData } = await supabase
    .from('activity_log')
    .select('id, event, note, created_at')
    .eq('invoice_id', id)
    .order('created_at', { ascending: true })

  const activity  = activityData ?? []
  const clientRaw = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients
  const client    = clientRaw as { id: string; name: string; email: string; phone: string; address: string; country: string } | null
  const items     = Array.isArray(invoice.invoice_items) ? invoice.invoice_items : []

  const isOverdue = invoice.status !== 'paid' && new Date(invoice.due_date) < new Date()

  return (
    <InvoiceDetailView id={id} invoice={invoice as any} activity={activity} client={client} items={items} isOverdue={isOverdue}/>
  )
}