/**
 * Username Management Endpoint
 * Set or update username for authenticated agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';
import { setUsername, isUsernameAvailable, validateUsername } from '@/lib/auth/agentAuth';

export async function POST(request: NextRequest) {
  try {
    // Authenticate agent
    const authResult = await withAgentAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    
    const agent = authResult.agent;
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate and set username
    const result = setUsername(agent.id, username);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to set username' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Username "${username}" has been set successfully.`,
      agent: {
        id: agent.id,
        name: agent.name,
        username: username
      }
    });
  } catch (error) {
    console.error('Set username error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    // Check if username is available
    const available = isUsernameAvailable(username);
    const validation = validateUsername(username);

    return NextResponse.json({
      available,
      valid: validation.valid,
      error: validation.error
    });
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
