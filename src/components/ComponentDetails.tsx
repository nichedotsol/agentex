'use client'

import { Component } from '@/hooks/useComponentRegistry'
import { motion } from 'framer-motion'

interface ComponentDetailsProps {
  component: Component | null
  onClose: () => void
}

export default function ComponentDetails({ component, onClose }: ComponentDetailsProps) {
  if (!component) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-20 bottom-20 w-80 bg-ax-bg-elevated/95 backdrop-blur-md border border-ax-border window-shadow z-50 overflow-y-auto"
    >
      <div className="p-4 border-b border-ax-border flex items-center justify-between">
        <div className="font-mono text-xs text-ax-cyan">COMPONENT DETAILS</div>
        <button
          onClick={onClose}
          className="w-5 h-5 border border-ax-border hover:border-ax-red hover:bg-ax-red/20 flex items-center justify-center transition-all"
        >
          <span className="text-[10px] text-ax-text">×</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <div className="text-4xl mb-2">{component.metadata.icon}</div>
          <div className="font-mono text-lg text-ax-cyan mb-1">
            {component.name.replace(/-/g, '_').toUpperCase()}
          </div>
          <div className="font-mono text-[10px] text-ax-text-dim">
            {component.type.toUpperCase()} · v{component.version} · {component.provider}
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="font-mono text-[10px] text-ax-cyan uppercase mb-2">DESCRIPTION</div>
          <p className="font-sans text-xs text-ax-text-dim">{component.metadata.description}</p>
        </div>

        {/* Tags */}
        {component.metadata.tags && component.metadata.tags.length > 0 && (
          <div>
            <div className="font-mono text-[10px] text-ax-cyan uppercase mb-2">TAGS</div>
            <div className="flex flex-wrap gap-2">
              {component.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] px-2 py-1 bg-ax-bg border border-ax-border text-ax-text-dim"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        <div>
          <div className="font-mono text-[10px] text-ax-cyan uppercase mb-2">RESOURCES</div>
          <div className="font-mono text-[10px] text-ax-text-dim space-y-1">
            {component.resources.token_cost && (
              <div>COST: {component.resources.token_cost}</div>
            )}
            {component.resources.context_window && (
              <div>CONTEXT: {component.resources.context_window.toLocaleString()} tokens</div>
            )}
            {component.resources.rate_limits && (
              <div>
                RATE: {Object.entries(component.resources.rate_limits)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')}
              </div>
            )}
            {component.resources.pricing && (
              <div>PRICING: {component.resources.pricing}</div>
            )}
          </div>
        </div>

        {/* Capabilities */}
        {component.interface?.capabilities && (
          <div>
            <div className="font-mono text-[10px] text-ax-cyan uppercase mb-2">CAPABILITIES</div>
            <div className="flex flex-wrap gap-2">
              {component.interface.capabilities.map((cap: string) => (
                <span
                  key={cap}
                  className="font-mono text-[9px] px-2 py-1 bg-ax-bg border border-ax-cyan/30 text-ax-cyan"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author */}
        <div>
          <div className="font-mono text-[10px] text-ax-cyan uppercase mb-2">AUTHOR</div>
          <div className="font-mono text-[10px] text-ax-text-dim">{component.metadata.author}</div>
        </div>
      </div>
    </motion.div>
  )
}
