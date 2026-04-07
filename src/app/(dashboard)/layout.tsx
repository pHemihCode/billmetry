import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import { ToastProvider } from '@/components/ui/toast'
import { NotificationProvider } from '@/components/ui/notification'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileData } = await supabase
    .from('profiles')
    .select('full_name, business_name, logo_url, plan')
    .eq('id', user.id)
    .single()

  const profile = {
    full_name:     profileData?.full_name     ?? null,
    business_name: profileData?.business_name ?? null,
    logo_url:      profileData?.logo_url      ?? null,
    plan:          profileData?.plan          ?? 'free',
    email:         user.email                 ?? null,
  }

  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('id, event, note, created_at, invoice_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const notifications = (recentActivity ?? []).map(activity => {
    const typeMap: Record<string, { type: 'payment' | 'invoice' | 'reminder' | 'system'; title: string }> = {
      paid:          { type: 'payment',  title: 'Payment received'          },
      sent:          { type: 'invoice',  title: 'Invoice sent'              },
      created:       { type: 'invoice',  title: 'Invoice created'           },
      overdue:       { type: 'reminder', title: 'Invoice overdue'           },
      reminder_sent: { type: 'reminder', title: 'Reminder sent'             },
      viewed:        { type: 'invoice',  title: 'Invoice viewed by client'  },
    }
    const cfg = typeMap[activity.event] ?? { type: 'system' as const, title: activity.event }
    return {
      id:        activity.id,
      type:      cfg.type,
      title:     cfg.title,
      body:      activity.note ?? '',
      read:      false,
      createdAt: new Date(activity.created_at),
      href:      activity.invoice_id ? `/invoices/${activity.invoice_id}` : undefined,
    }
  })

  return (
    <ToastProvider>
      <NotificationProvider initialNotifications={notifications}>
        <div className="flex h-screen overflow-hidden" style={{ background: '#060A16' }}>

          {/* Desktop sidebar */}
          <Sidebar profile={profile} />

          {/* Main column */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Header user={user} profile={profile} />

            {/*
              pb-20 on mobile creates space above the fixed bottom tab bar.
              On md+ the tab bar is hidden so no extra padding needed.
            */}
            <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 md:pb-6 md:px-6 md:py-8">
              {children}
            </main>
          </div>
        </div>
      </NotificationProvider>
    </ToastProvider>
  )
}