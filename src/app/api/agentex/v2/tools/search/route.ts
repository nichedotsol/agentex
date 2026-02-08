/**
 * AgentEX v2 API - Tool Search Endpoint
 * Search and filter available tools
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadAllTools } from '@/lib/utils/tool-loader';
import { ToolSpec, ToolCategory } from '@/lib/types/tool-spec';

export interface ToolSearchRequest {
  query?: string;
  category?: ToolCategory;
  capabilities?: string[];
}

export interface ToolSearchResponse {
  tools: ToolSpec[];
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ToolSearchRequest;
    const { query, category, capabilities } = body;

    // Load all tools
    let tools = await loadAllTools();

    // Filter by category
    if (category) {
      tools = tools.filter(t => t.category === category);
    }

    // Filter by capabilities
    if (capabilities && capabilities.length > 0) {
      tools = tools.filter(t => 
        capabilities.every(cap => 
          t.interface.capabilities.some(c => 
            c.toLowerCase().includes(cap.toLowerCase())
          )
        )
      );
    }

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      tools = tools.filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.metadata.description.toLowerCase().includes(lowerQuery) ||
        t.id.toLowerCase().includes(lowerQuery) ||
        t.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return NextResponse.json({
      tools,
      total: tools.length
    } as ToolSearchResponse);

  } catch (error) {
    console.error('Tool search error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also support GET for simple queries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;
    const category = searchParams.get('category') as ToolCategory | undefined;
    const capabilities = searchParams.get('capabilities')?.split(',') || undefined;

    const body: ToolSearchRequest = { query, category, capabilities };
    
    // Reuse POST logic
    const req = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    });
    
    return POST(req);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
