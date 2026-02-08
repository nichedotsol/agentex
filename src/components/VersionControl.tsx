'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import {
  saveVersion,
  getVersionHistory,
  deleteVersion,
  setCurrentVersion,
  getCurrentVersion,
  compareVersions,
  type BuildVersion
} from '@/lib/utils/versionControl'
import { SkeletonList } from './SkeletonLoader'

interface VersionControlProps {
  onClose: () => void
  onLoadVersion?: (version: BuildVersion) => void
}

export default function VersionControl({ onClose, onLoadVersion }: VersionControlProps) {
  const [versions, setVersions] = useState<BuildVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [comparingVersions, setComparingVersions] = useState<{ v1: string; v2: string } | null>(null)
  const [comparison, setComparison] = useState<{ differences: string[]; similarity: number } | null>(null)

  const buildState = useBuildStore()

  useEffect(() => {
    loadVersions()
  }, [])

  const loadVersions = () => {
    const history = getVersionHistory()
    setVersions(history.versions)
    setCurrentVersionId(history.currentVersionId)
    setLoading(false)
  }

  const handleSave = () => {
    if (!saveName.trim()) return

    const version = saveVersion(
      buildState,
      saveName,
      saveDescription || undefined,
      buildState.settings.author || undefined
    )
    
    setCurrentVersionId(version.id)
    loadVersions()
    setShowSaveDialog(false)
    setSaveName('')
    setSaveDescription('')
  }

  const handleLoad = (version: BuildVersion) => {
    if (onLoadVersion) {
      onLoadVersion(version)
    }
    setCurrentVersionId(version.id)
    setCurrentVersion(version.id)
    onClose()
  }

  const handleDelete = (versionId: string) => {
    if (confirm('Are you sure you want to delete this version?')) {
      deleteVersion(versionId)
      loadVersions()
    }
  }

  const handleCompare = (versionId1: string, versionId2: string) => {
    setComparingVersions({ v1: versionId1, v2: versionId2 })
    const result = compareVersions(versionId1, versionId2)
    setComparison(result)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 max-w-2xl w-full"
        >
          <SkeletonList count={3} />
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
                Version Control
              </h2>
              <p className="font-sans text-sm text-ax-text-secondary">
                Save, load, and compare different versions of your agent
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all micro-bounce"
              >
                Save Version
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-ax-border hover:border-ax-error hover:bg-ax-error/20 flex items-center justify-center transition-all micro-bounce"
              >
                <span className="text-ax-text">×</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {versions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 opacity-30">📦</div>
                <p className="font-sans text-sm text-ax-text-secondary mb-4">
                  No versions saved yet
                </p>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all"
                >
                  Save First Version
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`card-hover p-4 ${
                      currentVersionId === version.id ? 'ring-2 ring-ax-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-sans text-base font-semibold text-ax-text">
                            {version.name}
                          </h3>
                          {currentVersionId === version.id && (
                            <span className="px-2 py-0.5 bg-ax-primary/20 text-ax-primary text-xs font-sans rounded">
                              Current
                            </span>
                          )}
                          {version.tags && version.tags.length > 0 && (
                            <div className="flex gap-1">
                              {version.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-ax-bg-elevated text-ax-text-secondary text-xs font-sans rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {version.description && (
                          <p className="font-sans text-sm text-ax-text-secondary mb-2">
                            {version.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-ax-text-tertiary">
                          <span>{formatDate(version.timestamp)}</span>
                          {version.author && (
                            <>
                              <span>•</span>
                              <span>{version.author}</span>
                            </>
                          )}
                          <span>•</span>
                          <span>
                            {version.buildState.tools.length} tools
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleLoad(version)}
                          className="px-3 py-1.5 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-xs hover:bg-ax-bg-hover hover:text-ax-text transition-all"
                        >
                          Load
                        </button>
                        {selectedVersion && selectedVersion !== version.id && (
                          <button
                            onClick={() => handleCompare(selectedVersion, version.id)}
                            className="px-3 py-1.5 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-xs hover:bg-ax-bg-hover hover:text-ax-text transition-all"
                          >
                            Compare
                          </button>
                        )}
                        {!selectedVersion && (
                          <button
                            onClick={() => setSelectedVersion(version.id)}
                            className="px-3 py-1.5 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-xs hover:bg-ax-bg-hover hover:text-ax-text transition-all"
                          >
                            Select
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(version.id)}
                          className="px-3 py-1.5 bg-ax-error/20 text-ax-error rounded-lg font-sans text-xs hover:bg-ax-error/30 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Comparison Results */}
            {comparison && comparingVersions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 card p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sans text-base font-semibold text-ax-text">
                    Comparison Results
                  </h3>
                  <button
                    onClick={() => {
                      setComparison(null)
                      setComparingVersions(null)
                      setSelectedVersion(null)
                    }}
                    className="text-ax-text-tertiary hover:text-ax-text"
                  >
                    ×
                  </button>
                </div>
                <div className="mb-4">
                  <div className="font-sans text-sm text-ax-text-secondary mb-2">
                    Similarity: <span className="text-ax-text font-semibold">{comparison.similarity.toFixed(1)}%</span>
                  </div>
                  {comparison.differences.length > 0 ? (
                    <div>
                      <div className="font-sans text-xs text-ax-text-tertiary mb-2 uppercase tracking-wide">
                        Differences:
                      </div>
                      <ul className="space-y-1">
                        {comparison.differences.map((diff, i) => (
                          <li key={i} className="font-sans text-sm text-ax-text-secondary">
                            • {diff}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="font-sans text-sm text-ax-text-secondary">
                      No differences found
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Save Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
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
                Save Version
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Version Name</label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="e.g., v1.0, Production Ready, etc."
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="What changed in this version?"
                    className="form-textarea"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowSaveDialog(false)
                      setSaveName('')
                      setSaveDescription('')
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!saveName.trim()}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Save
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
