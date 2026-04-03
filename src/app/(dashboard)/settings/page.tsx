import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsPage from '@/components/dashboard/SettingsPage'

// This is the Server Component wrapper.
// It fetches the profile server-side and passes it to the client form.
// This avoids a loading flash — data is ready before the page renders.

export default async function Settings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, business_name, email, phone, address, default_currency, logo_url, plan')
    .eq('id', user.id)
    .single()

  return (
    <SettingsPage
      initialProfile={{
        full_name:        profile?.full_name        ?? '',
        business_name:    profile?.business_name    ?? '',
        email:            user.email                ?? '',
        phone:            profile?.phone            ?? '',
        address:          profile?.address          ?? '',
        default_currency: profile?.default_currency ?? 'NGN',
        logo_url:         profile?.logo_url         ?? null,
        plan:             profile?.plan             ?? 'free',
      }}
    />
  )
}