import { BuildState } from '@/lib/stores/buildStore'

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  avatar?: string
  joinedAt: number
}

export interface Team {
  id: string
  name: string
  description?: string
  ownerId: string
  members: TeamMember[]
  createdAt: number
  updatedAt: number
}

export interface SharedBuild {
  id: string
  buildId: string
  buildState: BuildState
  sharedBy: string
  sharedAt: number
  teamId?: string
  permissions: 'view' | 'edit' | 'admin'
  comments: Comment[]
}

export interface Comment {
  id: string
  buildId: string
  authorId: string
  authorName: string
  content: string
  timestamp: number
  replies?: Comment[]
  resolved?: boolean
}

export interface Workspace {
  id: string
  name: string
  description?: string
  teamId: string
  builds: string[] // Build IDs
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY_TEAMS = 'agentex-teams'
const STORAGE_KEY_SHARED = 'agentex-shared-builds'
const STORAGE_KEY_COMMENTS = 'agentex-comments'
const STORAGE_KEY_WORKSPACES = 'agentex-workspaces'

/**
 * Collaboration utilities for team workspaces, sharing, and comments
 */
export class Collaboration {
  /**
   * Get all teams
   */
  static getTeams(): Team[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TEAMS)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
    
    return []
  }

  /**
   * Create a new team
   */
  static createTeam(name: string, description: string, ownerId: string, ownerName: string, ownerEmail: string): Team {
    const teams = this.getTeams()
    
    const team: Team = {
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      ownerId,
      members: [{
        id: ownerId,
        name: ownerName,
        email: ownerEmail,
        role: 'owner',
        joinedAt: Date.now()
      }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    teams.push(team)
    this.saveTeams(teams)
    
    return team
  }

  /**
   * Get team by ID
   */
  static getTeam(teamId: string): Team | null {
    const teams = this.getTeams()
    return teams.find(t => t.id === teamId) || null
  }

  /**
   * Add member to team
   */
  static addTeamMember(teamId: string, member: Omit<TeamMember, 'joinedAt'>): boolean {
    const teams = this.getTeams()
    const team = teams.find(t => t.id === teamId)
    
    if (!team) return false
    
    team.members.push({
      ...member,
      joinedAt: Date.now()
    })
    team.updatedAt = Date.now()
    
    this.saveTeams(teams)
    return true
  }

  /**
   * Remove member from team
   */
  static removeTeamMember(teamId: string, memberId: string): boolean {
    const teams = this.getTeams()
    const team = teams.find(t => t.id === teamId)
    
    if (!team) return false
    
    team.members = team.members.filter(m => m.id !== memberId)
    team.updatedAt = Date.now()
    
    this.saveTeams(teams)
    return true
  }

  /**
   * Share build
   */
  static shareBuild(
    buildState: BuildState,
    sharedBy: string,
    teamId?: string,
    permissions: 'view' | 'edit' | 'admin' = 'view'
  ): SharedBuild {
    const shared = this.getSharedBuilds()
    
    const sharedBuild: SharedBuild = {
      id: `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buildId: `build_${Date.now()}`,
      buildState: JSON.parse(JSON.stringify(buildState)), // Deep clone
      sharedBy,
      sharedAt: Date.now(),
      teamId,
      permissions,
      comments: []
    }
    
    shared.push(sharedBuild)
    this.saveSharedBuilds(shared)
    
    return sharedBuild
  }

  /**
   * Get shared builds
   */
  static getSharedBuilds(teamId?: string): SharedBuild[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SHARED)
      if (stored) {
        const all = JSON.parse(stored)
        return teamId ? all.filter((b: SharedBuild) => b.teamId === teamId) : all
      }
    } catch (error) {
      console.error('Failed to load shared builds:', error)
    }
    
    return []
  }

  /**
   * Get shared build by ID
   */
  static getSharedBuild(id: string): SharedBuild | null {
    const shared = this.getSharedBuilds()
    return shared.find(b => b.id === id) || null
  }

  /**
   * Add comment to build
   */
  static addComment(
    buildId: string,
    authorId: string,
    authorName: string,
    content: string,
    parentId?: string
  ): Comment {
    const comments = this.getAllComments()
    
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      buildId,
      authorId,
      authorName,
      content,
      timestamp: Date.now(),
      replies: [],
      resolved: false
    }
    
    if (parentId) {
      // Add as reply
      const parent = comments.find(c => c.id === parentId)
      if (parent) {
        if (!parent.replies) parent.replies = []
        parent.replies.push(comment)
      }
    } else {
      comments.push(comment)
    }
    
    // Also add to shared build if it exists
    const shared = this.getSharedBuilds()
    const sharedBuild = shared.find(b => b.buildId === buildId)
    if (sharedBuild) {
      if (parentId) {
        const parent = sharedBuild.comments.find(c => c.id === parentId)
        if (parent) {
          if (!parent.replies) parent.replies = []
          parent.replies.push(comment)
        }
      } else {
        sharedBuild.comments.push(comment)
      }
      this.saveSharedBuilds(shared)
    }
    
    this.saveComments(comments)
    
    return comment
  }

  /**
   * Get comments for a build
   */
  static getComments(buildId: string): Comment[] {
    const comments = this.getAllComments()
    return comments.filter(c => c.buildId === buildId && !c.replies) // Only top-level comments
  }

  /**
   * Get all comments
   */
  static getAllComments(): Comment[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMMENTS)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
    
    return []
  }

  /**
   * Resolve comment
   */
  static resolveComment(commentId: string): boolean {
    const comments = this.getAllComments()
    const comment = comments.find(c => c.id === commentId)
    
    if (!comment) return false
    
    comment.resolved = true
    this.saveComments(comments)
    
    return true
  }

  /**
   * Create workspace
   */
  static createWorkspace(name: string, description: string, teamId: string): Workspace {
    const workspaces = this.getWorkspaces()
    
    const workspace: Workspace = {
      id: `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      teamId,
      builds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    workspaces.push(workspace)
    this.saveWorkspaces(workspaces)
    
    return workspace
  }

  /**
   * Get workspaces
   */
  static getWorkspaces(teamId?: string): Workspace[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WORKSPACES)
      if (stored) {
        const all = JSON.parse(stored)
        return teamId ? all.filter((w: Workspace) => w.teamId === teamId) : all
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    }
    
    return []
  }

  /**
   * Add build to workspace
   */
  static addBuildToWorkspace(workspaceId: string, buildId: string): boolean {
    const workspaces = this.getWorkspaces()
    const workspace = workspaces.find(w => w.id === workspaceId)
    
    if (!workspace) return false
    
    if (!workspace.builds.includes(buildId)) {
      workspace.builds.push(buildId)
      workspace.updatedAt = Date.now()
      this.saveWorkspaces(workspaces)
    }
    
    return true
  }

  /**
   * Remove build from workspace
   */
  static removeBuildFromWorkspace(workspaceId: string, buildId: string): boolean {
    const workspaces = this.getWorkspaces()
    const workspace = workspaces.find(w => w.id === workspaceId)
    
    if (!workspace) return false
    
    workspace.builds = workspace.builds.filter(id => id !== buildId)
    workspace.updatedAt = Date.now()
    this.saveWorkspaces(workspaces)
    
    return true
  }

  /**
   * Save teams
   */
  private static saveTeams(teams: Team[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_TEAMS, JSON.stringify(teams))
    } catch (error) {
      console.error('Failed to save teams:', error)
    }
  }

  /**
   * Save shared builds
   */
  private static saveSharedBuilds(shared: SharedBuild[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_SHARED, JSON.stringify(shared))
    } catch (error) {
      console.error('Failed to save shared builds:', error)
    }
  }

  /**
   * Save comments
   */
  private static saveComments(comments: Comment[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(comments))
    } catch (error) {
      console.error('Failed to save comments:', error)
    }
  }

  /**
   * Save workspaces
   */
  private static saveWorkspaces(workspaces: Workspace[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(workspaces))
    } catch (error) {
      console.error('Failed to save workspaces:', error)
    }
  }
}
