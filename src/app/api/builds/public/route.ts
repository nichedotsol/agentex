/**
 * Get Public Builds
 * Returns all public builds for the community feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBuildStatus } from '@/lib/utils/build-store';
import { getAgentBuildIds, getAgentCollaborations } from '@/lib/utils/agent-builds';
import { getAgentById } from '@/lib/auth/agentAuth';
import { getBuildGitHubRepo } from '@/lib/integrations/github';
import { getBuildMoltHubRepo } from '@/lib/integrations/molthub';

// In-memory stores for votes and comments (replace with database)
const buildVotes = (globalThis as any).__agentex_build_votes__ || new Map<string, Map<string, 'up' | 'down'>>();
const buildComments = (globalThis as any).__agentex_build_comments__ || new Map<string, any[]>();
const collaborationMessages = (globalThis as any).__agentex_collab_messages__ || new Map<string, any[]>();
(globalThis as any).__agentex_build_votes__ = buildVotes;
(globalThis as any).__agentex_build_comments__ = buildComments;
(globalThis as any).__agentex_collab_messages__ = collaborationMessages;

export async function GET(request: NextRequest) {
  try {
    // Get all agent IDs from the agent store
    const allAgentIds = Array.from((globalThis as any).__agentex_agent_store__?.keys() || []) as string[];
    
    // Collect all builds from all agents
    const allBuilds: any[] = [];
    
    for (const agentId of allAgentIds) {
      const buildIds = getAgentBuildIds(agentId);
      const agent = getAgentById(agentId);
      
      for (const buildId of buildIds) {
        const build = getBuildStatus(buildId);
        if (build) {
          // Get votes
          const votes = buildVotes.get(buildId) || new Map();
          let upvotes = 0;
          let downvotes = 0;
          for (const vote of votes.values()) {
            if (vote === 'up') upvotes++;
            else downvotes++;
          }
          
          // Get comment count
          const comments = buildComments.get(buildId) || [];
          
          // Get collaborators from build config or collaborations
          const collabs = getAgentCollaborations(agentId).filter(c => c.buildId === buildId);
          const collaboratorIds = collabs.map(c => c.agentId || c.agent).filter(id => id && id !== agentId);
          const collaborators = collaboratorIds.map(id => {
            const collabAgent = getAgentById(id);
            return collabAgent?.name || 'Unknown';
          });
          
          // Get GitHub and MoltHub repos
          const githubRepo = getBuildGitHubRepo(build.buildId);
          const molthubRepo = getBuildMoltHubRepo(build.buildId);
          
          allBuilds.push({
            buildId: build.buildId,
            name: build.config?.settings?.name || build.buildId,
            description: build.config?.settings?.description,
            status: build.status,
            progress: build.progress,
            createdAt: build.createdAt,
            updatedAt: build.updatedAt,
            agentId: agentId,
            agentName: agent?.name || 'Unknown',
            agentType: agent?.type || 'unknown',
            upvotes,
            downvotes,
            commentCount: comments.length,
            collaborators,
            isCollaboration: collaborators.length > 0,
            githubRepo: githubRepo ? {
              owner: githubRepo.owner,
              repo: githubRepo.repo,
              url: githubRepo.url
            } : undefined,
            molthubRepo: molthubRepo ? {
              agentId: molthubRepo.agentId,
              repoId: molthubRepo.repoId,
              url: molthubRepo.url,
              name: molthubRepo.name
            } : undefined
          });
        }
      }
    }
    
    // Sort by updatedAt (most recent first)
    allBuilds.sort((a, b) => b.updatedAt - a.updatedAt);
    
    return NextResponse.json({ builds: allBuilds });
  } catch (error) {
    console.error('Error fetching public builds:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
