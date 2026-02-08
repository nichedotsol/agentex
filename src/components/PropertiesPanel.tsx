'use client'

import { motion } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { useUIStore } from '@/lib/stores/uiStore'
import { useRegistryStore } from '@/lib/stores/registryStore'

export default function PropertiesPanel() {
  const { getAllComponents, validation } = useBuildStore()
  const { selectedComponentId, selectComponent } = useUIStore()
  const { getComponentById } = useRegistryStore()
  
  const components = getAllComponents()
  const componentCount = components.length
  const hasComponents = componentCount > 0
  const selectedComponent = selectedComponentId ? getComponentById(selectedComponentId) : null

  const handleSelectComponent = (buildComponent: any) => {
    selectComponent(buildComponent.id)
  }

  return (
    <div className="bg-ax-bg-elevated/80 backdrop-blur-md border-l border-ax-border overflow-y-auto p-4">
      {/* Component List */}
      {hasComponents && (
        <div className="mb-6">
          <div className="font-mono text-[10px] text-ax-cyan uppercase tracking-[2px] mb-3">
            Components
          </div>
          <div className="space-y-2">
            {components.map((buildComp) => (
              <button
                key={buildComp.id}
                onClick={() => handleSelectComponent(buildComp)}
                className={`w-full text-left px-3 py-2 bg-ax-bg/50 border transition-all ${
                  selectedComponentId === buildComp.id
                    ? 'border-ax-cyan text-ax-cyan shadow-[0_0_10px_rgba(0,255,159,0.2)]'
                    : 'border-ax-border text-ax-text hover:border-ax-cyan/50'
                }`}
              >
                <div className="font-mono text-[10px] text-ax-cyan mb-1">
                  {buildComp.component.type.toUpperCase()}
                </div>
                <div className="font-mono text-xs text-ax-text">
                  {buildComp.component.name?.replace(/-/g, '_').toUpperCase() || buildComp.id}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="font-mono text-[10px] text-ax-cyan uppercase tracking-[2px] mb-3">
          Cost Analysis
        </div>
        <div className="bg-ax-bg/50 border border-ax-border p-3">
          <div className="font-mono text-[10px] text-ax-text-dim mb-2">
            EST. COST/RUN
          </div>
          <motion.div 
            className="font-mono text-xl text-ax-cyan mb-3"
            animate={{ 
              textShadow: hasComponents 
                ? '0 0 10px rgba(0,255,159,0.5)' 
                : 'none'
            }}
          >
            ${(componentCount * 0.03).toFixed(2)}
          </motion.div>
          <div className="h-1 bg-ax-border relative overflow-hidden">
            <motion.div 
              className="h-full bg-ax-cyan shadow-[0_0_10px_rgba(0,255,159,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(componentCount * 15, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="font-mono text-[10px] text-ax-cyan uppercase tracking-[2px] mb-3">
          System Metrics
        </div>
        <div className="bg-ax-bg/50 border border-ax-border p-3 font-mono text-[11px] space-y-2">
          <MetricLine label="components" value={componentCount.toString()} highlight={hasComponents} />
          <MetricLine label="connections" value={Math.max(0, componentCount - 1).toString()} />
          <MetricLine label="avg_latency" value={hasComponents ? '~2.5s' : '--'} />
          <MetricLine label="token_budget" value="1000" />
          <MetricLine label="rate_limit" value="unlimited" />
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] text-ax-cyan uppercase tracking-[2px] mb-3">
          Build Config
        </div>
        <div className="bg-ax-bg/50 border border-ax-border p-3 font-mono text-[11px] space-y-2">
          <MetricLine label="id" value="BUILD_001" />
          <MetricLine label="version" value="0.1.0" />
          <MetricLine 
            label="status" 
            value={hasComponents ? 'building' : 'draft'}
            highlight={hasComponents}
          />
        </div>
      </div>
    </div>
  )
}

function MetricLine({ 
  label, 
  value,
  highlight = false
}: { 
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-ax-text-dim">{label}:</span>
      <motion.span 
        className={highlight ? 'text-ax-cyan' : 'text-ax-cyan'}
        animate={{
          textShadow: highlight 
            ? '0 0 8px rgba(0,255,159,0.5)'
            : 'none'
        }}
      >
        {value}
      </motion.span>
    </div>
  )
}
