/**
 * Get Collaborations for Authenticated Agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';

// In-memory store for collaborations (replace with database)
const collaborations = (globalThis as any).__agentex_collaborations__ || new Map<string, any[]>();
(globalThis as any).__agentex_collaborations__ = collaborations;

export const GET = withAgentAuth(async (request: NextRequest, agent) => {
  // Get collaborations for this agent
  const agentCollaborations = collaborations.get(agent.id) || [];
  
  return NextResponse.json({ 
    collaborations: agentCollaborations,
    total: agentCollaborations.length
  });
});

/**
 * Add a collaboration
 */
export function addCollaboration(agentId: string, collaboration: any) {
  const collabs = collaborations.get(agentId) || [];
  collabs.push({
    ...collaboration,
    id: `collab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: Date.now()
  });
  collaborations.set(agentId, collabs);
}
