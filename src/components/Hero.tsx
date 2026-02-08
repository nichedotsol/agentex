'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle gradient backgrounds */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-sans text-7xl md:text-8xl lg:text-9xl font-bold text-ax-text mb-6 tracking-tight"
        >
          AgentEX
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-sans text-2xl md:text-3xl text-ax-text-secondary mb-6 font-light"
        >
          Build AI agents in 90 seconds
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="font-sans text-lg md:text-xl text-ax-text-tertiary mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          The universal standard for building and deploying AI agents.
          Drag-and-drop components, configure settings, export real code.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link
            href="/builder"
            className="px-8 py-3.5 bg-ax-primary text-white rounded-lg font-sans text-base font-medium hover:bg-ax-primary-hover transition-all duration-200 shadow-lg shadow-ax-primary/20 hover:shadow-ax-primary/30"
          >
            Start Building
          </Link>
          <Link
            href="#components"
            className="px-8 py-3.5 bg-ax-bg-elevated border border-ax-border text-ax-text rounded-lg font-sans text-base font-medium hover:bg-ax-bg-hover hover:border-ax-border-hover transition-all duration-200"
          >
            View Components
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-ax-text-tertiary font-sans text-sm"
        >
          Scroll to explore
        </motion.div>
      </motion.div>
    </section>
  )
}
