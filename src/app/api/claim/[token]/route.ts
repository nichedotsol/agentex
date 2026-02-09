/**
 * Claim Token Endpoint
 * Returns claim information for a given token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByClaimToken } from '@/lib/auth/agentAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const agent = getAgentByClaimToken(token);

    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid claim token' },
        { status: 404 }
      );
    }

    // Return agent info (without sensitive data)
    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type,
        claimed: !!agent.claimedBy
      },
      claimToken: token
    });
  } catch (error) {
    console.error('Claim token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
