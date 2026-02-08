import { BuildState } from '@/lib/stores/buildStore'

export interface MarketplaceAgent {
  id: string
  name: string
  description: string
  author: string
  authorId?: string
  version: string
  category: string
  tags: string[]
  buildState: BuildState
  thumbnail?: string
  rating: number
  reviewCount: number
  downloadCount: number
  createdAt: number
  updatedAt: number
  featured?: boolean
  verified?: boolean
}

export interface MarketplaceFilters {
  category?: string
  tags?: string[]
  minRating?: number
  sortBy?: 'popular' | 'recent' | 'rating' | 'downloads'
  search?: string
}

const STORAGE_KEY = 'agentex-marketplace-agents'

/**
 * Marketplace utilities for managing community agents
 */
export class Marketplace {
  /**
   * Get all marketplace agents
   */
  static getAllAgents(): MarketplaceAgent[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load marketplace agents:', error)
    }
    
    return []
  }

  /**
   * Save agent to marketplace
   */
  static saveAgent(agent: Omit<MarketplaceAgent, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'downloadCount'>): MarketplaceAgent {
    const agents = this.getAllAgents()
    
    const newAgent: MarketplaceAgent = {
      ...agent,
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rating: 0,
      reviewCount: 0,
      downloadCount: 0
    }
    
    agents.push(newAgent)
    this.saveAgents(agents)
    
    return newAgent
  }

  /**
   * Get agent by ID
   */
  static getAgent(id: string): MarketplaceAgent | null {
    const agents = this.getAllAgents()
    return agents.find(a => a.id === id) || null
  }

  /**
   * Update agent
   */
  static updateAgent(id: string, updates: Partial<MarketplaceAgent>): boolean {
    const agents = this.getAllAgents()
    const index = agents.findIndex(a => a.id === id)
    
    if (index === -1) return false
    
    agents[index] = {
      ...agents[index],
      ...updates,
      updatedAt: Date.now()
    }
    
    this.saveAgents(agents)
    return true
  }

  /**
   * Delete agent
   */
  static deleteAgent(id: string): boolean {
    const agents = this.getAllAgents()
    const filtered = agents.filter(a => a.id !== id)
    
    if (filtered.length === agents.length) return false
    
    this.saveAgents(filtered)
    return true
  }

  /**
   * Filter agents
   */
  static filterAgents(filters: MarketplaceFilters): MarketplaceAgent[] {
    let agents = this.getAllAgents()
    
    // Search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      agents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchLower) ||
        agent.description.toLowerCase().includes(searchLower) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        agent.author.toLowerCase().includes(searchLower)
      )
    }
    
    // Category
    if (filters.category) {
      agents = agents.filter(agent => agent.category === filters.category)
    }
    
    // Tags
    if (filters.tags && filters.tags.length > 0) {
      agents = agents.filter(agent =>
        filters.tags!.some(tag => agent.tags.includes(tag))
      )
    }
    
    // Min rating
    if (filters.minRating !== undefined) {
      agents = agents.filter(agent => agent.rating >= filters.minRating!)
    }
    
    // Sort
    switch (filters.sortBy) {
      case 'popular':
        agents.sort((a, b) => b.downloadCount - a.downloadCount)
        break
      case 'recent':
        agents.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'rating':
        agents.sort((a, b) => b.rating - a.rating)
        break
      case 'downloads':
        agents.sort((a, b) => b.downloadCount - a.downloadCount)
        break
      default:
        // Default: featured first, then by downloads
        agents.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.downloadCount - a.downloadCount
        })
    }
    
    return agents
  }

  /**
   * Increment download count
   */
  static incrementDownloads(id: string): void {
    const agent = this.getAgent(id)
    if (agent) {
      this.updateAgent(id, {
        downloadCount: agent.downloadCount + 1
      })
    }
  }

  /**
   * Rate agent
   */
  static rateAgent(id: string, rating: number): boolean {
    const agent = this.getAgent(id)
    if (!agent || rating < 1 || rating > 5) return false
    
    const newRating = ((agent.rating * agent.reviewCount) + rating) / (agent.reviewCount + 1)
    
    this.updateAgent(id, {
      rating: Math.round(newRating * 10) / 10,
      reviewCount: agent.reviewCount + 1
    })
    
    return true
  }

  /**
   * Fork agent (create a copy)
   */
  static forkAgent(id: string, newName: string, newAuthor: string): MarketplaceAgent | null {
    const original = this.getAgent(id)
    if (!original) return null
    
    const forked: MarketplaceAgent = {
      ...original,
      id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName,
      author: newAuthor,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rating: 0,
      reviewCount: 0,
      downloadCount: 0,
      featured: false
    }
    
    const agents = this.getAllAgents()
    agents.push(forked)
    this.saveAgents(agents)
    
    return forked
  }

  /**
   * Get featured agents
   */
  static getFeaturedAgents(limit: number = 6): MarketplaceAgent[] {
    const agents = this.getAllAgents()
    return agents
      .filter(a => a.featured)
      .sort((a, b) => b.downloadCount - a.downloadCount)
      .slice(0, limit)
  }

  /**
   * Get categories
   */
  static getCategories(): string[] {
    const agents = this.getAllAgents()
    const categories = new Set(agents.map(a => a.category))
    return Array.from(categories).sort()
  }

  /**
   * Get all tags
   */
  static getAllTags(): string[] {
    const agents = this.getAllAgents()
    const tags = new Set<string>()
    agents.forEach(agent => {
      agent.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  /**
   * Save agents to storage
   */
  private static saveAgents(agents: MarketplaceAgent[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
    } catch (error) {
      console.error('Failed to save marketplace agents:', error)
    }
  }

  /**
   * Initialize with sample agents
   */
  static initializeSamples(): void {
    const agents = this.getAllAgents()
    if (agents.length > 0) return // Already initialized
    
    // Sample agents would be added here
    // For now, we'll leave it empty and let users add their own
  }
}
