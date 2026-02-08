/**
 * AgentEX v2 API - Deploy Agent Endpoint
 * Deploy agent to hosting platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBuildStatus, updateBuildStatus } from '@/lib/utils/build-store';
import { exportToVercel, exportToGitHub } from '@/lib/utils/exportUtils';

export interface DeployRequest {
  buildId: string;
  platform: 'vercel' | 'railway' | 'render' | 'fly' | 'github';
  credentials: {
    apiKey: string; // Platform API key
    [key: string]: any;
  };
  environment: Record<string, string>; // User's API keys for agent
  projectName?: string;
}

export interface DeployResponse {
  deployId: string;
  status: 'deploying';
  estimatedTime: number; // seconds
  statusUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as DeployRequest;
    const { buildId, platform, credentials, environment, projectName } = body;

    if (!buildId || !platform || !credentials?.apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: buildId, platform, credentials.apiKey' },
        { status: 400 }
      );
    }

    // Verify build exists and is complete
    const build = getBuildStatus(buildId);
    if (!build) {
      return NextResponse.json(
        { error: `Build "${buildId}" not found` },
        { status: 404 }
      );
    }

    if (build.status !== 'complete') {
      return NextResponse.json(
        { error: `Build must be complete before deploying. Current status: ${build.status}` },
        { status: 400 }
      );
    }

    // Create deploy ID
    const deployId = `deploy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Queue deployment (async)
    queueDeploymentJob(deployId, buildId, platform, credentials, environment, projectName).catch(error => {
      console.error('Deployment job failed:', error);
    });

    return NextResponse.json({
      deployId,
      status: 'deploying',
      estimatedTime: platform === 'vercel' ? 120 : 180,
      statusUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://agentexs.vercel.app'}/api/agentex/v2/deploy-status/${deployId}`
    } as DeployResponse);

  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Background deployment job
 */
async function queueDeploymentJob(
  deployId: string,
  buildId: string,
  platform: string,
  credentials: any,
  environment: Record<string, string>,
  projectName?: string
) {
  try {
    const build = getBuildStatus(buildId);
    if (!build || !build.result) {
      throw new Error('Build not found or incomplete');
    }

    // For now, we'll handle Vercel and GitHub deployments
    // Other platforms can be added similarly
    
    if (platform === 'vercel') {
      // Use existing exportToVercel utility
      // Note: exportToVercel expects (buildState, vercelToken, projectName, onProgress)
      // We need to reconstruct buildState from stored config or use a minimal one
      const result = await exportToVercel(
        build.config as any, // buildState - reconstruct from stored config
        credentials.apiKey,
        projectName || build.config?.name || 'agentex-agent',
        () => {} // onProgress callback
      );

      // Store deployment result
      // result is a string URL from exportToVercel
      updateBuildStatus(buildId, {
        result: {
          ...build.result,
          deployUrl: result,
          deployId
        }
      });
    } else if (platform === 'github') {
      // Use existing exportToGitHub utility
      // Note: exportToGitHub expects (buildState, format, githubToken, repoName, onProgress)
      const result = await exportToGitHub(
        build.config as any, // buildState - reconstruct from stored config
        'typescript',
        credentials.apiKey,
        projectName || build.config?.name || 'agentex-agent',
        () => {} // onProgress callback
      );

      // result is a string URL from exportToGitHub
      updateBuildStatus(buildId, {
        result: {
          ...build.result,
          deployUrl: result,
          deployId
        }
      });
    } else {
      throw new Error(`Platform "${platform}" not yet supported. Supported: vercel, github`);
    }

  } catch (error) {
    console.error('Deployment failed:', error);
    // Could store deployment error in a separate deploy status store
    throw error;
  }
}
