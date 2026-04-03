'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { authStyles } from '@/lib/auth-styles'
import GoogleIcon from '@/components/ui/GoogleIcon'

const supabase = createClient()
export default function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: authStyles }} />

      <div className="auth-bg relative flex items-center justify-center px-4 py-12 overflow-hidden">
        <div className="relative z-10 w-full max-w-100">

          {/* Logo */}
          <div className="auth-fade-up text-center mb-8">
            <Link href="/" className="mono inline-block text-sm font-semibold tracking-widest text-blue-400 uppercase hover:text-blue-300 transition-colors">
              BillMetry
            </Link>
          </div>

          <div className="auth-card auth-fade-up-1">

            {/* Header */}
            <div className="mb-7">
              <h1 className="heading text-2xl font-extrabold text-white mb-1">Welcome back</h1>
              <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
            </div>

            {/* Error */}
            {error && <div className="auth-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="auth-fade-up-2">
                <label className="auth-label">Email address</label>
                <input
                  className="auth-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="auth-fade-up-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                </div>
                <div className="relative">
                  <input
                    className="auth-input"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              </div>
                  <div className='flex justify-end'>
                     <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                  </div>

              <div className="auth-fade-up-4 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="auth-shimmer-btn w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                >
                  {loading ? <><span className="spinner" /> Signing in…</> : 'Sign in'}
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
          </div>

          {/* Footer link */}
          <p className="auth-fade-up-4 text-center text-sm text-slate-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}