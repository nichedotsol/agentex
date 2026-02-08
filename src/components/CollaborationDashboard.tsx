'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuildStore } from '@/lib/stores/buildStore'
import { Collaboration, type Team, type SharedBuild, type Comment, type Workspace } from '@/lib/utils/collaboration'
import { SkeletonList } from './SkeletonLoader'

interface CollaborationDashboardProps {
  onClose: () => void
  onLoadBuild?: (build: SharedBuild) => void
}

type Tab = 'teams' | 'workspaces' | 'shared' | 'comments'

export default function CollaborationDashboard({ onClose, onLoadBuild }: CollaborationDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('teams')
  const [teams, setTeams] = useState<Team[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [sharedBuilds, setSharedBuilds] = useState<SharedBuild[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('')
  
  // Form states
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [workspaceDescription, setWorkspaceDescription] = useState('')
  const [shareTeamId, setShareTeamId] = useState('')
  const [sharePermissions, setSharePermissions] = useState<'view' | 'edit' | 'admin'>('view')

  const buildState = useBuildStore()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = () => {
    setLoading(true)
    setTeams(Collaboration.getTeams())
    setWorkspaces(Collaboration.getWorkspaces())
    setSharedBuilds(Collaboration.getSharedBuilds())
    setComments(Collaboration.getAllComments())
    setLoading(false)
  }

  const handleCreateTeam = () => {
    if (!teamName.trim()) return

    const ownerId = 'user_' + Date.now() // In real app, get from auth
    const ownerName = buildState.settings.author || 'You'
    const ownerEmail = 'user@example.com' // In real app, get from auth

    Collaboration.createTeam(teamName, teamDescription, ownerId, ownerName, ownerEmail)
    setTeamName('')
    setTeamDescription('')
    setShowCreateTeam(false)
    loadData()
  }

  const handleCreateWorkspace = () => {
    if (!workspaceName.trim() || !selectedTeam) return

    Collaboration.createWorkspace(workspaceName, workspaceDescription, selectedTeam)
    setWorkspaceName('')
    setWorkspaceDescription('')
    setSelectedTeam('')
    setShowCreateWorkspace(false)
    loadData()
  }

  const handleShare = () => {
    if (!shareTeamId) return

    const sharedBy = buildState.settings.author || 'Anonymous'
    Collaboration.shareBuild(buildState, sharedBy, shareTeamId, sharePermissions)
    setShareTeamId('')
    setSharePermissions('view')
    setShowShareDialog(false)
    loadData()
  }

  const handleLoadShared = (shared: SharedBuild) => {
    if (onLoadBuild) {
      onLoadBuild(shared)
    }
    onClose()
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
          className="relative glass-panel max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-ax-border flex items-center justify-between">
            <div>
              <h2 className="font-sans text-xl font-semibold text-ax-text mb-1">
                Collaboration
              </h2>
              <p className="font-sans text-sm text-ax-text-secondary">
                Teams, workspaces, shared builds, and comments
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-ax-border hover:border-ax-error hover:bg-ax-error/20 flex items-center justify-center transition-all micro-bounce"
            >
              <span className="text-ax-text">×</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="p-6 border-b border-ax-border">
            <div className="flex gap-2">
              {(['teams', 'workspaces', 'shared', 'comments'] as Tab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-sans text-sm rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-ax-primary text-white'
                      : 'bg-ax-bg text-ax-text-secondary hover:bg-ax-bg-hover'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <SkeletonList count={3} />
            ) : (
              <>
                {/* Teams Tab */}
                {activeTab === 'teams' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-sans text-lg font-semibold text-ax-text">Teams</h3>
                      <button
                        onClick={() => setShowCreateTeam(true)}
                        className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all micro-bounce"
                      >
                        Create Team
                      </button>
                    </div>
                    {teams.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">👥</div>
                        <p className="font-sans text-sm text-ax-text-secondary mb-4">
                          No teams yet
                        </p>
                        <button
                          onClick={() => setShowCreateTeam(true)}
                          className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all"
                        >
                          Create Your First Team
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map((team, i) => (
                          <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="card-hover p-5"
                          >
                            <h4 className="font-sans text-base font-semibold text-ax-text mb-2">
                              {team.name}
                            </h4>
                            {team.description && (
                              <p className="font-sans text-sm text-ax-text-secondary mb-3">
                                {team.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-ax-text-tertiary">
                              <span>{team.members.length} members</span>
                              <span>{formatDate(team.createdAt)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Workspaces Tab */}
                {activeTab === 'workspaces' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-sans text-lg font-semibold text-ax-text">Workspaces</h3>
                      <button
                        onClick={() => setShowCreateWorkspace(true)}
                        className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all micro-bounce"
                      >
                        Create Workspace
                      </button>
                    </div>
                    {workspaces.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">📁</div>
                        <p className="font-sans text-sm text-ax-text-secondary mb-4">
                          No workspaces yet
                        </p>
                        <button
                          onClick={() => setShowCreateWorkspace(true)}
                          className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all"
                        >
                          Create Your First Workspace
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {workspaces.map((workspace, i) => (
                          <motion.div
                            key={workspace.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="card-hover p-5"
                          >
                            <h4 className="font-sans text-base font-semibold text-ax-text mb-2">
                              {workspace.name}
                            </h4>
                            {workspace.description && (
                              <p className="font-sans text-sm text-ax-text-secondary mb-3">
                                {workspace.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-ax-text-tertiary">
                              <span>{workspace.builds.length} builds</span>
                              <span>{formatDate(workspace.createdAt)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Shared Builds Tab */}
                {activeTab === 'shared' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-sans text-lg font-semibold text-ax-text">Shared Builds</h3>
                      <button
                        onClick={() => setShowShareDialog(true)}
                        className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all micro-bounce"
                      >
                        Share Current Build
                      </button>
                    </div>
                    {sharedBuilds.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">🔗</div>
                        <p className="font-sans text-sm text-ax-text-secondary mb-4">
                          No shared builds yet
                        </p>
                        <button
                          onClick={() => setShowShareDialog(true)}
                          className="px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover transition-all"
                        >
                          Share Your First Build
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sharedBuilds.map((shared, i) => (
                          <motion.div
                            key={shared.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="card-hover p-5"
                          >
                            <h4 className="font-sans text-base font-semibold text-ax-text mb-2">
                              {shared.buildState.settings.name}
                            </h4>
                            <p className="font-sans text-sm text-ax-text-secondary mb-3">
                              Shared by {shared.sharedBy}
                            </p>
                            <div className="flex items-center justify-between text-xs text-ax-text-tertiary mb-3">
                              <span>{formatDate(shared.sharedAt)}</span>
                              <span className="px-2 py-0.5 bg-ax-bg-elevated rounded">
                                {shared.permissions}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleLoadShared(shared)}
                                className="flex-1 px-3 py-2 bg-ax-primary text-white rounded-lg font-sans text-xs font-medium hover:bg-ax-primary-hover transition-all"
                              >
                                Load
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Comments Tab */}
                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <h3 className="font-sans text-lg font-semibold text-ax-text mb-4">Comments</h3>
                    {comments.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-4 opacity-30">💬</div>
                        <p className="font-sans text-sm text-ax-text-secondary">
                          No comments yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment, i) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`card p-4 ${comment.resolved ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className="font-sans text-sm font-semibold text-ax-text">
                                  {comment.authorName}
                                </span>
                                <span className="font-sans text-xs text-ax-text-tertiary ml-2">
                                  {formatDate(comment.timestamp)}
                                </span>
                              </div>
                              {comment.resolved && (
                                <span className="px-2 py-0.5 bg-ax-success/20 text-ax-success text-xs font-sans rounded">
                                  Resolved
                                </span>
                              )}
                            </div>
                            <p className="font-sans text-sm text-ax-text-secondary mb-2">
                              {comment.content}
                            </p>
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-4 mt-2 space-y-2 border-l-2 border-ax-border pl-4">
                                {comment.replies.map(reply => (
                                  <div key={reply.id} className="text-sm">
                                    <span className="font-sans text-xs font-semibold text-ax-text">
                                      {reply.authorName}
                                    </span>
                                    <span className="font-sans text-xs text-ax-text-tertiary ml-2">
                                      {formatDate(reply.timestamp)}
                                    </span>
                                    <p className="font-sans text-xs text-ax-text-secondary mt-1">
                                      {reply.content}
                                    </p>
                                  </div>
                                ))}
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

      {/* Create Team Dialog */}
      <AnimatePresence>
        {showCreateTeam && (
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
                Create Team
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="My Team"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    placeholder="Team description..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateTeam(false)
                      setTeamName('')
                      setTeamDescription('')
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTeam}
                    disabled={!teamName.trim()}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Workspace Dialog */}
      <AnimatePresence>
        {showCreateWorkspace && (
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
                Create Workspace
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Workspace Name</label>
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="My Workspace"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Team</label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select a team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    placeholder="Workspace description..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCreateWorkspace(false)
                      setWorkspaceName('')
                      setWorkspaceDescription('')
                      setSelectedTeam('')
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateWorkspace}
                    disabled={!workspaceName.trim() || !selectedTeam}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Create
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Dialog */}
      <AnimatePresence>
        {showShareDialog && (
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
                Share Build
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Team</label>
                  <select
                    value={shareTeamId}
                    onChange={(e) => setShareTeamId(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select a team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Permissions</label>
                  <select
                    value={sharePermissions}
                    onChange={(e) => setSharePermissions(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Edit</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowShareDialog(false)
                      setShareTeamId('')
                      setSharePermissions('view')
                    }}
                    className="flex-1 px-4 py-2 bg-ax-bg text-ax-text-secondary rounded-lg font-sans text-sm hover:bg-ax-bg-hover transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleShare}
                    disabled={!shareTeamId}
                    className="flex-1 px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Share
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
