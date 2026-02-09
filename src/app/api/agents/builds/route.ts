/**
 * Get Active Builds for Authenticated Agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';
import { getBuildStatus } from '@/lib/utils/build-store';
import { getAgentBuildIds } from '@/lib/utils/agent-builds';

export const GET = withAgentAuth(async (request: NextRequest, agent) => {
  // Get all builds for this agent
  const buildIds = getAgentBuildIds(agent.id);
  
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
