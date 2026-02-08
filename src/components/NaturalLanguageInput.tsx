'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { useRegistryStore } from '@/lib/stores/registryStore'

export default function NaturalLanguageInput() {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { addComponent } = useBuildStore()
  const { components } = useRegistryStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    
    // TODO: Implement LLM-based natural language parsing
    // For now, simple keyword matching
    const query = input.toLowerCase()
    
    // Find matching components
    let matchedComponent = null
    
    // Brain matching
    if (query.includes('claude') || query.includes('anthropic')) {
      matchedComponent = components.brains.find(c => c.id.includes('claude'))
    } else if (query.includes('gpt') || query.includes('openai')) {
      matchedComponent = components.brains.find(c => c.id.includes('gpt'))
    } else if (query.includes('llama')) {
      matchedComponent = components.brains.find(c => c.id.includes('llama'))
    } else if (query.includes('openclaw')) {
      matchedComponent = components.brains.find(c => c.id.includes('openclaw'))
    }
    
    // Tool matching
    if (query.includes('search') || query.includes('web')) {
      matchedComponent = components.tools.find(c => c.id.includes('web-search'))
    } else if (query.includes('code') || query.includes('execute')) {
      matchedComponent = components.tools.find(c => c.id.includes('code-execution'))
    } else if (query.includes('blockchain') || query.includes('crypto')) {
      matchedComponent = components.tools.find(c => c.id.includes('blockchain'))
    } else if (query.includes('price') || query.includes('token')) {
      matchedComponent = components.tools.find(c => c.id.includes('token-price'))
    } else if (query.includes('twitter') || query.includes('social')) {
      matchedComponent = components.tools.find(c => c.id.includes('twitter'))
    }
    
    // Runtime matching
    if (query.includes('vercel') || query.includes('serverless')) {
      matchedComponent = components.runtimes.find(c => c.id.includes('vercel'))
    } else if (query.includes('docker') || query.includes('local')) {
      matchedComponent = components.runtimes.find(c => c.id.includes('docker'))
    }

    if (matchedComponent) {
      // Add component to build
      const timestamp = Date.now()
      const newComponentId = `${matchedComponent.type}_${timestamp}`
      addComponent(matchedComponent, { x: 100, y: 100 })
      setInput('')
    }
    
    setIsProcessing(false)
  }

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6">
      <div className="mb-4">
        <h3 className="font-sans text-lg font-semibold text-ax-text mb-2">
          Describe what you want to build
        </h3>
        <p className="font-sans text-sm text-ax-text-secondary">
          Use natural language to add components. Try: "Add Claude brain with web search"
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., 'Add Claude brain with web search and deploy to Vercel'"
          className="flex-1 px-4 py-3 bg-ax-bg/50 border border-ax-border rounded-xl text-ax-text font-sans text-sm outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20 transition-all placeholder:text-ax-text-tertiary"
          disabled={isProcessing}
        />
        <motion.button
          type="submit"
          disabled={!input.trim() || isProcessing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-ax-primary text-white rounded-xl font-sans text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-ax-primary/20 hover:shadow-ax-primary/30"
        >
          {isProcessing ? 'Adding...' : 'Add'}
        </motion.button>
      </form>

      <AnimatePresence>
        {input && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-ax-border"
          >
            <p className="font-sans text-xs text-ax-text-tertiary">
              💡 Tip: Be specific about components. Example: "Claude brain", "web search tool", "Vercel runtime"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
