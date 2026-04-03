'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client { id: string; name: string; email: string }

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

interface InitialData {
  clientId: string
  invoiceNumber: string
  currency: string
  dueDate: string
  taxRate: number
  notes: string
  items: LineItem[]
}

interface InvoiceBuilderEditProps {
  invoiceId: string
  clients: Client[]
  initialData: InitialData
}

// ─── Constants ────────────────────────────────────────────────────────────────

const currencies = ['NGN', 'USD', 'GBP', 'EUR']
const currencySymbols: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }

const inputCls = `
  w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3
  text-sm text-white placeholder:text-slate-600
  focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]
  focus:ring-2 focus:ring-blue-500/10 transition-all duration-150
`

function genId() { return Math.random().toString(36).slice(2, 9) }

function fmt(n: number, currency: string) {
  const s = currencySymbols[currency] ?? ''
  return `${s}${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <h2
        className="text-sm font-semibold text-white mb-4"
        style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoiceBuilderEdit({
  invoiceId, clients, initialData,
}: InvoiceBuilderEditProps) {
  const router = useRouter()

  const [clientId, setClientId]     = useState(initialData.clientId)
  const [invoiceNum, setInvoiceNum] = useState(initialData.invoiceNumber)
  const [currency, setCurrency]     = useState(initialData.currency)
  const [dueDate, setDueDate]       = useState(initialData.dueDate)
  const [taxRate, setTaxRate]       = useState(initialData.taxRate)
  const [notes, setNotes]           = useState(initialData.notes)
  const [items, setItems]           = useState<LineItem[]>(
    initialData.items.length > 0
      ? initialData.items
      : [{ id: genId(), description: '', quantity: 1, rate: 0 }]
  )
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  // ── Calculations ────────────────────────────────────────────────────────────
  const subtotal  = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total     = subtotal + taxAmount

  // ── Line item helpers ────────────────────────────────────────────────────────
  function updateItem(id: string, key: keyof LineItem, value: string | number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [key]: value } : i))
  }
  function addItem() {
    setItems(prev => [...prev, { id: genId(), description: '', quantity: 1, rate: 0 }])
  }
  function removeItem(id: string) {
    if (items.length === 1) return
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!clientId)  { setError('Please select a client.'); return }
    if (!dueDate)   { setError('Please set a due date.'); return }
    if (items.some(i => !i.description.trim())) {
      setError('All line items need a description.')
      return
    }

    setSaving(true)
    setError(null)

    const supabase = createClient()

    // Update the invoice header
    const { error: invErr } = await supabase
      .from('invoices')
      .update({
        client_id:      clientId,
        invoice_number: invoiceNum,
        currency,
        subtotal,
        tax_rate:       taxRate,
        tax_amount:     taxAmount,
        total,
        due_date:       dueDate,
        notes:          notes || null,
      })
      .eq('id', invoiceId)

    if (invErr) { setError(invErr.message); setSaving(false); return }

    // Delete old items and re-insert — simplest correct approach
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: itemsErr } = await supabase
      .from('invoice_items')
      .insert(items.map(item => ({
        invoice_id:  invoiceId,
        user_id:     user.id,
        description: item.description,
        quantity:    item.quantity,
        rate:        item.rate,
        amount:      item.quantity * item.rate,
      })))

    if (itemsErr) { setError(itemsErr.message); setSaving(false); return }

    router.push(`/invoices/${invoiceId}`)
    router.refresh()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* Info banner */}
      <div
        className="rounded-xl px-4 py-3 text-sm text-blue-300 border flex items-center gap-2"
        style={{ background: 'rgba(37,99,235,0.07)', borderColor: 'rgba(96,165,250,0.18)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Only draft invoices can be edited. Once sent, create a new invoice instead.
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm text-red-400 border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* ── Details ── */}
      <Card title="Invoice details">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Client *</label>
            <select className={inputCls} value={clientId} onChange={e => setClientId(e.target.value)}
              style={{ appearance: 'none' }}>
              <option value="" style={{ background: '#0D1527' }}>Select a client…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0D1527' }}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Invoice number</label>
            <input className={inputCls} type="text" value={invoiceNum}
              onChange={e => setInvoiceNum(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Currency</label>
            <select className={inputCls} value={currency} onChange={e => setCurrency(e.target.value)}
              style={{ appearance: 'none' }}>
              {currencies.map(c => (
                <option key={c} value={c} style={{ background: '#0D1527' }}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Due date *</label>
            <input className={inputCls} type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>
        </div>
      </Card>

      {/* ── Line items ── */}
      <Card title="Line items">
        <div className="grid gap-2 mb-2 text-xs font-medium text-slate-600 uppercase tracking-wider px-1"
          style={{ gridTemplateColumns: '1fr 80px 120px 100px 32px', fontFamily: 'var(--font-mono), monospace' }}>
          <span>Description</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Rate ({currencySymbols[currency] ?? ''})</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        <div className="space-y-2">
          {items.map(item => {
            const amount = item.quantity * item.rate
            return (
              <div key={item.id} className="grid items-center gap-2"
                style={{ gridTemplateColumns: '1fr 80px 120px 100px 32px' }}>
                <input className={inputCls} type="text" value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="e.g. Logo design" />
                <input className={`${inputCls} text-center`} type="number" min="0.01" step="0.01"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                <input className={`${inputCls} text-right`} type="number" min="0" step="0.01"
                  value={item.rate}
                  onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                <div className="text-right text-sm font-medium text-slate-300 px-1 py-3"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}>
                  {fmt(amount, currency)}
                </div>
                <button type="button" onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/8 transition-colors disabled:opacity-20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6m4-6v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            )
          })}
        </div>

        <button type="button" onClick={addItem}
          className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add line item
        </button>

        {/* Totals */}
        <div className="mt-6 pt-5 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {fmt(subtotal, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <span>Tax</span>
              <input type="number" min="0" max="100" step="0.5" value={taxRate}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-14 bg-white/3 border border-white/8 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500/50" />
              <span>%</span>
            </div>
            <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {fmt(taxAmount, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-white font-semibold">Total</span>
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {fmt(total, currency)}
            </span>
          </div>
        </div>
      </Card>

      {/* ── Notes ── */}
      <Card title="Notes / payment terms">
        <textarea className={inputCls} rows={3} value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Payment due within 14 days. Bank transfer accepted." />
      </Card>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button type="button" onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-white transition-colors px-5 py-3">
          Cancel
        </button>
        <button type="button" disabled={saving} onClick={handleSave}
          className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl disabled:opacity-60 transition-all"
          style={{ background: 'linear-gradient(90deg, #1D4ED8, #2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}>
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : 'Save changes'}
        </button>
      </div>
    </div>
  )
}