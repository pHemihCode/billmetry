import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// Flutterwave redirects here after payment with these query params:
// ?status=successful&tx_ref=INV-xxx&transaction_id=12345
// This page shows confirmation to the client and verifies payment

export default async function InvoicePaidPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }>
}) {
  const { status, tx_ref, transaction_id } = await searchParams

  const isSuccess = status === 'successful'

  // Try to find the invoice from tx_ref so we can show details
  let invoiceNumber: string | null = null
  let clientName: string | null = null

  if (tx_ref && isSuccess) {
    const supabase = await createClient()

    // tx_ref format: INV-{invoiceId}-{timestamp}
    const parts     = tx_ref.split('-')
    const invoiceId = parts.slice(1, parts.length - 1).join('-')

    if (invoiceId) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number, clients(name)')
        .eq('id', invoiceId)
        .single()

      if (invoice) {
        invoiceNumber = invoice.invoice_number
        const clientRaw = Array.isArray(invoice.clients) ? invoice.clients[0] : invoice.clients
        clientName = (clientRaw as { name: string } | null)?.name ?? null
      }
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: '#060A16' }}
    >
      <div
        className="w-full max-w-md text-center rounded-2xl border p-10"
        style={{
          background:   'linear-gradient(145deg, rgba(13,21,39,0.95), rgba(8,14,28,0.98))',
          borderColor:  isSuccess ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
          boxShadow:    isSuccess
            ? '0 0 0 1px rgba(52,211,153,0.08), 0 32px 80px rgba(0,0,0,0.5)'
            : '0 0 0 1px rgba(239,68,68,0.08), 0 32px 80px rgba(0,0,0,0.5)',
        }}
      >
        {isSuccess ? (
          <>
            {/* Success icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(52,211,153,0.25)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>

            <h1
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
              Payment successful!
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              {invoiceNumber
                ? <>Your payment for invoice <span className="text-white font-mono font-semibold">{invoiceNumber}</span> has been confirmed.</>
                : 'Your payment has been confirmed and processed.'}
            </p>

            {/* Transaction ID for reference */}
            {transaction_id && (
              <div
                className="rounded-xl px-4 py-3 mb-6 text-left"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-xs text-slate-600 mb-1" style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  TRANSACTION ID
                </p>
                <p className="text-sm text-slate-300 font-mono">{transaction_id}</p>
              </div>
            )}

            <p className="text-xs text-slate-600 mb-8">
              A receipt has been sent to your email address.
            </p>

            <p
              className="text-xs text-slate-700"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Powered by BillMetry
            </p>
          </>
        ) : (
          <>
            {/* Failed icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(248,113,113,0.25)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>

            <h1
              className="text-2xl font-bold text-white mb-3"
              style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
            >
              Payment not completed
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Something went wrong with your payment. No money has been charged.
              Please try again or contact the sender for a new payment link.
            </p>

            <p
              className="text-xs text-slate-700"
              style={{ fontFamily: 'var(--font-mono), monospace' }}
            >
              Powered by BillMetry
            </p>
          </>
        )}
      </div>
    </div>
  )
}