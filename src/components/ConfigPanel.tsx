'use client'

import { useState } from 'react'
import BrainConfig from './BrainConfig'
import ToolConfig from './ToolConfig'
import RuntimeConfig from './RuntimeConfig'
import BuildSettings from './BuildSettings'
import { useBuildStore } from '@/lib/stores/buildStore'
import { useUIStore } from '@/lib/stores/uiStore'
import { useRegistryStore } from '@/lib/stores/registryStore'

export default function ConfigPanel() {
  const { selectedComponentId, closeConfigPanel } = useUIStore()
  const { getAllComponents, updateComponentConfig, updateBuildSettings, settings } = useBuildStore()
  const { getComponentById } = useRegistryStore()
  
  const components = getAllComponents()
  const buildComponent = components.find(c => c.id === selectedComponentId)
  const selectedComponent = buildComponent ? buildComponent.component : null
  
  const [activeTab, setActiveTab] = useState<'config' | 'settings'>('config')

  if (!selectedComponent && !settings) {
    return null
  }

  return (
    <div className="fixed right-4 top-20 bottom-20 w-96 bg-ax-bg-elevated/95 backdrop-blur-md border border-ax-border window-shadow z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-ax-border flex items-center justify-between">
        <div className="font-mono text-xs text-ax-cyan">
          {selectedComponent ? 'COMPONENT CONFIG' : 'BUILD SETTINGS'}
        </div>
        <button
          onClick={closeConfigPanel}
          className="w-5 h-5 border border-ax-border hover:border-ax-red hover:bg-ax-red/20 flex items-center justify-center transition-all"
        >
          <span className="text-[10px] text-ax-text">×</span>
        </button>
      </div>

      {/* Tabs */}
      {selectedComponent && (
        <div className="flex border-b border-ax-border">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 px-4 py-2 font-mono text-[10px] border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-ax-cyan text-ax-cyan'
                : 'border-transparent text-ax-text-dim hover:text-ax-text'
            }`}
          >
            CONFIG
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-2 font-mono text-[10px] border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-ax-cyan text-ax-cyan'
                : 'border-transparent text-ax-text-dim hover:text-ax-text'
            }`}
          >
            SETTINGS
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedComponent ? (
          activeTab === 'config' ? (
            <>
              {selectedComponent.type === 'brain' && (
                <BrainConfig
                  component={selectedComponent}
                  onUpdate={(config) => selectedComponentId && updateComponentConfig(selectedComponentId, config)}
                />
              )}
              {selectedComponent.type === 'tool' && (
                <ToolConfig
                  component={selectedComponent}
                  onUpdate={(config) => selectedComponentId && updateComponentConfig(selectedComponentId, config)}
                />
              )}
              {selectedComponent.type === 'runtime' && (
                <RuntimeConfig
                  component={selectedComponent}
                  onUpdate={(config) => selectedComponentId && updateComponentConfig(selectedComponentId, config)}
                />
              )}
            </>
          ) : (
            <BuildSettings
              settings={settings}
              onUpdate={updateBuildSettings}
            />
          )
        ) : (
          <BuildSettings
            settings={buildSettings}
            onUpdate={onBuildSettingsUpdate}
          />
        )}
      </div>
    </div>
  )
}
