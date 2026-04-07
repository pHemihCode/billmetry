'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType = 'payment' | 'invoice' | 'system' | 'reminder'

export interface Notification {
  id:        string
  type:      NotificationType
  title:     string
  body:      string
  read:      boolean
  createdAt: Date
  href?:     string   // optional link to relevant page
}

interface NotificationContextValue {
  notifications:  Notification[]
  unreadCount:    number
  markRead:       (id: string) => void
  markAllRead:    () => void
  dismiss:        (id: string) => void
  add:            (n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotifContext = createContext<NotificationContextValue | null>(null)

export function useNotifications() {
  const ctx = useContext(NotifContext)
  if (!ctx) throw new Error('useNotifications must be inside NotificationProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children, initialNotifications = [] }: {
  children: ReactNode
  initialNotifications?: Notification[]
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const add = useCallback((n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const notif: Notification = {
      ...n,
      id:        Math.random().toString(36).slice(2),
      read:      false,
      createdAt: new Date(),
    }
    setNotifications(prev => [notif, ...prev])
  }, [])

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, dismiss, add }}>
      {children}
    </NotifContext.Provider>
  )
}

// ─── Icon per type ────────────────────────────────────────────────────────────

const typeConfig: Record<NotificationType, { icon: ReactNode; color: string; bg: string }> = {
  payment: {
    color: '#34D399',
    bg:    'rgba(34,197,94,0.1)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  invoice: {
    color: '#60A5FA',
    bg:    'rgba(96,165,250,0.1)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  reminder: {
    color: '#FBBF24',
    bg:    'rgba(245,158,11,0.1)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
  },
  system: {
    color: '#A78BFA',
    bg:    'rgba(167,139,250,0.1)',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60)   return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

// ─── Dropdown component ───────────────────────────────────────────────────────

export function NotificationDropdown() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          width: 34, height: 34, borderRadius: 10, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: open ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.04)',
          border: open ? '1px solid rgba(96,165,250,0.2)' : '1px solid rgba(255,255,255,0.07)',
          cursor: 'pointer', position: 'relative', color: 'rgba(148,163,184,0.9)',
          transition: 'background 0.15s, border-color 0.15s',
        }}
        aria-label="Notifications"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 8, height: 8, borderRadius: '50%',
            background: '#EF4444',
            border: '1.5px solid #060A16',
          }} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: 320, zIndex: 200,
          background: 'linear-gradient(145deg, #0D1527, #080E1E)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 14,
          boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.08)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft: 8, fontSize: 10, fontWeight: 700,
                  background: 'rgba(37,99,235,0.2)', color: '#60A5FA',
                  border: '1px solid rgba(96,165,250,0.25)',
                  padding: '1px 7px', borderRadius: 20,
                  fontFamily: 'monospace',
                }}>
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                style={{ fontSize: 11, color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔔</div>
                <p style={{ fontSize: 13, color: '#475569' }}>No notifications yet</p>
                <p style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                  Payment confirmations and reminders will appear here.
                </p>
              </div>
            ) : (
              notifications.map(notif => {
                const cfg = typeConfig[notif.type]
                return (
                  <div
                    key={notif.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: notif.read ? 'transparent' : 'rgba(37,99,235,0.04)',
                      cursor: notif.href ? 'pointer' : 'default',
                      transition: 'background 0.15s',
                    }}
                    onClick={() => {
                      markRead(notif.id)
                      if (notif.href) window.location.href = notif.href
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = notif.read ? 'transparent' : 'rgba(37,99,235,0.04)' }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: cfg.bg, color: cfg.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {cfg.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <p style={{ fontSize: 12, fontWeight: notif.read ? 400 : 600, color: '#E2E8F0', margin: 0, lineHeight: 1.4 }}>
                          {notif.title}
                        </p>
                        <button
                          onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 2, flexShrink: 0 }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                      <p style={{ fontSize: 11, color: '#64748B', margin: '3px 0 0', lineHeight: 1.5 }}>{notif.body}</p>
                      <p style={{ fontSize: 10, color: '#334155', margin: '4px 0 0', fontFamily: 'monospace' }}>
                        {timeAgo(notif.createdAt)}
                        {!notif.read && (
                          <span style={{ marginLeft: 8, width: 5, height: 5, borderRadius: '50%', background: '#2563EB', display: 'inline-block', verticalAlign: 'middle' }} />
                        )}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}