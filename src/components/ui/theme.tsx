'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = 'dark' | 'light' | 'system'
type ResolvedTheme = 'dark' | 'light'

interface ThemeContextValue {
  theme:         Theme
  resolvedTheme: ResolvedTheme
  setTheme:      (t: Theme) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue>({
  theme:         'dark',
  resolvedTheme: 'dark',
  setTheme:      () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')

  // Load saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('billmetry-theme') as Theme | null
    if (saved) setThemeState(saved)
  }, [])

  // Resolve system preference and apply class to <html>
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    function resolve(t: Theme): ResolvedTheme {
      if (t === 'system') return mediaQuery.matches ? 'dark' : 'light'
      return t
    }

    const resolved = resolve(theme)
    setResolvedTheme(resolved)

    const html = document.documentElement
    if (resolved === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }

    function handleSystemChange() {
      if (theme === 'system') {
        const r = mediaQuery.matches ? 'dark' : 'light'
        setResolvedTheme(r)
        html.classList.toggle('dark',  r === 'dark')
        html.classList.toggle('light', r === 'light')
      }
    }

    mediaQuery.addEventListener('change', handleSystemChange)
    return () => mediaQuery.removeEventListener('change', handleSystemChange)
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('billmetry-theme', t)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── Toggle button ────────────────────────────────────────────────────────────
// Cycles: dark → light → system → dark

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  function cycle() {
    if (theme === 'dark')   setTheme('light')
    else if (theme === 'light') setTheme('system')
    else setTheme('dark')
  }

  const icons = {
    dark: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
    light: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    ),
    system: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  }

  const labels = { dark: 'Dark', light: 'Light', system: 'System' }

  return (
    <button
      onClick={cycle}
      title={`Theme: ${labels[theme]} — click to change`}
      style={{
        width: 34, height: 34, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        cursor: 'pointer',
        color: 'rgba(148,163,184,0.9)',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.14)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
      }}
    >
      {icons[theme]}
    </button>
  )
}