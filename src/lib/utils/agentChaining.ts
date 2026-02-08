import { BuildState } from '@/lib/stores/buildStore'

export interface AgentNode {
  id: string
  agentId: string
  agentName: string
  buildState: BuildState
  position: { x: number; y: number }
  config: {
    trigger?: 'manual' | 'auto' | 'conditional'
    condition?: string
    delay?: number
  }
}

export interface AgentConnection {
  id: string
  from: string // Agent node ID
  to: string // Agent node ID
  type: 'sequential' | 'parallel' | 'conditional'
  condition?: string
  dataMapping?: Record<string, string> // Map output fields to input fields
}

export interface AgentChain {
  id: string
  name: string
  description?: string
  nodes: AgentNode[]
  connections: AgentConnection[]
  createdAt: number
  updatedAt: number
}

export interface ChainExecution {
  id: string
  chainId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  currentNodeId?: string
  results: Record<string, any> // Node ID -> execution result
  startedAt: number
  completedAt?: number
  error?: string
}

const STORAGE_KEY_CHAINS = 'agentex-chains'
const STORAGE_KEY_EXECUTIONS = 'agentex-chain-executions'

/**
 * Agent chaining utilities for building workflows and agent-to-agent communication
 */
export class AgentChaining {
  /**
   * Get all chains
   */
  static getChains(): AgentChain[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHAINS)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load chains:', error)
    }
    
    return []
  }

  /**
   * Create a new chain
   */
  static createChain(name: string, description?: string): AgentChain {
    const chains = this.getChains()
    
    const chain: AgentChain = {
      id: `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      nodes: [],
      connections: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    chains.push(chain)
    this.saveChains(chains)
    
    return chain
  }

  /**
   * Get chain by ID
   */
  static getChain(chainId: string): AgentChain | null {
    const chains = this.getChains()
    return chains.find(c => c.id === chainId) || null
  }

  /**
   * Add node to chain
   */
  static addNode(chainId: string, agentId: string, agentName: string, buildState: BuildState, position: { x: number; y: number }, config?: AgentNode['config']): AgentNode | null {
    const chains = this.getChains()
    const chain = chains.find(c => c.id === chainId)
    
    if (!chain) return null
    
    const node: AgentNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      agentName,
      buildState: JSON.parse(JSON.stringify(buildState)), // Deep clone
      position,
      config: config || { trigger: 'auto' }
    }
    
    chain.nodes.push(node)
    chain.updatedAt = Date.now()
    this.saveChains(chains)
    
    return node
  }

  /**
   * Remove node from chain
   */
  static removeNode(chainId: string, nodeId: string): boolean {
    const chains = this.getChains()
    const chain = chains.find(c => c.id === chainId)
    
    if (!chain) return false
    
    // Remove node
    chain.nodes = chain.nodes.filter(n => n.id !== nodeId)
    
    // Remove connections involving this node
    chain.connections = chain.connections.filter(
      c => c.from !== nodeId && c.to !== nodeId
    )
    
    chain.updatedAt = Date.now()
    this.saveChains(chains)
    
    return true
  }

  /**
   * Add connection between nodes
   */
  static addConnection(
    chainId: string,
    from: string,
    to: string,
    type: 'sequential' | 'parallel' | 'conditional' = 'sequential',
    condition?: string,
    dataMapping?: Record<string, string>
  ): AgentConnection | null {
    const chains = this.getChains()
    const chain = chains.find(c => c.id === chainId)
    
    if (!chain) return null
    
    // Validate nodes exist
    const fromNode = chain.nodes.find(n => n.id === from)
    const toNode = chain.nodes.find(n => n.id === to)
    
    if (!fromNode || !toNode) return null
    
    const connection: AgentConnection = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      from,
      to,
      type,
      condition,
      dataMapping
    }
    
    chain.connections.push(connection)
    chain.updatedAt = Date.now()
    this.saveChains(chains)
    
    return connection
  }

  /**
   * Remove connection
   */
  static removeConnection(chainId: string, connectionId: string): boolean {
    const chains = this.getChains()
    const chain = chains.find(c => c.id === chainId)
    
    if (!chain) return false
    
    chain.connections = chain.connections.filter(c => c.id !== connectionId)
    chain.updatedAt = Date.now()
    this.saveChains(chains)
    
    return true
  }

  /**
   * Update node position
   */
  static updateNodePosition(chainId: string, nodeId: string, position: { x: number; y: number }): boolean {
    const chains = this.getChains()
    const chain = chains.find(c => c.id === chainId)
    
    if (!chain) return false
    
    const node = chain.nodes.find(n => n.id === nodeId)
    if (!node) return false
    
    node.position = position
    chain.updatedAt = Date.now()
    this.saveChains(chains)
    
    return true
  }

  /**
   * Update node config
   */
  static updateNodeConfig(chainId: string, nodeId: string, config: Partial<AgentNode['config']>): boolean {
    const chains = this.getChains()
    const chain = chains.find(c => c.id === chainId)
    
    if (!chain) return false
    
    const node = chain.nodes.find(n => n.id === nodeId)
    if (!node) return false
    
    node.config = { ...node.config, ...config }
    chain.updatedAt = Date.now()
    this.saveChains(chains)
    
    return true
  }

  /**
   * Get execution history
   */
  static getExecutions(chainId?: string): ChainExecution[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EXECUTIONS)
      if (stored) {
        const all = JSON.parse(stored)
        return chainId ? all.filter((e: ChainExecution) => e.chainId === chainId) : all
      }
    } catch (error) {
      console.error('Failed to load executions:', error)
    }
    
    return []
  }

  /**
   * Create execution record
   */
  static createExecution(chainId: string): ChainExecution {
    const executions = this.getExecutions()
    
    const execution: ChainExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      chainId,
      status: 'pending',
      results: {},
      startedAt: Date.now()
    }
    
    executions.push(execution)
    this.saveExecutions(executions)
    
    return execution
  }

  /**
   * Update execution status
   */
  static updateExecution(executionId: string, updates: Partial<ChainExecution>): boolean {
    const executions = this.getExecutions()
    const execution = executions.find(e => e.id === executionId)
    
    if (!execution) return false
    
    Object.assign(execution, updates)
    
    if (updates.status === 'completed' || updates.status === 'failed') {
      execution.completedAt = Date.now()
    }
    
    this.saveExecutions(executions)
    
    return true
  }

  /**
   * Get next nodes in chain (for execution)
   */
  static getNextNodes(chain: AgentChain, currentNodeId: string): AgentNode[] {
    const connections = chain.connections.filter(c => c.from === currentNodeId)
    const nextNodeIds = connections.map(c => c.to)
    return chain.nodes.filter(n => nextNodeIds.includes(n.id))
  }

  /**
   * Get previous nodes in chain
   */
  static getPreviousNodes(chain: AgentChain, currentNodeId: string): AgentNode[] {
    const connections = chain.connections.filter(c => c.to === currentNodeId)
    const previousNodeIds = connections.map(c => c.from)
    return chain.nodes.filter(n => previousNodeIds.includes(n.id))
  }

  /**
   * Validate chain (check for cycles, orphaned nodes, etc.)
   */
  static validateChain(chain: AgentChain): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Check for orphaned nodes (nodes with no connections)
    const connectedNodeIds = new Set<string>()
    chain.connections.forEach(conn => {
      connectedNodeIds.add(conn.from)
      connectedNodeIds.add(conn.to)
    })
    
    chain.nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && chain.nodes.length > 1) {
        warnings.push(`Node "${node.agentName}" is not connected to any other nodes`)
      }
    })
    
    // Check for duplicate connections
    const connectionKeys = new Set<string>()
    chain.connections.forEach(conn => {
      const key = `${conn.from}-${conn.to}`
      if (connectionKeys.has(key)) {
        errors.push(`Duplicate connection from "${conn.from}" to "${conn.to}"`)
      }
      connectionKeys.add(key)
    })
    
    // Check for self-connections
    chain.connections.forEach(conn => {
      if (conn.from === conn.to) {
        errors.push(`Node "${conn.from}" cannot connect to itself`)
      }
    })
    
    // Check for cycles (simple check - can be enhanced)
    // This is a basic cycle detection - for production, use DFS
    const visited = new Set<string>()
    const recStack = new Set<string>()
    
    const hasCycle = (nodeId: string): boolean => {
      if (recStack.has(nodeId)) return true
      if (visited.has(nodeId)) return false
      
      visited.add(nodeId)
      recStack.add(nodeId)
      
      const outgoing = chain.connections.filter(c => c.from === nodeId)
      for (const conn of outgoing) {
        if (hasCycle(conn.to)) return true
      }
      
      recStack.delete(nodeId)
      return false
    }
    
    for (const node of chain.nodes) {
      if (!visited.has(node.id) && hasCycle(node.id)) {
        errors.push('Chain contains a cycle')
        break
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Save chains
   */
  private static saveChains(chains: AgentChain[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_CHAINS, JSON.stringify(chains))
    } catch (error) {
      console.error('Failed to save chains:', error)
    }
  }

  /**
   * Save executions
   */
  private static saveExecutions(executions: ChainExecution[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_EXECUTIONS, JSON.stringify(executions))
    } catch (error) {
      console.error('Failed to save executions:', error)
    }
  }
}
