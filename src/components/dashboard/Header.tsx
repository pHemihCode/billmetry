'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  full_name: string | null
  business_name: string | null
  logo_url: string | null
  plan: string | null
}

interface HeaderProps {
  user: User
  profile: Profile | null
}

// ─── Page title map ───────────────────────────────────────────────────────────
// Maps the current path to a human-readable page title shown in the header

function getPageTitle(pathname: string): { title: string; subtitle: string } {
  if (pathname === '/dashboard')           return { title: 'Overview',     subtitle: 'Your business at a glance' }
  if (pathname.startsWith('/invoices/new')) return { title: 'New invoice',  subtitle: 'Create and send an invoice' }
  if (pathname.startsWith('/invoices/'))   return { title: 'Invoice',       subtitle: 'View and manage this invoice' }
  if (pathname === '/invoices')            return { title: 'Invoices',      subtitle: 'All your invoices' }
  if (pathname.startsWith('/clients/new')) return { title: 'New client',    subtitle: 'Add a client to your account' }
  if (pathname.startsWith('/clients/'))   return { title: 'Client',         subtitle: 'Client details and history' }
  if (pathname === '/clients')            return { title: 'Clients',        subtitle: 'Manage your clients' }
  if (pathname === '/analytics') return { title: 'Analytics', subtitle: 'Revenue and performance insights' }
  if (pathname === '/settings')           return { title: 'Settings',       subtitle: 'Account and preferences' }
  return { title: 'InvoiceFlow', subtitle: '' }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Header({ user, profile }: HeaderProps) {
  const pathname  = usePathname()
  const { title, subtitle } = getPageTitle(pathname)

  const displayName = profile?.business_name ?? profile?.full_name ?? user.email ?? 'Account'
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
  
  return (
    <header
      className="shrink-0 flex items-center justify-between px-6 py-4 border-b"
      style={{
        background: 'rgba(6,10,22,0.8)',
        borderColor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left — page title */}
      <div>
        <h1
          className="text-base font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-3">

        {/* Quick action — New Invoice */}
        {pathname !== '/invoices/new' && (
          <Link
            href="/invoices/new"
            className="hidden sm:flex items-center gap-2 text-xs font-semibold text-white px-4 py-2 rounded-lg transition-all duration-150"
            style={{
              background: 'linear-gradient(90deg, #1D4ED8, #2563EB)',
              boxShadow: '0 0 0 1px rgba(96,165,250,0.2)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New invoice
          </Link>
        )}

        {/* Notification bell — placeholder for future */}
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          title="Notifications"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {/* Avatar */}
        <Link href="/settings" title="Settings">
          {profile?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border"
              style={{ borderColor: 'rgba(96,165,250,0.25)' }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
                borderColor: 'rgba(96,165,250,0.2)',
              }}
            >
              {initials}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}