/**
 * AgentEX v2 API - Validate Requirements Endpoint
 * Validates agent requirements before building
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadTool, validateTools, findSimilarTool, loadAllTools } from '@/lib/utils/tool-loader';
import { ToolSpec } from '@/lib/types/tool-spec';
import { analyzeRequirements, recommendRuntime, checkRuntimeCompatibility, getRuntimeCost } from '@/lib/utils/runtime-selector';

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

    // 3. Analyze runtime requirements
    const requirements = analyzeRequirements(
      { description, config: { expectedTraffic: 'low' } },
      validTools
    );

    // 4. Runtime recommendation
    let runtimeRec: RuntimeRecommendation | undefined;
    if (!runtime || runtime === 'auto') {
      runtimeRec = recommendRuntime(requirements);
    } else {
      // User specified runtime - check compatibility
      const compatible = checkRuntimeCompatibility(runtime as any, requirements);
      if (!compatible.compatible) {
        issues.push({
          type: 'runtime_incompatible',
          severity: 'warning',
          message: compatible.reason,
          suggestion: `Consider switching to a compatible runtime`,
          autoFixable: false
        });
      }
      // Still provide recommendation
      runtimeRec = recommendRuntime(requirements);
      if (runtimeRec.primary !== runtime) {
        issues.push({
          type: 'runtime_incompatible',
          severity: 'warning',
          message: `Recommended runtime is "${runtimeRec.primary}" but you specified "${runtime}"`,
          suggestion: `Consider using "${runtimeRec.primary}" for better compatibility`,
          autoFixable: false
        });
      }
    }

    // 5. Calculate costs
    const selectedRuntime = (runtime || runtimeRec?.primary || 'vercel') as any;
    const runtimeCost = getRuntimeCost(selectedRuntime, requirements);
    const costEstimate = calculateCosts(validTools, selectedRuntime, runtimeCost);

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


function calculateCosts(tools: ToolSpec[], runtime: string, runtimeCost: ReturnType<typeof getRuntimeCost>): CostEstimate {
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
  breakdown.push({
    service: 'Hosting',
    cost: runtimeCost.estimate
  });
  
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
