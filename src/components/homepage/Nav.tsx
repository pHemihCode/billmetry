import Link from "next/link";
import { LogoFull } from "../ui/logo";

interface NavProps {
  isLoggedIn: boolean
}


function Nav({ isLoggedIn }: NavProps) {
  return (
    <nav className="backdrop-blur-xl -webkit-backdrop-blur-xl nav-glass fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
 
      {/* Logo */}
            <div
              className="px-5 shrink-0"  
            >
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <LogoFull />
              </Link>
            </div>
 
      {/* Links — hidden when logged in to keep nav clean */}
      {!isLoggedIn && (
        <div className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
          <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How it works</a>
          <a href="#features"     className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#pricing"      className="hover:text-white transition-colors duration-200">Pricing</a>
        </div>
      )}
 
      {/* Right side — changes based on auth state */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          // ── Logged in state ──────────────────────────────────────────────
          <>
            {/* Subtle "you're logged in" indicator */}
            <div
              className="hidden sm:flex items-center gap-2 text-xs text-slate-500 px-3 py-1.5 rounded-full border"
              style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                style={{ boxShadow: '0 0 6px rgba(74,222,128,0.6)' }}
              />
              Signed in
            </div>
 
            {/* Primary CTA — go to dashboard */}
            <a
              href="/dashboard"
              className="shimmer-btn flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-full"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Go to dashboard
            </a>
          </>
        ) : (
          // ── Logged out state ─────────────────────────────────────────────
          <>
            <a
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="shimmer-btn text-sm font-bold text-white px-5 py-2.5 rounded-full"
            >
              Start free
            </a>
          </>
        )}
      </div>
    </nav>
  )
}
export default Nav