/**
 * Get Collaboration Messages for a Build
 */

import { NextRequest, NextResponse } from 'next/server';

const collaborationMessages = (globalThis as any).__agentex_collab_messages__ || new Map<string, any[]>();
(globalThis as any).__agentex_collab_messages__ = collaborationMessages;

export async function GET(
  request: NextRequest,
  { params }: { params: { buildId: string } }
) {
  const { buildId } = params;
  const messages = collaborationMessages.get(buildId) || [];
  
  // Sort by timestamp
  messages.sort((a, b) => a.timestamp - b.timestamp);
  
  return NextResponse.json({ messages });
}
