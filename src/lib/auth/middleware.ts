/**
 * Authentication Middleware for Agent Requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAgent, Agent } from './agentAuth';

/**
 * Extract API key from request
 */
export function extractApiKey(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try X-API-Key header
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Try query parameter (for GET requests)
  const apiKeyParam = request.nextUrl.searchParams.get('apiKey');
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return null;
}

/**
 * Authenticate request and return agent
 */
export async function requireAuth(request: NextRequest): Promise<{ agent: Agent } | { error: Response }> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'API key required. Use Authorization: Bearer <apiKey> header or X-API-Key header.' },
        { status: 401 }
      )
    };
  }

  const agent = await authenticateAgent(apiKey);

  if (!agent) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid API key' },
        { status: 401 }
      )
    };
  }

  return { agent };
}

/**
 * Optional authentication - returns agent if provided, null otherwise
 */
export async function optionalAuth(request: NextRequest): Promise<Agent | null> {
  const apiKey = extractApiKey(request);
  if (!apiKey) return null;
  return await authenticateAgent(apiKey);
}

/**
 * Wrapper for protected routes
 */
export async function withAgentAuth(request: NextRequest): Promise<{ agent: Agent } | { error: Response }> {
  return await requireAuth(request);
}
