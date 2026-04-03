import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  verifyWebhookSignature,
  verifyTransaction,
  type FlutterwaveWebhookPayload,
} from '@/lib/flutterwave'
import {
  sendReceiptEmail,
  sendFreelancerPaidNotification,
} from '@/lib/email'

// ─── Supabase admin client ────────────────────────────────────────────────────
// Uses service role key to bypass RLS — this file never runs in the browser.

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const currencySymbols: Record<string, string> = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€',
}

function fmtAmount(amount: number, currency: string): string {
  const sym = currencySymbols[currency] ?? currency + ' '
  return `${sym}${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {

    // ── 1. Verify the signature ─────────────────────────────────────────────
    // Flutterwave sends a "verif-hash" header matching your FLW_WEBHOOK_HASH env var.
    // Reject anything that doesn't match — prevents spoofed requests.

    const signature = request.headers.get('verif-hash')
    if (!signature || !verifyWebhookSignature(signature)) {
      console.error('[webhook] Invalid signature')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload: FlutterwaveWebhookPayload = await request.json()

    // ── 2. Only handle successful charge completions ─────────────────────────
    if (payload.event !== 'charge.completed' || payload.data.status !== 'successful') {
      return NextResponse.json({ received: true })
    }

    const {
      id: flwTransactionId,
      tx_ref,
      payment_type,
      created_at,
    } = payload.data

    // ── 3. Independently verify with Flutterwave API ─────────────────────────
    // Never trust the webhook payload amount alone — always verify server-side.

    const verified = await verifyTransaction(flwTransactionId)
    if (!verified || verified.status !== 'successful') {
      console.error('[webhook] Transaction verification failed', tx_ref)
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    // ── 4. Parse invoice ID from tx_ref ──────────────────────────────────────
    // Format: "INV-{uuid}-{timestamp}"
    // UUIDs contain hyphens, so we strip the "INV-" prefix and the trailing
    // timestamp, then rejoin the middle segments as the UUID.
    // e.g. "INV-550e8400-e29b-41d4-a716-446655440000-1735000000000"
    //   → invoiceId = "550e8400-e29b-41d4-a716-446655440000"

    const parts     = tx_ref.split('-')
    const invoiceId = parts.slice(1, parts.length - 1).join('-')

    if (!invoiceId) {
      console.error('[webhook] Could not parse invoiceId from tx_ref', tx_ref)
      return NextResponse.json({ error: 'Invalid tx_ref' }, { status: 400 })
    }

    // ── 5. Idempotency check ──────────────────────────────────────────────────
    // Flutterwave retries webhooks on non-200 responses. If we already processed
    // this transaction, return 200 immediately without re-processing.

    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('flw_transaction_id', String(flwTransactionId))
      .single()

    if (existingPayment) {
      console.log('[webhook] Already processed, skipping', tx_ref)
      return NextResponse.json({ received: true })
    }

    // ── 6. Fetch invoice with all data needed for emails ─────────────────────
    // We expand the select here to include invoice_number, client details,
    // and the freelancer profile — all needed for email notifications.

    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        id,
        user_id,
        status,
        invoice_number,
        total,
        currency,
        clients (
          name,
          email
        ),
        profiles (
          full_name,
          business_name,
          email
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      console.error('[webhook] Invoice not found', invoiceId, invoiceError?.message)
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Safely unwrap the joined relations — Supabase returns them as arrays
    // even on a .single() parent query because the join is one-to-many capable.
    const clientRaw  = Array.isArray(invoice.clients)  ? invoice.clients[0]  : invoice.clients
    const profileRaw = Array.isArray(invoice.profiles) ? invoice.profiles[0] : invoice.profiles

    const client  = clientRaw  as { name: string;  email: string } | null
    const profile = profileRaw as {
      full_name: string
      business_name: string | null
      email: string
    } | null

    // Resolved display values used in emails
    const freelancerName  = profile?.business_name ?? profile?.full_name ?? 'Your freelancer'
    const freelancerEmail = profile?.email ?? ''
    const clientName      = client?.name  ?? 'Client'
    const clientEmail     = client?.email ?? ''

    const formattedAmount = fmtAmount(verified.amount, verified.currency)
    const formattedDate   = fmtDate(new Date().toISOString())

    // ── 7. Update invoice to paid ─────────────────────────────────────────────

    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status:     'paid',
        paid_at:    new Date().toISOString(),
        flw_tx_ref: tx_ref,
      })
      .eq('id', invoiceId)

    if (updateError) {
      console.error('[webhook] Failed to update invoice', updateError.message)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // ── 8. Insert payment record ───────────────────────────────────────────────

    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        invoice_id:         invoiceId,
        user_id:            invoice.user_id,
        flw_transaction_id: String(flwTransactionId),
        amount_paid:        verified.amount,
        currency:           verified.currency,
        payment_method:     payment_type,
        status:             'successful',
        paid_at:            created_at,
      })

    if (paymentError) {
      console.error('[webhook] Failed to insert payment record', paymentError.message)
      // Don't return error here — invoice is already marked paid.
      // Log it and continue so emails still send.
    }

    // ── 9. Log activity ────────────────────────────────────────────────────────

    await supabaseAdmin.from('activity_log').insert({
      invoice_id: invoiceId,
      user_id:    invoice.user_id,
      event:      'paid',
      note:       `Payment of ${formattedAmount} confirmed via Flutterwave`,
    })

    // ── 10. Send emails ────────────────────────────────────────────────────────
    // Fire both emails concurrently. We wrap in try/catch so an email failure
    // doesn't cause Flutterwave to retry the entire webhook.

    try {
      await Promise.all([
        // Receipt to client
        clientEmail ? sendReceiptEmail({
          to:            clientEmail,
          clientName,
          invoiceNumber: invoice.invoice_number,
          amount:        formattedAmount,
          paidAt:        formattedDate,
        }) : Promise.resolve(),

        // Paid notification to freelancer
        freelancerEmail ? sendFreelancerPaidNotification({
          to:            freelancerEmail,
          freelancerName,
          clientName,
          invoiceNumber: invoice.invoice_number,
          amount:        formattedAmount,
          paidAt:        formattedDate,
        }) : Promise.resolve(),
      ])
    } catch (emailErr) {
      // Email failure is non-fatal — payment is already recorded
      console.error('[webhook] Email send failed (non-fatal)', emailErr)
    }

    console.log('[webhook] Payment processed successfully', {
      invoiceId,
      invoiceNumber: invoice.invoice_number,
      amount:        verified.amount,
      currency:      verified.currency,
    })

    return NextResponse.json({ received: true })

  } catch (err) {
    console.error('[webhook] Unexpected error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}