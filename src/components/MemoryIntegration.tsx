'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { MemoryIntegration as MemoryUtils, type MemoryEntry, type MemorySearchResult, type MemoryStats, type MemoryOptimization } from '@/lib/utils/memoryIntegration'
import { SkeletonList } from './SkeletonLoader'

interface MemoryIntegrationProps {
  onClose: () => void
}

type View = 'visualization' | 'search' | 'optimization'

export default function MemoryIntegration({ onClose }: MemoryIntegrationProps) {
  const [view, setView] = useState<View>('visualization')
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [stats, setStats] = useState<MemoryStats | null>(null)
  const [optimizations, setOptimizations] = useState<MemoryOptimization[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MemorySearchResult[]>([])
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null)
  const [selectedComponent, setSelectedComponent] = useState<string>('all')
  
  // Filters
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [filterMinImportance, setFilterMinImportance] = useState<number>(0)

  const buildState = useBuildStore()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (view === 'search' && searchQuery) {
      performSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery, view, selectedComponent, filterTags, filterMinImportance])

  useEffect(() => {
    if (selectedComponent !== 'all') {
      loadData()
    }
  }, [selectedComponent])

  const loadData = () => {
    setLoading(true)
    const componentId = selectedComponent === 'all' ? undefined : selectedComponent
    setEntries(MemoryUtils.getEntries(componentId))
    setStats(MemoryUtils.getStats(componentId))
    setOptimizations(MemoryUtils.getOptimizations(componentId))
    setLoading(false)
  }

  const performSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const componentId = selectedComponent === 'all' ? undefined : selectedComponent
    const results = MemoryUtils.searchEntries(searchQuery, {
      componentId,
      tags: filterTags.length > 0 ? filterTags : undefined,
      minImportance: filterMinImportance > 0 ? filterMinImportance : undefined
    })
    
    setSearchResults(results)
  }

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this memory entry?')) {
      MemoryUtils.deleteEntry(entryId)
      loadData()
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null)
      }
    }
  }

  const handleApplyOptimization = async (optimization: MemoryOptimization) => {
    if (confirm(`Apply optimization: ${optimization.description}?`)) {
      await optimization.action()
      loadData()
    }
  }

  const handleAccessEntry = (entryId: string) => {
    MemoryUtils.accessEntry(entryId)
    loadData()
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 0.7) return 'text-ax-success'
    if (importance >= 0.4) return 'text-ax-primary'
    return 'text-ax-text-tertiary'
  }

  const getImportanceBg = (importance: number) => {
    if (importance >= 0.7) return 'bg-ax-success/20'
    if (importance >= 0.4) return 'bg-ax-primary/20'
    return 'bg-ax-bg-elevated'
  }

  // Get unique tags from all entries
  const allTags = Array.from(new Set(entries.flatMap(e => e.metadata.tags || [])))

  // Get component options
  const memories = buildState.getAllComponents().filter(c => c.component.type === 'memory')
  const componentOptions = [
    { id: 'all', name: 'All Components' },
    ...memories.map(m => ({ id: m.id, name: m.component.name }))
  ]

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
          className="relative glass-panel max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-ax-border flex items-center justify-between">
            <div>
              <h2 className="font-sans text-xl font-semibold text-ax-text mb-1">
                Memory Integration
              </h2>
              <p className="font-sans text-sm text-ax-text-secondary">
                Visualize, search, and optimize memory components
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClose()
              }}
              className="w-8 h-8 rounded-lg border border-ax-border hover:border-ax-error hover:bg-ax-error/20 flex items-center justify-center transition-all micro-bounce cursor-pointer relative z-10 pointer-events-auto"
            >
              <span className="text-ax-text">×</span>
            </button>
          </div>

          {/* Component Filter */}
          <div className="p-4 border-b border-ax-border">
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="form-input max-w-xs"
            >
              {componentOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="p-6 border-b border-ax-border">
            <div className="flex gap-2">
              {(['visualization', 'search', 'optimization'] as View[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setView(tab)
                  }}
                  className={`px-4 py-2 font-sans text-sm rounded-lg transition-all relative z-10 pointer-events-auto cursor-pointer ${
                    view === tab
                      ? 'bg-ax-primary text-white'
                      : 'bg-ax-bg text-ax-text-secondary hover:bg-ax-bg-hover hover:text-ax-text'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="p-6">
                <SkeletonList count={3} />
              </div>
            ) : (
              <>
                {/* Visualization View */}
                {view === 'visualization' && (
                  <div className="p-6 overflow-y-auto h-full">
                    {stats && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="card p-4">
                          <div className="text-xs text-ax-text-tertiary mb-1">Total Entries</div>
                          <div className="text-2xl font-semibold text-ax-text">{stats.totalEntries}</div>
                        </div>
                        <div className="card p-4">
                          <div className="text-xs text-ax-text-tertiary mb-1">Total Size</div>
                          <div className="text-2xl font-semibold text-ax-text">{formatSize(stats.totalSize)}</div>
                        </div>
                        <div className="card p-4">
                          <div className="text-xs text-ax-text-tertiary mb-1">Avg Importance</div>
                          <div className="text-2xl font-semibold text-ax-text">
                            {(stats.averageImportance * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="card p-4">
                          <div className="text-xs text-ax-text-tertiary mb-1">Components</div>
                          <div className="text-2xl font-semibold text-ax-text">
                            {Object.keys(stats.byComponent).length}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className="font-sans text-base font-semibold text-ax-text mb-3">Memory Entries</h3>
                      {entries.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-4xl mb-4 opacity-30">💾</div>
                          <p className="font-sans text-sm text-ax-text-secondary">
                            No memory entries yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {entries.map((entry, i) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => {
                                setSelectedEntry(entry)
                                handleAccessEntry(entry.id)
                              }}
                              className="card-hover p-4 cursor-pointer"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="font-sans text-sm font-semibold text-ax-text mb-1">
                                    {entry.key}
                                  </div>
                                  <div className="font-sans text-xs text-ax-text-secondary line-clamp-2">
                                    {typeof entry.value === 'string' 
                                      ? entry.value 
                                      : JSON.stringify(entry.value).substring(0, 100)}
                                  </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-sans ${getImportanceBg(entry.metadata.importance || 0)} ${getImportanceColor(entry.metadata.importance || 0)}`}>
                                  {(entry.metadata.importance || 0).toFixed(2)}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs text-ax-text-tertiary">
                                <div className="flex gap-3">
                                  <span>{formatDate(entry.metadata.timestamp)}</span>
                                  {entry.metadata.accessCount !== undefined && (
                                    <span>Accessed {entry.metadata.accessCount} times</span>
                                  )}
                                </div>
                                {entry.metadata.tags && entry.metadata.tags.length > 0 && (
                                  <div className="flex gap-1">
                                    {entry.metadata.tags.map(tag => (
                                      <span key={tag} className="px-2 py-0.5 bg-ax-bg-elevated rounded text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Search View */}
                {view === 'search' && (
                  <div className="p-6 overflow-y-auto h-full">
                    <div className="mb-6 space-y-4">
                      <div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search memory entries..."
                          className="form-input w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Filter by Tags</label>
                          <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                              <button
                                key={tag}
                                onClick={() => {
                                  setFilterTags(
                                    filterTags.includes(tag)
                                      ? filterTags.filter(t => t !== tag)
                                      : [...filterTags, tag]
                                  )
                                }}
                                className={`px-3 py-1 rounded text-xs font-sans transition-all ${
                                  filterTags.includes(tag)
                                    ? 'bg-ax-primary text-white'
                                    : 'bg-ax-bg-elevated text-ax-text-secondary hover:bg-ax-bg-hover'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="form-label">Min Importance</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={filterMinImportance}
                            onChange={(e) => setFilterMinImportance(parseFloat(e.target.value))}
                            className="w-full"
                          />
                          <div className="text-xs text-ax-text-tertiary mt-1">
                            {Math.round(filterMinImportance * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {searchResults.length === 0 && searchQuery ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">🔍</div>
                        <p className="font-sans text-sm text-ax-text-secondary">
                          No results found
                        </p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-3">
                        {searchResults.map((result, i) => (
                          <motion.div
                            key={result.entry.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedEntry(result.entry)}
                            className="card-hover p-4 cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-sans text-sm font-semibold text-ax-text mb-1">
                                  {result.entry.key}
                                </div>
                                <div className="font-sans text-xs text-ax-text-secondary line-clamp-2">
                                  {typeof result.entry.value === 'string' 
                                    ? result.entry.value 
                                    : JSON.stringify(result.entry.value).substring(0, 100)}
                                </div>
                              </div>
                              <div className="text-xs text-ax-primary">
                                Score: {result.score.toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-ax-text-tertiary">
                              <span>Matched: {result.matchedFields.join(', ')}</span>
                              <span>•</span>
                              <span>{formatDate(result.entry.metadata.timestamp)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">🔍</div>
                        <p className="font-sans text-sm text-ax-text-secondary">
                          Enter a search query to find memory entries
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Optimization View */}
                {view === 'optimization' && (
                  <div className="p-6 overflow-y-auto h-full">
                    <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                      Optimization Suggestions
                    </h3>
                    {optimizations.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">✨</div>
                        <p className="font-sans text-sm text-ax-text-secondary">
                          No optimizations available. Your memory is already optimized!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {optimizations.map((opt, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="card p-5"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded text-xs font-sans ${
                                    opt.type === 'cleanup' ? 'bg-ax-error/20 text-ax-error' :
                                    opt.type === 'compression' ? 'bg-ax-primary/20 text-ax-primary' :
                                    opt.type === 'archival' ? 'bg-ax-text-tertiary/20 text-ax-text-tertiary' :
                                    'bg-ax-success/20 text-ax-success'
                                  }`}>
                                    {opt.type}
                                  </span>
                                  <h4 className="font-sans text-sm font-semibold text-ax-text">
                                    {opt.description}
                                  </h4>
                                </div>
                                <p className="font-sans text-xs text-ax-text-secondary">
                                  Estimated savings: {formatSize(opt.estimatedSavings)}
                                </p>
                                <p className="font-sans text-xs text-ax-text-tertiary mt-1">
                                  Affects {opt.affectedEntries.length} entries
                                </p>
                              </div>
                              <button
                                onClick={() => handleApplyOptimization(opt)}
                                className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all micro-bounce"
                              >
                                Apply
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Entry Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel max-w-2xl w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-lg font-semibold text-ax-text">
                  Memory Entry Details
                </h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="w-8 h-8 rounded-lg border border-ax-border hover:border-ax-error hover:bg-ax-error/20 flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Key</label>
                  <div className="form-input bg-ax-bg/30">{selectedEntry.key}</div>
                </div>
                <div>
                  <label className="form-label">Value</label>
                  <pre className="form-textarea bg-ax-bg/30 font-mono text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedEntry.value, null, 2)}
                  </pre>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Importance</label>
                    <div className="form-input bg-ax-bg/30">
                      {(selectedEntry.metadata.importance || 0).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Access Count</label>
                    <div className="form-input bg-ax-bg/30">
                      {selectedEntry.metadata.accessCount || 0}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="form-label">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.metadata.tags?.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-ax-bg-elevated rounded text-xs">
                        {tag}
                      </span>
                    )) || <span className="text-xs text-ax-text-tertiary">No tags</span>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleDeleteEntry(selectedEntry.id)
                      setSelectedEntry(null)
                    }}
                    className="flex-1 px-4 py-2 bg-ax-error/20 text-ax-error rounded-lg font-sans text-sm hover:bg-ax-error/30 transition-all"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}
