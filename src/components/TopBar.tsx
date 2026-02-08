'use client'

import { useBuildStore } from '@/lib/stores/buildStore'

interface TopBarProps {
  onExportClick: () => void
  onTemplateClick?: () => void
  onTestClick?: () => void
  onVersionClick?: () => void
  onMarketplaceClick?: () => void
  onCollaborationClick?: () => void
}

export default function TopBar({ onExportClick, onTemplateClick, onTestClick, onVersionClick, onMarketplaceClick, onCollaborationClick }: TopBarProps) {
  const { settings } = useBuildStore()

  return (
    <div className="h-14 px-6 glass-panel border-b border-ax-border flex items-center justify-between relative z-20">
      <div className="flex items-center gap-3">
        <div className="text-base font-semibold text-ax-text font-sans">
          AgentEX
        </div>
        <div className="h-4 w-px bg-ax-border" />
        <div className="text-sm text-ax-text-secondary font-sans">
          Builder
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-ax-text-secondary font-sans">
        <span className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-ax-success animate-pulse-subtle" />
          <span>Live</span>
        </span>
        <span className="text-ax-text-tertiary">{settings.name}</span>
      </div>
      
      <div className="flex gap-2">
        {onCollaborationClick && (
          <button 
            onClick={onCollaborationClick}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift"
          >
            Collaborate
          </button>
        )}
        {onMarketplaceClick && (
          <button 
            onClick={onMarketplaceClick}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift"
          >
            Marketplace
          </button>
        )}
        {onVersionClick && (
          <button 
            onClick={onVersionClick}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift"
          >
            Versions
          </button>
        )}
        {onTemplateClick && (
          <button 
            onClick={onTemplateClick}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift"
          >
            Templates
          </button>
        )}
        {onTestClick && (
          <button 
            onClick={onTestClick}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift"
          >
            Test
          </button>
        )}
        <button 
          onClick={onExportClick}
          className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all duration-200 shadow-lg shadow-ax-primary/20 micro-bounce"
        >
          Export
        </button>
      </div>
    </div>
  )
}
