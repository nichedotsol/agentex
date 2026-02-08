'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { useRegistryStore } from '@/lib/stores/registryStore'
import { parseNaturalLanguage, type ParsedIntent as SimpleParsedIntent } from '@/lib/utils/naturalLanguageParser'
import { LLMParser, type ParsedIntent as LLMParsedIntent } from '@/lib/utils/llmParser'
import { calculateComponentPosition } from '@/hooks/useWorkspace'

type ParsedIntent = SimpleParsedIntent | LLMParsedIntent

export default function NaturalLanguageInput() {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [parser, setParser] = useState<LLMParser | null>(null)
  const { addComponent } = useBuildStore()
  const { components } = useRegistryStore()

  // Initialize parser when components are loaded
  useEffect(() => {
    if (components.brains.length > 0) {
      setParser(new LLMParser(components))
    }
  }, [components])

  // Generate suggestions as user types
  useEffect(() => {
    if (!parser || !input.trim() || input.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const generateSuggestions = async () => {
      try {
        const result = await parser.parse(input)
        if (result.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (error) {
        console.error('Error generating suggestions:', error)
      }
    }

    const debounceTimer = setTimeout(generateSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [input, parser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    setShowSuggestions(false)
    
    try {
      let intent

      // Try LLM parser first
      if (parser) {
        const result = await parser.parse(input)
        intent = result.intent
        
        // Show suggestions if confidence is low
        if (result.intent.confidence < 0.7 && result.suggestions && result.suggestions.length > 0) {
          setSuggestions(result.suggestions)
          setShowSuggestions(true)
        }
      } else {
        // Fallback to simple parser
        intent = parseNaturalLanguage(input, components)
      }
      
      if (!intent || ('confidence' in intent && intent.confidence < 0.5)) {
        console.warn('Could not parse input:', input)
        setIsProcessing(false)
        return
      }

      // Handle multi-step requests
      if (parser && (input.includes(' and ') || input.includes(' then '))) {
        const intents = await parser.parseMultiStep(input)
        for (const stepIntent of intents) {
          await processIntent(stepIntent)
        }
      } else {
        await processIntent(intent)
      }
      
      setInput('')
      setSuggestions([])
    } catch (error) {
      console.error('Error processing natural language input:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const processIntent = async (intent: ParsedIntent | any) => {
    if (intent.action === 'add' && intent.componentName) {
      // Find the component
      const allComponents = [
        ...components.brains,
        ...components.tools,
        ...components.runtimes,
        ...components.memories || [],
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
        addComponent(matchedComponent, position)
        
        // Apply configuration if provided
        if (intent.config && Object.keys(intent.config).length > 0) {
          // Get the newly added component ID
          const newComponents = useBuildStore.getState().getAllComponents()
          const newComponent = newComponents.find(c => 
            c.component.id === matchedComponent.id &&
            !buildComponents.some(bc => bc.id === c.id)
          )
          
          if (newComponent) {
            useBuildStore.getState().updateComponentConfig(newComponent.id, intent.config)
          }
        }
      }
    } else if (intent.action === 'remove' && intent.componentId) {
      useBuildStore.getState().removeComponent(intent.componentId)
    } else if (intent.action === 'configure' && intent.componentId && intent.config) {
      useBuildStore.getState().updateComponentConfig(intent.componentId, intent.config)
    } else if (intent.action === 'deploy') {
      // TODO: Trigger deployment flow
      console.log('Deploy action:', intent)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 mb-6"
    >
      <div className="mb-4">
        <motion.h3 
          className="font-sans text-lg font-semibold text-ax-text mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Describe what you want to build
        </motion.h3>
        <motion.p 
          className="font-sans text-sm text-ax-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Use natural language to add components. Try: "Add Claude brain with web search"
        </motion.p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., 'Add Claude brain with web search and deploy to Vercel'"
            className="w-full px-4 py-3 bg-ax-bg/50 border border-ax-border rounded-xl text-ax-text font-sans text-sm outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20 transition-all duration-200 placeholder:text-ax-text-tertiary hover:border-ax-border-hover"
            disabled={isProcessing}
          />
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div className="w-5 h-5 border-2 border-ax-primary border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </motion.div>
        <motion.button
          type="submit"
          disabled={!input.trim() || isProcessing}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)"
          }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-ax-primary text-white rounded-xl font-sans text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-ax-primary/20 hover:shadow-ax-primary/30 micro-bounce"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </span>
          ) : (
            'Add'
          )}
        </motion.button>
      </form>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 pt-4 border-t border-ax-border"
          >
            <div className="font-sans text-xs text-ax-text-secondary mb-2 font-medium">
              💡 Suggestions:
            </div>
            <ul className="space-y-1">
              {suggestions.map((suggestion, i) => (
                <li key={i} className="font-sans text-xs text-ax-text-tertiary">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
        {input && !showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-ax-border"
          >
            <p className="font-sans text-xs text-ax-text-tertiary">
              💡 Tip: Be specific about components. Example: "Add Claude brain with temperature 0.7" or "Add web search tool and email tool"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
