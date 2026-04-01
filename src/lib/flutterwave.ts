// Flutterwave API helper
// Uses raw fetch — no npm package needed. Cleaner and lighter.

const FLW_BASE = process.env.FLW_BASE
const FLW_SECRET = process.env.FLW_SECRET_KEY!

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreatePaymentLinkParams {
  amount: number
  currency: string        // 'NGN' | 'USD' | 'GBP' | 'EUR'
  invoiceId: string       // your Supabase invoice UUID
  invoiceNumber: string   // e.g. INV-0042
  clientEmail: string
  clientName: string
  freelancerName: string
}

export interface FlutterwaveWebhookPayload {
  event: string
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    amount: number
    currency: string
    status: 'successful' | 'failed'
    payment_type: string
    customer: {
      email: string
      name: string
    }
    created_at: string
  }
}

// ─── Create a hosted payment link ────────────────────────────────────────────
// Flutterwave hosts the checkout page — you just redirect the client there.

export async function createPaymentLink(params: CreatePaymentLinkParams): Promise<string> {
  const txRef = `INV-${params.invoiceId}-${Date.now()}`

  const response = await fetch(`${FLW_BASE}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${FLW_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: params.amount,
      currency: params.currency,
      redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/invoice/paid?ref=${txRef}`,
      customer: {
        email: params.clientEmail,
        name: params.clientName,
      },
      meta: {
        invoice_id: params.invoiceId,
        invoice_number: params.invoiceNumber,
      },
      customizations: {
        title: `Invoice ${params.invoiceNumber}`,
        description: `Payment to ${params.freelancerName}`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
    }),
  })

  const data = await response.json()

  if (data.status !== 'success') {
    throw new Error(data.message ?? 'Failed to create payment link')
  }

  return data.data.link as string
}

// ─── Verify a webhook signature ───────────────────────────────────────────────
// Flutterwave sends a hash header with every webhook.
// Always verify it before trusting the payload.

export function verifyWebhookSignature(receivedHash: string): boolean {
  const secretHash = process.env.FLW_WEBHOOK_HASH!
  return receivedHash === secretHash
}

// ─── Verify a transaction directly with Flutterwave ──────────────────────────
// Belt-and-suspenders: after the webhook fires, verify the tx independently.
// Never mark an invoice paid based on webhook data alone.

export async function verifyTransaction(transactionId: number): Promise<{
  status: 'successful' | 'failed'
  amount: number
  currency: string
  txRef: string
} | null> {
  const response = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${FLW_SECRET}` },
  })

  const data = await response.json()

  if (data.status !== 'success') return null

  return {
    status: data.data.status,
    amount: data.data.amount,
    currency: data.data.currency,
    txRef: data.data.tx_ref,
  }
}