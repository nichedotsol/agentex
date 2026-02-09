/**
 * AgentEX v2 API - Generate Agent Endpoint
 * Generates agent code asynchronously
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBuild, updateBuildStatus, getBuildStatus } from '@/lib/utils/build-store';
import { optionalAuth } from '@/lib/auth/middleware';
import { trackBuildForAgent } from '@/app/api/agents/builds/route';
import { loadToolServer } from '@/lib/tools/server-loader';
import { generateCode } from '@/lib/utils/codeGenerator';
import { generateTests, generateVitestConfig, generateTestUtils, mergePackageJson } from '@/lib/generators/test-generator';
import { generateSetupDocs } from '@/lib/generators/setup-generator';

export interface GenerateRequest {
  name: string;
  description: string;
  brain: string;
  tools: string[];
  runtime: string;
  config?: {
    temperature?: number;
    maxTokens?: number;
    cronSchedule?: string;
    timeout?: number;
  };
}

export interface GenerateResponse {
  buildId: string;
  status: 'queued' | 'generating';
  estimatedTime: number; // seconds
  statusUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // Optional authentication - track builds for authenticated agents
    const agent = await optionalAuth(request);
    
    const config = await request.json() as GenerateRequest;
    const { name, description, brain, tools, runtime } = config;

    // Validate required fields
    if (!name || !description || !brain || !tools || !runtime) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, brain, tools, runtime' },
        { status: 400 }
      );
    }

    // Create build ID
    const buildId = `build_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create build record
    const build = createBuild(buildId, config);
    console.log(`Created build: ${buildId}`, build);

    // Verify build was created
    const verifyBuild = getBuildStatus(buildId);
    if (!verifyBuild) {
      console.error(`Failed to create build: ${buildId}`);
      return NextResponse.json(
        { error: 'Failed to create build record' },
        { status: 500 }
      );
    }

    // Track build for authenticated agent
    if (agent) {
      trackBuildForAgent(agent.id, buildId);
    }

    // Queue generation (async - don't await)
    queueGenerationJob(buildId, config).catch(error => {
      console.error('Generation job failed:', error);
      updateBuildStatus(buildId, {
        status: 'failed',
        error: {
          message: error instanceof Error ? error.message : 'Generation failed',
          code: 'GENERATION_ERROR',
          canRetry: true,
          suggestedFix: 'Check tool configurations and try again'
        }
      });
    });

    return NextResponse.json({
      buildId,
      status: 'queued',
      estimatedTime: 45,
      statusUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://agentexs.vercel.app'}/api/agentex/v2/status/${buildId}`
    } as GenerateResponse);

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Background generation job
 */
async function queueGenerationJob(buildId: string, config: GenerateRequest) {
  try {
    // Update status to generating
    updateBuildStatus(buildId, { 
      status: 'generating', 
      progress: 0 
    });

    // Load tools
    updateBuildStatus(buildId, { progress: 10 });
    const toolSpecs = await Promise.all(
      config.tools.map(async (toolId: string) => {
        try {
          return await loadToolServer(toolId);
        } catch {
          // Try with tool- prefix
          try {
            return await loadToolServer(`tool-${toolId}`);
          } catch {
            // Try without tool- prefix if toolId has it
            if (toolId.startsWith('tool-')) {
              return await loadToolServer(toolId.replace('tool-', ''));
            }
            throw new Error(`Tool "${toolId}" not found`);
          }
        }
      })
    );

    // Build agent configuration
    updateBuildStatus(buildId, { progress: 20 });
    const agentConfig = {
      name: config.name,
      description: config.description,
      brain: {
        type: config.brain,
        config: {
          temperature: config.config?.temperature || 0.7,
          max_tokens: config.config?.maxTokens || 4096
        }
      },
      tools: toolSpecs.map(tool => ({
        id: tool.id,
        name: tool.name,
        config: tool.config
      })),
      runtime: config.runtime,
      settings: {
        name: config.name,
        description: config.description,
        token_budget: 1000,
        timeout: config.config?.timeout || 30,
        retry_policy: 'exponential'
      }
    };

    // Generate code
    updateBuildStatus(buildId, { progress: 40 });
    
    // Create a mock build state for code generation
    // In production, this would use the actual build store structure
    const mockBuildState: any = {
      settings: agentConfig.settings,
      brain: {
        id: `brain-${config.brain}`,
        component: {
          id: config.brain,
          type: 'brain' as const,
          name: config.brain,
          provider: config.brain.includes('claude') ? 'anthropic' : 'openai',
          config: agentConfig.brain.config,
          interface: { inputs: [], outputs: [], capabilities: [] },
          resources: {},
          metadata: { author: '', description: '', tags: [], icon: '', color: '' }
        },
        config: agentConfig.brain.config,
        position: { x: 0, y: 0 }
      },
      tools: toolSpecs.map((tool, index) => ({
        id: `tool-${tool.id}-${index}`,
        component: {
          id: tool.id,
          type: 'tool' as const,
          name: tool.name,
          provider: tool.provider,
          config: tool.config,
          interface: tool.interface,
          resources: tool.resources,
          metadata: tool.metadata
        },
        config: tool.config,
        position: { x: 0, y: 0 }
      })),
      runtime: {
        id: `runtime-${config.runtime}`,
        component: {
          id: config.runtime,
          type: 'runtime' as const,
          name: config.runtime,
          provider: config.runtime,
          config: {},
          interface: { inputs: [], outputs: [], capabilities: [] },
          resources: {},
          metadata: { author: '', description: '', tags: [], icon: '', color: '' }
        },
        config: {},
        position: { x: 0, y: 0 }
      },
      memories: [],
      validation: { valid: true, errors: [], warnings: [] }
    };

    const generatedCode = generateCode(mockBuildState as any, {
      format: 'typescript',
      includeDependencies: true,
      includeReadme: true
    });

    // Generate setup documentation
    updateBuildStatus(buildId, { progress: 60 });
    const setupDocs = generateSetupDocs({
      name: config.name,
      description: config.description,
      runtime: config.runtime as any
    }, toolSpecs, config.runtime as any);
    
    // Generate test suite
    updateBuildStatus(buildId, { progress: 65 });
    const testSuite = generateTests({
      name: config.name,
      description: config.description,
      config: config.config
    }, toolSpecs);
    const vitestConfig = generateVitestConfig();
    const testUtils = generateTestUtils();

    // Package everything
    updateBuildStatus(buildId, { progress: 80 });
    
    // Add test files to generated code
    const testFiles = [
      { path: 'tests/integration.test.ts', content: testSuite.integrationTests },
      { path: 'vitest.config.ts', content: vitestConfig },
      { path: 'tests/utils/test-helpers.ts', content: testUtils },
      { path: 'test.sh', content: testSuite.testScript },
      { path: 'scripts/check-env.js', content: testSuite.envCheckScript }
    ];
    
    // Update package.json with test config
    const packageJsonFile = generatedCode.find((f: any) => f.path === 'package.json');
    if (packageJsonFile) {
      packageJsonFile.content = mergePackageJson(packageJsonFile.content, testSuite.packageJsonTestConfig);
    } else {
      generatedCode.push({
        path: 'package.json',
        content: mergePackageJson('{}', testSuite.packageJsonTestConfig)
      });
    }
    
    // Add all test files
    generatedCode.push(...testFiles);
    
    // In production, upload to storage and create download URL
    // For now, we'll store the code in the build status
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://agentexs.vercel.app'}/api/agentex/v2/download/${buildId}`;
    const previewUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://agentexs.vercel.app'}/preview/${buildId}`;
    const setupInstructionsUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://agentexs.vercel.app'}/setup/${buildId}`;

    // Mark complete
    updateBuildStatus(buildId, {
      status: 'complete',
      progress: 100,
      result: {
        downloadUrl,
        previewUrl,
        setupInstructionsUrl,
        sourceCode: {
          typescript: JSON.stringify(generatedCode, null, 2)
        }
      }
    });

  } catch (error) {
    updateBuildStatus(buildId, {
      status: 'failed',
      error: {
        message: error instanceof Error ? error.message : 'Generation failed',
        code: 'GENERATION_ERROR',
        canRetry: true,
        suggestedFix: 'Check tool configurations and try again'
      }
    });
    throw error;
  }
}

// Setup documentation generation is now handled by generateSetupDocs from setup-generator.ts
