import Features from "@/components/homepage/Features"
import Nav from "@/components/homepage/Nav"
import Footer from "@/components/homepage/Footer"
import HowItWorks from "@/components/homepage/HowItWorks"
import Pricing from "@/components/homepage/Pricing"
import CTA from "@/components/homepage/CTA"
import HeroSection from "@/components/homepage/HeroSection"
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bob {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-10px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes aurora {
    0%   { transform: translate(-50%,-50%) scale(1)    rotate(0deg); }
    33%  { transform: translate(-50%,-50%) scale(1.08) rotate(120deg); }
    66%  { transform: translate(-50%,-50%) scale(0.95) rotate(240deg); }
    100% { transform: translate(-50%,-50%) scale(1)    rotate(360deg); }
  }
  @keyframes slideIn {
    from { transform: translateX(-100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0   rgba(96,165,250,0.5); }
    70%  { box-shadow: 0 0 0 8px rgba(96,165,250,0); }
    100% { box-shadow: 0 0 0 0   rgba(96,165,250,0); }
  }
 
  .fu   { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
  .fu1  { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.1s both; }
  .fu2  { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.2s both; }
  .fu3  { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.3s both; }
  .fu4  { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) 0.4s both; }
  .bob  { animation: bob 4s ease-in-out infinite; }
  .aurora { animation: aurora 20s linear infinite; }
  .pulse  { animation: pulseRing 2.2s ease-in-out infinite; }
 
  .shimmer {
    background: linear-gradient(90deg,#1D4ED8 0%,#3B82F6 35%,#60A5FA 55%,#2563EB 75%,#1D4ED8 100%);
    background-size: 220% auto;
    animation: shimmer 3.5s linear infinite;
    transition: opacity 0.2s;
  }
  .shimmer:hover { opacity:0.88; animation-duration:1.8s; }
 
  .nav-glass {
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(255,255,255,0.055);
  }
  .drawer-overlay {
    animation: fadeIn 0.2s ease both;
  }
  .drawer-panel {
    animation: slideIn 0.28s cubic-bezier(.22,1,.36,1) both;
  }
  .feature-card {
    background: linear-gradient(140deg,rgba(255,255,255,0.038) 0%,rgba(255,255,255,0.008) 100%);
    border: 1px solid rgba(255,255,255,0.07);
    transition: border-color 0.25s, transform 0.25s;
  }
  .feature-card:hover { border-color:rgba(96,165,250,0.3); transform:translateY(-3px); }
  .step-card {
    background: linear-gradient(145deg,rgba(13,21,39,0.8),rgba(8,14,28,0.9));
    border: 1px solid rgba(255,255,255,0.07);
    transition: border-color 0.25s, transform 0.25s;
  }
  .step-card:hover { border-color:rgba(96,165,250,0.3); transform:translateY(-3px); }
  .card-shadow {
    box-shadow: 0 0 0 1px rgba(37,99,235,0.18),0 20px 60px rgba(5,10,25,0.7);
  }
  .gradient-text {
    background: linear-gradient(135deg,#93C5FD 0%,#60A5FA 40%,#818CF8 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
`

export default async function LandingPage() {
    const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return (
      <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <main className="min-h-screen text-white" style={{ fontFamily:'var(--font-dm-sans),sans-serif' }}>
        <Nav isLoggedIn={!!user} />
        <HeroSection />
        <HowItWorks />
        <Features />
        <Pricing isLoggedIn={!!user} />
        <CTA />
        <Footer />
      </main>
    </>
  )
}