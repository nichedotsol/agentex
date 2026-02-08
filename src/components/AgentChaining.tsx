'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { AgentChaining as ChainingUtils, type AgentChain, type AgentNode, type AgentConnection, type ChainExecution } from '@/lib/utils/agentChaining'
import { SkeletonList } from './SkeletonLoader'

interface AgentChainingProps {
  onClose: () => void
}

type View = 'chains' | 'editor' | 'executions'

export default function AgentChaining({ onClose }: AgentChainingProps) {
  const [view, setView] = useState<View>('chains')
  const [chains, setChains] = useState<AgentChain[]>([])
  const [selectedChain, setSelectedChain] = useState<AgentChain | null>(null)
  const [executions, setExecutions] = useState<ChainExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateChain, setShowCreateChain] = useState(false)
  const [showAddNode, setShowAddNode] = useState(false)
  const [showConnectionDialog, setShowConnectionDialog] = useState(false)
  const [selectedNode, setSelectedNode] = useState<AgentNode | null>(null)
  const [connectionFrom, setConnectionFrom] = useState<string>('')
  const [connectionType, setConnectionType] = useState<'sequential' | 'parallel' | 'conditional'>('sequential')
  const [connectionCondition, setConnectionCondition] = useState('')
  
  // Form states
  const [chainName, setChainName] = useState('')
  const [chainDescription, setChainDescription] = useState('')
  
  // Canvas state
  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedNode, setDraggedNode] = useState<string | null>(null)

  const buildState = useBuildStore()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedChain) {
      loadExecutions(selectedChain.id)
    }
  }, [selectedChain])

  const loadData = () => {
    setLoading(true)
    setChains(ChainingUtils.getChains())
    setLoading(false)
  }

  const loadExecutions = (chainId: string) => {
    setExecutions(ChainingUtils.getExecutions(chainId))
  }

  const handleCreateChain = () => {
    if (!chainName.trim()) return

    const chain = ChainingUtils.createChain(chainName, chainDescription)
    setChainName('')
    setChainDescription('')
    setShowCreateChain(false)
    loadData()
    setSelectedChain(chain)
    setView('editor')
  }

  const handleAddNode = () => {
    if (!selectedChain) return

    const position = {
      x: 400 + (selectedChain.nodes.length * 50),
      y: 300 + (selectedChain.nodes.length * 50)
    }

    const node = ChainingUtils.addNode(
      selectedChain.id,
      `agent_${Date.now()}`,
      buildState.settings.name || 'New Agent',
      buildState,
      position
    )

    if (node) {
      loadChain(selectedChain.id)
      setShowAddNode(false)
    }
  }

  const handleAddConnection = () => {
    if (!selectedChain || !connectionFrom || !selectedNode) return

    const connection = ChainingUtils.addConnection(
      selectedChain.id,
      connectionFrom,
      selectedNode.id,
      connectionType,
      connectionCondition || undefined
    )

    if (connection) {
      loadChain(selectedChain.id)
      setShowConnectionDialog(false)
      setConnectionFrom('')
      setConnectionType('sequential')
      setConnectionCondition('')
      setSelectedNode(null)
    }
  }

  const handleDeleteNode = (nodeId: string) => {
    if (!selectedChain) return
    ChainingUtils.removeNode(selectedChain.id, nodeId)
    loadChain(selectedChain.id)
  }

  const handleDeleteConnection = (connectionId: string) => {
    if (!selectedChain) return
    ChainingUtils.removeConnection(selectedChain.id, connectionId)
    loadChain(selectedChain.id)
  }

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    setIsDragging(true)
    setDraggedNode(nodeId)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleNodeDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedNode || !selectedChain) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    const node = selectedChain.nodes.find(n => n.id === draggedNode)
    if (node) {
      const newPosition = {
        x: node.position.x + deltaX,
        y: node.position.y + deltaY
      }
      ChainingUtils.updateNodePosition(selectedChain.id, draggedNode, newPosition)
      loadChain(selectedChain.id)
    }

    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, draggedNode, selectedChain, dragStart])

  const handleNodeDragEnd = () => {
    setIsDragging(false)
    setDraggedNode(null)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleNodeDrag)
      window.addEventListener('mouseup', handleNodeDragEnd)
      return () => {
        window.removeEventListener('mousemove', handleNodeDrag)
        window.removeEventListener('mouseup', handleNodeDragEnd)
      }
    }
  }, [isDragging, handleNodeDrag])

  const loadChain = (chainId: string) => {
    const chain = ChainingUtils.getChain(chainId)
    if (chain) {
      setSelectedChain(chain)
    }
  }

  const handleStartExecution = () => {
    if (!selectedChain) return

    const execution = ChainingUtils.createExecution(selectedChain.id)
    loadExecutions(selectedChain.id)
    
    // Simulate execution (in real app, this would call an API)
    setTimeout(() => {
      ChainingUtils.updateExecution(execution.id, {
        status: 'running',
        currentNodeId: selectedChain.nodes[0]?.id
      })
      loadExecutions(selectedChain.id)
    }, 500)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConnectionPath = (from: AgentNode, to: AgentNode): string => {
    const dx = to.position.x - from.position.x
    const dy = to.position.y - from.position.y
    const midX = from.position.x + dx / 2
    const midY = from.position.y + dy / 2
    
    return `M ${from.position.x} ${from.position.y} Q ${midX} ${midY} ${to.position.x} ${to.position.y}`
  }

  const validation = selectedChain ? ChainingUtils.validateChain(selectedChain) : null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative glass-panel max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-ax-border flex items-center justify-between">
            <div>
              <h2 className="font-sans text-xl font-semibold text-ax-text mb-1">
                Agent Chaining
              </h2>
              <p className="font-sans text-sm text-ax-text-secondary">
                Build workflows with multiple agents
              </p>
            </div>
            <div className="flex items-center gap-3">
              {selectedChain && view === 'editor' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleStartExecution()
                  }}
                  className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all micro-bounce cursor-pointer relative z-10 pointer-events-auto"
                >
                  Run Chain
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onClose()
                }}
                className="w-8 h-8 rounded-lg border border-ax-border hover:border-ax-error hover:bg-ax-error/20 flex items-center justify-center transition-all micro-bounce cursor-pointer relative z-10 pointer-events-auto"
              >
                <span className="text-ax-text">×</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="p-6 border-b border-ax-border">
            <div className="flex gap-2">
              {(['chains', 'editor', 'executions'] as View[]).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setView(tab)
                    if (tab === 'editor' && !selectedChain && chains.length > 0) {
                      setSelectedChain(chains[0])
                    }
                  }}
                  className={`px-4 py-2 font-sans text-sm rounded-lg transition-all relative z-10 pointer-events-auto cursor-pointer ${
                    view === tab
                      ? 'bg-ax-primary text-white'
                      : 'bg-ax-bg text-ax-text-secondary hover:bg-ax-bg-hover hover:text-ax-text'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="p-6">
                <SkeletonList count={3} />
              </div>
            ) : (
              <>
                {/* Chains List */}
                {view === 'chains' && (
                  <div className="p-6 overflow-y-auto h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-sans text-lg font-semibold text-ax-text">Chains</h3>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowCreateChain(true)
                        }}
                        className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all micro-bounce cursor-pointer relative z-10 pointer-events-auto"
                      >
                        Create Chain
                      </button>
                    </div>
                    {chains.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">🔗</div>
                        <p className="font-sans text-sm text-ax-text-secondary mb-4">
                          No chains yet
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowCreateChain(true)
                          }}
                          className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                        >
                          Create Your First Chain
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {chains.map((chain, i) => (
                          <motion.div
                            key={chain.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedChain(chain)
                              setView('editor')
                            }}
                            className="card-hover p-5 cursor-pointer pointer-events-auto relative z-10"
                          >
                            <h4 className="font-sans text-base font-semibold text-ax-text mb-2">
                              {chain.name}
                            </h4>
                            {chain.description && (
                              <p className="font-sans text-sm text-ax-text-secondary mb-3">
                                {chain.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-ax-text-tertiary">
                              <span>{chain.nodes.length} agents</span>
                              <span>{formatDate(chain.createdAt)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Chain Editor */}
                {view === 'editor' && (
                  <div className="flex flex-col h-full">
                    {!selectedChain ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-4 opacity-30">🔗</div>
                          <p className="font-sans text-sm text-ax-text-secondary mb-4">
                            Select or create a chain to edit
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowCreateChain(true)
                            }}
                            className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                          >
                            Create Chain
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-4 border-b border-ax-border flex items-center justify-between">
                          <div>
                            <h3 className="font-sans text-base font-semibold text-ax-text">
                              {selectedChain.name}
                            </h3>
                            {validation && (
                              <div className="mt-1">
                                {validation.valid ? (
                                  <span className="text-xs text-ax-success">✓ Valid chain</span>
                                ) : (
                                  <span className="text-xs text-ax-error">
                                    {validation.errors.length} error(s)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowAddNode(true)
                              }}
                              className="px-3 py-1.5 bg-ax-bg border border-ax-border text-ax-text-secondary rounded-lg font-sans text-xs hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                            >
                              Add Agent
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSelectedChain(null)
                                loadData()
                              }}
                              className="px-3 py-1.5 bg-ax-bg border border-ax-border text-ax-text-secondary rounded-lg font-sans text-xs hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                            >
                              Back to Chains
                            </button>
                          </div>
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                          <div
                            ref={canvasRef}
                            className="w-full h-full relative bg-ax-bg/30 grid-canvas"
                            style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)` }}
                          >
                            {/* Connections */}
                            <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
                              {selectedChain.connections.map(conn => {
                                const fromNode = selectedChain.nodes.find(n => n.id === conn.from)
                                const toNode = selectedChain.nodes.find(n => n.id === conn.to)
                                if (!fromNode || !toNode) return null
                                
                                return (
                                  <g key={conn.id}>
                                    <path
                                      d={getConnectionPath(fromNode, toNode)}
                                      stroke="rgba(99, 102, 241, 0.5)"
                                      strokeWidth="2"
                                      fill="none"
                                      markerEnd="url(#arrowhead)"
                                    />
                                    <path
                                      d={getConnectionPath(fromNode, toNode)}
                                      stroke="transparent"
                                      strokeWidth="20"
                                      fill="none"
                                      onClick={() => handleDeleteConnection(conn.id)}
                                      className="cursor-pointer"
                                    />
                                  </g>
                                )
                              })}
                              <defs>
                                <marker
                                  id="arrowhead"
                                  markerWidth="10"
                                  markerHeight="10"
                                  refX="9"
                                  refY="3"
                                  orient="auto"
                                >
                                  <polygon points="0 0, 10 3, 0 6" fill="rgba(99, 102, 241, 0.5)" />
                                </marker>
                              </defs>
                            </svg>

                            {/* Nodes */}
                            {selectedChain.nodes.map((node, i) => (
                              <motion.div
                                key={node.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                  position: 'absolute',
                                  left: node.position.x,
                                  top: node.position.y,
                                  transform: 'translate(-50%, -50%)'
                                }}
                                onMouseDown={(e) => handleNodeDragStart(node.id, e)}
                                className="cursor-move"
                              >
                                <div className="card p-4 min-w-[200px]">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-sans text-sm font-semibold text-ax-text">
                                      {node.agentName}
                                    </h4>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteNode(node.id)
                                      }}
                                      className="w-5 h-5 rounded border border-ax-border hover:border-ax-error hover:bg-ax-error/20 flex items-center justify-center transition-all text-xs"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  <div className="text-xs text-ax-text-tertiary mb-2">
                                    {node.config.trigger || 'auto'}
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedNode(node)
                                        setConnectionFrom(node.id)
                                        setShowConnectionDialog(true)
                                      }}
                                      className="flex-1 px-2 py-1 bg-ax-primary/20 text-ax-primary rounded text-xs font-sans hover:bg-ax-primary/30 transition-all"
                                    >
                                      Connect
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Executions */}
                {view === 'executions' && (
                  <div className="p-6 overflow-y-auto h-full">
                    <h3 className="font-sans text-lg font-semibold text-ax-text mb-4">
                      Execution History
                    </h3>
                    {executions.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">⚡</div>
                        <p className="font-sans text-sm text-ax-text-secondary">
                          No executions yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {executions.map((execution, i) => (
                          <motion.div
                            key={execution.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="card p-4"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-sans text-sm font-semibold text-ax-text">
                                Execution {execution.id.slice(-8)}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs font-sans ${
                                execution.status === 'completed' ? 'bg-ax-success/20 text-ax-success' :
                                execution.status === 'failed' ? 'bg-ax-error/20 text-ax-error' :
                                execution.status === 'running' ? 'bg-ax-primary/20 text-ax-primary' :
                                'bg-ax-bg-elevated text-ax-text-secondary'
                              }`}>
                                {execution.status}
                              </span>
                            </div>
                            <div className="text-xs text-ax-text-tertiary">
                              Started: {formatDate(execution.startedAt)}
                              {execution.completedAt && ` • Completed: ${formatDate(execution.completedAt)}`}
                            </div>
                            {execution.error && (
                              <div className="mt-2 text-xs text-ax-error">
                                Error: {execution.error}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Create Chain Dialog */}
      <AnimatePresence>
        {showCreateChain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel max-w-md w-full p-6"
            >
              <h3 className="font-sans text-lg font-semibold text-ax-text mb-4">
                Create Chain
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Chain Name</label>
                  <input
                    type="text"
                    value={chainName}
                    onChange={(e) => setChainName(e.target.value)}
                    placeholder="My Agent Chain"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={chainDescription}
                    onChange={(e) => setChainDescription(e.target.value)}
                    placeholder="Chain description..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowCreateChain(false)
                      setChainName('')
                      setChainDescription('')
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleCreateChain()
                    }}
                    disabled={!chainName.trim()}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer relative z-10 pointer-events-auto"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Node Dialog */}
      <AnimatePresence>
        {showAddNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel max-w-md w-full p-6"
            >
              <h3 className="font-sans text-lg font-semibold text-ax-text mb-4">
                Add Agent to Chain
              </h3>
              <div className="space-y-4">
                <p className="font-sans text-sm text-ax-text-secondary">
                  This will add your current build as a node in the chain.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowAddNode(false)
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNode}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all"
                  >
                    Add Agent
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection Dialog */}
      <AnimatePresence>
        {showConnectionDialog && selectedChain && selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel max-w-md w-full p-6"
            >
              <h3 className="font-sans text-lg font-semibold text-ax-text mb-4">
                Create Connection
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">From</label>
                  <select
                    value={connectionFrom}
                    onChange={(e) => setConnectionFrom(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select source agent</option>
                    {selectedChain.nodes
                      .filter(n => n.id !== selectedNode.id)
                      .map(node => (
                        <option key={node.id} value={node.id}>{node.agentName}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">To</label>
                  <input
                    type="text"
                    value={selectedNode.agentName}
                    disabled
                    className="form-input opacity-50"
                  />
                </div>
                <div>
                  <label className="form-label">Connection Type</label>
                  <select
                    value={connectionType}
                    onChange={(e) => setConnectionType(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="sequential">Sequential</option>
                    <option value="parallel">Parallel</option>
                    <option value="conditional">Conditional</option>
                  </select>
                </div>
                {connectionType === 'conditional' && (
                  <div>
                    <label className="form-label">Condition</label>
                    <input
                      type="text"
                      value={connectionCondition}
                      onChange={(e) => setConnectionCondition(e.target.value)}
                      placeholder="e.g., result.status === 'success'"
                      className="form-input"
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConnectionDialog(false)
                      setConnectionFrom('')
                      setConnectionType('sequential')
                      setConnectionCondition('')
                      setSelectedNode(null)
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddConnection}
                    disabled={!connectionFrom}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Create Connection
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}
