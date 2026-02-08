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
          className="font-mono text-3xl md:text-4xl text-ax-cyan text-center mb-8 chrome-aberration"
        >
          COMPONENT LIBRARY
        </motion.h2>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {(['brain', 'tools', 'runtime'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 font-mono text-sm border transition-all ${
                activeTab === tab
                  ? 'border-ax-cyan text-ax-cyan shadow-[0_0_15px_rgba(0,255,159,0.3)]'
                  : 'border-ax-border text-ax-text-dim hover:border-ax-cyan/50'
              }`}
            >
              {tab.toUpperCase()} ({components[tab].length})
            </button>
          ))}
        </div>

        {/* Component Grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {components[activeTab].map((comp, i) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-ax-bg-elevated/80 backdrop-blur-md border border-ax-border p-4 hover:border-ax-cyan transition-all group cursor-pointer"
            >
              <div className="text-3xl mb-3 group-hover:animate-float">
                {comp.icon}
              </div>
              <div className="font-mono text-xs text-ax-cyan mb-1">
                {activeTab.toUpperCase()}
              </div>
              <div className="font-mono text-sm text-ax-text mb-2 group-hover:chrome-aberration transition-all">
                {comp.name}
              </div>
              <div className="font-mono text-[10px] text-ax-text-dim">
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
