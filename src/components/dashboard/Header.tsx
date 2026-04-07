'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { NotificationDropdown } from '@/components/ui/notification'

interface Profile {
  full_name:     string | null
  business_name: string | null
  logo_url:      string | null
  plan:          string | null
}

interface HeaderProps {
  user:    User
  profile: Profile | null
}

function getPageTitle(pathname: string): { title: string; subtitle?: string } {
  if (pathname === '/dashboard')               return { title: 'Overview',     subtitle: 'Your business at a glance'   }
  if (pathname.startsWith('/invoices/new'))    return { title: 'New invoice',  subtitle: 'Create and send an invoice'  }
  if (pathname.match(/\/invoices\/.+\/edit/))  return { title: 'Edit invoice'                                          }
  if (pathname.startsWith('/invoices/'))       return { title: 'Invoice'                                               }
  if (pathname === '/invoices')                return { title: 'Invoices',     subtitle: 'All your invoices'           }
  if (pathname.startsWith('/clients/new'))     return { title: 'New client'                                            }
  if (pathname.startsWith('/clients/'))        return { title: 'Client detail'                                         }
  if (pathname === '/clients')                 return { title: 'Clients',      subtitle: 'Manage your clients'         }
  if (pathname === '/analytics')               return { title: 'Analytics',    subtitle: 'Revenue and performance'     }
  if (pathname === '/billing')                 return { title: 'Billing',      subtitle: 'Plans and subscription'      }
  if (pathname === '/settings')                return { title: 'Settings',     subtitle: 'Account and preferences'     }
  return { title: 'BillMetry' }
}

export default function Header({ user, profile }: HeaderProps) {
  const pathname = usePathname()
  const { title, subtitle } = getPageTitle(pathname)

  const displayName = profile?.business_name ?? profile?.full_name ?? user.email ?? 'Account'
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="dash-header shrink-0 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[rgba(255,255,255,0.07)]">
      {/* Page title */}
      <div className="min-w-0">
        <h1 className="text-sm md:text-base font-bold text-white leading-tight"
          style={{ fontFamily: 'var(--font-bricolage), sans-serif' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notifications */}
        <NotificationDropdown />

        {/* Avatar → settings */}
        <Link href="/settings" title="Settings">
          {profile?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.logo_url} alt={displayName}
              className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border cursor-pointer"
              style={{ borderColor: 'rgba(96,165,250,0.25)' }} />
          ) : (
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#1D4ED8,#7C3AED)', borderColor: 'rgba(96,165,250,0.2)' }}>
              {initials}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}