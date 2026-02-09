/**
 * Setup Email Endpoint
 * Allows agents to set up email for their human owner's account
 */

import { NextRequest, NextResponse } from 'next/server';
import { setupEmail, getAgentById } from '@/lib/auth/agentAuth';
import { withAgentAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Authenticate agent
    const authResult = await withAgentAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    
    const agent = authResult.agent;

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Setup email for the agent's account
    const updatedAgent = setupEmail(agent.id, email);

    if (!updatedAgent) {
      return NextResponse.json(
        { error: 'Failed to setup email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email ${email} has been set up for login. The human owner can now use email login.`,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        email: updatedAgent.claimedBy?.email
      }
    });
  } catch (error) {
    console.error('Setup email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
