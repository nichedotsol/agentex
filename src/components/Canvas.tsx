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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center font-mono"
            >
              <div className="text-5xl text-ax-text-dim opacity-30 mb-4 font-pixel">
                [ ]
              </div>
              <div className="text-xs text-ax-text-dim mb-1">
                CLICK COMPONENTS TO ADD
              </div>
              <div className="text-[10px] text-ax-text-dim opacity-50">
                start with brain component
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
  const componentColor = comp.metadata?.color || '#00ff9f'
  const componentIcon = comp.metadata?.icon || '⚙️'
  const componentName = comp.name?.replace(/-/g, '_').toUpperCase() || component.id

  return (
    <Draggable
      position={position}
      handle=".window-handle"
      onStop={handleStop}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: selected ? 1.05 : 1, 
          opacity: 1,
          boxShadow: selected 
            ? `0 0 30px ${componentColor}80` 
            : '0 0 40px rgba(0, 255, 159, 0.15)'
        }}
        onClick={onSelect}
        className="absolute window-glass window-shadow cursor-pointer"
        style={{ 
          width: 280,
          borderColor: selected ? componentColor : 'rgba(0, 255, 159, 0.2)'
        }}
      >
        {/* Window title bar */}
        <div className="window-handle px-3 py-2 border-b border-ax-border/50 flex items-center justify-between cursor-move">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div 
                className="w-2 h-2 rounded-full bg-ax-red/60 hover:bg-ax-red cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }} 
              />
              <div className="w-2 h-2 rounded-full bg-ax-text-dim/30" />
              <div className="w-2 h-2 rounded-full bg-ax-cyan/30" />
            </div>
            <span className="font-mono text-[10px] text-ax-text-dim ml-2">
              {comp.type?.toUpperCase() || 'COMPONENT'}
            </span>
          </div>
          <div className="font-mono text-[9px] text-ax-text-dim">
            {component.id.split('_').pop()?.slice(-6)}
          </div>
        </div>

        {/* Window content */}
        <div className="p-4">
          <div className="text-2xl mb-3">{componentIcon}</div>
          <div className="font-mono text-sm text-ax-cyan mb-2">
            {componentName}
          </div>
          <div className="font-mono text-[10px] text-ax-text-dim space-y-1">
            {comp.metadata?.description && (
              <div className="text-[9px] mb-2 opacity-70">
                {comp.metadata.description.substring(0, 60)}...
              </div>
            )}
            {comp.resources?.token_cost && (
              <div>COST: {comp.resources.token_cost.split(' per')[0]}</div>
            )}
            {comp.resources?.context_window && (
              <div>CTX: {(comp.resources.context_window / 1000).toFixed(0)}K</div>
            )}
            {comp.config?.platform && (
              <div>PLATFORM: {comp.config.platform}</div>
            )}
            {comp.provider && (
              <div>PROVIDER: {comp.provider}</div>
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
