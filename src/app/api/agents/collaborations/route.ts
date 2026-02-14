/**
 * Get Collaborations for Authenticated Agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';
import { getAgentCollaborations } from '@/lib/utils/agent-builds';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Authenticate agent
    const authResult = await withAgentAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    
    const agent = authResult.agent;
    
    // Get collaborations for this agent
    const agentCollaborations = getAgentCollaborations(agent.id);
    
    return NextResponse.json({ 
      collaborations: agentCollaborations,
      total: agentCollaborations.length
    });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
