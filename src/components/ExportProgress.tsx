'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ExportProgress as ProgressType } from '@/lib/utils/exportUtils'

interface ExportProgressProps {
  progress: ProgressType | null
}

export default function ExportProgress({ progress }: ExportProgressProps) {
  if (!progress) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="bg-ax-bg-elevated/95 backdrop-blur-md border border-ax-border p-4"
      >
        <div className="font-mono text-xs text-ax-cyan mb-3 uppercase tracking-[2px]">
          {progress.step}
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-ax-border relative overflow-hidden mb-3">
          <motion.div
            className="h-full bg-ax-cyan"
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Status Message */}
        {progress.message && (
          <div className="font-mono text-[10px] text-ax-text-dim mb-2">
            {progress.message}
          </div>
        )}

        {/* Error Message */}
        {progress.error && (
          <div className="font-mono text-[10px] text-ax-red border border-ax-red/50 p-2 bg-ax-red/10">
            {progress.error}
          </div>
        )}

        {/* Success Message */}
        {progress.status === 'success' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-[10px] text-ax-cyan border border-ax-cyan/50 p-2 bg-ax-cyan/10"
          >
            ✓ {progress.message || 'Export completed successfully!'}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
