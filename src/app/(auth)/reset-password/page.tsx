'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { authStyles } from '@/lib/auth-styles'


function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8)          score++
  if (pw.length >= 12)         score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'Weak',   color: '#EF4444' }
  if (score <= 2) return { score, label: 'Fair',   color: '#F59E0B' }
  if (score <= 3) return { score, label: 'Good',   color: '#3B82F6' }
  return               { score, label: 'Strong', color: '#22C55E' }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)

  const strength = getStrength(password)
  const mismatch = confirm.length > 0 && password !== confirm

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }

    setLoading(true); setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) { setError(error.message); setLoading(false); return }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <div className="auth-bg relative flex items-center justify-center px-4 py-12 overflow-hidden">

        <div className="relative z-10 w-full max-w-100">

          <div className="auth-fade-up text-center mb-8">
            <Link href="/" className="mono inline-block text-sm font-semibold tracking-widest text-blue-400 uppercase hover:text-blue-300 transition-colors">
              InvoiceFlow
            </Link>
          </div>

          <div className="auth-card auth-fade-up-1">

            {!success ? (
              <>
                <div className="mb-6 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>

                <div className="mb-7">
                  <h1 className="heading text-2xl font-extrabold text-white mb-1">Set new password</h1>
                  <p className="text-slate-500 text-sm">Choose a strong password for your account.</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="auth-fade-up-2">
                    <label className="auth-label">New password</label>
                    <div className="relative">
                      <input
                        className="auth-input"
                        type={showPw ? 'text' : 'password'}
                        required autoComplete="new-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        style={{ paddingRight: '44px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors text-xs"
                        tabIndex={-1}
                      >
                        {showPw ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {password.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4].map(i => (
                            <div
                              key={i}
                              className="flex-1 h-1 rounded-full transition-all duration-300"
                              style={{
                                background: i <= Math.ceil(strength.score / 1.25)
                                  ? strength.color
                                  : 'rgba(255,255,255,0.08)',
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: strength.color }}>{strength.label} password</p>
                      </div>
                    )}
                  </div>

                  <div className="auth-fade-up-3">
                    <label className="auth-label">Confirm password</label>
                    <input
                      className="auth-input"
                      type={showPw ? 'text' : 'password'}
                      required autoComplete="new-password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      style={{
                        borderColor: mismatch ? 'rgba(239,68,68,0.4)' : undefined,
                      }}
                    />
                    {mismatch && (
                      <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
                    )}
                  </div>

                  <div className="auth-fade-up-4 pt-1">
                    <button
                      type="submit"
                      disabled={loading || mismatch}
                      className="auth-shimmer-btn w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    >
                      {loading ? <><span className="spinner" /> Updating…</> : 'Update password'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success */
              <div className="text-center py-2 auth-fade-in">
                <div className="mx-auto mb-5 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="heading text-xl font-extrabold text-white mb-2">Password updated</h2>
                <p className="text-slate-400 text-sm">Redirecting you to your dashboard…</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}