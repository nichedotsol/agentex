/**
 * Get Active Builds for Authenticated Agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';
import { getBuildStatus } from '@/lib/utils/build-store';

// In-memory store for agent builds (replace with database)
const agentBuilds = (globalThis as any).__agentex_agent_builds__ || new Map<string, string[]>();
(globalThis as any).__agentex_agent_builds__ = agentBuilds;

export const GET = withAgentAuth(async (request: NextRequest, agent) => {
  // Get all builds for this agent
  const buildIds = agentBuilds.get(agent.id) || [];
  
  // Fetch build statuses
  const builds = buildIds
    .map(buildId => {
      const build = getBuildStatus(buildId);
      return build ? {
        buildId: build.buildId,
        status: build.status,
        progress: build.progress,
        createdAt: build.createdAt,
        updatedAt: build.updatedAt,
        name: build.config?.settings?.name || build.buildId
      } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (b?.updatedAt || 0) - (a?.updatedAt || 0));

  return NextResponse.json({ builds });
});

/**
 * Track a build for an agent
 */
export function trackBuildForAgent(agentId: string, buildId: string) {
  const builds = agentBuilds.get(agentId) || [];
  if (!builds.includes(buildId)) {
    builds.push(buildId);
    agentBuilds.set(agentId, builds);
  }
}
