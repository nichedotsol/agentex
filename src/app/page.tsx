'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Dynamically import components to avoid SSR issues
const BackgroundLayers = dynamic(() => import('@/components/BackgroundLayers'), { ssr: false })
const Hero = dynamic(() => import('@/components/Hero'), { ssr: true })
const Features = dynamic(() => import('@/components/Features'), { ssr: true })
const ComponentShowcaseSection = dynamic(() => import('@/components/ComponentShowcaseSection'), { ssr: true })
const HowItWorks = dynamic(() => import('@/components/HowItWorks'), { ssr: true })
const ExportTargets = dynamic(() => import('@/components/ExportTargets'), { ssr: true })
const Footer = dynamic(() => import('@/components/Footer'), { ssr: true })

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
