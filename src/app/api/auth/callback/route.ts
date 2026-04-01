import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This route handles:
// 1. Email confirmation links (user clicks link in their inbox)
// 2. OAuth callbacks (after Google login redirects back)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, send them to login with an error param
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}