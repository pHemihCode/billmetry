import Features from "@/components/homepage/Features"
import Nav from "@/components/homepage/Nav"
import Footer from "@/components/homepage/Footer"
import HowItWorks from "@/components/homepage/HowItWorks"
import Pricing from "@/components/homepage/Pricing"
import CTA from "@/components/homepage/CTA"
import HeroSection from "@/components/homepage/HeroSection"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0c0c0e] text-white">
      <Nav />
      <HeroSection />
      <HowItWorks />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}