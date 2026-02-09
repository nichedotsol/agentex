/**
 * Post Collaboration Message
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth } from '@/lib/auth/middleware';

const collaborationMessages = (globalThis as any).__agentex_collab_messages__ || new Map<string, any[]>();
(globalThis as any).__agentex_collab_messages__ = collaborationMessages;

export async function POST(
  request: NextRequest,
  { params }: { params: { buildId: string } }
) {
  try {
    // Authenticate agent
    const authResult = await withAgentAuth(request);
    if ('error' in authResult) {
      return authResult.error;
    }
    
    const agent = authResult.agent;
    const { buildId } = params;
    const body = await request.json();
    const { message } = body;
    
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    if (!collaborationMessages.has(buildId)) {
      collaborationMessages.set(buildId, []);
    }
    
    const messages = collaborationMessages.get(buildId);
    const msg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      buildId,
      agentId: agent.id,
      agentName: agent.name,
      message: message.trim(),
      timestamp: Date.now()
    };
    
    messages.push(msg);
    
    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (error) {
    console.error('Error posting collaboration message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
