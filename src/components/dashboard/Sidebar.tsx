'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogoIcon } from '@/components/ui/logo'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  full_name: string | null
  business_name: string | null
  logo_url: string | null
  plan: string | null
  email?: string | null
}

interface SidebarProps {
  profile: Profile | null
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const navItems = [
  {
    href: '/dashboard',
    label: 'Overview',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    href: '/invoices',
    label: 'Invoices',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  },
  {
    href: '/clients',
    label: 'Clients',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/analytics',
    label: 'Analytics',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    exact: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
  },
]

const planStyle: Record<string, { color: string; bg: string; border: string; label: string }> = {
  free:     { color: '#94A3B8', bg: 'rgba(100,116,139,0.1)',  border: 'rgba(100,116,139,0.2)',  label: 'Free'     },
  pro:      { color: '#60A5FA', bg: 'rgba(37,99,235,0.12)',   border: 'rgba(96,165,250,0.25)',  label: 'Pro'      },
  business: { color: '#A78BFA', bg: 'rgba(124,58,237,0.12)',  border: 'rgba(167,139,250,0.25)', label: 'Business' },
}

// ─── User menu popover ────────────────────────────────────────────────────────

function UserMenuPopover({
  profile,
  onClose,
  onLogout,
}: {
  profile: Profile | null
  onClose: () => void
  onLogout: () => void
}) {
  const plan      = profile?.plan ?? 'free'
  const ps        = planStyle[plan] ?? planStyle.free
  const name      = profile?.business_name ?? profile?.full_name ?? 'My account'
  const email     = profile?.email ?? ''
  const initials  = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  const menuItems = [
    {
      href: '/settings',
      label: 'Profile & settings',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ),
    },
    {
      href: '/settings#billing',
      label: 'Billing & plan',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
    },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        marginBottom: '8px',
        background: 'linear-gradient(145deg, #0D1527, #080E1E)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '14px',
        padding: '6px',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.08)',
        zIndex: 100,
      }}
    >
      {/* User info header */}
      <div
        style={{
          padding: '10px 12px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {profile?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt={name}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(96,165,250,0.2)' }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: 'white',
              flexShrink: 0,
            }}>
              {initials}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </p>
            {email && (
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {email}
              </p>
            )}
          </div>
        </div>

        {/* Plan badge */}
        <div style={{
          marginTop: '10px',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '3px 10px', borderRadius: '20px',
          background: ps.bg, border: `1px solid ${ps.border}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ps.color, display: 'inline-block' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: ps.color, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            {ps.label} plan
          </span>
          {plan === 'free' && (
            <Link
              href="/settings#billing"
              onClick={onClose}
              style={{ fontSize: '10px', color: '#60A5FA', marginLeft: '4px', textDecoration: 'none', fontWeight: 600 }}
            >
              Upgrade →
            </Link>
          )}
        </div>
      </div>

      {/* Menu items */}
      {menuItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 12px', borderRadius: '8px',
            color: 'rgba(148,163,184,0.9)', fontSize: '13px', fontWeight: 500,
            textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'rgba(148,163,184,0.9)'
          }}
        >
          <span style={{ color: '#64748B' }}>{item.icon}</span>
          {item.label}
        </Link>
      ))}

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          width: '100%', padding: '9px 12px', borderRadius: '8px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(148,163,184,0.7)', fontSize: '13px', fontWeight: 500,
          textAlign: 'left', transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
          e.currentTarget.style.color = '#F87171'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(148,163,184,0.7)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign out
      </button>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar({ profile }: SidebarProps) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef   = useRef<HTMLDivElement>(null)

  const displayName = profile?.business_name ?? profile?.full_name ?? 'My account'
  const initials    = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const plan        = profile?.plan ?? 'free'

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return ()  => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
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
      <div
        className="px-5 py-5 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LogoIcon size={28} />
          <span
            className="text-sm font-bold text-white tracking-tight"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Bill<span style={{ color: '#60A5FA', fontWeight: 400 }}>Metry</span>
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                color:      active ? '#fff'                            : 'rgba(148,163,184,0.8)',
                background: active ? 'rgba(37,99,235,0.15)'           : 'transparent',
                border:     active ? '1px solid rgba(96,165,250,0.18)' : '1px solid transparent',
              }}
            >
              <span style={{ color: active ? '#60A5FA' : 'rgba(100,116,139,0.9)', flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: '#3B82F6' }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade nudge for free users */}
      {plan === 'free' && (
        <div className="px-3 pb-3">
          <Link
            href="/settings#billing"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-xs transition-colors"
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
        </div>
      )}

      {/* User avatar + popover trigger */}
      <div
        className="px-3 pb-4 border-t pt-3 flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.05)', position: 'relative' }}
        ref={menuRef}
      >
        {/* Popover renders ABOVE the trigger */}
        {menuOpen && (
          <UserMenuPopover
            profile={profile}
            onClose={() => setMenuOpen(false)}
            onLogout={handleLogout}
          />
        )}

        {/* Avatar button */}
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-150 group"
          style={{
            background:   menuOpen ? 'rgba(37,99,235,0.1)'  : 'transparent',
            border:       menuOpen ? '1px solid rgba(96,165,250,0.15)' : '1px solid transparent',
          }}
          aria-expanded={menuOpen}
          aria-haspopup="true"
        >
          {/* Avatar */}
          {profile?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              style={{ border: '1px solid rgba(96,165,250,0.25)' }}
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)', flexShrink: 0 }}
            >
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-medium text-white truncate">{displayName}</p>
            <p className="text-xs truncate capitalize" style={{ color: planStyle[plan]?.color ?? '#94A3B8' }}>
              {plan} plan
            </p>
          </div>

          {/* Chevron */}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(100,116,139,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
          >
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}