'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  full_name:     string | null
  business_name: string | null
  logo_url:      string | null
  plan:          string | null
  email?:        string | null
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const nav = [
  {
    href: '/dashboard', label: 'Overview', exact: true,
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#60A5FA' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/invoices', label: 'Invoices', exact: false,
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#60A5FA' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/clients', label: 'Clients', exact: false,
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#60A5FA' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/analytics', label: 'Analytics', exact: false,
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#60A5FA' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    href: '/settings', label: 'Settings', exact: false,
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#60A5FA' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
  },
]

// Bottom tab bar shows only these 4 (Settings is accessed via hamburger)
const bottomTabs = ['/dashboard', '/invoices', '/clients', '/analytics']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href)
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

const planColors: Record<string, string> = {
  free: '#94A3B8', pro: '#60A5FA', business: '#A78BFA',
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="10" fill="#2563EB"/>
      <rect x="11" y="10" width="5"  height="24"  rx="2"   fill="white"/>
      <rect x="15" y="10" width="10" height="4.5" rx="2"   fill="white"/>
      <rect x="15" y="19.5" width="12" height="4" rx="2"   fill="white"/>
      <rect x="15" y="29.5" width="10" height="4.5" rx="2" fill="white"/>
      <rect x="23" y="10" width="4"  height="8"   rx="2"   fill="white"/>
      <rect x="23" y="29" width="4"  height="9"   rx="2"   fill="white"/>
      <rect x="29" y="28" width="4"  height="6"   rx="1.5" fill="rgba(255,255,255,0.38)"/>
      <rect x="34" y="22" width="4"  height="12"  rx="1.5" fill="rgba(255,255,255,0.65)"/>
      <rect x="39" y="16" width="4"  height="18"  rx="1.5" fill="white"/>
    </svg>
  )
}

// ─── Nav link (shared) ────────────────────────────────────────────────────────

function NavItem({
  item, pathname, onClick,
}: {
  item: typeof nav[number]
  pathname: string
  onClick?: () => void
}) {
  const active = isActive(pathname, item.href, item.exact)
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
      style={{
        color:      active ? '#fff' : 'rgba(148,163,184,0.8)',
        background: active ? 'rgba(37,99,235,0.15)' : 'transparent',
        border:     active ? '1px solid rgba(96,165,250,0.18)' : '1px solid transparent',
      }}
    >
      <span style={{ flexShrink: 0 }}>{item.icon(active)}</span>
      <span>{item.label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: '#3B82F6' }} />
      )}
    </Link>
  )
}

// ─── User footer (shared) ─────────────────────────────────────────────────────

function UserFooter({ profile, onClick }: { profile: Profile | null; onClick?: () => void }) {
  const router = useRouter()
  const name   = profile?.business_name ?? profile?.full_name ?? 'My account'
  const plan   = profile?.plan ?? 'free'

  async function handleLogout() {
    onClick?.()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="border-t px-3 pb-4 pt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Plan badge */}
      {plan === 'free' && (
        <Link href="/billing" onClick={onClick}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs mb-2 transition-colors"
          style={{ background: 'rgba(37,99,235,0.06)', borderColor: 'rgba(96,165,250,0.15)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          <span className="text-blue-300 font-medium">Upgrade to Pro</span>
        </Link>
      )}

      {/* User row */}
      <div className="flex items-center gap-2.5 px-2 py-2">
        {profile?.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.logo_url} alt={name}
            className="w-7 h-7 rounded-full object-cover shrink-0"
            style={{ border: '1px solid rgba(96,165,250,0.25)' }} />
        ) : (
          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)' }}>
            {getInitials(name)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-white truncate">{name}</p>
          <p className="text-xs capitalize truncate" style={{ color: planColors[plan] ?? '#94A3B8' }}>
            {plan} plan
          </p>
        </div>
        <button onClick={handleLogout} title="Sign out"
          className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-colors"
          style={{ color: '#475569' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
          onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  return (
    <aside className="dash-sidebar hidden md:flex flex-col w-55 shrink-0 h-screen border-r border-r-[rgba(255,255,255,0.07)]">
      {/* Logo */}
      <div className="px-5 py-5 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: 'Georgia,serif' }}>
            Bill<span style={{ color: '#60A5FA', fontWeight: 400 }}>Metry</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <NavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <UserFooter profile={profile} />
    </aside>
  )
}

// ─── Mobile sidebar ───────────────────────────────────────────────────────────
// Pattern: hamburger button in top-left → slide-in drawer from left
// Also renders a bottom tab bar for the most-used routes

function MobileNav({ profile }: { profile: Profile | null }) {
  const pathname        = usePathname()
  const [open, setOpen] = useState(false)

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {/* ── Hamburger button — rendered inline by Header ───────────────────── */}
      {/* Exported separately so Header can place it correctly */}

      {/* ── Bottom tab bar ──────────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{
          background:   'rgba(7,9,26,0.97)',
          borderTop:    '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}
      >
        {nav.filter(n => bottomTabs.includes(n.href)).map(item => {
          const active = isActive(pathname, item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0"
              style={{
                color:      active ? '#60A5FA' : 'rgba(100,116,139,0.8)',
                background: active ? 'rgba(37,99,235,0.1)' : 'transparent',
              }}
            >
              {item.icon(active)}
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}

        {/* More button → opens drawer */}
        <button
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
          style={{ color: 'rgba(100,116,139,0.8)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="4" y1="7"  x2="20" y2="7"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="17" x2="20" y2="17"/>
          </svg>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </div>

      {/* ── Slide-in drawer ─────────────────────────────────────────────────── */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          {/* Backdrop */}
          <div
            className="animate-fadeIn"
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(3px)',
            }}
          />

          {/* Panel */}
          <div
            className="animate-slideLeft"
            style={{
              position: 'absolute', top: 0, left: 0, bottom: 0,
              width: 'min(280px, 82vw)',
              display: 'flex', flexDirection: 'column',
              background: 'linear-gradient(180deg,#0D1527 0%,#060A16 100%)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '12px 0 40px rgba(0,0,0,0.6)',
            }}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-5 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5">
                <Logo size={26} />
                <span className="text-sm font-bold text-white" style={{ fontFamily: 'Georgia,serif' }}>
                  Bill<span style={{ color: '#60A5FA', fontWeight: 400 }}>Metry</span>
                </span>
              </Link>
              <button onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* All nav links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {nav.map(item => (
                <NavItem key={item.href} item={item} pathname={pathname}
                  onClick={() => setOpen(false)} />
              ))}

              {/* Billing — extra link */}
              <Link href="/billing" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 mt-1"
                style={{
                  color:      pathname.startsWith('/billing') ? '#fff' : 'rgba(148,163,184,0.8)',
                  background: pathname.startsWith('/billing') ? 'rgba(37,99,235,0.15)' : 'transparent',
                  border:     pathname.startsWith('/billing') ? '1px solid rgba(96,165,250,0.18)' : '1px solid transparent',
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke={pathname.startsWith('/billing') ? '#60A5FA' : 'currentColor'}
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Billing
              </Link>
            </nav>

            <UserFooter profile={profile} onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}

// ─── Hamburger button (exported for Header) ───────────────────────────────────

export function HamburgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg shrink-0"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      aria-label="Open menu"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="7"  x2="20" y2="7"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="17" x2="20" y2="17"/>
      </svg>
    </button>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Sidebar({ profile }: { profile: Profile | null }) {
  return (
    <>
      <DesktopSidebar profile={profile} />
      <MobileNav profile={profile} />
    </>
  )
}