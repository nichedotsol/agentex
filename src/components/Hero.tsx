'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-dots opacity-20" />
      
      {/* Blurred gradient backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 20% 30%, rgba(0, 255, 159, 0.3) 0%, transparent 50%)',
            filter: 'blur(120px)',
          }}
        />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 80% 70%, rgba(0, 217, 255, 0.3) 0%, transparent 50%)',
            filter: 'blur(140px)',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-6xl md:text-8xl font-bold text-ax-cyan mb-6 chrome-aberration-strong"
        >
          AGENTEX
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-xl md:text-2xl text-ax-text-dim mb-4"
        >
          BUILD AI AGENTS IN 90 SECONDS
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-sans text-base md:text-lg text-ax-text-dim mb-12 max-w-2xl mx-auto"
        >
          The universal standard for building and deploying AI agents.
          Drag-and-drop components, configure settings, export real code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link
            href="/builder"
            className="px-8 py-4 bg-ax-cyan text-ax-bg border border-ax-cyan font-mono text-sm font-semibold hover:shadow-[0_0_30px_rgba(0,255,159,0.6)] transition-all"
          >
            START BUILDING
          </Link>
          <Link
            href="#components"
            className="px-8 py-4 bg-transparent border border-ax-border text-ax-text font-mono text-sm hover:border-ax-cyan hover:text-ax-cyan hover:shadow-[0_0_20px_rgba(0,255,159,0.3)] transition-all"
          >
            VIEW COMPONENTS
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-ax-text-dim font-mono text-xs"
        >
          SCROLL ↓
        </motion.div>
      </motion.div>
    </section>
  )
}
