/**
 * AgentEX v2 API - Tool Detail Endpoint
 * Get detailed information about a specific tool
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadTool } from '@/lib/utils/tool-loader';

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
      const tool = await loadTool(toolId);
      return NextResponse.json(tool);
    } catch (error) {
      return NextResponse.json(
        { error: `Tool "${toolId}" not found`, message: error instanceof Error ? error.message : 'Unknown error' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Tool detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
