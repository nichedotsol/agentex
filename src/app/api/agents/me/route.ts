/**
 * Get Current Agent Info
 * Returns information about the authenticated agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate agent
    const authResult = await withAgentAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    
    const agent = authResult.agent;
    
    // Return agent info without sensitive data
    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      username: agent.username,
      type: agent.type,
      metadata: agent.metadata,
      createdAt: agent.createdAt,
      lastActiveAt: agent.lastActiveAt,
      usage: agent.usage,
      rateLimit: agent.rateLimit
    });
  } catch (error) {
    console.error('Error fetching agent info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
