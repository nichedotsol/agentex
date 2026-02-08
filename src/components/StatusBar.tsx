'use client'

import { useWorkspace } from '@/hooks/useWorkspace'

export default function StatusBar() {
  const { zoom } = useWorkspace()
  
  return (
    <div className="h-10 px-6 glass-panel border-t border-ax-border flex items-center justify-between font-sans text-xs text-ax-text-secondary relative z-20">
      <div className="flex items-center gap-6">
        <span className="text-ax-text">AgentEX v0.1.0</span>
        <div className="h-3 w-px bg-ax-border" />
        <span className="flex items-center gap-2">
          Status: <span className="text-ax-success font-medium">Ready</span>
        </span>
      </div>
      <div className="flex items-center gap-6">
        <span>Grid: 32px</span>
        <span>Zoom: {Math.round(zoom * 100)}%</span>
        <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  )
}
