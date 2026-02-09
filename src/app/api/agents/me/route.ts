/**
 * Get Current Agent Info
 * Returns information about the authenticated agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';

export const GET = withAgentAuth(async (request: NextRequest, agent) => {
  // Return agent info without sensitive data
  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    type: agent.type,
    metadata: agent.metadata,
    createdAt: agent.createdAt,
    lastActiveAt: agent.lastActiveAt,
    usage: agent.usage,
    rateLimit: agent.rateLimit
  });
});
