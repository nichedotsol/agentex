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
import { useBuildStore } from '@/lib/stores/buildStore'
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

  return (
    <main className="h-screen flex flex-col relative overflow-hidden">
      <BackgroundLayers />
      
      <TopBar onExportClick={() => setExportModalOpen(true)} />
      
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
    </main>
  )
}
