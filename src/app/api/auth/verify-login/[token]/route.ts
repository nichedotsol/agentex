/**
 * Verify Login Token Endpoint
 * Verifies a login token and creates a session
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyLoginToken } from '@/lib/auth/agentAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // Verify login token
    const agent = verifyLoginToken(token);

    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid or expired login link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Generate session token (for client-side storage)
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Return agent info (without sensitive data)
    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        type: agent.type
      },
      sessionToken
    });
  } catch (error) {
    console.error('Verify login token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
