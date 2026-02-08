'use client'

import { useState } from 'react'

interface WorkspaceControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onViewChange: (view: 'default' | 'top' | 'side' | 'isometric') => void
  zoom: number
}

export default function WorkspaceControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onViewChange,
  zoom
}: WorkspaceControlsProps) {
  const [showControls, setShowControls] = useState(false)

  return (
    <div className="absolute top-4 right-4 z-30">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowControls(!showControls)
        }}
        className="w-10 h-10 bg-ax-bg-elevated/90 backdrop-blur-sm border border-ax-border flex items-center justify-center hover:border-ax-cyan transition-all cursor-pointer relative z-30 pointer-events-auto"
      >
        <span className="font-mono text-xs text-ax-cyan">⚙</span>
      </button>

      {showControls && (
        <div className="absolute top-12 right-0 bg-ax-bg-elevated/95 backdrop-blur-md border border-ax-border p-3 space-y-2 min-w-[200px]">
          <div className="font-mono text-[10px] text-ax-cyan uppercase mb-2">CONTROLS</div>
          
          {/* Zoom */}
          <div className="space-y-1">
            <div className="font-mono text-[10px] text-ax-text-dim">ZOOM: {Math.round(zoom * 100)}%</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onZoomOut()
                }}
                className="flex-1 px-2 py-1 bg-ax-bg border border-ax-border text-ax-text font-mono text-[10px] hover:border-ax-cyan transition-all cursor-pointer pointer-events-auto"
              >
                −
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onZoomIn()
                }}
                className="flex-1 px-2 py-1 bg-ax-bg border border-ax-border text-ax-text font-mono text-[10px] hover:border-ax-cyan transition-all cursor-pointer pointer-events-auto"
              >
                +
              </button>
            </div>
          </div>

          {/* View Presets */}
          <div className="space-y-1">
            <div className="font-mono text-[10px] text-ax-text-dim">VIEW</div>
            <div className="grid grid-cols-2 gap-1">
              {(['default', 'top', 'side', 'isometric'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onViewChange(view)
                  }}
                  className="px-2 py-1 bg-ax-bg border border-ax-border text-ax-text font-mono text-[9px] hover:border-ax-cyan transition-all cursor-pointer pointer-events-auto"
                >
                  {view.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onReset()
            }}
            className="w-full px-2 py-1 bg-ax-bg border border-ax-border text-ax-text font-mono text-[10px] hover:border-ax-cyan hover:text-ax-cyan transition-all cursor-pointer pointer-events-auto"
          >
            RESET
          </button>
        </div>
      )}
    </div>
  )
}
