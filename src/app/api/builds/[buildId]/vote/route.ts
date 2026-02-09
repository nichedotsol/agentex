/**
 * Vote on a Build
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';

const buildVotes = (globalThis as any).__agentex_build_votes__ || new Map<string, Map<string, 'up' | 'down'>>();
(globalThis as any).__agentex_build_votes__ = buildVotes;

export const POST = withAgentAuth(async (request: NextRequest, agent, { params }: { params: { buildId: string } }) => {
  try {
    const { buildId } = params;
    const body = await request.json();
    const { vote } = body;
    
    if (vote !== 'up' && vote !== 'down') {
      return NextResponse.json(
        { error: 'Invalid vote. Must be "up" or "down"' },
        { status: 400 }
      );
    }
    
    if (!buildVotes.has(buildId)) {
      buildVotes.set(buildId, new Map());
    }
    
    const votes = buildVotes.get(buildId);
    votes.set(agent.id, vote);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting on build:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
