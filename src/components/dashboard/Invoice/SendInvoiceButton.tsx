'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
// This is intentionally a small, focused client component.
// The invoice detail page is a Server Component — we isolate
// the interactive "Send" button here to keep the rest server-rendered.

interface SendInvoiceButtonProps {
  invoiceId: string
  currentPaymentLink: string | null
}

export default function SendInvoiceButton({ invoiceId, currentPaymentLink }: SendInvoiceButtonProps) {
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [copied, setCopied]   = useState(false)
  const { success, error: toastError } = useToast()
  // If there's already a payment link, show a "Copy link" button instead
  if (currentPaymentLink) {
    return (
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(currentPaymentLink)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }}
        className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl border transition-all"
        style={{
          borderColor: copied ? 'rgba(52,211,153,0.4)' : 'rgba(96,165,250,0.25)',
          background:  copied ? 'rgba(16,185,129,0.08)' : 'rgba(37,99,235,0.08)',
          color:       copied ? '#34D399' : '#fff',
        }}
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            Copy payment link
          </>
        )}
      </button>
    )
  }

  async function handleSend() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      })

      const data = await res.json()

      if (!res.ok) {
        toastError(data.error ?? 'Something went wrong')
        return
      }

      // Refresh the page so the payment link appears
      router.refresh()
    } catch {
        toastError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSend}
        disabled={loading}
        className="flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl disabled:opacity-60 transition-all"
        style={{
          background: 'linear-gradient(90deg, #1D4ED8, #2563EB)',
          boxShadow: '0 0 0 1px rgba(96,165,250,0.2)',
        }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Generating link…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Send invoice
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}