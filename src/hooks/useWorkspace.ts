'use client'

import { useState, useCallback } from 'react'

export type ViewPreset = 'default' | 'top' | 'side' | 'isometric'

export function useWorkspace() {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [view, setView] = useState<ViewPreset>('default')

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2))
  }, [])

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5))
  }, [])

  const reset = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setView('default')
  }, [])

  const changeView = useCallback((newView: ViewPreset) => {
    setView(newView)
    // Reset pan/zoom for new view
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }, [])

  return {
    zoom,
    pan,
    view,
    zoomIn,
    zoomOut,
    reset,
    changeView,
    setPan
  }
}

export function calculateComponentPosition(
  componentType: 'brain' | 'tool' | 'runtime' | 'memory',
  existingComponents: any[],
  index: number
): { x: number; y: number } {
  const brainComponents = existingComponents.filter(c => c.type === 'brain')
  const toolComponents = existingComponents.filter(c => c.type === 'tool')
  const runtimeComponents = existingComponents.filter(c => c.type === 'runtime')

  switch (componentType) {
    case 'brain':
      // Brain goes in center
      return { x: 400, y: 300 }
    
    case 'tool':
      // Tools surround the brain in a circle
      const brainPos = brainComponents[0]?.position || { x: 400, y: 300 }
      const toolIndex = toolComponents.length
      const angle = (toolIndex * (360 / 8)) * (Math.PI / 180) // 8 positions around circle
      const radius = 200
      return {
        x: brainPos.x + Math.cos(angle) * radius,
        y: brainPos.y + Math.sin(angle) * radius
      }
    
    case 'runtime':
      // Runtime goes at bottom
      return { x: 400, y: 600 }
    
    case 'memory':
      // Memory components go to the left of the brain
      const brainPos = brainComponents[0]?.position || { x: 400, y: 300 }
      const memoryIndex = existingComponents.filter(c => c.type === 'memory').length
      return {
        x: brainPos.x - 250,
        y: brainPos.y + (memoryIndex * 120)
      }
    
    default:
      return { x: 100 + (index * 20), y: 100 + (index * 20) }
  }
}

export function validateComponentPlacement(
  componentType: 'brain' | 'tool' | 'runtime' | 'memory',
  existingComponents: any[]
): { valid: boolean; error?: string } {
  if (componentType === 'brain') {
    const brainCount = existingComponents.filter(c => c.type === 'brain').length
    if (brainCount >= 1) {
      return { valid: false, error: 'Only one brain component allowed' }
    }
  }

  if (componentType === 'runtime') {
    const runtimeCount = existingComponents.filter(c => c.type === 'runtime').length
    if (runtimeCount >= 1) {
      return { valid: false, error: 'Only one runtime component allowed' }
    }
  }

  return { valid: true }
}
