'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { authStyles } from '@/lib/auth-styles'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) { setError(error.message); setLoading(false); return }
    setSent(true); setLoading(false)
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

            {!sent ? (
              <>
                {/* Lock icon */}
                <div className="mb-6 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>

                <div className="mb-7">
                  <h1 className="heading text-2xl font-extrabold text-white mb-1">Reset your password</h1>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Enter your email and we'll send you a link to create a new password.
                  </p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="auth-fade-up-2">
                    <label className="auth-label">Email address</label>
                    <input
                      className="auth-input"
                      type="email" required autoComplete="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="auth-fade-up-3 pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-shimmer-btn w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                    >
                      {loading ? <><span className="spinner" /> Sending link…</> : 'Send reset link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-2 auth-fade-in">
                <div className="mx-auto mb-5 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.18)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h2 className="heading text-xl font-extrabold text-white mb-2">Email sent</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Check <span className="text-blue-300">{email}</span> for a password reset link.
                  It expires in 1 hour.
                </p>
                <p className="text-slate-600 text-xs mt-4">
                  Didn't receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => setSent(false)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    try again
                  </button>.
                </p>
              </div>
            )}
          </div>

          <p className="auth-fade-up-4 text-center text-sm text-slate-600 mt-6">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}