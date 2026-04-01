import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentLink } from '@/lib/flutterwave'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invoiceId } = await request.json()
    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 })
    }

    // Fetch invoice + client + profile in one query
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        id,
        invoice_number,
        total,
        currency,
        status,
        clients ( name, email ),
        profiles ( business_name, full_name )
      `)
      .eq('id', invoiceId)
      .eq('user_id', user.id)   // RLS + explicit check
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }

    // Supabase returns joined relations as arrays even with .single() on the parent.
    // Normalize to a single object before use.
    const clientRaw = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients
    const profileRaw = Array.isArray(invoice.profiles) ? invoice.profiles[0] : invoice.profiles

    if (!clientRaw || !profileRaw) {
      return NextResponse.json({ error: 'Client or profile not found' }, { status: 404 })
    }

    const client = clientRaw as { name: string; email: string }
    const profile = profileRaw as { business_name: string | null; full_name: string }

    // Create the Flutterwave hosted payment link
    const paymentLink = await createPaymentLink({
      amount: invoice.total,
      currency: invoice.currency,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number,
      clientEmail: client.email,
      clientName: client.name,
      freelancerName: profile.business_name ?? profile.full_name,
    })

    // Save the payment link on the invoice + mark as sent
    await supabase
      .from('invoices')
      .update({
        payment_link: paymentLink,
        status: invoice.status === 'draft' ? 'sent' : invoice.status,
      })
      .eq('id', invoiceId)

    // Log activity
    await supabase.from('activity_log').insert({
      invoice_id: invoiceId,
      user_id: user.id,
      event: 'sent',
      note: 'Payment link generated and invoice sent to client',
    })

    return NextResponse.json({ paymentLink })

  } catch (err) {
    console.error('[initiate payment]', err)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }
}