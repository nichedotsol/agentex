/**
 * AgentEX v2 API - Tool Detail Endpoint
 * Get detailed information about a specific tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadToolServer } from '@/lib/tools/server-loader';

export async function GET(
  request: NextRequest,
  { params }: { params: { toolId: string } }
) {
  try {
    const { toolId } = params;

    if (!toolId) {
      return NextResponse.json(
        { error: 'toolId is required' },
        { status: 400 }
      );
    }

    try {
      // Try exact match first
      let tool = await loadToolServer(toolId);
      return NextResponse.json(tool);
    } catch {
      try {
        // Try with tool- prefix
        const tool = await loadToolServer(`tool-${toolId}`);
        return NextResponse.json(tool);
      } catch {
        // Try without tool- prefix if toolId has it
        if (toolId.startsWith('tool-')) {
          try {
            const tool = await loadToolServer(toolId.replace('tool-', ''));
            return NextResponse.json(tool);
          } catch {
            return NextResponse.json(
              { error: `Tool "${toolId}" not found`, suggestion: 'Use search_tools to find available tools' },
              { status: 404 }
            );
          }
        }
        return NextResponse.json(
          { error: `Tool "${toolId}" not found`, suggestion: 'Use search_tools to find available tools' },
          { status: 404 }
        );
      }
    }

  } catch (error) {
    console.error('Tool detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
