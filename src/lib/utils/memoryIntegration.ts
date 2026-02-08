import { BuildState, BuildComponent } from '@/lib/stores/buildStore'
import { Component } from '@/hooks/useComponentRegistry'

export interface MemoryEntry {
  id: string
  key: string
  value: any
  metadata: {
    timestamp: number
    agentId?: string
    sessionId?: string
    tags?: string[]
    importance?: number // 0-1 scale
    accessCount?: number
    lastAccessed?: number
  }
}

export interface MemorySearchResult {
  entry: MemoryEntry
  score: number
  matchedFields: string[]
}

export interface MemoryStats {
  totalEntries: number
  totalSize: number // bytes
  byComponent: Record<string, {
    count: number
    size: number
  }>
  byTag: Record<string, number>
  oldestEntry: number
  newestEntry: number
  averageImportance: number
}

export interface MemoryOptimization {
  type: 'cleanup' | 'compression' | 'archival' | 'deduplication'
  description: string
  estimatedSavings: number // bytes
  affectedEntries: string[]
  action: () => Promise<void>
}

const STORAGE_KEY_MEMORY = 'agentex-memory-entries'
const STORAGE_KEY_MEMORY_STATS = 'agentex-memory-stats'

/**
 * Memory integration utilities for visualization, search, and optimization
 */
export class MemoryIntegration {
  /**
   * Get all memory entries
   */
  static getEntries(componentId?: string): MemoryEntry[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEMORY)
      if (stored) {
        const all = JSON.parse(stored)
        return componentId ? all.filter((e: MemoryEntry) => e.metadata.agentId === componentId) : all
      }
    } catch (error) {
      console.error('Failed to load memory entries:', error)
    }
    
    return []
  }

  /**
   * Add memory entry
   */
  static addEntry(
    key: string,
    value: any,
    componentId?: string,
    tags?: string[],
    importance?: number
  ): MemoryEntry {
    const entries = this.getEntries()
    
    const entry: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key,
      value,
      metadata: {
        timestamp: Date.now(),
        agentId: componentId,
        tags: tags || [],
        importance: importance || 0.5,
        accessCount: 0,
        lastAccessed: Date.now()
      }
    }
    
    entries.push(entry)
    this.saveEntries(entries)
    this.updateStats()
    
    return entry
  }

  /**
   * Get entry by ID
   */
  static getEntry(entryId: string): MemoryEntry | null {
    const entries = this.getEntries()
    return entries.find(e => e.id === entryId) || null
  }

  /**
   * Update entry
   */
  static updateEntry(entryId: string, updates: Partial<MemoryEntry>): boolean {
    const entries = this.getEntries()
    const entry = entries.find(e => e.id === entryId)
    
    if (!entry) return false
    
    Object.assign(entry, updates)
    this.saveEntries(entries)
    this.updateStats()
    
    return true
  }

  /**
   * Delete entry
   */
  static deleteEntry(entryId: string): boolean {
    const entries = this.getEntries()
    const filtered = entries.filter(e => e.id !== entryId)
    
    if (filtered.length === entries.length) return false
    
    this.saveEntries(filtered)
    this.updateStats()
    
    return true
  }

  /**
   * Search memory entries
   */
  static searchEntries(
    query: string,
    filters?: {
      componentId?: string
      tags?: string[]
      minImportance?: number
      dateRange?: { from: number; to: number }
    }
  ): MemorySearchResult[] {
    const entries = this.getEntries()
    const results: MemorySearchResult[] = []
    
    const queryLower = query.toLowerCase()
    
    for (const entry of entries) {
      // Apply filters
      if (filters?.componentId && entry.metadata.agentId !== filters.componentId) continue
      if (filters?.tags && filters.tags.length > 0) {
        const hasTag = filters.tags.some(tag => entry.metadata.tags?.includes(tag))
        if (!hasTag) continue
      }
      if (filters?.minImportance && (entry.metadata.importance || 0) < filters.minImportance) continue
      if (filters?.dateRange) {
        if (entry.metadata.timestamp < filters.dateRange.from || entry.metadata.timestamp > filters.dateRange.to) continue
      }
      
      // Search in key, value, and tags
      const matchedFields: string[] = []
      let score = 0
      
      if (entry.key.toLowerCase().includes(queryLower)) {
        matchedFields.push('key')
        score += 0.5
      }
      
      const valueStr = JSON.stringify(entry.value).toLowerCase()
      if (valueStr.includes(queryLower)) {
        matchedFields.push('value')
        score += 0.3
      }
      
      if (entry.metadata.tags) {
        const matchingTags = entry.metadata.tags.filter(tag => tag.toLowerCase().includes(queryLower))
        if (matchingTags.length > 0) {
          matchedFields.push('tags')
          score += 0.2 * matchingTags.length
        }
      }
      
      // Boost score by importance and recency
      score += (entry.metadata.importance || 0) * 0.2
      const age = Date.now() - entry.metadata.timestamp
      const daysOld = age / (1000 * 60 * 60 * 24)
      score += Math.max(0, 1 - daysOld / 30) * 0.1 // Boost recent entries
      
      if (score > 0) {
        results.push({ entry, score, matchedFields })
      }
    }
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score)
    
    return results
  }

  /**
   * Get memory statistics
   */
  static getStats(componentId?: string): MemoryStats {
    const entries = componentId ? this.getEntries(componentId) : this.getEntries()
    
    const stats: MemoryStats = {
      totalEntries: entries.length,
      totalSize: 0,
      byComponent: {},
      byTag: {},
      oldestEntry: Date.now(),
      newestEntry: 0,
      averageImportance: 0
    }
    
    let totalImportance = 0
    
    for (const entry of entries) {
      // Calculate size (rough estimate)
      const entrySize = JSON.stringify(entry).length
      stats.totalSize += entrySize
      
      // By component
      const compId = entry.metadata.agentId || 'unknown'
      if (!stats.byComponent[compId]) {
        stats.byComponent[compId] = { count: 0, size: 0 }
      }
      stats.byComponent[compId].count++
      stats.byComponent[compId].size += entrySize
      
      // By tag
      if (entry.metadata.tags) {
        for (const tag of entry.metadata.tags) {
          stats.byTag[tag] = (stats.byTag[tag] || 0) + 1
        }
      }
      
      // Timestamps
      if (entry.metadata.timestamp < stats.oldestEntry) {
        stats.oldestEntry = entry.metadata.timestamp
      }
      if (entry.metadata.timestamp > stats.newestEntry) {
        stats.newestEntry = entry.metadata.timestamp
      }
      
      // Importance
      totalImportance += entry.metadata.importance || 0
    }
    
    stats.averageImportance = entries.length > 0 ? totalImportance / entries.length : 0
    
    return stats
  }

  /**
   * Get optimization suggestions
   */
  static getOptimizations(componentId?: string): MemoryOptimization[] {
    const entries = componentId ? this.getEntries(componentId) : this.getEntries()
    const optimizations: MemoryOptimization[] = []
    
    // Find old, low-importance entries
    const oldLowImportance = entries.filter(e => {
      const age = Date.now() - e.metadata.timestamp
      const daysOld = age / (1000 * 60 * 60 * 24)
      return daysOld > 30 && (e.metadata.importance || 0) < 0.3
    })
    
    if (oldLowImportance.length > 0) {
      const totalSize = oldLowImportance.reduce((sum, e) => sum + JSON.stringify(e).length, 0)
      optimizations.push({
        type: 'cleanup',
        description: `Remove ${oldLowImportance.length} old, low-importance entries`,
        estimatedSavings: totalSize,
        affectedEntries: oldLowImportance.map(e => e.id),
        action: async () => {
          for (const entry of oldLowImportance) {
            this.deleteEntry(entry.id)
          }
        }
      })
    }
    
    // Find duplicate entries
    const keyMap = new Map<string, MemoryEntry[]>()
    for (const entry of entries) {
      const key = entry.key
      if (!keyMap.has(key)) {
        keyMap.set(key, [])
      }
      keyMap.get(key)!.push(entry)
    }
    
    const duplicates: MemoryEntry[] = []
    for (const [key, entriesWithKey] of keyMap.entries()) {
      if (entriesWithKey.length > 1) {
        // Keep the most recent one
        entriesWithKey.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
        duplicates.push(...entriesWithKey.slice(1))
      }
    }
    
    if (duplicates.length > 0) {
      const totalSize = duplicates.reduce((sum, e) => sum + JSON.stringify(e).length, 0)
      optimizations.push({
        type: 'deduplication',
        description: `Remove ${duplicates.length} duplicate entries`,
        estimatedSavings: totalSize,
        affectedEntries: duplicates.map(e => e.id),
        action: async () => {
          for (const entry of duplicates) {
            this.deleteEntry(entry.id)
          }
        }
      })
    }
    
    // Find rarely accessed entries
    const rarelyAccessed = entries.filter(e => {
      const accessCount = e.metadata.accessCount || 0
      const age = Date.now() - e.metadata.timestamp
      const daysOld = age / (1000 * 60 * 60 * 24)
      return accessCount < 3 && daysOld > 7
    })
    
    if (rarelyAccessed.length > 0) {
      const totalSize = rarelyAccessed.reduce((sum, e) => sum + JSON.stringify(e).length, 0)
      optimizations.push({
        type: 'archival',
        description: `Archive ${rarelyAccessed.length} rarely accessed entries`,
        estimatedSavings: totalSize * 0.5, // Assume 50% size reduction with compression
        affectedEntries: rarelyAccessed.map(e => e.id),
        action: async () => {
          // In a real implementation, this would compress and archive
          for (const entry of rarelyAccessed) {
            // Mark as archived
            this.updateEntry(entry.id, {
              metadata: {
                ...entry.metadata,
                tags: [...(entry.metadata.tags || []), 'archived']
              }
            })
          }
        }
      })
    }
    
    return optimizations
  }

  /**
   * Access entry (increment access count)
   */
  static accessEntry(entryId: string): boolean {
    const entry = this.getEntry(entryId)
    if (!entry) return false
    
    this.updateEntry(entryId, {
      metadata: {
        ...entry.metadata,
        accessCount: (entry.metadata.accessCount || 0) + 1,
        lastAccessed: Date.now()
      }
    })
    
    return true
  }

  /**
   * Clear all entries
   */
  static clearAll(componentId?: string): boolean {
    if (componentId) {
      const entries = this.getEntries()
      const filtered = entries.filter(e => e.metadata.agentId !== componentId)
      this.saveEntries(filtered)
    } else {
      this.saveEntries([])
    }
    this.updateStats()
    return true
  }

  /**
   * Save entries
   */
  private static saveEntries(entries: MemoryEntry[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(entries))
    } catch (error) {
      console.error('Failed to save memory entries:', error)
    }
  }

  /**
   * Update statistics cache
   */
  private static updateStats(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stats = this.getStats()
      localStorage.setItem(STORAGE_KEY_MEMORY_STATS, JSON.stringify(stats))
    } catch (error) {
      console.error('Failed to update stats:', error)
    }
  }
}
