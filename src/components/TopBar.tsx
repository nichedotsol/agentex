'use client'

import { useBuildStore } from '@/lib/stores/buildStore'

interface TopBarProps {
  onExportClick: () => void
}

export default function TopBar({ onExportClick }: TopBarProps) {
  const { settings } = useBuildStore()

  return (
    <div className="h-12 px-5 bg-ax-bg-elevated/90 backdrop-blur-sm border-b border-ax-border flex items-center justify-between font-mono relative z-20">
      <div className="text-[13px] font-semibold text-ax-cyan tracking-[2px] chrome-aberration-strong">
        AGENTEX/BUILDER
      </div>
      
      <div className="flex items-center gap-5 text-[11px] text-ax-text-dim">
        <span className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-ax-cyan animate-pulse-slow shadow-[0_0_8px_rgba(0,255,159,0.8)]" />
          LIVE
        </span>
        <span>{settings.name}</span>
        <span>MODIFIED: 2M AGO</span>
      </div>
      
      <div className="flex gap-2">
        <button className="px-3 py-1.5 bg-transparent border border-ax-border text-ax-text font-mono text-[11px] hover:border-ax-cyan hover:text-ax-cyan hover:shadow-[0_0_10px_rgba(0,255,159,0.3)] transition-all">
          SAVE
        </button>
        <button className="px-3 py-1.5 bg-transparent border border-ax-border text-ax-text font-mono text-[11px] hover:border-ax-cyan hover:text-ax-cyan hover:shadow-[0_0_10px_rgba(0,255,159,0.3)] transition-all">
          TEST
        </button>
        <button 
          onClick={onExportClick}
          className="px-3 py-1.5 bg-ax-cyan text-ax-bg border border-ax-cyan font-mono text-[11px] font-semibold hover:shadow-[0_0_20px_rgba(0,255,159,0.6)] transition-all"
        >
          EXPORT
        </button>
      </div>
    </div>
  )
}
