'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import ComponentShowcaseSection from '@/components/ComponentShowcaseSection'
import HowItWorks from '@/components/HowItWorks'
import ExportTargets from '@/components/ExportTargets'
import Footer from '@/components/Footer'
import BackgroundLayers from '@/components/BackgroundLayers'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="font-mono text-green-400">LOADING...</div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <ErrorBoundary>
      <main className="relative min-h-screen bg-black text-white">
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
    </ErrorBoundary>
  )
}
