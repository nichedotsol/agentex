'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { exportToZip, exportToCursor, ExportProgress as ProgressType } from '@/lib/utils/exportUtils'
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
                    requirements="API integration required"
                    onClick={() => {}}
                    disabled={true}
                  />

                  <ExportTarget
                    type="vercel"
                    icon="▲"
                    name="Vercel"
                    description="Deploy directly to Vercel (requires Vercel token)"
                    requirements="API integration required"
                    onClick={() => {}}
                    disabled={true}
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
    </AnimatePresence>
  )
}
