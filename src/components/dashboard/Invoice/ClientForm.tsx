'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'
// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientFormProps {
  mode: 'new' | 'edit'
  initialData?: {
    id: string
    name: string
    email: string
    phone: string
    address: string
    country: string
  }
}

const inputCls = `
  w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3
  text-sm text-white placeholder:text-slate-600
  focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-blue-500/10
  transition-all duration-150
`

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientForm({ mode, initialData }: ClientFormProps) {
  const router  = useRouter()
  const isEdit  = mode === 'edit'
  const { success, error: toastError } = useToast()
  const [name, setName]       = useState(initialData?.name    ?? '')
  const [email, setEmail]     = useState(initialData?.email   ?? '')
  const [phone, setPhone]     = useState(initialData?.phone   ?? '')
  const [address, setAddress] = useState(initialData?.address ?? '')
  const [country, setCountry] = useState(initialData?.country ?? '')
  const [error, setError]     = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = { name, email, phone, address, country, user_id: user.id }

    if (isEdit && initialData?.id) {
      const { error } = await supabase
        .from('clients')
        .update({ name, email, phone, address, country })
        .eq('id', initialData.id)

      if (error) { toastError(error.message); setSaving(false); return }
      router.push(`/clients/${initialData.id}`)
    } else {
      const { data, error } = await supabase
        .from('clients')
        .insert(payload)
        .select('id')
        .single()

      if (error) { toastError(error.message); setSaving(false); return }
      router.push(`/clients/${data.id}`)
    }

    router.refresh()
  }

  async function handleArchive() {
    if (!initialData?.id) return
    if (!confirm('Archive this client? Their invoices will be kept.')) return

    const supabase = createClient()
    await supabase.from('clients').update({ is_archived: true }).eq('id', initialData.id)
    router.push('/clients')
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="rounded-2xl border p-6"
        style={{ background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))', borderColor: 'rgba(255,255,255,0.06)' }}>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-400 border mb-5"
            style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Full name *</label>
              <input className={inputCls} type="text" required value={name}
                onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Email address *</label>
              <input className={inputCls} type="email" required value={email}
                onChange={e => setEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
          </div>

          {/* Phone + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Phone</label>
              <input className={inputCls} type="tel" value={phone}
                onChange={e => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Country</label>
              <input className={inputCls} type="text" value={country}
                onChange={e => setCountry(e.target.value)} placeholder="United States" />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Billing address</label>
            <textarea className={inputCls} rows={3} value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="123 Main Street, New York, NY 10001" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {isEdit ? (
              <button type="button" onClick={handleArchive}
                className="text-sm text-slate-600 hover:text-red-400 transition-colors">
                Archive client
              </button>
            ) : (
              <button type="button" onClick={() => router.back()}
                className="text-sm text-slate-500 hover:text-white transition-colors">
                Cancel
              </button>
            )}

            <button type="submit" disabled={saving}
              className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl disabled:opacity-60 transition-all"
              style={{ background: 'linear-gradient(90deg, #1D4ED8, #2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}>
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {isEdit ? 'Saving…' : 'Adding…'}</>
              ) : isEdit ? 'Save changes' : 'Add client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}