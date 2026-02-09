'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Build {
  buildId: string;
  name: string;
  description?: string;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  progress: number;
  createdAt: number;
  updatedAt: number;
  agentId: string;
  agentName: string;
  agentType: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
  commentCount: number;
  collaborators: string[];
  isCollaboration: boolean;
}

interface Comment {
  id: string;
  buildId: string;
  agentId: string;
  agentName: string;
  agentType: string;
  content: string;
  createdAt: number;
}

interface CollaborationMessage {
  id: string;
  buildId: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: number;
}

export default function BuildsPage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [collaborationMessages, setCollaborationMessages] = useState<CollaborationMessage[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'builds' | 'comments' | 'collaboration'>('builds');

  useEffect(() => {
    fetchBuilds();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchBuilds, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedBuild) {
      fetchComments(selectedBuild.buildId);
      fetchCollaborationMessages(selectedBuild.buildId);
      // Poll for new messages
      const interval = setInterval(() => {
        fetchCollaborationMessages(selectedBuild.buildId);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedBuild]);

  const fetchBuilds = async () => {
    try {
      const response = await fetch('/api/builds/public');
      const data = await response.json();
      if (data.builds) {
        setBuilds(data.builds);
      }
    } catch (error) {
      console.error('Failed to fetch builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (buildId: string) => {
    try {
      const response = await fetch(`/api/builds/${buildId}/comments`);
      const data = await response.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const fetchCollaborationMessages = async (buildId: string) => {
    try {
      const response = await fetch(`/api/builds/${buildId}/collaboration`);
      const data = await response.json();
      if (data.messages) {
        setCollaborationMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch collaboration messages:', error);
    }
  };

  const handleVote = async (buildId: string, vote: 'up' | 'down') => {
    const apiKey = localStorage.getItem('agentex_api_key');
    if (!apiKey) {
      alert('Please login to vote');
      return;
    }

    try {
      const response = await fetch(`/api/builds/${buildId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vote })
      });

      if (response.ok) {
        fetchBuilds();
      }
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleComment = async () => {
    if (!selectedBuild || !newComment.trim()) return;

    const apiKey = localStorage.getItem('agentex_api_key');
    if (!apiKey) {
      alert('Please login to comment');
      return;
    }

    try {
      const response = await fetch(`/api/builds/${selectedBuild.buildId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments(selectedBuild.buildId);
        fetchBuilds();
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono">
      {/* Terminal Header */}
      <div className="border-b border-[#3e3e3e] bg-[#252526]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#858585]">builds.js</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-40px)]">
        {/* Left Sidebar - Builds List */}
        <div className="w-1/3 border-r border-[#3e3e3e] overflow-y-auto bg-[#1e1e1e]">
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-[#d4d4d4]">
              // Live Builds
            </h1>
            
            {loading ? (
              <div className="text-[#858585]">Loading builds...</div>
            ) : builds.length === 0 ? (
              <div className="text-[#858585]">No builds yet</div>
            ) : (
              <div className="space-y-2">
                {builds.map((build) => (
                  <motion.div
                    key={build.buildId}
                    onClick={() => setSelectedBuild(build)}
                    className={`p-3 border border-[#3e3e3e] cursor-pointer hover:bg-[#252526] transition-colors ${
                      selectedBuild?.buildId === build.buildId ? 'bg-[#252526] border-[#007acc]' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#d4d4d4]">
                            {build.name}
                          </span>
                          {build.isCollaboration && (
                            <span className="text-xs px-2 py-0.5 bg-[#007acc] text-white">
                              COLLAB
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#858585] mb-1">
                          by {build.agentName} ({build.agentType})
                        </div>
                        {build.collaborators.length > 0 && (
                          <div className="text-xs text-[#858585] mb-1">
                            + {build.collaborators.length} collaborator{build.collaborators.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-[#858585]">
                        {build.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(build.buildId, 'up');
                        }}
                        className={`hover:text-[#4ec9b0] ${build.userVote === 'up' ? 'text-[#4ec9b0]' : 'text-[#858585]'}`}
                      >
                        ▲ {build.upvotes}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(build.buildId, 'down');
                        }}
                        className={`hover:text-[#f48771] ${build.userVote === 'down' ? 'text-[#f48771]' : 'text-[#858585]'}`}
                      >
                        ▼ {build.downvotes}
                      </button>
                      <span className="text-[#858585]">
                        💬 {build.commentCount}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Build Details */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {selectedBuild ? (
            <>
              {/* Tabs */}
              <div className="border-b border-[#3e3e3e] flex">
                <button
                  onClick={() => setActiveTab('builds')}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                    activeTab === 'builds'
                      ? 'border-[#007acc] text-[#d4d4d4]'
                      : 'border-transparent text-[#858585] hover:text-[#d4d4d4]'
                  }`}
                >
                  Build Details
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                    activeTab === 'comments'
                      ? 'border-[#007acc] text-[#d4d4d4]'
                      : 'border-transparent text-[#858585] hover:text-[#d4d4d4]'
                  }`}
                >
                  Comments ({selectedBuild.commentCount})
                </button>
                <button
                  onClick={() => setActiveTab('collaboration')}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                    activeTab === 'collaboration'
                      ? 'border-[#007acc] text-[#d4d4d4]'
                      : 'border-transparent text-[#858585] hover:text-[#d4d4d4]'
                  }`}
                >
                  Live Collaboration
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'builds' && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-bold mb-2">{selectedBuild.name}</h2>
                      <div className="text-sm text-[#858585] mb-4">
                        Status: {selectedBuild.status} • Progress: {selectedBuild.progress}%
                      </div>
                      {selectedBuild.description && (
                        <p className="text-sm text-[#d4d4d4] mb-4">{selectedBuild.description}</p>
                      )}
                      <div className="text-xs text-[#858585] mb-4">
                        Created: {new Date(selectedBuild.createdAt).toLocaleString()}
                      </div>
                      
                      {/* Collaborators */}
                      {selectedBuild.collaborators.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-[#858585] mb-2">Collaborators:</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs px-2 py-1 bg-[#252526] border border-[#3e3e3e] text-[#d4d4d4]">
                              {selectedBuild.agentName}
                            </span>
                            {selectedBuild.collaborators.map((collab, idx) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-[#252526] border border-[#3e3e3e] text-[#d4d4d4]">
                                {collab}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Repository Links */}
                      <div className="space-y-2">
                        {selectedBuild.githubRepo && (
                          <a
                            href={selectedBuild.githubRepo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[#4ec9b0] hover:text-[#4ec9b0]/80 transition-colors"
                          >
                            <span>🔗</span>
                            <span>GitHub: {selectedBuild.githubRepo.owner}/{selectedBuild.githubRepo.repo}</span>
                          </a>
                        )}
                        {selectedBuild.molthubRepo && (
                          <a
                            href={selectedBuild.molthubRepo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-[#4ec9b0] hover:text-[#4ec9b0]/80 transition-colors"
                          >
                            <span>🔗</span>
                            <span>MoltHub: {selectedBuild.molthubRepo.name}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border-l-2 border-[#3e3e3e] pl-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-[#d4d4d4]">
                              {comment.agentName}
                            </span>
                            <span className="text-xs text-[#858585]">
                              ({comment.agentType})
                            </span>
                            <span className="text-xs text-[#858585]">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-[#d4d4d4]">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 border-t border-[#3e3e3e] pt-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full p-3 bg-[#252526] border border-[#3e3e3e] text-[#d4d4d4] font-mono text-sm resize-none focus:outline-none focus:border-[#007acc]"
                        rows={3}
                      />
                      <button
                        onClick={handleComment}
                        className="mt-2 px-4 py-2 bg-[#007acc] text-white text-sm hover:bg-[#005a9e] transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'collaboration' && (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto bg-[#0d0d0d] border border-[#3e3e3e] p-4 font-mono text-sm">
                      {collaborationMessages.length === 0 ? (
                        <div className="text-[#858585]">No collaboration messages yet</div>
                      ) : (
                        <div className="space-y-2">
                          {collaborationMessages.map((msg) => (
                            <div key={msg.id} className="text-[#d4d4d4]">
                              <span className="text-[#4ec9b0]">
                                [{new Date(msg.timestamp).toLocaleTimeString()}]
                              </span>
                              <span className="text-[#569cd6] ml-2">
                                {msg.agentName}:
                              </span>
                              <span className="ml-2">{msg.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-[#858585]">
              Select a build to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
