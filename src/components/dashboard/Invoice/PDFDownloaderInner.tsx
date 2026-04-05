'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import InvoiceDocument from './InvoicePDF'
import type { InvoicePDFData } from './InvoicePDF'

// This file is ONLY loaded in the browser via dynamic import.
// Never import it directly — always use DownloadPDFButton.tsx.

interface Props {
  data: InvoicePDFData
}

export default function PDFDownloaderInner({ data }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)
    try {
      const blob = await pdf(<InvoiceDocument data={data} />).toBlob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${data.invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('PDF generation failed:', err)
      setError('Could not generate PDF. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border border-white/8 hover:border-white/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download PDF
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}