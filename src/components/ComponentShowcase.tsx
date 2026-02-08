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

  const getCategoryComponents = (category: 'brains' | 'tools' | 'runtimes' | 'memories') => {
    return components[category] || []
  }

  if (loading) {
    return (
      <div className="glass-panel border-r border-ax-border flex items-center justify-center p-8">
        <div className="font-sans text-sm text-ax-text-secondary">Loading components...</div>
      </div>
    )
  }

  return (
    <div className="glass-panel border-r border-ax-border flex flex-col overflow-hidden">
      <div className="p-5 border-b border-ax-border">
        <div className="font-sans text-sm font-semibold text-ax-text mb-3">
          Components
        </div>
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2.5 bg-ax-bg border border-ax-border rounded-lg text-ax-text font-sans text-sm outline-none focus:border-ax-primary focus:ring-1 focus:ring-ax-primary transition-all placeholder:text-ax-text-tertiary"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && registry && (
        <div className="px-4 py-2 border-b border-ax-border flex gap-2 flex-wrap">
          {(['brains', 'tools', 'runtimes', 'memories'] as const).map((category) => {
            const categoryData = registry.categories[category]
            if (!categoryData) return null
            const categoryComponents = getCategoryComponents(category)
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 font-sans text-sm rounded-lg transition-all ${
                  activeCategory === category
                    ? 'bg-ax-primary text-white'
                    : 'bg-ax-bg text-ax-text-secondary hover:bg-ax-bg-hover hover:text-ax-text'
                }`}
              >
                {categoryData.name} ({categoryComponents.length})
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
                {components.memories && components.memories.length > 0 && (
                  <ShowcaseSection 
                    title="MEMORY" 
                    items={components.memories}
                    categoryData={registry.categories.memories}
                    onAddComponent={handleAddComponent}
                    active={activeCategory === 'memories'}
                  />
                )}
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
      className="group relative card-hover p-4 cursor-pointer overflow-hidden"
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(to bottom right, transparent, ${component.metadata.color || '#00ff9f'}10)`
        }}
      />
      
      {/* Component info */}
      <div className="relative z-10">
        <div className="font-sans text-xs text-ax-text-tertiary mb-1.5 uppercase tracking-wide">
          {component.type}
        </div>
        <div className="font-sans text-sm font-semibold text-ax-text mb-2">
          {component.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
        <div className="font-sans text-xs text-ax-text-secondary leading-relaxed">
          {meta}
          {ctx && ` · ${ctx}`}
          {rate && ` · ${rate}`}
        </div>
        {component.metadata.tags && component.metadata.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {component.metadata.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="font-sans text-[10px] px-2 py-0.5 bg-ax-bg border border-ax-border rounded text-ax-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add indicator */}
      <div className="absolute top-3 right-3 w-6 h-6 bg-ax-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
        <span className="text-white text-xs font-bold">+</span>
      </div>
    </motion.div>
  )
}
