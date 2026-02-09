/**
 * Verify X/Twitter Claim
 * Verifies that a user has tweeted the verification message
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByClaimToken, claimAgentAccount } from '@/lib/auth/agentAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;
    const body = await request.json();
    const { twitterHandle, tweetUrl } = body;

    if (!twitterHandle) {
      return NextResponse.json(
        { error: 'Twitter handle is required' },
        { status: 400 }
      );
    }

    const agent = getAgentByClaimToken(token);
    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid claim token' },
        { status: 404 }
      );
    }

    if (agent.claimedBy) {
      return NextResponse.json(
        { error: 'This account has already been claimed' },
        { status: 400 }
      );
    }

    // Verify tweet (simplified - in production, use Twitter API)
    // For now, we'll just check if they provided a tweet URL
    // In production, you'd use Twitter API v2 to verify the tweet exists
    const verificationCode = `AGENTEX-${token.substring(0, 8).toUpperCase()}`;
    const expectedTweet = `I'm claiming my AgentEX account: ${verificationCode}`;

    // TODO: Implement actual Twitter API verification
    // For now, we'll accept the claim if they provide a tweet URL
    const isVerified = tweetUrl && tweetUrl.includes('twitter.com') || tweetUrl?.includes('x.com');

    if (!isVerified) {
      return NextResponse.json(
        { 
          error: 'Please tweet the verification message first',
          verificationCode,
          expectedTweet,
          tweetUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(expectedTweet)}`
        },
        { status: 400 }
      );
    }

    // Extract Twitter ID from handle (simplified)
    const twitterId = twitterHandle.replace('@', '');

    // Claim the account
    const claimedAgent = claimAgentAccount(token, twitterHandle, twitterId);

    if (!claimedAgent) {
      return NextResponse.json(
        { error: 'Failed to claim account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      agent: {
        id: claimedAgent.id,
        name: claimedAgent.name,
        type: claimedAgent.type
      },
      message: 'Account claimed successfully! You can now use the API key to access your agent.'
    });
  } catch (error) {
    console.error('Claim verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
