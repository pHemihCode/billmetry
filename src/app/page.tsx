import Features from "@/components/homepage/Features"
import Nav from "@/components/homepage/Nav"
import Footer from "@/components/homepage/Footer"
import HowItWorks from "@/components/homepage/HowItWorks"
import Pricing from "@/components/homepage/Pricing"
import CTA from "@/components/homepage/CTA"
import HeroSection from "@/components/homepage/HeroSection"
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
export default async function LandingPage() {
    const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <main className="min-h-screen bg-[#0c0c0e] text-white">
      <Nav isLoggedIn={!!user}/>
      <HeroSection />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}