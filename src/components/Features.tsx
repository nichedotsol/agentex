'use client'

import { motion } from 'framer-motion'

const features = [
  {
    title: 'LIGHTWEIGHT',
    description: 'Zero infrastructure burden',
    icon: '⚡',
    color: 'ax-cyan'
  },
  {
    title: 'SIMPLE',
    description: 'Drag-and-drop interface',
    icon: '🎯',
    color: 'ax-blue'
  },
  {
    title: 'UNIVERSAL',
    description: 'Works with any LLM',
    icon: '🌐',
    color: 'ax-cyan'
  },
  {
    title: 'PORTABLE',
    description: 'Export to code anytime',
    icon: '📦',
    color: 'ax-blue'
  },
]

export default function Features() {
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
          WHY AGENTEX?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-ax-bg-elevated/80 backdrop-blur-md border border-ax-border p-6 hover:border-ax-cyan transition-all group"
            >
              <div className="text-4xl mb-4 group-hover:animate-float">
                {feature.icon}
              </div>
              <h3 className="font-mono text-lg text-ax-cyan mb-2 group-hover:chrome-aberration transition-all">
                {feature.title}
              </h3>
              <p className="font-sans text-sm text-ax-text-dim">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
