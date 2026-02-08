'use client'

import { useBuildStore } from '@/lib/stores/buildStore'

interface TopBarProps {
  onExportClick: () => void
  onTemplateClick?: () => void
  onTestClick?: () => void
  onVersionClick?: () => void
  onMarketplaceClick?: () => void
  onCollaborationClick?: () => void
  onChainingClick?: () => void
  onMemoryClick?: () => void
  onAnalyticsClick?: () => void
}

export default function TopBar({ onExportClick, onTemplateClick, onTestClick, onVersionClick, onMarketplaceClick, onCollaborationClick, onChainingClick, onMemoryClick, onAnalyticsClick }: TopBarProps) {
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
        <span className="text-ax-text-tertiary">{settings.name || 'Untitled Agent'}</span>
      </div>
      
      <div className="flex gap-2 relative z-30">
        {onAnalyticsClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAnalyticsClick()
            }}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift relative z-30 pointer-events-auto cursor-pointer"
          >
            Analytics
          </button>
        )}
        {onMemoryClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMemoryClick()
            }}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift relative z-30 pointer-events-auto cursor-pointer"
          >
            Memory
          </button>
        )}
        {onChainingClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChainingClick()
            }}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift relative z-30 pointer-events-auto cursor-pointer"
          >
            Chains
          </button>
        )}
        {onCollaborationClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCollaborationClick()
            }}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift relative z-30 pointer-events-auto cursor-pointer"
          >
            Collaborate
          </button>
        )}
        {onMarketplaceClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMarketplaceClick()
            }}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift relative z-30 pointer-events-auto cursor-pointer"
          >
            Marketplace
          </button>
        )}
        {onVersionClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onVersionClick()
            }}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift relative z-30 pointer-events-auto cursor-pointer"
          >
            Versions
          </button>
        )}
        {onTemplateClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onTemplateClick()
            }}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift relative z-30 pointer-events-auto cursor-pointer"
          >
            Templates
          </button>
        )}
        {onTestClick && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onTestClick()
            }}
            className="px-4 py-2 bg-transparent border border-ax-border text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover hover:border-ax-border-hover hover:text-ax-text transition-all duration-200 micro-lift relative z-30 pointer-events-auto cursor-pointer"
          >
            Test
          </button>
        )}
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onExportClick()
          }}
          className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all duration-200 shadow-lg shadow-ax-primary/20 micro-bounce relative z-30 pointer-events-auto cursor-pointer"
        >
          Export
        </button>
      </div>
    </div>
  )
}
