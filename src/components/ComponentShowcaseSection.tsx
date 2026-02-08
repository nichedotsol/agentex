'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

type ComponentInfo = {
  name: string
  icon: string
  meta: string
  ctx?: string
  rate?: string
}

const components: {
  brain: ComponentInfo[]
  tools: ComponentInfo[]
  runtime: ComponentInfo[]
} = {
  brain: [
    { name: 'CLAUDE_SONNET_4', icon: '🧠', meta: '$3/$15 per M', ctx: '200K' },
    { name: 'GPT_4', icon: '🤖', meta: '$10/$30 per M', ctx: '128K' },
    { name: 'LLAMA_3.3_70B', icon: '🦙', meta: '$0.35/$0.40 per M', ctx: 'OSS' },
    { name: 'OPENCLAW_V1', icon: '🦅', meta: '$2.50/$10 per M', ctx: '128K' },
  ],
  tools: [
    { name: 'WEB_SEARCH', icon: '🔍', meta: 'brave', rate: '60/min' },
    { name: 'CODE_EXEC', icon: '⚙️', meta: 'e2b', rate: 'python' },
    { name: 'BLOCKCHAIN_QUERY', icon: '⛓️', meta: 'alchemy', rate: 'eth+sol' },
    { name: 'TOKEN_PRICE', icon: '💰', meta: 'coingecko', rate: 'realtime' },
    { name: 'TWITTER_POST', icon: '🐦', meta: 'api v2', rate: '50/15min' },
  ],
  runtime: [
    { name: 'VERCEL', icon: '▲', meta: 'serverless', rate: 'edge' },
    { name: 'LOCAL_DOCKER', icon: '🐳', meta: 'fastapi', rate: 'python' },
  ],
}

export default function ComponentShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'brain' | 'tools' | 'runtime'>('brain')

  return (
    <section id="components" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-sans text-4xl md:text-5xl font-bold text-ax-text text-center mb-4"
        >
          Component Library
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-ax-text-secondary text-lg mb-12 max-w-2xl mx-auto"
        >
          Choose from a growing library of brains, tools, and runtimes
        </motion.p>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-12">
          {(['brain', 'tools', 'runtime'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-sans text-sm rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-ax-primary text-white'
                  : 'bg-ax-bg-elevated border border-ax-border text-ax-text-secondary hover:bg-ax-bg-hover hover:text-ax-text'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({components[tab].length})
            </button>
          ))}
        </div>

        {/* Component Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {components[activeTab].map((comp, i) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="card-hover group cursor-pointer"
            >
              <div className="font-sans text-xs text-ax-text-tertiary mb-2 uppercase tracking-wide">
                {activeTab}
              </div>
              <div className="font-sans text-lg font-bold text-ax-text mb-2">
                {comp.name.replace(/_/g, ' ')}
              </div>
              <div className="font-sans text-xs text-ax-text-secondary">
                {comp.meta}
                {comp.ctx && ` · ${comp.ctx}`}
                {comp.rate && ` · ${comp.rate}`}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
