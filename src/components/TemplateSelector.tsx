'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loadAllTemplates, loadTemplateRegistry, AgentTemplate, TemplateRegistry, applyTemplateToBuild } from '@/lib/utils/templateLoader'
import { useBuildStore } from '@/lib/stores/buildStore'
import { useRegistryStore } from '@/lib/stores/registryStore'
import SkeletonLoader from './SkeletonLoader'

interface TemplateSelectorProps {
  onClose: () => void
}

export default function TemplateSelector({ onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<AgentTemplate[]>([])
  const [registry, setRegistry] = useState<TemplateRegistry | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { setBuildState } = useBuildStore()
  const { components } = useRegistryStore()

  useEffect(() => {
    async function loadTemplates() {
      try {
        const [templatesData, registryData] = await Promise.all([
          loadAllTemplates(),
          loadTemplateRegistry()
        ])
        setTemplates(templatesData)
        setRegistry(registryData)
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTemplates()
  }, [])

  const handleApplyTemplate = (template: AgentTemplate) => {
    try {
      const buildState = applyTemplateToBuild(template, components)
      setBuildState(buildState as any)
      onClose()
    } catch (error) {
      console.error('Failed to apply template:', error)
      alert('Failed to apply template. Some components may not be available.')
    }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 max-w-2xl w-full"
        >
          <div className="space-y-4">
            <SkeletonLoader height="2rem" />
            <SkeletonLoader height="1rem" width="60%" />
            <div className="space-y-2 mt-4">
              {[1, 2, 3].map(i => (
                <SkeletonLoader key={i} height="6rem" />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative glass-panel max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-ax-border flex items-center justify-between">
            <div>
              <h2 className="font-sans text-xl font-semibold text-ax-text mb-1">
                Agent Templates
              </h2>
              <p className="font-sans text-sm text-ax-text-secondary">
                Start with a pre-built agent template
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-ax-border hover:border-ax-error hover:bg-ax-error/20 flex items-center justify-center transition-all micro-bounce"
            >
              <span className="text-ax-text">×</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-ax-border space-y-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-ax-bg/50 border border-ax-border rounded-lg text-ax-text font-sans text-sm outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20 transition-all placeholder:text-ax-text-tertiary"
            />
            {registry && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 font-sans text-xs rounded-lg transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-ax-primary text-white'
                      : 'bg-ax-bg text-ax-text-secondary hover:bg-ax-bg-hover'
                  }`}
                >
                  All
                </button>
                {Object.entries(registry.categories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1.5 font-sans text-xs rounded-lg transition-all ${
                      selectedCategory === key
                        ? 'bg-ax-primary text-white'
                        : 'bg-ax-bg text-ax-text-secondary hover:bg-ax-bg-hover'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 opacity-30">🔍</div>
                <p className="font-sans text-sm text-ax-text-secondary">
                  No templates found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTemplates.map((template, i) => {
                  const category = registry?.categories[template.category]
                  return (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="card-hover p-5 cursor-pointer"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-sans text-base font-semibold text-ax-text mb-1">
                            {template.name}
                          </h3>
                          {category && (
                            <span
                              className="inline-block px-2 py-0.5 rounded text-xs font-sans"
                              style={{
                                backgroundColor: `${category.color}20`,
                                color: category.color
                              }}
                            >
                              {category.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="font-sans text-sm text-ax-text-secondary mb-4 leading-relaxed">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-ax-text-tertiary">
                        <span>{template.components.tools.length} tools</span>
                        <span>•</span>
                        <span>{template.author}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
