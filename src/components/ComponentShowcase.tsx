'use client'

import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/lib/stores/uiStore'
import { useRegistryStore } from '@/lib/stores/registryStore'
import { useBuildStore } from '@/lib/stores/buildStore'
import { Component, useComponentSearch } from '@/hooks/useComponentRegistry'
import { calculateComponentPosition, validateComponentPlacement } from '@/hooks/useWorkspace'

export default function ComponentShowcase() {
  const { searchQuery, activeCategory, setSearchQuery, setActiveCategory, selectComponent } = useUIStore()
  const { registry, components, loading, loadRegistry } = useRegistryStore()
  const { getAllComponents, addComponent } = useBuildStore()
  
  const buildComponents = getAllComponents()
  const filteredComponents = useComponentSearch(components, searchQuery, activeCategory)

  useEffect(() => {
    if (!registry) {
      loadRegistry()
    }
  }, [registry, loadRegistry])

  const handleAddComponent = (component: Component) => {
    // Validate placement
    const validation = validateComponentPlacement(component.type, buildComponents)
    if (!validation.valid) {
      console.warn(validation.error)
      return
    }

    // Calculate position based on component type
    const position = calculateComponentPosition(
      component.type,
      buildComponents,
      buildComponents.length
    )

    // Generate ID before adding (matching store's format)
    const timestamp = Date.now()
    const newComponentId = `${component.type}_${timestamp}`
    
    addComponent(component, position)
    
    // Select the component immediately with the generated ID
    selectComponent(newComponentId)
  }

  const getCategoryComponents = (category: 'brains' | 'tools' | 'runtimes') => {
    return components[category]
  }

  if (loading) {
    return (
      <div className="bg-ax-bg-elevated/80 backdrop-blur-md border-r border-ax-border flex items-center justify-center p-8">
        <div className="font-mono text-xs text-ax-text-dim">LOADING...</div>
      </div>
    )
  }

  return (
    <div className="bg-ax-bg-elevated/80 backdrop-blur-md border-r border-ax-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-ax-border">
        <div className="font-mono text-[11px] text-ax-text-dim uppercase tracking-[2px] mb-2">
          Component Showcase
        </div>
        <input
          type="text"
          placeholder="search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2.5 py-2 bg-ax-bg/50 border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all placeholder:text-ax-text-dim"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && registry && (
        <div className="px-4 py-2 border-b border-ax-border flex gap-2">
          {(['brains', 'tools', 'runtimes'] as const).map((category) => {
            const categoryData = registry.categories[category]
            const categoryComponents = getCategoryComponents(category)
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 font-mono text-[10px] border transition-all ${
                  activeCategory === category
                    ? 'border-ax-cyan text-ax-cyan shadow-[0_0_10px_rgba(0,255,159,0.2)]'
                    : 'border-ax-border text-ax-text-dim hover:border-ax-cyan/50'
                }`}
              >
                {categoryData.icon} {categoryData.name} ({categoryComponents.length})
              </button>
            )
          })}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        {searchQuery ? (
          // Search results
          <div>
            <div className="font-mono text-[10px] text-ax-cyan uppercase tracking-[2px] mb-4">
              SEARCH RESULTS ({filteredComponents.length})
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredComponents.map((comp, i) => (
                <ComponentCard
                  key={comp.id}
                  component={comp}
                  index={i}
                  onAdd={() => handleAddComponent(comp)}
                />
              ))}
            </div>
          </div>
        ) : (
          // Category sections
          <>
            {registry && (
              <>
                <ShowcaseSection 
                  title="BRAIN" 
                  items={components.brains}
                  categoryData={registry.categories.brains}
                  onAddComponent={handleAddComponent}
                  active={activeCategory === 'brains'}
                />
                <ShowcaseSection 
                  title="TOOLS" 
                  items={components.tools}
                  categoryData={registry.categories.tools}
                  onAddComponent={handleAddComponent}
                  active={activeCategory === 'tools'}
                />
                <ShowcaseSection 
                  title="RUNTIME" 
                  items={components.runtimes}
                  categoryData={registry.categories.runtimes}
                  onAddComponent={handleAddComponent}
                  active={activeCategory === 'runtimes'}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function ShowcaseSection({ 
  title, 
  items,
  categoryData,
  onAddComponent,
  active
}: { 
  title: string
  items: Component[]
  categoryData: { name: string; description: string; icon: string; color: string }
  onAddComponent: (comp: Component) => void
  active: boolean
}) {
  if (!active) return null

  return (
    <div className="mb-8">
      <div className="font-mono text-[10px] text-ax-cyan uppercase tracking-[2px] mb-4 flex items-center gap-2">
        <span>&gt;</span>
        {title} ({items.length})
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, i) => (
          <ComponentCard
            key={item.id}
            component={item}
            index={i}
            onAdd={() => onAddComponent(item)}
          />
        ))}
      </div>
    </div>
  )
}

function ComponentCard({ 
  component,
  index,
  onAdd
}: { 
  component: Component
  index: number
  onAdd: () => void
}) {
  const getMetaInfo = () => {
    if (component.type === 'brain') {
      return {
        meta: component.resources.token_cost || 'N/A',
        ctx: component.resources.context_window ? `${(component.resources.context_window / 1000).toFixed(0)}K` : undefined
      }
    }
    if (component.type === 'tool') {
      return {
        meta: component.provider,
        rate: component.resources.rate_limits 
          ? Object.entries(component.resources.rate_limits)[0]?.[1] || ''
          : undefined
      }
    }
    if (component.type === 'runtime') {
      return {
        meta: component.config.platform || component.provider,
        rate: component.config.framework || ''
      }
    }
    return { meta: component.provider }
  }

  const { meta, ctx, rate } = getMetaInfo()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onAdd}
      className="group relative bg-ax-bg border border-ax-border p-3 cursor-pointer hover:border-ax-cyan transition-all overflow-hidden"
      style={{ borderColor: component.metadata.color ? `${component.metadata.color}40` : undefined }}
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(to bottom right, transparent, ${component.metadata.color || '#00ff9f'}10)`
        }}
      />
      
      {/* Preview icon */}
      <div className="text-3xl mb-2 group-hover:animate-float relative z-10">
        {component.metadata.icon}
      </div>
      
      {/* Component info */}
      <div className="relative z-10">
        <div className="font-mono text-[10px] text-ax-cyan mb-1">
          {component.type.toUpperCase()}
        </div>
        <div className="font-mono text-xs text-ax-text mb-2 group-hover:chrome-aberration transition-all">
          {component.name.replace(/-/g, '_').toUpperCase()}
        </div>
        <div className="font-mono text-[9px] text-ax-text-dim leading-tight">
          {meta}
          {ctx && ` · ${ctx}`}
          {rate && ` · ${rate}`}
        </div>
        {component.metadata.tags && component.metadata.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {component.metadata.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="font-mono text-[8px] px-1.5 py-0.5 bg-ax-bg-elevated border border-ax-border text-ax-text-dim"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add indicator */}
      <div className="absolute top-2 right-2 w-4 h-4 border border-ax-cyan rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-ax-cyan">+</span>
      </div>
    </motion.div>
  )
}
