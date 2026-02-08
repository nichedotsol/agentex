'use client'

import { motion } from 'framer-motion'

const features = [
  {
    title: 'Lightweight',
    description: 'Zero infrastructure burden. Build and deploy without managing servers.',
  },
  {
    title: 'Intuitive',
    description: 'Drag-and-drop interface that feels natural. No coding required.',
  },
  {
    title: 'Universal',
    description: 'Works with any LLM provider. Claude, GPT, Llama, and more.',
  },
  {
    title: 'Portable',
    description: 'Export to real, deployable code. No vendor lock-in.',
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
          className="font-sans text-4xl md:text-5xl font-bold text-ax-text text-center mb-4"
        >
          Why AgentEX?
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-ax-text-secondary text-lg mb-16 max-w-2xl mx-auto"
        >
          Everything you need to build production-ready AI agents
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="card-hover group"
            >
              <h3 className="font-sans text-2xl font-bold text-ax-text mb-3 kinetic-float">
                {feature.title}
              </h3>
              <p className="font-sans text-sm text-ax-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
