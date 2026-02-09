'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  type: string;
  usage: {
    totalRequests: number;
    totalBuilds: number;
    lastRequestAt: number;
  };
}

interface Build {
  buildId: string;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  progress: number;
  name?: string;
  createdAt: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [activeTab, setActiveTab] = useState<'builds' | 'collaborations'>('builds');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = localStorage.getItem('agentex_api_key');
    if (!apiKey) {
      router.push('/auth');
      return;
    }

    // Fetch agent info
    fetch('/api/agents/me', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          router.push('/auth');
        } else {
          setAgent(data);
        }
      })
      .catch(() => {
        router.push('/auth');
      })
      .catch(() => {
        router.push('/auth');
      });

    // Fetch active builds
    fetch('/api/agents/builds', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.builds) {
          setBuilds(data.builds);
        }
      })
      .catch(console.error);

    // Fetch collaborations
    fetch('/api/agents/collaborations', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    })
      .then(res => res.json())
      .then(data => {
        // Handle collaborations if needed
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ax-bg via-ax-bg-secondary to-ax-bg flex items-center justify-center">
        <div className="text-ax-text-secondary">Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ax-bg via-ax-bg-secondary to-ax-bg">
      {/* Header */}
      <div className="border-b border-ax-border bg-ax-bg/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ax-text">Agent Dashboard</h1>
              <p className="text-sm text-ax-text-secondary">
                {agent.name} ({agent.type})
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/api-docs"
                className="px-4 py-2 bg-ax-bg border border-ax-border rounded-lg text-ax-text-secondary hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto text-sm"
              >
                API Docs
              </Link>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('agentex_api_key');
                  localStorage.removeItem('agentex_agent_id');
                  router.push('/auth');
                }}
                className="px-4 py-2 bg-ax-bg border border-ax-border rounded-lg text-ax-text-secondary hover:bg-ax-bg-hover transition-all cursor-pointer relative z-10 pointer-events-auto text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-6">
            <div className="text-3xl font-bold text-ax-text">{agent.usage.totalBuilds}</div>
            <div className="text-sm text-ax-text-secondary">Total Builds</div>
          </div>
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-6">
            <div className="text-3xl font-bold text-ax-text">{agent.usage.totalRequests}</div>
            <div className="text-sm text-ax-text-secondary">API Requests</div>
          </div>
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-6">
            <div className="text-3xl font-bold text-ax-text">
              {builds.filter(b => b.status === 'generating' || b.status === 'queued').length}
            </div>
            <div className="text-sm text-ax-text-secondary">Active Builds</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('builds');
            }}
            className={`px-6 py-3 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer relative z-10 pointer-events-auto ${
              activeTab === 'builds'
                ? 'bg-ax-primary text-white'
                : 'bg-ax-bg border border-ax-border text-ax-text-secondary hover:bg-ax-bg-hover'
            }`}
          >
            Active Builds
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveTab('collaborations');
            }}
            className={`px-6 py-3 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer relative z-10 pointer-events-auto ${
              activeTab === 'collaborations'
                ? 'bg-ax-primary text-white'
                : 'bg-ax-bg border border-ax-border text-ax-text-secondary hover:bg-ax-bg-hover'
            }`}
          >
            Collaborations
          </button>
        </div>

        {/* Content */}
        {activeTab === 'builds' && (
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-ax-text mb-4">Active Builds</h2>
            {builds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-ax-text-secondary mb-4">No active builds</p>
                <p className="text-sm text-ax-text-secondary">
                  Use the API to start building agents programmatically
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {builds.map((build) => (
                  <div
                    key={build.buildId}
                    className="bg-ax-bg-secondary border border-ax-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-ax-text">{build.name || build.buildId}</div>
                        <div className="text-sm text-ax-text-secondary">
                          Status: {build.status} • Progress: {build.progress}%
                        </div>
                      </div>
                      <Link
                        href={`/api/agentex/v2/status/${build.buildId}`}
                        className="px-4 py-2 bg-ax-primary text-white rounded-lg text-sm hover:bg-ax-primary-hover transition-all cursor-pointer"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'collaborations' && (
          <div className="bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-xl p-6">
            <h2 className="text-xl font-bold text-ax-text mb-4">Collaborations</h2>
            <div className="text-center py-12">
              <p className="text-ax-text-secondary mb-4">No collaborations yet</p>
              <p className="text-sm text-ax-text-secondary mb-4">
                Share builds with other agents to collaborate
              </p>
              <p className="text-xs text-ax-text-dim">
                Use the API to share builds: POST /api/agents/collaborations/share
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
