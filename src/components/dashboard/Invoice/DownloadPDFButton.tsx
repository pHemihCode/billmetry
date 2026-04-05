'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import type { InvoicePDFData } from './InvoicePDF'

// @react-pdf/renderer uses browser APIs that crash on the server.
// dynamic import with ssr:false ensures it only loads in the browser.
const PDFDownloader = dynamic(
  () => import('./PDFDownloaderInner'),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="flex items-center gap-2 text-sm font-medium text-slate-500 px-4 py-2.5 rounded-xl border border-white/8 cursor-not-allowed"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Loading PDF…
      </button>
    ),
  }
)

interface DownloadPDFButtonProps {
  data: InvoicePDFData
}

export default function DownloadPDFButton({ data }: DownloadPDFButtonProps) {
  return <PDFDownloader data={data} />
}