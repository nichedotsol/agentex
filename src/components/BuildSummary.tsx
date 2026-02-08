'use client'

import { useBuildStore } from '@/lib/stores/buildStore'
import { motion } from 'framer-motion'

export default function BuildSummary() {
  const { brain, tools, runtime, settings, validation } = useBuildStore()

  const estimatedCost = (brain ? 0.03 : 0) + (tools.length * 0.01) + (runtime ? 0.02 : 0)

  return (
    <div className="bg-ax-bg/50 border border-ax-border p-4 space-y-4">
      <div className="font-mono text-xs text-ax-cyan uppercase tracking-[2px] mb-3">
        Build Summary
      </div>

      {/* Validation Status */}
      {validation && (
        <div className={`p-3 border ${
          validation.valid 
            ? 'border-ax-cyan bg-ax-cyan/10' 
            : 'border-ax-red bg-ax-red/10'
        }`}>
          <div className="font-mono text-[10px] flex items-center gap-2 mb-2">
            <span className={validation.valid ? 'text-ax-cyan' : 'text-ax-red'}>
              {validation.valid ? '✓' : '✗'}
            </span>
            <span className={validation.valid ? 'text-ax-cyan' : 'text-ax-red'}>
              {validation.valid ? 'VALID' : 'INVALID'}
            </span>
          </div>
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, i) => (
                <div key={i} className="font-mono text-[9px] text-ax-red">
                  • {error}
                </div>
              ))}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="space-y-1 mt-2">
              {validation.warnings.map((warning, i) => (
                <div key={i} className="font-mono text-[9px] text-ax-text-dim">
                  ⚠ {warning}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Components */}
      <div className="space-y-3">
        <div>
          <div className="font-mono text-[10px] text-ax-text-dim mb-1">Brain</div>
          <div className="font-mono text-xs text-ax-text">
            {brain ? brain.component.name.replace(/-/g, '_').toUpperCase() : 'NONE'}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] text-ax-text-dim mb-1">Tools ({tools.length})</div>
          {tools.length > 0 ? (
            <div className="space-y-1">
              {tools.map((tool) => (
                <div key={tool.id} className="font-mono text-xs text-ax-text">
                  • {tool.component.name.replace(/-/g, '_').toUpperCase()}
                </div>
              ))}
            </div>
          ) : (
            <div className="font-mono text-xs text-ax-text-dim">No tools</div>
          )}
        </div>

        <div>
          <div className="font-mono text-[10px] text-ax-text-dim mb-1">Runtime</div>
          <div className="font-mono text-xs text-ax-text">
            {runtime ? runtime.component.name.replace(/-/g, '_').toUpperCase() : 'NONE'}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="pt-3 border-t border-ax-border space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-ax-text-dim">Token Budget</span>
          <span className="font-mono text-xs text-ax-text">{settings.token_budget}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-ax-text-dim">Est. Cost/Run</span>
          <motion.span 
            className="font-mono text-xs text-ax-cyan"
            animate={{ 
              textShadow: '0 0 10px rgba(0,255,159,0.5)' 
            }}
          >
            ${estimatedCost.toFixed(3)}
          </motion.span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-mono text-[10px] text-ax-text-dim">Build Name</span>
          <span className="font-mono text-xs text-ax-text">{settings.name}</span>
        </div>
      </div>
    </div>
  )
}
