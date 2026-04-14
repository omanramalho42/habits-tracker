"use client"

import { Navbar } from "@/components/trial-wizzard/navbar"
import { HeroSection } from "@/components/trial-wizzard/hero-section"
import { FeaturesSection } from "@/components/trial-wizzard/features-section"
import { HowItWorksSection } from "@/components/trial-wizzard/how-it-works-section"
import { AppPreviewSection } from "@/components/trial-wizzard/app-preview-section"
import { PricingSection } from "@/components/trial-wizzard/pricing-section"
import { Footer } from "@/components/trial-wizzard/footer"
import { SignupToast } from "@/components/trial-wizzard/signup-section"
import { SoundProvider } from "@/components/trial-wizzard/sound-provider"
import { SoundToggle } from "@/components/trial-wizzard/sound-toggle"

export default function FreeTrial() {
  return (
    <SoundProvider>
      <main className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AppPreviewSection />
        <PricingSection />
        <Footer />
        <SignupToast />
        <SoundToggle />
      </main>
    </SoundProvider>
  )
}
