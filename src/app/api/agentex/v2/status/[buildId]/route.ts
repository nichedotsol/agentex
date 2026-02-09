/**
 * AgentEX v2 API - Build Status Endpoint
 * Check status of agent generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBuildStatus } from '@/lib/utils/build-store';
import { sanitizeBuildConfig } from '@/lib/utils/sanitize';
import { optionalAuth } from '@/lib/auth/middleware';

export interface StatusResponse {
  buildId: string;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  progress: number; // 0-100
  result?: {
    downloadUrl: string;
    previewUrl: string;
    setupInstructionsUrl: string;
    sourceCode?: {
      typescript: string;
      python: string;
    };
  };
  error?: {
    message: string;
    code: string;
    canRetry: boolean;
    suggestedFix?: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { buildId: string } }
) {
  try {
    const { buildId } = params;

    if (!buildId) {
      return NextResponse.json(
        { error: 'buildId is required' },
        { status: 400 }
      );
    }

    const status = getBuildStatus(buildId);
    console.log(`Status check for buildId: ${buildId}`, status ? 'found' : 'not found');

    if (!status) {
      console.log(`Build "${buildId}" not found in store`);
      return NextResponse.json(
        { error: `Build "${buildId}" not found` },
        { status: 404 }
      );
    }

    // Check if requester is the build owner
    const agent = await optionalAuth(request);
    const isOwner = agent && status.agentId === agent.id;

    // Sanitize config if not owner (remove API keys, secrets, etc.)
    const config = isOwner ? status.config : (status.config ? sanitizeBuildConfig(status.config) : null);

    return NextResponse.json({
      buildId: status.buildId,
      status: status.status,
      progress: status.progress,
      result: status.result,
      error: status.error,
      config: config
    } as StatusResponse);

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
