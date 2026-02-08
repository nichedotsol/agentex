'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OnboardingTooltipProps {
  id: string
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  showOnce?: boolean
}

export default function OnboardingTooltip({ 
  id, 
  message, 
  position = 'bottom',
  showOnce = true 
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const storageKey = `onboarding-${id}`

  useEffect(() => {
    if (showOnce) {
      const hasSeen = localStorage.getItem(storageKey)
      if (hasSeen) return
    }
    
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [storageKey, showOnce])

  const handleDismiss = () => {
    setIsVisible(false)
    if (showOnce) {
      localStorage.setItem(storageKey, 'true')
    }
  }

  if (!isVisible) return null

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`absolute ${positionClasses[position]} z-50`}
      >
        <div className="glass-panel p-3 rounded-lg max-w-xs shadow-lg border border-ax-border">
          <p className="font-sans text-xs text-ax-text mb-2">{message}</p>
          <button
            onClick={handleDismiss}
            className="font-sans text-xs text-ax-primary hover:text-ax-primary-hover"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
