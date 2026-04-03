'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '../ui/toast'
// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  full_name: string
  business_name: string
  email: string
  phone: string
  address: string
  default_currency: string
  logo_url: string | null
  plan: string
}

const currencies = ['NGN', 'USD', 'GBP', 'EUR']

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6 border"
      style={{
        background: 'linear-gradient(145deg, rgba(13,21,39,0.9), rgba(8,14,28,0.95))',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="mb-5 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <h2
          className="text-base font-bold text-white mb-1"
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
        >
          {title}
        </h2>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
      {children}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-2">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-600 mt-1.5">{hint}</p>}
    </div>
  )
}

const inputCls = `
  w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3
  text-sm text-white placeholder:text-slate-600
  focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-blue-500/10
  transition-all duration-150
`

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage({ initialProfile }: { initialProfile: Profile }) {
  const router     = useRouter()
  const fileRef    = useRef<HTMLInputElement>(null)
   const { success, error: toastError } = useToast()

  const [form, setForm]         = useState<Profile>(initialProfile)
  const [saving, setSaving]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [preview, setPreview]   = useState<string | null>(initialProfile.logo_url)

  function update(key: keyof Profile, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setSaved(false)
  }

  // ── Logo upload ─────────────────────────────────────────────────────────────

   async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toastError('File too large', 'Logo must be under 2MB.')
      return
    }

    setPreview(URL.createObjectURL(file))
    setUploading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ext  = file.name.split('.').pop()
      const path = `${user.id}/logo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(path)

      setForm(f => ({ ...f, logo_url: publicUrl }))
      setPreview(publicUrl)
      success('Logo uploaded', 'Your logo has been updated.')
    } catch (err: any) {
      toastError('Upload failed', err.message ?? 'Please try again.')
      setPreview(initialProfile.logo_url)
    } finally {
      setUploading(false)
    }
  }

  // ── Save profile ────────────────────────────────────────────────────────────

   async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name:        form.full_name,
        business_name:    form.business_name,
        phone:            form.phone,
        address:          form.address,
        default_currency: form.default_currency,
        logo_url:         form.logo_url,
      })
      .eq('id', user.id)

    if (updateError) {
      toastError('Save failed', updateError.message)
    } else {
      success('Profile saved', 'Your changes have been saved.')
      router.refresh()
    }

    setSaving(false)
  }

  const initials = (form.business_name || form.full_name || 'BM')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <form onSubmit={handleSave} className="max-w-2xl mx-auto space-y-6">

      {/* Global error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm text-red-400 border"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      {/* ── Business profile ── */}
      <Section title="Business profile" desc="This information appears on every invoice you send.">
        <div className="space-y-4">

          {/* Logo upload */}
          <Field label="Business logo" hint="PNG or JPG, max 2MB. Shown on invoice PDFs.">
            <div className="flex items-center gap-4">
              {/* Avatar preview */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden border relative"
                style={{ borderColor: 'rgba(96,165,250,0.2)', background: 'rgba(37,99,235,0.08)' }}
              >
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                )}
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="text-blue-300 font-bold text-lg"
                    style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
                  >
                    {initials}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : preview ? 'Change logo' : 'Upload logo'}
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setForm(f => ({ ...f, logo_url: null })) }}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name">
              <input
                className={inputCls}
                type="text"
                value={form.full_name}
                onChange={e => update('full_name', e.target.value)}
                placeholder="John Doe"
              />
            </Field>
            <Field label="Business name">
              <input
                className={inputCls}
                type="text"
                value={form.business_name}
                onChange={e => update('business_name', e.target.value)}
                placeholder="BillMetry"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone">
              <input
                className={inputCls}
                type="tel"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="+234 800 000 0000"
              />
            </Field>
            <Field label="Default currency">
              <select
                className={inputCls}
                value={form.default_currency}
                onChange={e => update('default_currency', e.target.value)}
                style={{ appearance: 'none' }}
              >
                {currencies.map(c => (
                  <option key={c} value={c} style={{ background: '#0D1527' }}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Business address" hint="Shown on invoice PDFs as your billing address.">
            <textarea
              className={inputCls}
              rows={3}
              value={form.address}
              onChange={e => update('address', e.target.value)}
              placeholder="14 Broad Street, Lagos Island, Lagos"
            />
          </Field>
        </div>
      </Section>

      {/* ── Account ── */}
      <Section title="Account" desc="Your login credentials.">
        <Field label="Email address" hint="To change your email, contact support.">
          <input
            className={`${inputCls} opacity-50 cursor-not-allowed`}
            type="email"
            value={form.email}
            disabled
          />
        </Field>
      </Section>

      {/* ── Plan ── */}
      <Section title="Subscription" desc="Your current plan and usage.">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white capitalize">{form.plan} plan</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {form.plan === 'free'
                ? '3 invoices per month · 1 client'
                : form.plan === 'pro'
                ? 'Unlimited invoices · Unlimited clients'
                : 'Everything in Pro + analytics'}
            </p>
          </div>
          {form.plan === 'free' && (
            <a
              href="/#pricing"
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 rounded-xl border"
              style={{ borderColor: 'rgba(96,165,250,0.2)', background: 'rgba(37,99,235,0.08)' }}
            >
              Upgrade →
            </a>
          )}
        </div>
      </Section>

      {/* Save button */}
      <div className="flex items-center justify-end gap-4 pb-4">
        {saved && (
          <span className="text-sm text-green-400 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Saved
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(90deg, #1D4ED8, #2563EB)', boxShadow: '0 0 0 1px rgba(96,165,250,0.2)' }}
        >
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Saving…</>
          ) : 'Save changes'}
        </button>
      </div>
    </form>
  )
}