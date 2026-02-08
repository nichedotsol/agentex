'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/TopBar'
import ComponentShowcase from '@/components/ComponentShowcase'
import Canvas from '@/components/Canvas'
import PropertiesPanel from '@/components/PropertiesPanel'
import StatusBar from '@/components/StatusBar'
import BackgroundLayers from '@/components/BackgroundLayers'
import ConfigPanel from '@/components/ConfigPanel'
import ExportModal from '@/components/ExportModal'
import NaturalLanguageInput from '@/components/NaturalLanguageInput'
import TemplateSelector from '@/components/TemplateSelector'
import AgentTester from '@/components/AgentTester'
import VersionControl from '@/components/VersionControl'
import Marketplace from '@/components/Marketplace'
import CollaborationDashboard from '@/components/CollaborationDashboard'
import AgentChaining from '@/components/AgentChaining'
import MemoryIntegration from '@/components/MemoryIntegration'
import AutoSaveIndicator from '@/components/AutoSaveIndicator'
import { useBuildStore } from '@/lib/stores/buildStore'
import type { BuildVersion } from '@/lib/utils/versionControl'
import type { MarketplaceAgent } from '@/lib/utils/marketplace'
import type { SharedBuild } from '@/lib/utils/collaboration'
import { useUIStore } from '@/lib/stores/uiStore'
import { useRegistryStore } from '@/lib/stores/registryStore'

export default function BuilderPage() {
  const { 
    getAllComponents, 
    addComponent, 
    updateComponentConfig, 
    updateComponentPosition,
    updateBuildSettings,
    settings,
    validation
  } = useBuildStore()
  
  const { 
    selectedComponentId, 
    configPanelOpen, 
    openConfigPanel, 
    closeConfigPanel,
    selectComponent
  } = useUIStore()
  
  const { loadRegistry, getComponentById } = useRegistryStore()
  
  const components = getAllComponents()
  const selectedComponent = selectedComponentId ? getComponentById(selectedComponentId) : null

  // Load registry on mount
  useEffect(() => {
    loadRegistry()
  }, [loadRegistry])

  const handleComponentUpdate = (componentId: string, config: any) => {
    updateComponentConfig(componentId, config)
  }

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [testerModalOpen, setTesterModalOpen] = useState(false)
  const [versionControlOpen, setVersionControlOpen] = useState(false)
  const [marketplaceOpen, setMarketplaceOpen] = useState(false)
  const [collaborationOpen, setCollaborationOpen] = useState(false)
  const [chainingOpen, setChainingOpen] = useState(false)
  const [memoryOpen, setMemoryOpen] = useState(false)
  
  const { setBuildState } = useBuildStore()

  const handleLoadVersion = (version: BuildVersion) => {
    setBuildState(version.buildState)
  }

  const handleLoadMarketplaceAgent = (agent: MarketplaceAgent) => {
    setBuildState(agent.buildState)
  }

  const handleLoadSharedBuild = (shared: SharedBuild) => {
    setBuildState(shared.buildState)
  }

  return (
    <main className="h-screen flex flex-col relative overflow-hidden">
      <BackgroundLayers />
      
          <TopBar 
            onExportClick={() => setExportModalOpen(true)}
            onTemplateClick={() => setTemplateModalOpen(true)}
            onTestClick={() => setTesterModalOpen(true)}
            onVersionClick={() => setVersionControlOpen(true)}
            onMarketplaceClick={() => setMarketplaceOpen(true)}
            onCollaborationClick={() => setCollaborationOpen(true)}
            onChainingClick={() => setChainingOpen(true)}
            onMemoryClick={() => setMemoryOpen(true)}
          />
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="p-6 border-b border-ax-border">
          <NaturalLanguageInput />
        </div>
        <div className="flex-1 grid grid-cols-[360px_1fr_320px] overflow-hidden">
          <ComponentShowcase />
          <Canvas />
          <PropertiesPanel />
        </div>
      </div>
      
      <StatusBar />

      {/* Configuration Panel */}
      {configPanelOpen && <ConfigPanel />}

      {/* Export Modal */}
      <ExportModal 
        isOpen={exportModalOpen} 
        onClose={() => setExportModalOpen(false)} 
      />

      {/* Template Selector */}
      {templateModalOpen && (
        <TemplateSelector onClose={() => setTemplateModalOpen(false)} />
      )}

      {/* Agent Tester */}
      {testerModalOpen && (
        <AgentTester onClose={() => setTesterModalOpen(false)} />
      )}

      {/* Version Control */}
      {versionControlOpen && (
        <VersionControl 
          onClose={() => setVersionControlOpen(false)}
          onLoadVersion={handleLoadVersion}
        />
      )}

      {/* Marketplace */}
      {marketplaceOpen && (
        <Marketplace 
          onClose={() => setMarketplaceOpen(false)}
          onLoadAgent={handleLoadMarketplaceAgent}
        />
      )}

      {/* Collaboration Dashboard */}
      {collaborationOpen && (
        <CollaborationDashboard 
          onClose={() => setCollaborationOpen(false)}
          onLoadBuild={handleLoadSharedBuild}
        />
      )}

      {/* Agent Chaining */}
      {chainingOpen && (
        <AgentChaining 
          onClose={() => setChainingOpen(false)}
        />
      )}

      {/* Memory Integration */}
      {memoryOpen && (
        <MemoryIntegration 
          onClose={() => setMemoryOpen(false)}
        />
      )}

      {/* Auto-save Indicator */}
      <AutoSaveIndicator />
    </main>
  )
}
