'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number     // ms — default 4000
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (opts: Omit<Toast, 'id'>) => void
  success: (title: string, description?: string) => void
  error:   (title: string, description?: string) => void
  info:    (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  dismiss: (id: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Config ───────────────────────────────────────────────────────────────────

const toastConfig: Record<ToastType, {
  icon: ReactNode
  barColor: string
  iconBg: string
  iconColor: string
  border: string
}> = {
  success: {
    barColor:  '#22C55E',
    iconBg:    'rgba(34,197,94,0.12)',
    iconColor: '#22C55E',
    border:    'rgba(34,197,94,0.2)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  error: {
    barColor:  '#EF4444',
    iconBg:    'rgba(239,68,68,0.12)',
    iconColor: '#EF4444',
    border:    'rgba(239,68,68,0.2)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  info: {
    barColor:  '#3B82F6',
    iconBg:    'rgba(59,130,246,0.12)',
    iconColor: '#60A5FA',
    border:    'rgba(96,165,250,0.2)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
  warning: {
    barColor:  '#F59E0B',
    iconBg:    'rgba(245,158,11,0.12)',
    iconColor: '#FBBF24',
    border:    'rgba(251,191,36,0.2)',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
}

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const cfg      = toastConfig[toast.type]
  const duration = toast.duration ?? 4000
  const [visible, setVisible]   = useState(false)
  const [progress, setProgress] = useState(100)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef    = useRef<number>(Date.now())
  const remaining   = useRef<number>(duration)

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  // Progress bar countdown
  useEffect(() => {
    startRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct     = Math.max(0, ((remaining.current - elapsed) / duration) * 100)
      setProgress(pct)
      if (pct === 0) {
        clearInterval(intervalRef.current!)
        handleDismiss()
      }
    }, 50)
    return () => clearInterval(intervalRef.current!)
  }, [])

  function handleDismiss() {
    setVisible(false)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  // Pause on hover
  function handleMouseEnter() {
    if (!intervalRef.current) return
    clearInterval(intervalRef.current)
    remaining.current = remaining.current - (Date.now() - startRef.current)
  }

  function handleMouseLeave() {
    startRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current
      const pct     = Math.max(0, ((remaining.current - elapsed) / duration) * 100)
      setProgress(pct)
      if (pct === 0) {
        clearInterval(intervalRef.current!)
        handleDismiss()
      }
    }, 50)
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform:  visible ? 'translateX(0) scale(1)'     : 'translateX(100%) scale(0.95)',
        opacity:    visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s ease',
        background: 'linear-gradient(145deg, rgba(13,21,39,0.98), rgba(8,14,28,0.99))',
        border:     `1px solid ${cfg.border}`,
        borderRadius: '14px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        width: '340px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Progress bar */}
      <div style={{
        position:   'absolute',
        bottom:     0,
        left:       0,
        height:     '2px',
        width:      `${progress}%`,
        background: cfg.barColor,
        transition: 'width 50ms linear',
        borderRadius: '0 0 0 14px',
      }} />

      {/* Icon */}
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: cfg.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: cfg.iconColor,
      }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontSize: '13px', fontWeight: 600,
          color: '#F1F5F9', lineHeight: 1.4,
          fontFamily: 'var(--font-bricolage), sans-serif',
        }}>
          {toast.title}
        </p>
        {toast.description && (
          <p style={{
            margin: '3px 0 0', fontSize: '12px',
            color: 'rgba(148,163,184,0.8)', lineHeight: 1.5,
          }}>
            {toast.description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(100,116,139,0.8)', padding: '2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '4px', flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#94A3B8')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(100,116,139,0.8)')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6"  y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

// ─── Toast container ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div style={{
      position:   'fixed',
      top:     '24px',
      right:      '24px',
      zIndex:     9999,
      display:    'flex',
      flexDirection: 'column',
      gap:        '10px',
      alignItems: 'flex-end',
    }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts(prev => [...prev, { ...opts, id }])
  }, [])

  const success = useCallback((title: string, description?: string) => {
    toast({ type: 'success', title, description })
  }, [toast])

  const error = useCallback((title: string, description?: string) => {
    toast({ type: 'error', title, description })
  }, [toast])

  const info = useCallback((title: string, description?: string) => {
    toast({ type: 'info', title, description })
  }, [toast])

  const warning = useCallback((title: string, description?: string) => {
    toast({ type: 'warning', title, description })
  }, [toast])

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
// This is what you import in every component that needs toasts

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}