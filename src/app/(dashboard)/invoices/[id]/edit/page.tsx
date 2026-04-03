import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InvoiceBuilderEdit from '@/components/dashboard/Invoice/InvoiceBuilderEdit'

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Only draft invoices can be edited — sent/paid ones are locked
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      id, invoice_number, status, currency, subtotal,
      tax_rate, tax_amount, total, due_date, notes, client_id,
      invoice_items ( id, description, quantity, rate, amount )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!invoice) notFound()

  if (invoice.status !== 'draft') {
    // Non-draft invoices redirect back to detail — can't edit them
    redirect(`/invoices/${id}`)
  }

  const { data: clientsData } = await supabase
    .from('clients')
    .select('id, name, email')
    .eq('user_id', user.id)
    .eq('is_archived', false)
    .order('name')

  const clients = clientsData ?? []
  const items   = Array.isArray(invoice.invoice_items) ? invoice.invoice_items : []

  return (
    <InvoiceBuilderEdit
      invoiceId={id}
      clients={clients}
      initialData={{
        clientId:      invoice.client_id,
        invoiceNumber: invoice.invoice_number,
        currency:      invoice.currency,
        dueDate:       invoice.due_date,
        taxRate:       invoice.tax_rate,
        notes:         invoice.notes ?? '',
        items:         items.map(item => ({
          id:          item.id,
          description: item.description,
          quantity:    item.quantity,
          rate:        item.rate,
        })),
      }}
    />
  )
}