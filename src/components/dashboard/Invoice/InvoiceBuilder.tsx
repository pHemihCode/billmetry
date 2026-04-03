'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { randomBytes } from 'crypto'
import { useToast } from '@/components/ui/toast'
// ─── Types ────────────────────────────────────────────────────────────────────

interface Client { id: string; name: string; email: string }

interface LineItem {
  id: string        // local key only — not saved to DB
  description: string
  quantity: number
  rate: number
}

interface InvoiceBuilderProps {
  clients: Client[]
  defaultCurrency: string
  nextInvoiceNumber: string
}

const currencies   = ['NGN', 'USD', 'GBP', 'EUR']
const inputCls = `
  w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3
  text-sm text-white placeholder:text-slate-600
  focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-blue-500/10
  transition-all duration-150
`

const currencySymbols: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' }

function genId() { return Math.random().toString(36).slice(2, 9) }

function formatAmount(n: number, currency: string) {
  return `${currencySymbols[currency] ?? ''}${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoiceBuilder({ clients, defaultCurrency, nextInvoiceNumber }: InvoiceBuilderProps) {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  // Form state
  const [clientId, setClientId]       = useState('')
  const [invoiceNum, setInvoiceNum]   = useState(nextInvoiceNumber)
  const [currency, setCurrency]       = useState(defaultCurrency)
  const [dueDate, setDueDate]         = useState('')
  const [taxRate, setTaxRate]         = useState(0)
  const [notes, setNotes]             = useState('')
  const [items, setItems]             = useState<LineItem[]>([
    { id: genId(), description: '', quantity: 1, rate: 0 },
  ])

  // UI state
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  // ── Calculations ─────────────────────────────────────────────────────────

  const subtotal   = items.reduce((s, item) => s + item.quantity * item.rate, 0)
  const taxAmount  = subtotal * (taxRate / 100)
  const total      = subtotal + taxAmount

  // ── Line item helpers ─────────────────────────────────────────────────────

  function updateItem(id: string, key: keyof LineItem, value: string | number) {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [key]: value } : item))
  }

  function addItem() {
    setItems(prev => [...prev, { id: genId(), description: '', quantity: 1, rate: 0 }])
  }

  function removeItem(id: string) {
    if (items.length === 1) return   // always keep at least one row
    setItems(prev => prev.filter(item => item.id !== id))
  }

  // ── Save ─────────────────────────────────────────────────────────────────

const publicToken = randomBytes(20).toString('hex')
  async function handleSave(status: 'draft' | 'sent') {
    if (!clientId) { toastError('Please select a client.'); return }
    if (!dueDate)  { toastError('Please set a due date.'); return }
    if (items.some(i => !i.description.trim())) {
      toastError('All line items need a description.')
      return
    }

    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Insert invoice
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .insert({
        user_id:        user.id,
        client_id:      clientId,
        invoice_number: invoiceNum,
        status,
        currency,
        subtotal,
        tax_rate:       taxRate,
        tax_amount:     taxAmount,
        total,
        due_date:       dueDate,
        notes:          notes || null,
      })
      .select('id')
      .single()

    if (invError) { toastError(invError.message); setSaving(false); return }

    // 2. Insert line items
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(
        items.map(item => ({
          invoice_id:  invoice.id,
          user_id:     user.id,
          description: item.description,
          quantity:    item.quantity,
          rate:        item.rate,
          amount:      item.quantity * item.rate,
        }))
      )

    if (itemsError) { toastError(itemsError.message); setSaving(false); return }

    // 3. Log activity
    await supabase.from('activity_log').insert({
      invoice_id: invoice.id,
      user_id:    user.id,
      event:      'created',
      note:       `Invoice ${invoiceNum} created as ${status}`,
    })

    router.push(`/invoices/${invoice.id}`)
    router.refresh()
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const sym = currencySymbols[currency] ?? ''

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm text-red-400 border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* ── Header details ── */}
      <div className="rounded-2xl border p-6"
        style={{ background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="text-sm font-semibold text-white mb-4"
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
          Invoice details
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Client */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Client *</label>
            <select
              className={inputCls}
              value={clientId}
              onChange={e => setClientId(e.target.value)}
              style={{ appearance: 'none' }}
            >
              <option value="" style={{ background: '#0D1527' }}>Select a client…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#0D1527' }}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Invoice number */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Invoice number</label>
            <input className={inputCls} type="text" value={invoiceNum}
              onChange={e => setInvoiceNum(e.target.value)} />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Currency</label>
            <select className={inputCls} value={currency} onChange={e => setCurrency(e.target.value)}
              style={{ appearance: 'none' }}>
              {currencies.map(c => (
                <option key={c} value={c} style={{ background: '#0D1527' }}>{c}</option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Due date *</label>
            <input className={inputCls} type="date" value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              style={{ colorScheme: 'dark' }} />
          </div>
        </div>
      </div>

      {/* ── Line items ── */}
      <div className="rounded-2xl border p-6"
        style={{ background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>

        <h2 className="text-sm font-semibold text-white mb-4"
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
          Line items
        </h2>

        {/* Column headers */}
        <div className="grid gap-2 mb-2 text-xs font-medium text-slate-600 uppercase tracking-wider px-1"
          style={{ gridTemplateColumns: '1fr 80px 120px 100px 32px', fontFamily: 'var(--font-mono), monospace' }}>
          <span>Description</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Rate ({sym})</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map(item => {
            const amount = item.quantity * item.rate
            return (
              <div key={item.id}
                className="grid items-center gap-2"
                style={{ gridTemplateColumns: '1fr 80px 120px 100px 32px' }}>

                {/* Description */}
                <input
                  className={inputCls}
                  type="text"
                  value={item.description}
                  onChange={e => updateItem(item.id, 'description', e.target.value)}
                  placeholder="e.g. Logo design"
                />

                {/* Quantity */}
                <input
                  className={`${inputCls} text-center`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={item.quantity}
                  onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                />

                {/* Rate */}
                <input
                  className={`${inputCls} text-right`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.rate}
                  onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                />

                {/* Amount (read-only) */}
                <div
                  className="text-right text-sm font-medium text-slate-300 px-1 py-3"
                  style={{ fontFamily: 'var(--font-mono), monospace' }}
                >
                  {formatAmount(amount, currency)}
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/8 transition-colors disabled:opacity-20"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            )
          })}
        </div>

        {/* Add item */}
        <button
          type="button"
          onClick={addItem}
          className="mt-3 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add line item
        </button>

        {/* Totals */}
        <div className="mt-6 pt-5 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {formatAmount(subtotal, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <span>Tax</span>
              <input
                type="number" min="0" max="100" step="0.5"
                value={taxRate}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-14 bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-blue-500/50"
              />
              <span>%</span>
            </div>
            <span className="text-white" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {formatAmount(taxAmount, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-white font-semibold">Total</span>
            <span className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-mono), monospace' }}>
              {formatAmount(total, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="rounded-2xl border p-6"
        style={{ background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>
        <label className="block text-xs font-medium text-slate-400 mb-2">Notes / payment terms</label>
        <textarea
          className={inputCls}
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Payment due within 14 days. Bank transfer accepted."
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-white transition-colors px-5 py-3"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('draft')}
          className="text-sm font-semibold text-slate-300 px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave('sent')}
          className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl disabled:opacity-60 transition-all"
          style={{ background: 'linear-gradient(90deg, #1D4ED8, #2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Create & send
            </>
          )}
        </button>
      </div>
    </div>
  )
}