/**
 * AgentEX v2 API - Validate Requirements Endpoint
 * Validates agent requirements before building
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadTool, validateTools, findSimilarTool, loadAllTools } from '@/lib/utils/tool-loader';
import { ToolSpec } from '@/lib/types/tool-spec';

export interface ValidateRequest {
  description: string;
  tools: string[];
  runtime?: string;
}

export interface Issue {
  type: 'missing_tool' | 'runtime_incompatible' | 'config_error';
  severity: 'error' | 'warning';
  tool?: string;
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

export interface CostEstimate {
  monthly: string;
  breakdown: Array<{
    service: string;
    cost: string;
  }>;
  total: string;
}

export interface RuntimeRecommendation {
  primary: string;
  reasoning: string;
  alternatives: string[];
  costEstimate: string;
  limitations: string[];
}

export interface ValidateResponse {
  valid: boolean;
  issues: Issue[];
  estimatedCost: CostEstimate;
  requiredEnv: Array<{
    key: string;
    purpose: string;
    getFrom: string;
    required: boolean;
    example?: string;
  }>;
  recommendations: {
    runtime?: RuntimeRecommendation;
    toolSubstitutions?: Array<{
      original: string;
      replacement: string;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ValidateRequest;
    const { description, tools, runtime } = body;

    if (!description || !tools || !Array.isArray(tools)) {
      return NextResponse.json(
        { error: 'Invalid request: description and tools array required' },
        { status: 400 }
      );
    }

    const issues: Issue[] = [];

    // 1. Validate all tools exist
    const toolValidation = await validateTools(tools);
    
    for (const missing of toolValidation.missingTools) {
      const similar = await findSimilarTool(missing);
      issues.push({
        type: 'missing_tool',
        severity: 'error',
        tool: missing,
        message: `Tool "${missing}" not found`,
        suggestion: similar ? `Use "${similar.id}" instead` : 'Remove this tool',
        autoFixable: !!similar
      });
    }

    // 2. Load valid tools
    const validTools: ToolSpec[] = [];
    for (const toolId of tools) {
      if (!toolValidation.missingTools.includes(toolId)) {
        try {
          const tool = await loadTool(toolId);
          validTools.push(tool);
        } catch (error) {
          issues.push({
            type: 'missing_tool',
            severity: 'error',
            tool: toolId,
            message: `Failed to load tool "${toolId}"`,
            suggestion: 'Check tool ID spelling',
            autoFixable: false
          });
        }
      }
    }

    // 3. Analyze runtime requirements (simplified for now)
    const hasCron = description.toLowerCase().includes('schedule') || 
                    description.toLowerCase().includes('cron') ||
                    description.toLowerCase().includes('hourly') ||
                    description.toLowerCase().includes('daily');
    const hasWebsockets = validTools.some(t => 
      t.interface.capabilities.includes('websocket') || 
      t.name.toLowerCase().includes('websocket')
    );
    const persistent = hasCron || hasWebsockets;

    // 4. Runtime recommendation
    let runtimeRec: RuntimeRecommendation | undefined;
    if (!runtime || runtime === 'auto') {
      if (persistent || hasWebsockets) {
        runtimeRec = {
          primary: 'railway',
          reasoning: 'Your agent needs to run continuously or use websockets. Railway provides always-on hosting.',
          alternatives: ['render', 'fly.io'],
          costEstimate: '$5-20/month',
          limitations: ['Requires credit card', 'Manual setup needed']
        };
      } else if (hasCron) {
        runtimeRec = {
          primary: 'vercel-cron',
          reasoning: 'Scheduled tasks work perfectly with Vercel Cron (serverless).',
          alternatives: ['github-actions', 'railway'],
          costEstimate: 'Free (Hobby plan)',
          limitations: ['Max 1/minute frequency on free tier']
        };
      } else {
        runtimeRec = {
          primary: 'vercel',
          reasoning: 'Simple request/response patterns work perfectly on Vercel serverless functions.',
          alternatives: ['netlify', 'cloudflare-pages'],
          costEstimate: 'Free (Hobby plan)',
          limitations: ['10 second timeout', 'No persistent state']
        };
      }
    }

    // 5. Check runtime compatibility if specified
    if (runtime && runtime !== 'auto' && runtimeRec) {
      if (runtime !== runtimeRec.primary) {
        const compatible = checkRuntimeCompatibility(runtime, { persistent, cron: hasCron, websockets: hasWebsockets });
        if (!compatible.compatible) {
          issues.push({
            type: 'runtime_incompatible',
            severity: 'warning',
            message: compatible.reason,
            suggestion: `Switch to "${runtimeRec.primary}"`,
            autoFixable: false
          });
        }
      }
    }

    // 6. Calculate costs
    const costEstimate = calculateCosts(validTools, runtime || runtimeRec?.primary || 'vercel');

    // 7. Collect required env vars
    const requiredEnv = validTools.flatMap(t => t.requiredEnv);

    // 8. Tool substitutions
    const toolSubstitutions = issues
      .filter(i => i.type === 'missing_tool' && i.autoFixable)
      .map(i => ({
        original: i.tool!,
        replacement: i.suggestion.replace('Use "', '').replace('" instead', '')
      }));

    return NextResponse.json({
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      estimatedCost: costEstimate,
      requiredEnv,
      recommendations: {
        runtime: runtimeRec,
        toolSubstitutions: toolSubstitutions.length > 0 ? toolSubstitutions : undefined
      }
    } as ValidateResponse);

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function checkRuntimeCompatibility(runtime: string, requirements: { persistent: boolean; cron: boolean; websockets: boolean }): { compatible: boolean; reason: string } {
  if (requirements.persistent && runtime === 'vercel') {
    return {
      compatible: false,
      reason: 'Vercel serverless functions cannot run persistently. Use Railway or Render for always-on hosting.'
    };
  }
  if (requirements.websockets && runtime === 'vercel') {
    return {
      compatible: false,
      reason: 'Vercel does not support websockets. Use Railway, Render, or Fly.io.'
    };
  }
  return { compatible: true, reason: '' };
}

function calculateCosts(tools: ToolSpec[], runtime: string): CostEstimate {
  const breakdown: Array<{ service: string; cost: string }> = [];
  
  // Tool costs
  for (const tool of tools) {
    if (tool.cost.tier === 'paid' || tool.cost.tier === 'freemium') {
      breakdown.push({
        service: tool.name,
        cost: tool.cost.estimate || 'Check provider pricing'
      });
    }
  }
  
  // Runtime costs
  if (runtime === 'railway' || runtime === 'render') {
    breakdown.push({
      service: 'Hosting',
      cost: '$5-20/month'
    });
  } else if (runtime === 'vercel') {
    breakdown.push({
      service: 'Hosting',
      cost: 'Free (Hobby plan)'
    });
  }
  
  const hasPaidServices = breakdown.some(b => b.cost.includes('$'));
  const total = hasPaidServices 
    ? breakdown.filter(b => b.cost.includes('$')).map(b => {
        const match = b.cost.match(/\$(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }).reduce((a, b) => a + b, 0) + '+/month'
    : 'Free';
  
  return {
    monthly: total,
    breakdown,
    total
  };
}
