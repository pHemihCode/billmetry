'use client'

import { useState } from 'react'
import Link from 'next/link'
import { authStyles } from '@/lib/auth-styles'
import { createClient } from '@/lib/supabase/client'
import GoogleIcon from '@/components/ui/GoogleIcon'
import { LogoFull } from '@/components/ui/logo'

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'Weak',   color: '#EF4444' }
  if (score <= 2) return { score, label: 'Fair',   color: '#F59E0B' }
  if (score <= 3) return { score, label: 'Good',   color: '#3B82F6' }
  return               { score, label: 'Strong', color: '#22C55E' }
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const strength = getStrength(password)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true); setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) { setError(error.message); setLoading(false); return }
    setDone(true); setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  if (done) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: authStyles }} />
        <div className="auth-bg relative flex items-center justify-center px-4 py-12 overflow-hidden">
          <div className="relative z-10 w-full max-w-100 text-center auth-fade-up">
            {/* Envelope icon */}
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(96,165,250,0.2)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h2 className="heading text-2xl font-extrabold text-white mb-3">Check your email</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              We sent a confirmation link to{' '}
              <span className="text-blue-300 font-medium">{email}</span>.
              <br />Click it to activate your account.
            </p>
            <Link href="/login" className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
              ← Back to sign in
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />
      <div className="auth-bg relative flex items-center justify-center px-4 py-10 overflow-hidden">

        <div className="relative z-10 w-full max-w-100">

          <div className="auth-fade-up text-center mb-8 ml-12.5">
            <Link href="/" className="flex items-center justify-center">
             <LogoFull />
            </Link>
          </div>

          <div className="auth-card auth-fade-up-1">
            <div className="mb-7">
              <h1 className="heading text-2xl font-extrabold text-white mb-1">Create your account</h1>
              <p className="text-slate-500 text-sm">Free forever. No credit card needed.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="auth-fade-up-2">
                <label className="auth-label">Full name</label>
                <input
                  className="auth-input"
                  type="text" required autoComplete="name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>

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

              <div className="auth-fade-up-3">
                <label className="auth-label">Password</label>
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

                {/* Password strength bar */}
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

              <div className="auth-fade-up-4 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="auth-shimmer-btn w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{borderRadius:'12px'}}
                >
                  {loading ? <><span className="spinner" /> Creating account…</> : 'Create free account'}
                </button>
              </div>
            </form>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or continue with</span>
              <div className="auth-divider-line" />
            </div>

            <button onClick={handleGoogle} className="auth-google-btn">
              <GoogleIcon />
              Google
            </button>

            <p className="text-center text-xs text-slate-600 mt-5 leading-relaxed">
              By signing up you agree to our{' '}
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Terms</a>
              {' '}and{' '}
              <a href="#" className="text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</a>.
            </p>
          </div>

          <p className="auth-fade-up-4 text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}