'use client'

export default function StatusBar() {
  return (
    <div className="h-8 px-5 bg-ax-bg-elevated/90 backdrop-blur-sm border-t border-ax-border flex items-center justify-between font-mono text-[10px] text-ax-text-dim relative z-20">
      <div className="flex gap-5">
        <span>AGENTEX v0.1.0</span>
        <span className="flex items-center gap-2">
          STATUS: <span className="text-ax-cyan">READY</span>
        </span>
      </div>
      <div className="flex gap-5">
        <span>GRID: 40PX</span>
        <span>ZOOM: 100%</span>
        <span>UTC-5</span>
      </div>
    </div>
  )
}
