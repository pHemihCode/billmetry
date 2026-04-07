// app/invoice/view/demo/page.tsx
// This is the demo page linked from the landing page "See demo" button.
// It shows a realistic-looking invoice without needing a real database record.
// No auth required.

import Link from 'next/link'

const demoInvoice = {
  number:       'INV-0042',
  status:       'sent',
  currency:     'USD',
  businessName: 'Femi Akintan Design',
  businessEmail: 'femi@billmetry.ng',
  clientName:   'Acme Corp',
  clientEmail:  'accounts@acmecorp.com',
  clientCountry: 'United States',
  issueDate:    '1 December 2025',
  dueDate:      '15 January 2026',
  items: [
    { description: 'Brand identity design',     qty: 1,   rate: 800,  amount: 800  },
    { description: 'Website UI/UX design',       qty: 1,   rate: 1200, amount: 1200 },
    { description: 'Social media kit (10 posts)', qty: 1,  rate: 350,  amount: 350  },
    { description: 'Revision rounds',             qty: 3,  rate: 50,   amount: 150  },
  ],
  subtotal:  2500,
  taxRate:   0,
  taxAmount: 0,
  total:     2500,
  notes:     'Payment due within 30 days. Bank transfer and card payments accepted. Late payments subject to 2% monthly fee.',
}

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

export default function DemoInvoicePage() {
  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#060A16', color: 'white' }}>

      {/* Demo banner */}
      <div className="max-w-2xl mx-auto mb-4">
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between text-sm"
          style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}
        >
          <span className="text-blue-300">
            This is a demo invoice — showing what your clients will see
          </span>
        </div>
      </div>

      {/* Invoice card */}
      <div
        className="max-w-2xl mx-auto rounded-2xl border overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(13,21,39,0.95), rgba(8,14,28,0.98))',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 0 0 1px rgba(37,99,235,0.1), 0 32px 80px rgba(5,10,25,0.6)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-6 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div>
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>Invoice</p>
            <p className="text-xl font-bold text-white"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>{demoInvoice.number}</p>
          </div>
          <span
            className="text-xs px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(37,99,235,0.13)',
              border: '1px solid rgba(96,165,250,0.22)',
              color: '#93C5FD',
              fontFamily: 'var(--font-mono), monospace',
            }}
          >
            AWAITING PAYMENT
          </span>
        </div>

        {/* From / To */}
        <div className="grid grid-cols-2 gap-6 px-8 py-6 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>From</p>
            <p className="text-sm font-semibold text-white">{demoInvoice.businessName}</p>
            <p className="text-xs text-slate-500">{demoInvoice.businessEmail}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>To</p>
            <p className="text-sm font-semibold text-white">{demoInvoice.clientName}</p>
            <p className="text-xs text-slate-500">{demoInvoice.clientEmail}</p>
            <p className="text-xs text-slate-600">{demoInvoice.clientCountry}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-6 px-8 py-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>Issue date</p>
            <p className="text-sm text-slate-300">{demoInvoice.issueDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>Due date</p>
            <p className="text-sm text-slate-300">{demoInvoice.dueDate}</p>
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 py-6">
          <div className="grid gap-1 mb-3 text-xs font-medium text-slate-600 uppercase tracking-wider"
            style={{ gridTemplateColumns: '1fr 50px 90px 90px', fontFamily: 'var(--font-mono), monospace' }}>
            <span>Description</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Amount</span>
          </div>

          {demoInvoice.items.map((item, i) => (
            <div key={i} className="grid items-center gap-1 py-3 border-b"
              style={{ gridTemplateColumns: '1fr 50px 90px 90px', borderColor: 'rgba(255,255,255,0.04)' }}>
              <span className="text-sm text-slate-300">{item.description}</span>
              <span className="text-sm text-slate-500 text-center"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{item.qty}</span>
              <span className="text-sm text-slate-400 text-right"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{fmt(item.rate)}</span>
              <span className="text-sm text-white text-right"
                style={{ fontFamily: 'var(--font-mono), monospace' }}>{fmt(item.amount)}</span>
            </div>
          ))}

          {/* Totals */}
          <div className="mt-5 space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>{fmt(demoInvoice.subtotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-3 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <span className="text-white">Total</span>
              <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>{fmt(demoInvoice.total)}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 p-4 rounded-xl border"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-2"
              style={{ fontFamily: 'var(--font-mono), monospace' }}>Notes</p>
            <p className="text-sm text-slate-400 leading-relaxed">{demoInvoice.notes}</p>
          </div>
        </div>

        {/* Pay button */}
        <div className="px-8 py-6 border-t"
          style={{ borderColor: 'rgba(37,99,235,0.15)', background: 'rgba(37,99,235,0.04)' }}>
          <p className="text-sm text-slate-400 mb-4 text-center">Pay securely with your card or bank transfer.</p>
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 w-full font-bold text-white py-4 rounded-xl text-sm"
            style={{ background: 'linear-gradient(90deg, #1D4ED8 0%, #3B82F6 50%, #2563EB 100%)' }}
          >
            Pay $2,500.00 now →
          </Link>
          <p className="text-xs text-slate-600 text-center mt-3">
            Demo only — sign up to create real invoices
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p className="text-xs text-slate-700">
          Powered by{' '}
          <Link href="/" className="text-blue-500 hover:text-blue-400 transition-colors">BillMetry</Link>
          {' '}· Professional invoicing for African freelancers
        </p>
      </div>
    </div>
  )
}