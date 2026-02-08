'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const targets = [
  {
    name: 'GITHUB',
    icon: '📦',
    description: 'One-click repository creation',
    color: 'ax-cyan'
  },
  {
    name: 'VERCEL',
    icon: '▲',
    description: 'Auto-deploy to your account',
    color: 'ax-blue'
  },
  {
    name: 'CURSOR',
    icon: '⌨️',
    description: 'Deep link to open project',
    color: 'ax-cyan'
  },
  {
    name: 'LOCAL',
    icon: '💾',
    description: 'Download as ZIP',
    color: 'ax-blue'
  },
]

export default function ExportTargets() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-mono text-3xl md:text-4xl text-ax-cyan text-center mb-16 chrome-aberration"
        >
          EXPORT TARGETS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {targets.map((target, i) => (
            <motion.div
              key={target.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-ax-bg-elevated/80 backdrop-blur-md border border-ax-border p-6 hover:border-ax-cyan transition-all group"
            >
              <div className="text-4xl mb-4 group-hover:animate-float">
                {target.icon}
              </div>
              <h3 className="font-mono text-lg text-ax-cyan mb-2 group-hover:chrome-aberration transition-all">
                {target.name}
              </h3>
              <p className="font-sans text-sm text-ax-text-dim">
                {target.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
