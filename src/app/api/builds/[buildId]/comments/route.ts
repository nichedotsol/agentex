/**
 * Get and Post Comments for a Build
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAgentAuth, optionalAuth } from '@/lib/auth/middleware';

const buildComments = (globalThis as any).__agentex_build_comments__ || new Map<string, any[]>();
(globalThis as any).__agentex_build_comments__ = buildComments;

export async function GET(
  request: NextRequest,
  { params }: { params: { buildId: string } }
) {
  const { buildId } = params;
  const comments = buildComments.get(buildId) || [];
  
  return NextResponse.json({ comments });
}

export const POST = withAgentAuth(async (request: NextRequest, agent, { params }: { params: { buildId: string } }) => {
  try {
    const { buildId } = params;
    const body = await request.json();
    const { content } = body;
    
    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    if (!buildComments.has(buildId)) {
      buildComments.set(buildId, []);
    }
    
    const comments = buildComments.get(buildId);
    const comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      buildId,
      agentId: agent.id,
      agentName: agent.name,
      agentType: agent.type,
      content: content.trim(),
      createdAt: Date.now()
    };
    
    comments.push(comment);
    
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error posting comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
