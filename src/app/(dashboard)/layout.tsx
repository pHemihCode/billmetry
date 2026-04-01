import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

// This layout wraps every route inside (dashboard)/
// It runs on the server, checks auth, and renders the shell.
// If the user is not logged in, middleware handles the redirect —
// but we double-check here as a safety net.

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the profile so we can show name + avatar in the header/sidebar
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, business_name, logo_url, plan')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-[#060A16] overflow-hidden">
      {/* Sidebar — fixed left column */}
      <Sidebar profile={profile} />

      {/* Main area — scrollable right column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header user={user} profile={profile} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}