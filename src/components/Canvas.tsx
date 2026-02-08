'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Draggable from 'react-draggable'
import ConnectionLine from './ConnectionLine'
import WorkspaceControls from './WorkspaceControls'
import { useWorkspace } from '@/hooks/useWorkspace'
import { useBuildStore } from '@/lib/stores/buildStore'
import { useUIStore } from '@/lib/stores/uiStore'
import { BuildComponent } from '@/lib/stores/buildStore'

export default function Canvas() {
  const { getAllComponents, updateComponentPosition, removeComponent } = useBuildStore()
  const { selectedComponentId, selectComponent } = useUIStore()
  const { zoom, zoomIn, zoomOut, reset, changeView } = useWorkspace()
  
  const components = getAllComponents()
  const isEmpty = components.length === 0
  const canvasRef = useRef<HTMLDivElement>(null)

  // Calculate connections between components
  const connections = components.length > 1 ? calculateConnections(components) : []

  // Update component positions when dragged
  const handleDragStop = (componentId: string, position: { x: number; y: number }) => {
    updateComponentPosition(componentId, position)
  }

  const handleSelectComponent = (component: BuildComponent) => {
    selectComponent(component.id)
  }

  const handleRemoveComponent = (componentId: string) => {
    removeComponent(componentId)
    if (selectedComponentId === componentId) {
      selectComponent(null)
    }
  }

  return (
    <div 
      ref={canvasRef}
      className="relative bg-ax-bg overflow-hidden"
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'center center'
      }}
    >
      {/* Animated grid */}
      <div className="absolute inset-0 grid-canvas" />
      
      {/* Workspace Controls */}
      <WorkspaceControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={reset}
        onViewChange={changeView}
        zoom={zoom}
      />

      {/* Connection Lines */}
      {connections.map((conn, i) => (
        <ConnectionLine
          key={`${conn.from.id}-${conn.to.id}-${i}`}
          from={conn.from.position}
          to={conn.to.position}
          color={conn.color}
          animated={true}
        />
      ))}
      
      {/* Canvas content */}
      <div className="relative h-full">
        {isEmpty ? (
          <div className="h-full flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="text-6xl text-ax-text-tertiary opacity-20 mb-6 font-sans font-light">
                [ ]
              </div>
              <div className="text-base text-ax-text-secondary mb-2 font-sans">
                Click components to add
              </div>
              <div className="text-sm text-ax-text-tertiary font-sans">
                Start with a brain component
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="h-full p-4">
            {components.map((comp) => (
              <FloatingWindow 
                key={comp.id}
                component={comp}
                selected={selectedComponentId === comp.id}
                onSelect={() => handleSelectComponent(comp)}
                onRemove={() => handleRemoveComponent(comp.id)}
                onDragStop={(position) => handleDragStop(comp.id, position)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FloatingWindow({ 
  component,
  selected,
  onSelect,
  onRemove,
  onDragStop
}: { 
  component: BuildComponent
  selected: boolean
  onSelect: () => void
  onRemove: () => void
  onDragStop: (position: { x: number; y: number }) => void
}) {
  const [position, setPosition] = useState(component.position || { x: 100, y: 100 })

  const handleStop = (e: any, data: any) => {
    const newPosition = { x: data.x, y: data.y }
    setPosition(newPosition)
    onDragStop(newPosition)
  }

  const comp = component.component
  const componentName = comp.name?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || component.id

  return (
    <Draggable
      position={position}
      handle=".window-handle"
      onStop={handleStop}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ 
          scale: selected ? 1.02 : 1, 
          opacity: 1,
        }}
        onClick={onSelect}
        className={`absolute card cursor-pointer ${selected ? 'ring-2 ring-ax-primary' : ''}`}
        style={{ 
          width: 300,
        }}
      >
        {/* Window header */}
        <div className="window-handle px-4 py-3 border-b border-ax-border flex items-center justify-between cursor-move">
          <div>
            <div className="font-sans text-xs text-ax-text-tertiary uppercase tracking-wide mb-1">
              {comp.type || 'Component'}
            </div>
            <div className="font-sans text-base font-semibold text-ax-text">
              {componentName}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="w-5 h-5 rounded-full bg-ax-error/20 hover:bg-ax-error/30 flex items-center justify-center transition-colors"
          >
            <span className="text-ax-error text-xs">×</span>
          </button>
        </div>

        {/* Window content */}
        <div className="p-4">
          {comp.metadata?.description && (
            <div className="font-sans text-xs text-ax-text-secondary mb-3 leading-relaxed">
              {comp.metadata.description.substring(0, 80)}...
            </div>
          )}
          <div className="space-y-2">
            {comp.resources?.token_cost && (
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-ax-text-tertiary">Cost</span>
                <span className="font-sans text-xs text-ax-text">{comp.resources.token_cost.split(' per')[0]}</span>
              </div>
            )}
            {comp.resources?.context_window && (
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-ax-text-tertiary">Context</span>
                <span className="font-sans text-xs text-ax-text">{(comp.resources.context_window / 1000).toFixed(0)}K</span>
              </div>
            )}
            {comp.config?.platform && (
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-ax-text-tertiary">Platform</span>
                <span className="font-sans text-xs text-ax-text">{comp.config.platform}</span>
              </div>
            )}
            {comp.provider && (
              <div className="flex justify-between items-center">
                <span className="font-sans text-xs text-ax-text-tertiary">Provider</span>
                <span className="font-sans text-xs text-ax-text">{comp.provider}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Draggable>
  )
}

function calculateConnections(components: BuildComponent[]) {
  const connections: Array<{
    from: { id: string; position: { x: number; y: number } }
    to: { id: string; position: { x: number; y: number } }
    color: string
  }> = []

  const brain = components.find(c => c.component.type === 'brain')
  const tools = components.filter(c => c.component.type === 'tool')
  const runtime = components.find(c => c.component.type === 'runtime')

  // Connect brain to tools
  if (brain) {
    tools.forEach(tool => {
      connections.push({
        from: { id: brain.id, position: brain.position },
        to: { id: tool.id, position: tool.position },
        color: '#00ff9f'
      })
    })
  }

  // Connect tools to runtime
  if (runtime) {
    tools.forEach(tool => {
      connections.push({
        from: { id: tool.id, position: tool.position },
        to: { id: runtime.id, position: runtime.position },
        color: '#00d9ff'
      })
    })
  }

  // Connect brain to runtime if both exist
  if (brain && runtime) {
    connections.push({
      from: { id: brain.id, position: brain.position },
      to: { id: runtime.id, position: runtime.position },
      color: '#ff0055'
    })
  }

  return connections
}
