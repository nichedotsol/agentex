'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'

export default function AutoSaveIndicator() {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const buildState = useBuildStore()

  useEffect(() => {
    // Simulate auto-save (in real implementation, this would debounce and save to backend)
    setIsSaving(true)
    const timer = setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())
    }, 500)

    return () => clearTimeout(timer)
  }, [buildState.brain, buildState.tools, buildState.runtime, buildState.settings])

  return (
    <AnimatePresence>
      {(isSaving || lastSaved) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-4 right-4 z-50 glass-panel px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-3 h-3 border-2 border-ax-primary border-t-transparent rounded-full animate-spin" />
              <span className="font-sans text-xs text-ax-text-secondary">Saving...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-ax-success" />
              <span className="font-sans text-xs text-ax-text-secondary">
                Saved {lastSaved?.toLocaleTimeString()}
              </span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
