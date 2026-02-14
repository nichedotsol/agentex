'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Analytics, type AnalyticsStats, type UsageEvent, type CostEntry } from '@/lib/utils/analytics'
import { SkeletonList } from './SkeletonLoader'

interface AnalyticsDashboardProps {
  onClose: () => void
}

type TimeRange = '7d' | '30d' | '90d' | 'all'

export default function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [usageChartData, setUsageChartData] = useState<Array<{ date: string; count: number }>>([])
  const [costChartData, setCostChartData] = useState<Array<{ date: string; amount: number }>>([])
  const [recentEvents, setRecentEvents] = useState<UsageEvent[]>([])
  const [recentCosts, setRecentCosts] = useState<CostEntry[]>([])

  const loadData = useCallback(() => {
    setLoading(true)
    
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const now = Date.now()
    const from = timeRange === 'all' ? 0 : now - (days * 24 * 60 * 60 * 1000)
    
    const timeRangeObj = timeRange === 'all' ? undefined : { from, to: now }
    
    setStats(Analytics.getStats(timeRangeObj))
    setUsageChartData(Analytics.getUsageChartData(days))
    setCostChartData(Analytics.getCostChartData(days))
    setRecentEvents(Analytics.getEvents(timeRangeObj).slice(-10).reverse())
    setRecentCosts(Analytics.getCosts(timeRangeObj).slice(-10).reverse())
    
    setLoading(false)
  }, [timeRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount)
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

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const getMaxValue = (data: Array<{ count?: number; amount?: number }>) => {
    return Math.max(...data.map(d => d.count || d.amount || 0), 1)
  }

  return (
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
              Analytics Dashboard
            </h2>
            <p className="font-sans text-sm text-ax-text-secondary">
              Usage analytics, cost tracking, and performance monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="form-input"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-ax-border hover:border-ax-error hover:bg-ax-error/20 flex items-center justify-center transition-all micro-bounce"
            >
              <span className="text-ax-text">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <SkeletonList count={3} />
          ) : stats ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4">
                  <div className="text-xs text-ax-text-tertiary mb-1">Total Builds</div>
                  <div className="text-2xl font-semibold text-ax-text">{stats.totalBuilds}</div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-ax-text-tertiary mb-1">Success Rate</div>
                  <div className="text-2xl font-semibold text-ax-success">
                    {(stats.successRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-ax-text-tertiary mb-1">Avg Response Time</div>
                  <div className="text-2xl font-semibold text-ax-text">
                    {formatDuration(stats.averageResponseTime)}
                  </div>
                </div>
                <div className="card p-4">
                  <div className="text-xs text-ax-text-tertiary mb-1">Total Cost</div>
                  <div className="text-2xl font-semibold text-ax-text">
                    {formatCurrency(stats.totalCost)}
                  </div>
                </div>
              </div>

              {/* Usage Chart */}
              <div className="card p-5">
                <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                  Usage Over Time
                </h3>
                <div className="h-48 flex items-end gap-1">
                  {usageChartData.map((point, i) => {
                    const max = getMaxValue(usageChartData)
                    const height = (point.count / max) * 100
                    return (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: i * 0.01 }}
                        className="flex-1 bg-ax-primary rounded-t hover:bg-ax-primary-hover transition-all relative group"
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-ax-bg-elevated border border-ax-border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {point.date}: {point.count}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Cost Chart */}
              {stats.totalCost > 0 && (
                <div className="card p-5">
                  <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                    Cost Over Time
                  </h3>
                  <div className="h-48 flex items-end gap-1">
                    {costChartData.map((point, i) => {
                      const max = getMaxValue(costChartData)
                      const height = max > 0 ? (point.amount / max) * 100 : 0
                      return (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.01 }}
                          className="flex-1 bg-ax-success rounded-t hover:bg-ax-success/80 transition-all relative group"
                        >
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-ax-bg-elevated border border-ax-border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {point.date}: {formatCurrency(point.amount)}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Cost Breakdown */}
              {stats.totalCost > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card p-5">
                    <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                      Cost by Provider
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats.costByProvider)
                        .sort(([, a], [, b]) => b - a)
                        .map(([provider, amount]) => (
                          <div key={provider} className="flex items-center justify-between">
                            <span className="font-sans text-sm text-ax-text-secondary">{provider}</span>
                            <span className="font-sans text-sm font-semibold text-ax-text">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="card p-5">
                    <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                      Cost by Service
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats.costByService)
                        .sort(([, a], [, b]) => b - a)
                        .map(([service, amount]) => (
                          <div key={service} className="flex items-center justify-between">
                            <span className="font-sans text-sm text-ax-text-secondary">{service}</span>
                            <span className="font-sans text-sm font-semibold text-ax-text">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-5">
                  <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                    Activity Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Builds</span>
                      <span className="font-sans text-sm font-semibold text-ax-text">{stats.totalBuilds}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Exports</span>
                      <span className="font-sans text-sm font-semibold text-ax-text">{stats.totalExports}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Tests</span>
                      <span className="font-sans text-sm font-semibold text-ax-text">{stats.totalTests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Deployments</span>
                      <span className="font-sans text-sm font-semibold text-ax-text">{stats.totalDeployments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Chain Executions</span>
                      <span className="font-sans text-sm font-semibold text-ax-text">{stats.totalChainExecutions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Memory Access</span>
                      <span className="font-sans text-sm font-semibold text-ax-text">{stats.totalMemoryAccesses}</span>
                    </div>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Success Rate</span>
                      <span className="font-sans text-sm font-semibold text-ax-success">
                        {(stats.successRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Error Rate</span>
                      <span className="font-sans text-sm font-semibold text-ax-error">
                        {(stats.errorRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm text-ax-text-secondary">Avg Response Time</span>
                      <span className="font-sans text-sm font-semibold text-ax-text">
                        {formatDuration(stats.averageResponseTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="card p-5">
                <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                  Recent Events
                </h3>
                {recentEvents.length === 0 ? (
                  <p className="font-sans text-sm text-ax-text-secondary">No events yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 bg-ax-bg/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            event.success ? 'bg-ax-success' : 'bg-ax-error'
                          }`} />
                          <span className="font-sans text-sm text-ax-text">{event.type}</span>
                          {event.duration && (
                            <span className="font-sans text-xs text-ax-text-tertiary">
                              {formatDuration(event.duration)}
                            </span>
                          )}
                        </div>
                        <span className="font-sans text-xs text-ax-text-tertiary">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Costs */}
              {recentCosts.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-sans text-base font-semibold text-ax-text mb-4">
                    Recent Costs
                  </h3>
                  <div className="space-y-2">
                    {recentCosts.map((cost) => (
                      <div
                        key={cost.id}
                        className="flex items-center justify-between p-3 bg-ax-bg/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-sm text-ax-text">{cost.provider}</span>
                          <span className="font-sans text-xs text-ax-text-tertiary">{cost.service}</span>
                          {cost.tokens && (
                            <span className="font-sans text-xs text-ax-text-tertiary">
                              {cost.tokens.toLocaleString()} tokens
                            </span>
                          )}
                        </div>
                        <span className="font-sans text-sm font-semibold text-ax-text">
                          {formatCurrency(cost.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 opacity-30">📊</div>
              <p className="font-sans text-sm text-ax-text-secondary">
                No analytics data available
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
