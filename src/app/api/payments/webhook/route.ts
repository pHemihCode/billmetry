import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyWebhookSignature, verifyTransaction, FlutterwaveWebhookPayload } from '@/lib/flutterwave'

// Use service role key here — this runs server-side only and needs to
// bypass RLS to update invoice + insert payment record
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    // 1. Verify the request genuinely came from Flutterwave
    const signature = request.headers.get('verif-hash')
    if (!signature || !verifyWebhookSignature(signature)) {
      console.error('[webhook] Invalid signature')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: FlutterwaveWebhookPayload = await request.json()

    // 2. Only process successful charge events
    if (payload.event !== 'charge.completed' || payload.data.status !== 'successful') {
      return NextResponse.json({ received: true })
    }

    const { id: flwTransactionId, tx_ref, amount, currency, payment_type, created_at } = payload.data

    // 3. Independently verify the transaction with Flutterwave's API
    //    Never trust webhook payload amounts alone
    const verified = await verifyTransaction(flwTransactionId)
    if (!verified || verified.status !== 'successful') {
      console.error('[webhook] Transaction verification failed', tx_ref)
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    // 4. Extract invoice ID from tx_ref (format: INV-{invoiceId}-{timestamp})
    const parts = tx_ref.split('-')
    // tx_ref is "INV-{uuid}-{timestamp}" — uuid has hyphens so we rejoin
    // e.g. "INV-550e8400-e29b-41d4-a716-446655440000-1735000000000"
    const invoiceId = parts.slice(1, parts.length - 1).join('-')

    if (!invoiceId) {
      console.error('[webhook] Could not parse invoice ID from tx_ref', tx_ref)
      return NextResponse.json({ error: 'Invalid tx_ref' }, { status: 400 })
    }

    // 5. Check if we've already processed this transaction (idempotency)
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('flw_transaction_id', String(flwTransactionId))
      .single()

    if (existingPayment) {
      // Already processed — return 200 so Flutterwave doesn't retry
      return NextResponse.json({ received: true })
    }

    // 6. Fetch the invoice to get user_id
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select('id, user_id, status')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      console.error('[webhook] Invoice not found', invoiceId)
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // 7. Update invoice status to paid
    await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        flw_tx_ref: tx_ref,
      })
      .eq('id', invoiceId)

    // 8. Insert payment record
    await supabaseAdmin.from('payments').insert({
      invoice_id: invoiceId,
      user_id: invoice.user_id,
      flw_transaction_id: String(flwTransactionId),
      amount_paid: verified.amount,
      currency: verified.currency,
      payment_method: payment_type,
      status: 'successful',
      paid_at: created_at,
    })

    // 9. Log activity
    await supabaseAdmin.from('activity_log').insert({
      invoice_id: invoiceId,
      user_id: invoice.user_id,
      event: 'paid',
      note: `Payment of ${verified.currency} ${verified.amount} confirmed via Flutterwave`,
    })

    // 10. TODO: Trigger emails (receipt to client, notification to freelancer)
    //     We'll wire this up when we build lib/email.ts with Resend

    console.log('[webhook] Payment processed successfully', { invoiceId, amount: verified.amount })
    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('[webhook] Unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}