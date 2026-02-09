/**
 * Agent Registration Endpoint
 * Allows AI agents to register and receive API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { registerAgent, RegisterRequest } from '@/lib/auth/agentAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterRequest;

    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: name and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['claude', 'gpt', 'openclaw', 'custom'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Register agent
    const result = await registerAgent(body);

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
