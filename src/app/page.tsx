'use client'

import { Suspense } from 'react'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import ComponentShowcaseSection from '@/components/ComponentShowcaseSection'
import HowItWorks from '@/components/HowItWorks'
import ExportTargets from '@/components/ExportTargets'
import Footer from '@/components/Footer'
import BackgroundLayers from '@/components/BackgroundLayers'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ax-bg text-ax-text">
      <div className="font-mono text-ax-cyan">LOADING...</div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-ax-bg text-ax-text">
      <Suspense fallback={<LoadingFallback />}>
        <BackgroundLayers />
        
        <div className="relative z-10">
          <Hero />
          <Features />
          <ComponentShowcaseSection />
          <HowItWorks />
          <ExportTargets />
          <Footer />
        </div>
      </Suspense>
    </main>
  )
}
