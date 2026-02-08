'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { useRegistryStore } from '@/lib/stores/registryStore'
import { parseNaturalLanguage } from '@/lib/utils/naturalLanguageParser'
import { calculateComponentPosition } from '@/hooks/useWorkspace'

export default function NaturalLanguageInput() {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { addComponent } = useBuildStore()
  const { components } = useRegistryStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    
    try {
      // Parse natural language input
      const intent = parseNaturalLanguage(input, components)
      
      if (!intent) {
        // If parsing fails, try LLM-based parsing (future enhancement)
        console.warn('Could not parse input:', input)
        setIsProcessing(false)
        return
      }

      if (intent.action === 'add' && intent.componentName) {
        // Find the component
        const allComponents = [
          ...components.brains,
          ...components.tools,
          ...components.runtimes,
        ]
        const matchedComponent = allComponents.find(c => c.id === intent.componentName)

        if (matchedComponent) {
          // Get current build components for positioning
          const buildComponents = useBuildStore.getState().getAllComponents()
          
          // Calculate position
          const position = calculateComponentPosition(
            matchedComponent.type,
            buildComponents,
            buildComponents.length
          )

          // Add component with optional config
          const timestamp = Date.now()
          const newComponentId = `${matchedComponent.type}_${timestamp}`
          
          addComponent(matchedComponent, position)
          
          // Apply configuration if provided
          if (intent.config && Object.keys(intent.config).length > 0) {
            // TODO: Apply config to component
            // updateComponentConfig(newComponentId, intent.config)
          }
          
          setInput('')
        }
      } else if (intent.action === 'deploy') {
        // TODO: Trigger deployment flow
        console.log('Deploy action:', intent)
      }
    } catch (error) {
      console.error('Error processing natural language input:', error)
    } finally {
      setIsProcessing(false)
    }
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
