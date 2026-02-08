import { BuildState } from '@/lib/stores/buildStore'

export interface UsageEvent {
  id: string
  type: 'build' | 'export' | 'test' | 'deploy' | 'chain_execution' | 'memory_access'
  timestamp: number
  agentId?: string
  duration?: number // milliseconds
  success: boolean
  metadata?: Record<string, any>
}

export interface CostEntry {
  id: string
  timestamp: number
  provider: string
  service: string
  amount: number // in USD
  tokens?: number
  agentId?: string
  metadata?: Record<string, any>
}

export interface PerformanceMetric {
  id: string
  timestamp: number
  agentId?: string
  metric: 'response_time' | 'token_usage' | 'error_rate' | 'success_rate'
  value: number
  unit?: string
}

export interface AnalyticsStats {
  totalBuilds: number
  totalExports: number
  totalTests: number
  totalDeployments: number
  totalChainExecutions: number
  totalMemoryAccesses: number
  successRate: number
  averageResponseTime: number
  totalCost: number
  costByProvider: Record<string, number>
  costByService: Record<string, number>
  usageByDay: Record<string, number>
  topAgents: Array<{ agentId: string; count: number }>
  errorRate: number
}

export interface TimeRange {
  from: number
  to: number
}

const STORAGE_KEY_EVENTS = 'agentex-analytics-events'
const STORAGE_KEY_COSTS = 'agentex-analytics-costs'
const STORAGE_KEY_PERFORMANCE = 'agentex-analytics-performance'

/**
 * Analytics utilities for usage tracking, cost tracking, and performance monitoring
 */
export class Analytics {
  /**
   * Track usage event
   */
  static trackEvent(
    type: UsageEvent['type'],
    success: boolean,
    agentId?: string,
    duration?: number,
    metadata?: Record<string, any>
  ): UsageEvent {
    const events = this.getEvents()
    
    const event: UsageEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      agentId,
      duration,
      success,
      metadata
    }
    
    events.push(event)
    this.saveEvents(events)
    
    return event
  }

  /**
   * Get events
   */
  static getEvents(timeRange?: TimeRange, agentId?: string): UsageEvent[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_EVENTS)
      if (stored) {
        let events: UsageEvent[] = JSON.parse(stored)
        
        if (timeRange) {
          events = events.filter(e => 
            e.timestamp >= timeRange.from && e.timestamp <= timeRange.to
          )
        }
        
        if (agentId) {
          events = events.filter(e => e.agentId === agentId)
        }
        
        return events
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    }
    
    return []
  }

  /**
   * Add cost entry
   */
  static addCost(
    provider: string,
    service: string,
    amount: number,
    tokens?: number,
    agentId?: string,
    metadata?: Record<string, any>
  ): CostEntry {
    const costs = this.getCosts()
    
    const cost: CostEntry = {
      id: `cost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      provider,
      service,
      amount,
      tokens,
      agentId,
      metadata
    }
    
    costs.push(cost)
    this.saveCosts(costs)
    
    return cost
  }

  /**
   * Get costs
   */
  static getCosts(timeRange?: TimeRange, agentId?: string): CostEntry[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COSTS)
      if (stored) {
        let costs: CostEntry[] = JSON.parse(stored)
        
        if (timeRange) {
          costs = costs.filter(c => 
            c.timestamp >= timeRange.from && c.timestamp <= timeRange.to
          )
        }
        
        if (agentId) {
          costs = costs.filter(c => c.agentId === agentId)
        }
        
        return costs
      }
    } catch (error) {
      console.error('Failed to load costs:', error)
    }
    
    return []
  }

  /**
   * Record performance metric
   */
  static recordMetric(
    metric: PerformanceMetric['metric'],
    value: number,
    agentId?: string,
    unit?: string
  ): PerformanceMetric {
    const metrics = this.getMetrics()
    
    const performanceMetric: PerformanceMetric = {
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      agentId,
      metric,
      value,
      unit
    }
    
    metrics.push(performanceMetric)
    this.saveMetrics(metrics)
    
    return performanceMetric
  }

  /**
   * Get metrics
   */
  static getMetrics(timeRange?: TimeRange, agentId?: string): PerformanceMetric[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PERFORMANCE)
      if (stored) {
        let metrics: PerformanceMetric[] = JSON.parse(stored)
        
        if (timeRange) {
          metrics = metrics.filter(m => 
            m.timestamp >= timeRange.from && m.timestamp <= timeRange.to
          )
        }
        
        if (agentId) {
          metrics = metrics.filter(m => m.agentId === agentId)
        }
        
        return metrics
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
    
    return []
  }

  /**
   * Get analytics statistics
   */
  static getStats(timeRange?: TimeRange): AnalyticsStats {
    const events = this.getEvents(timeRange)
    const costs = this.getCosts(timeRange)
    const metrics = this.getMetrics(timeRange)
    
    const stats: AnalyticsStats = {
      totalBuilds: events.filter(e => e.type === 'build').length,
      totalExports: events.filter(e => e.type === 'export').length,
      totalTests: events.filter(e => e.type === 'test').length,
      totalDeployments: events.filter(e => e.type === 'deploy').length,
      totalChainExecutions: events.filter(e => e.type === 'chain_execution').length,
      totalMemoryAccesses: events.filter(e => e.type === 'memory_access').length,
      successRate: 0,
      averageResponseTime: 0,
      totalCost: 0,
      costByProvider: {},
      costByService: {},
      usageByDay: {},
      topAgents: [],
      errorRate: 0
    }
    
    // Success rate
    const successful = events.filter(e => e.success).length
    stats.successRate = events.length > 0 ? successful / events.length : 0
    
    // Error rate
    stats.errorRate = events.length > 0 ? (events.length - successful) / events.length : 0
    
    // Average response time
    const eventsWithDuration = events.filter(e => e.duration !== undefined)
    if (eventsWithDuration.length > 0) {
      const totalDuration = eventsWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0)
      stats.averageResponseTime = totalDuration / eventsWithDuration.length
    }
    
    // Total cost
    stats.totalCost = costs.reduce((sum, c) => sum + c.amount, 0)
    
    // Cost by provider
    for (const cost of costs) {
      stats.costByProvider[cost.provider] = (stats.costByProvider[cost.provider] || 0) + cost.amount
    }
    
    // Cost by service
    for (const cost of costs) {
      stats.costByService[cost.service] = (stats.costByService[cost.service] || 0) + cost.amount
    }
    
    // Usage by day
    for (const event of events) {
      const date = new Date(event.timestamp)
      const dayKey = date.toISOString().split('T')[0]
      stats.usageByDay[dayKey] = (stats.usageByDay[dayKey] || 0) + 1
    }
    
    // Top agents
    const agentCounts: Record<string, number> = {}
    for (const event of events) {
      if (event.agentId) {
        agentCounts[event.agentId] = (agentCounts[event.agentId] || 0) + 1
      }
    }
    stats.topAgents = Object.entries(agentCounts)
      .map(([agentId, count]) => ({ agentId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    return stats
  }

  /**
   * Get chart data for usage over time
   */
  static getUsageChartData(days: number = 30): Array<{ date: string; count: number }> {
    const events = this.getEvents()
    const now = Date.now()
    const startTime = now - (days * 24 * 60 * 60 * 1000)
    
    const filtered = events.filter(e => e.timestamp >= startTime)
    const dailyCounts: Record<string, number> = {}
    
    for (const event of filtered) {
      const date = new Date(event.timestamp)
      const dayKey = date.toISOString().split('T')[0]
      dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1
    }
    
    // Fill in missing days with 0
    const result: Array<{ date: string; count: number }> = []
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000))
      const dayKey = date.toISOString().split('T')[0]
      result.unshift({ date: dayKey, count: dailyCounts[dayKey] || 0 })
    }
    
    return result
  }

  /**
   * Get chart data for costs over time
   */
  static getCostChartData(days: number = 30): Array<{ date: string; amount: number }> {
    const costs = this.getCosts()
    const now = Date.now()
    const startTime = now - (days * 24 * 60 * 60 * 1000)
    
    const filtered = costs.filter(c => c.timestamp >= startTime)
    const dailyCosts: Record<string, number> = {}
    
    for (const cost of filtered) {
      const date = new Date(cost.timestamp)
      const dayKey = date.toISOString().split('T')[0]
      dailyCosts[dayKey] = (dailyCosts[dayKey] || 0) + cost.amount
    }
    
    // Fill in missing days with 0
    const result: Array<{ date: string; amount: number }> = []
    for (let i = 0; i < days; i++) {
      const date = new Date(now - (i * 24 * 60 * 60 * 1000))
      const dayKey = date.toISOString().split('T')[0]
      result.unshift({ date: dayKey, amount: dailyCosts[dayKey] || 0 })
    }
    
    return result
  }

  /**
   * Clear all analytics data
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(STORAGE_KEY_EVENTS)
    localStorage.removeItem(STORAGE_KEY_COSTS)
    localStorage.removeItem(STORAGE_KEY_PERFORMANCE)
  }

  /**
   * Save events
   */
  private static saveEvents(events: UsageEvent[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events))
    } catch (error) {
      console.error('Failed to save events:', error)
    }
  }

  /**
   * Save costs
   */
  private static saveCosts(costs: CostEntry[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_COSTS, JSON.stringify(costs))
    } catch (error) {
      console.error('Failed to save costs:', error)
    }
  }

  /**
   * Save metrics
   */
  private static saveMetrics(metrics: PerformanceMetric[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_PERFORMANCE, JSON.stringify(metrics))
    } catch (error) {
      console.error('Failed to save metrics:', error)
    }
  }
}
