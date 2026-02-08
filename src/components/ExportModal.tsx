'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { exportToZip, exportToCursor, exportToVercel, exportToGitHub, ExportProgress as ProgressType } from '@/lib/utils/exportUtils'
import BuildSummary from './BuildSummary'
import ExportTarget from './ExportTarget'
import ExportProgress from './ExportProgress'
import CodePreview from './CodePreview'
import { generateCode } from '@/lib/utils/codeGenerator'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const buildState = useBuildStore()
  const [selectedFormat, setSelectedFormat] = useState<'typescript' | 'python'>('typescript')
  const [showPreview, setShowPreview] = useState(false)
  const [progress, setProgress] = useState<ProgressType | null>(null)
  const [previewFiles, setPreviewFiles] = useState<any[]>([])
  const [vercelToken, setVercelToken] = useState('')
  const [vercelProjectName, setVercelProjectName] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [githubRepoName, setGithubRepoName] = useState('')
  const [showVercelDialog, setShowVercelDialog] = useState(false)
  const [showGitHubDialog, setShowGitHubDialog] = useState(false)

  const handleLocalExport = async () => {
    try {
      setProgress({
        step: 'Exporting',
        progress: 0,
        status: 'processing',
        message: 'Preparing export...'
      })
      
      await exportToZip(buildState, selectedFormat, (prog) => {
        setProgress(prog)
      })
    } catch (error) {
      console.error('Export error:', error)
    }
  }

  const handleCursorExport = () => {
    const link = exportToCursor(buildState)
    // Copy to clipboard
    navigator.clipboard.writeText(link)
    setProgress({
      step: 'Complete',
      progress: 100,
      status: 'success',
      message: 'Cursor link copied to clipboard!'
    })
  }

  const handleVercelExport = async () => {
    if (!vercelToken || !vercelProjectName) {
      setShowVercelDialog(true)
      return
    }

    try {
      await exportToVercel(
        buildState,
        vercelToken,
        vercelProjectName,
        (prog) => {
          setProgress(prog)
        }
      )
    } catch (error) {
      console.error('Vercel export error:', error)
    }
  }

  const handleGitHubExport = async () => {
    if (!githubToken || !githubRepoName) {
      setShowGitHubDialog(true)
      return
    }

    try {
      await exportToGitHub(
        buildState,
        selectedFormat,
        githubToken,
        githubRepoName,
        (prog) => {
          setProgress(prog)
        }
      )
    } catch (error) {
      console.error('GitHub export error:', error)
    }
  }

  const handlePreview = () => {
    const files = generateCode(buildState, {
      format: selectedFormat,
      includeDependencies: true,
      includeReadme: true
    })
    setPreviewFiles(files)
    setShowPreview(true)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-ax-bg-elevated border border-ax-border window-shadow overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-ax-border flex items-center justify-between">
            <div className="font-mono text-sm text-ax-cyan uppercase tracking-[2px]">
              Export & Deploy
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 border border-ax-border hover:border-ax-red hover:bg-ax-red/20 flex items-center justify-center transition-all"
            >
              <span className="text-[12px] text-ax-text">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column: Build Summary & Export Targets */}
              <div className="space-y-6">
                <BuildSummary />

                {/* Format Selection */}
                <div className="bg-ax-bg/50 border border-ax-border p-4">
                  <div className="font-mono text-[10px] text-ax-text-dim uppercase tracking-[2px] mb-3">
                    Export Format
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedFormat('typescript')}
                      className={`flex-1 px-3 py-2 font-mono text-[10px] border transition-all ${
                        selectedFormat === 'typescript'
                          ? 'border-ax-cyan text-ax-cyan bg-ax-cyan/10'
                          : 'border-ax-border text-ax-text-dim hover:border-ax-cyan/50'
                      }`}
                    >
                      TypeScript
                    </button>
                    <button
                      onClick={() => setSelectedFormat('python')}
                      className={`flex-1 px-3 py-2 font-mono text-[10px] border transition-all ${
                        selectedFormat === 'python'
                          ? 'border-ax-cyan text-ax-cyan bg-ax-cyan/10'
                          : 'border-ax-border text-ax-text-dim hover:border-ax-cyan/50'
                      }`}
                    >
                      Python
                    </button>
                  </div>
                </div>

                {/* Export Targets */}
                <div className="space-y-3">
                  <div className="font-mono text-[10px] text-ax-text-dim uppercase tracking-[2px] mb-2">
                    Export Targets
                  </div>
                  
                  <ExportTarget
                    type="local"
                    icon="📦"
                    name="Local Download"
                    description="Download as ZIP file with all code and dependencies"
                    onClick={handleLocalExport}
                  />

                  <ExportTarget
                    type="cursor"
                    icon="🎯"
                    name="Cursor"
                    description="Generate deep link to open in Cursor IDE"
                    onClick={handleCursorExport}
                  />

                  <ExportTarget
                    type="github"
                    icon="🐙"
                    name="GitHub"
                    description="Create repository and push code (requires GitHub token)"
                    onClick={handleGitHubExport}
                  />

                  <ExportTarget
                    type="vercel"
                    icon="▲"
                    name="Vercel"
                    description="Deploy directly to Vercel (requires Vercel token)"
                    onClick={handleVercelExport}
                  />
                </div>

                {/* Preview Button */}
                <button
                  onClick={handlePreview}
                  className="w-full px-4 py-2 bg-ax-bg/50 border border-ax-border font-mono text-[10px] text-ax-text hover:border-ax-cyan hover:text-ax-cyan transition-all"
                >
                  PREVIEW CODE
                </button>
              </div>

              {/* Right Column: Preview & Progress */}
              <div className="space-y-6">
                {showPreview && previewFiles.length > 0 ? (
                  <CodePreview files={previewFiles} />
                ) : (
                  <div className="bg-ax-bg/50 border border-ax-border p-8 flex items-center justify-center min-h-[400px]">
                    <div className="text-center font-mono text-xs text-ax-text-dim">
                      <div className="text-4xl mb-4 opacity-30">⚙️</div>
                      <div>Click "Preview Code" to see generated files</div>
                    </div>
                  </div>
                )}

                {progress && <ExportProgress progress={progress} />}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Vercel Token Dialog */}
      <AnimatePresence>
        {showVercelDialog && (
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
                Deploy to Vercel
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Vercel Token</label>
                  <input
                    type="password"
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    placeholder="vercel_..."
                    className="form-input"
                  />
                  <p className="font-sans text-xs text-ax-text-tertiary mt-1">
                    Get your token from{' '}
                    <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener noreferrer" className="text-ax-primary hover:underline">
                      vercel.com/account/tokens
                    </a>
                  </p>
                </div>
                <div>
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    value={vercelProjectName}
                    onChange={(e) => setVercelProjectName(e.target.value)}
                    placeholder={buildState.settings.name.toLowerCase().replace(/\s+/g, '-')}
                    className="form-input"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowVercelDialog(false)
                      setVercelToken('')
                      setVercelProjectName('')
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setShowVercelDialog(false)
                      await handleVercelExport()
                    }}
                    disabled={!vercelToken.trim() || !vercelProjectName.trim()}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Deploy
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GitHub Token Dialog */}
      <AnimatePresence>
        {showGitHubDialog && (
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
                Export to GitHub
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">GitHub Token</label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_..."
                    className="form-input"
                  />
                  <p className="font-sans text-xs text-ax-text-tertiary mt-1">
                    Create a token with repo permissions at{' '}
                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-ax-primary hover:underline">
                      github.com/settings/tokens
                    </a>
                  </p>
                </div>
                <div>
                  <label className="form-label">Repository Name</label>
                  <input
                    type="text"
                    value={githubRepoName}
                    onChange={(e) => setGithubRepoName(e.target.value)}
                    placeholder={buildState.settings.name.toLowerCase().replace(/\s+/g, '-')}
                    className="form-input"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowGitHubDialog(false)
                      setGithubToken('')
                      setGithubRepoName('')
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setShowGitHubDialog(false)
                      await handleGitHubExport()
                    }}
                    disabled={!githubToken.trim() || !githubRepoName.trim()}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Export
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
