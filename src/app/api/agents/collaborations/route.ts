/**
 * Get Collaborations for Authenticated Agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';
import { getAgentCollaborations } from '@/lib/utils/agent-builds';

export const GET = withAgentAuth(async (request: NextRequest, agent) => {
  // Get collaborations for this agent
  const agentCollaborations = getAgentCollaborations(agent.id);
  
  return NextResponse.json({ 
    collaborations: agentCollaborations,
    total: agentCollaborations.length
  });
});
