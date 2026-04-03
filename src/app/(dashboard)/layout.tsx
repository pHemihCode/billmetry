import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import { ToastProvider } from '@/components/ui/toast'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, business_name, logo_url, plan')
    .eq('id', user.id)
    .single()

  return (
    // ToastProvider wraps the entire dashboard so any page or component
    // can call useToast() without any additional setup
    <ToastProvider>
      <div className="flex h-screen bg-[#060A16] overflow-hidden">
        <Sidebar profile={profile} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header user={user} profile={profile} />
          <main className="flex-1 overflow-y-auto px-6 py-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}