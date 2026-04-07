"use client"
import Link from "next/link";
import { LogoFull } from "../ui/logo";
import { useEffect, useState } from "react";
import LogoMark from "../ui/LogoMark";

interface NavProps {
  isLoggedIn: boolean
}

function MobileDrawer({
  open,
  onClose,
  isLoggedIn,
}: {
  open: boolean
  onClose: () => void
  isLoggedIn: boolean
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
 
  if (!open) return null
 
  const navLinks = [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#features',     label: 'Features' },
    { href: '#pricing',      label: 'Pricing' },
  ]
 
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      {/* Backdrop */}
      <div
        className="drawer-overlay"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
      />
 
      {/* Slide-in panel from left */}
      <div
        className="drawer-panel"
        style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: 'min(300px, 80vw)',
          background: 'linear-gradient(180deg,#0D1527 0%,#07091A 100%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '8px 0 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px' }}>
          <Link href="/" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <LogoFull />
          </Link>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
 
        {/* Nav links */}
        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              style={{
                display: 'block', padding: '13px 12px',
                color: '#CBD5E1', fontSize: 15, fontWeight: 500,
                textDecoration: 'none', borderRadius: 10,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#CBD5E1' }}
            >
              {link.label}
            </a>
          ))}
        </nav>
 
        {/* Auth actions */}
        <div style={{ padding: '16px 20px 32px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isLoggedIn ? (
            <Link href="/dashboard" onClick={onClose}
              className="shimmer"
              style={{ display: 'block', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px', borderRadius: 12, textDecoration: 'none' }}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" onClick={onClose}
                style={{ display: 'block', textAlign: 'center', color: '#94A3B8', fontSize: 14, fontWeight: 500, padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.09)', textDecoration: 'none' }}>
                Log in
              </Link>
              <Link href="/signup" onClick={onClose}
                className="shimmer"
                style={{ display: 'block', textAlign: 'center', color: 'white', fontWeight: 700, fontSize: 14, padding: '12px', borderRadius: 12, textDecoration: 'none' }}>
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Nav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
 
  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])
 
  return (
    <>
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 md:px-8">
 
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
           <LogoFull />
        </Link>
 
        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#features"     className="hover:text-white transition-colors">Features</a>
          <a href="#pricing"      className="hover:text-white transition-colors">Pricing</a>
        </div>
 
        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-500 px-3 py-1.5 rounded-full border"
                style={{ borderColor:'rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"
                  style={{ boxShadow:'0 0 6px rgba(74,222,128,0.6)' }} />
                Signed in
              </div>
              <Link href="/dashboard" className="shimmer text-sm font-bold text-white px-5 py-2.5 rounded-full">
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                Log in
              </Link>
              <Link href="/signup" className="shimmer text-sm font-bold text-white px-5 py-2.5 rounded-full">
                Start free
              </Link>
            </>
          )}
        </div>
 
        {/* Mobile hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl"
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7"  x2="20" y2="7"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="17" x2="20" y2="17"/>
          </svg>
        </button>
      </nav>
 
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} isLoggedIn={isLoggedIn} />
    </>
  )
}
export default Nav