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
    <div className="glass-panel border-l border-ax-border overflow-y-auto p-5">
      {/* Component List */}
      {hasComponents && (
        <div className="mb-8">
          <div className="font-sans text-sm font-semibold text-ax-text mb-4">
            Components
          </div>
          <div className="space-y-2">
            {components.map((buildComp) => (
              <button
                key={buildComp.id}
                onClick={() => handleSelectComponent(buildComp)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                  selectedComponentId === buildComp.id
                    ? 'bg-ax-primary/10 border-ax-primary text-ax-primary'
                    : 'bg-ax-bg border-ax-border text-ax-text-secondary hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text'
                }`}
              >
                <div className="font-sans text-xs text-ax-text-tertiary mb-1 uppercase tracking-wide">
                  {buildComp.component.type}
                </div>
                <div className="font-sans text-sm font-medium text-ax-text">
                  {buildComp.component.name?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || buildComp.id}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="font-sans text-sm font-semibold text-ax-text mb-4">
          System Metrics
        </div>
        <div className="card space-y-3">
          <MetricLine label="Components" value={componentCount.toString()} highlight={hasComponents} />
          <MetricLine label="Status" value={hasComponents ? 'Ready' : 'Empty'} />
          <MetricLine label="Validation" value={validation?.valid ? '✓ Valid' : '⚠ Needs setup'} />
        </div>
      </div>

      <div>
        <div className="font-sans text-sm font-semibold text-ax-text mb-4">
          Build Config
        </div>
        <div className="card space-y-3">
          <MetricLine label="ID" value="BUILD_001" />
          <MetricLine label="Version" value="0.1.0" />
          <MetricLine 
            label="Status" 
            value={hasComponents ? 'Building' : 'Draft'}
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
      <span className="font-sans text-sm text-ax-text-secondary">{label}</span>
      <span className={`font-sans text-sm font-medium ${highlight ? 'text-ax-primary' : 'text-ax-text'}`}>
        {value}
      </span>
    </div>
  )
}
