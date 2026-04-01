'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  full_name: string | null
  business_name: string | null
  logo_url: string | null
  plan: string | null
}

interface SidebarProps {
  profile: Profile | null
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/invoices',
    label: 'Invoices',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/clients',
    label: 'Clients',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2"/>
      </svg>
    ),
  },
]

const planColors: Record<string, { bg: string; text: string; border: string }> = {
  free:     { bg: 'rgba(100,116,139,0.1)',  text: '#94A3B8', border: 'rgba(100,116,139,0.2)' },
  pro:      { bg: 'rgba(37,99,235,0.12)',   text: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
  business: { bg: 'rgba(124,58,237,0.12)',  text: '#A78BFA', border: 'rgba(167,139,250,0.25)' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const displayName  = profile?.business_name ?? profile?.full_name ?? 'My Business'
  const initials     = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const plan         = profile?.plan ?? 'free'
  const planStyle    = planColors[plan] ?? planColors.free

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // An item is active if pathname exactly matches or starts with the href
  // (except /dashboard which must be exact to avoid matching everything)
  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="hidden md:flex flex-col w-55 shrink-0 border-r h-screen"
      style={{
        background: 'linear-gradient(180deg, #07091A 0%, #060A16 100%)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          {/* Logo mark */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <span
            className="text-sm font-semibold tracking-wide text-white group-hover:text-blue-300 transition-colors"
            style={{ fontFamily: 'var(--font-mono), monospace' }}
          >
            InvoiceFlow
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
              style={{
                color:      active ? '#fff'                          : 'rgba(148,163,184,0.8)',
                background: active ? 'rgba(37,99,235,0.15)'         : 'transparent',
                border:     active ? '1px solid rgba(96,165,250,0.18)' : '1px solid transparent',
              }}
            >
              <span
                className="shrink-0 transition-colors"
                style={{ color: active ? '#60A5FA' : 'rgba(100,116,139,0.9)' }}
              >
                {item.icon}
              </span>
              {item.label}
              {/* Active indicator dot */}
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: '#3B82F6' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section — plan badge + user + logout */}
      <div className="px-3 pb-5 space-y-3 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>

        {/* Plan badge — only show upgrade prompt for free users */}
        {plan === 'free' && (
          <Link
            href="/settings#billing"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs transition-colors hover:border-blue-400/30"
            style={{
              background: 'rgba(37,99,235,0.06)',
              borderColor: 'rgba(96,165,250,0.15)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span className="text-blue-300 font-medium">Upgrade to Pro</span>
          </Link>
        )}

        {/* Plan pill for paid users */}
        {plan !== 'free' && (
          <div
            className="mx-1 px-3 py-1.5 rounded-lg flex items-center gap-2 border"
            style={{ background: planStyle.bg, borderColor: planStyle.border }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: planStyle.text }} />
            <span className="text-xs font-semibold capitalize" style={{ fontFamily: 'var(--font-mono), monospace', color: planStyle.text }}>
              {plan} plan
            </span>
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-3 px-2 py-1">
          {profile?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)' }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-600 truncate capitalize">{plan} plan</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}