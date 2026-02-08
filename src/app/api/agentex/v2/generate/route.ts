/**
 * AgentEX v2 API - Generate Agent Endpoint
 * Generates agent code asynchronously
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBuild, updateBuildStatus } from '@/lib/utils/build-store';
import { loadTool } from '@/lib/utils/tool-loader';
import { generateCode } from '@/lib/utils/codeGenerator';

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
    createBuild(buildId, config);

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
      config.tools.map(toolId => loadTool(toolId))
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
    const setupDocs = generateSetupDocs(agentConfig, toolSpecs);

    // Package everything
    updateBuildStatus(buildId, { progress: 80 });
    
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

/**
 * Generate setup documentation
 */
function generateSetupDocs(agentConfig: any, tools: any[]) {
  const envVars = tools.flatMap((t: any) => t.requiredEnv || []);
  
  return {
    setupMd: `# Setup Instructions for ${agentConfig.name}

## Required Environment Variables

Create a \`.env.local\` file with the following:

\`\`\`bash
${envVars.map((v: any) => `# ${v.purpose}
# Get from: ${v.getFrom}
${v.key}=${v.example || 'your-key-here'}`).join('\n\n')}
\`\`\`

## Quick Start

1. **Copy environment template:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Fill in your API keys** in \`.env.local\`

4. **Run development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Test at:** http://localhost:3000

## Troubleshooting

**"Missing API key" error?**
→ Check that all keys in \`.env.local\` are filled in

**"Module not found" error?**  
→ Run \`npm install\` again

**Still having issues?**  
→ Check our Discord: discord.gg/agentex
`,
    envExample: envVars.map((v: any) => `${v.key}=`).join('\n')
  };
}
