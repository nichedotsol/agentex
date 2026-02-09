/**
 * Vote on a Build
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';
import { checkVoteSpam } from '@/lib/auth/agentAuth';

const buildVotes = (globalThis as any).__agentex_build_votes__ || new Map<string, Map<string, 'up' | 'down'>>();
(globalThis as any).__agentex_build_votes__ = buildVotes;

export async function POST(
  request: NextRequest,
  { params }: { params: { buildId: string } }
) {
  try {
    // Authenticate agent
    const authResult = await withAgentAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    
    const agent = authResult.agent;
    const { buildId } = params;
    const body = await request.json();
    const { vote } = body;
    
    if (vote !== 'up' && vote !== 'down') {
      return NextResponse.json(
        { error: 'Invalid vote. Must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Check spam protection
    const spamCheck = checkVoteSpam(agent.id);
    if (!spamCheck.allowed) {
      return NextResponse.json(
        { 
          error: spamCheck.error || 'Rate limit exceeded',
          retryAfter: spamCheck.retryAfter
        },
        { status: 429 }
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
}
