'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { Marketplace as MarketplaceUtils, type MarketplaceAgent, type MarketplaceFilters } from '@/lib/utils/marketplace'
import { SkeletonList } from './SkeletonLoader'

interface MarketplaceProps {
  onClose: () => void
  onLoadAgent?: (agent: MarketplaceAgent) => void
}

export default function Marketplace({ onClose, onLoadAgent }: MarketplaceProps) {
  const [agents, setAgents] = useState<MarketplaceAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<MarketplaceFilters>({
    sortBy: 'popular'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [shareName, setShareName] = useState('')
  const [shareDescription, setShareDescription] = useState('')
  const [shareCategory, setShareCategory] = useState('productivity')
  const [shareTags, setShareTags] = useState('')

  const buildState = useBuildStore()

  const loadAgents = useCallback(() => {
    setLoading(true)
    const filtered = MarketplaceUtils.filterAgents({
      ...filters,
      search: searchQuery || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined
    })
    setAgents(filtered)
    setLoading(false)
  }, [filters, searchQuery, selectedCategory])

  useEffect(() => {
    loadAgents()
    MarketplaceUtils.initializeSamples()
  }, [loadAgents])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  const handleShare = () => {
    if (!shareName.trim()) return

    const tags = shareTags.split(',').map(t => t.trim()).filter(Boolean)
    
    const agent = MarketplaceUtils.saveAgent({
      name: shareName,
      description: shareDescription || buildState.settings.description || '',
      author: buildState.settings.author || 'Anonymous',
      version: '1.0.0',
      category: shareCategory,
      tags,
      buildState: buildState,
      featured: false
    })

    setShowShareDialog(false)
    setShareName('')
    setShareDescription('')
    setShareTags('')
    loadAgents()
  }

  const handleLoad = (agent: MarketplaceAgent) => {
    if (onLoadAgent) {
      onLoadAgent(agent)
    }
    MarketplaceUtils.incrementDownloads(agent.id)
    loadAgents()
    onClose()
  }

  const handleFork = (agent: MarketplaceAgent) => {
    const newName = prompt(`Fork "${agent.name}" as:`, `${agent.name} (Fork)`)
    if (!newName) return

    const newAuthor = buildState.settings.author || 'Anonymous'
    const forked = MarketplaceUtils.forkAgent(agent.id, newName, newAuthor)
    
    if (forked) {
      if (onLoadAgent) {
        onLoadAgent(forked)
      }
      loadAgents()
      onClose()
    }
  }

  const categories = MarketplaceUtils.getCategories()
  const allTags = MarketplaceUtils.getAllTags()

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
          className="relative glass-panel max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-ax-border flex items-center justify-between">
            <div>
              <h2 className="font-sans text-xl font-semibold text-ax-text mb-1">
                Agent Marketplace
              </h2>
              <p className="font-sans text-sm text-ax-text-secondary">
                Browse, share, and fork community-built agents
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowShareDialog(true)
                }}
                className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all micro-bounce cursor-pointer relative z-10 pointer-events-auto"
              >
                Share Agent
              </button>
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
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-ax-border space-y-4">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-ax-bg/50 border border-ax-border rounded-lg text-ax-text font-sans text-sm outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20 transition-all placeholder:text-ax-text-tertiary"
            />
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-ax-text-secondary">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedCategory(e.target.value)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="px-3 py-1.5 bg-ax-bg border border-ax-border rounded-lg text-ax-text font-sans text-xs outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20 transition-all cursor-pointer relative z-10 pointer-events-auto"
                >
                  <option value="all">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-ax-text-secondary">Sort:</span>
                <select
                  value={filters.sortBy || 'popular'}
                  onChange={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setFilters({ ...filters, sortBy: e.target.value as any })
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="px-3 py-1.5 bg-ax-bg border border-ax-border rounded-lg text-ax-text font-sans text-xs outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20 transition-all cursor-pointer relative z-10 pointer-events-auto"
                >
                  <option value="popular">Popular</option>
                  <option value="recent">Recent</option>
                  <option value="rating">Rating</option>
                  <option value="downloads">Downloads</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <SkeletonList count={6} />
            ) : agents.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 opacity-30">🔍</div>
                <p className="font-sans text-sm text-ax-text-secondary mb-4">
                  No agents found
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowShareDialog(true)
                  }}
                  className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                >
                  Share Your First Agent
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`card-hover p-5 ${agent.featured ? 'ring-2 ring-ax-primary' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-sans text-base font-semibold text-ax-text">
                            {agent.name}
                          </h3>
                          {agent.featured && (
                            <span className="px-2 py-0.5 bg-ax-primary/20 text-ax-primary text-xs font-sans rounded">
                              Featured
                            </span>
                          )}
                          {agent.verified && (
                            <span className="text-ax-primary">✓</span>
                          )}
                        </div>
                        <p className="font-sans text-sm text-ax-text-secondary mb-2 line-clamp-2">
                          {agent.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {agent.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-ax-bg-elevated text-ax-text-tertiary text-xs font-sans rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ax-text-tertiary mb-3">
                      <span>{agent.author}</span>
                      <div className="flex items-center gap-3">
                        <span>⭐ {agent.rating.toFixed(1)}</span>
                        <span>📥 {agent.downloadCount}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleLoad(agent)
                        }}
                        className="flex-1 px-3 py-2 bg-ax-primary text-white rounded-lg font-sans text-xs font-medium hover:bg-ax-primary-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleFork(agent)
                        }}
                        className="flex-1 px-3 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-xs hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                      >
                        Fork
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Share Dialog */}
      <AnimatePresence>
        {showShareDialog && (
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
              className="glass-panel max-w-md w-full p-6"
            >
              <h3 className="font-sans text-lg font-semibold text-ax-text mb-4">
                Share Your Agent
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Agent Name</label>
                  <input
                    type="text"
                    value={shareName}
                    onChange={(e) => setShareName(e.target.value)}
                    placeholder="My Awesome Agent"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={shareDescription}
                    onChange={(e) => setShareDescription(e.target.value)}
                    placeholder="What does this agent do?"
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={shareCategory}
                    onChange={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShareCategory(e.target.value)
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="form-input cursor-pointer relative z-10 pointer-events-auto"
                  >
                    <option value="productivity">Productivity</option>
                    <option value="business">Business</option>
                    <option value="marketing">Marketing</option>
                    <option value="development">Development</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={shareTags}
                    onChange={(e) => setShareTags(e.target.value)}
                    placeholder="ai, automation, productivity"
                    className="form-input"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowShareDialog(false)
                      setShareName('')
                      setShareDescription('')
                      setShareTags('')
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleShare()
                    }}
                    disabled={!shareName.trim()}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer relative z-10 pointer-events-auto"
                  >
                    Share
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
