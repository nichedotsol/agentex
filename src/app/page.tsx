'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import ComponentShowcaseSection from '@/components/ComponentShowcaseSection'
import HowItWorks from '@/components/HowItWorks'
import ExportTargets from '@/components/ExportTargets'
import Footer from '@/components/Footer'
import BackgroundLayers from '@/components/BackgroundLayers'

export default function LandingPage() {
  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-black text-white">
        <BackgroundLayers />
        
        <div className="relative z-10">
          <Hero />
          <Features />
          <ComponentShowcaseSection />
          <HowItWorks />
          <ExportTargets />
          <Footer />
        </div>
      </main>
    </ErrorBoundary>
  )
}
