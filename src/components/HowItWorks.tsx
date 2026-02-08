'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Choose Components',
    description: 'Select brain, tools, and runtime from the component library',
  },
  {
    number: '02',
    title: 'Configure Settings',
    description: 'Customize model parameters, tool endpoints, and deployment options',
  },
  {
    number: '03',
    title: 'Export & Deploy',
    description: 'Generate code and deploy to GitHub, Vercel, or download locally',
  },
]

export default function HowItWorks() {
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
          How It Works
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-ax-text-secondary text-lg mb-16 max-w-2xl mx-auto"
        >
          Build production-ready AI agents in three simple steps
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="relative"
            >
              {/* Connection line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-ax-border -z-10" style={{ width: 'calc(100% - 2rem)' }}>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-ax-primary rounded-full" />
                </div>
              )}

              <div className="card-hover">
                <div className="font-sans text-4xl font-bold text-ax-primary mb-4 kinetic-float">
                  {step.number}
                </div>
                <h3 className="font-sans text-xl font-bold text-ax-text mb-3">
                  {step.title}
                </h3>
                <p className="font-sans text-sm text-ax-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
