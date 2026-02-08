/**
 * AgentEX v2 API - Validate Requirements Endpoint
 * Validates agent requirements before building
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadToolServer, loadAllToolsServer } from '@/lib/tools/server-loader';
import { ToolSpec } from '@/lib/types/tool-spec';
import { ToolSpec } from '@/lib/types/tool-spec';
import { analyzeRequirements, recommendRuntime, checkRuntimeCompatibility, getRuntimeCost } from '@/lib/utils/runtime-selector';

export interface ValidateRequest {
  action: 'validate';
  name?: string;
  description?: string;
  brain?: string;
  tools?: string[];
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
    const { name, description, brain, tools, runtime } = body;

    // Validate required fields for validate action
    if (!name || !description || !brain || !tools || !Array.isArray(tools)) {
      return NextResponse.json(
        { 
          valid: false,
          issues: [{
            type: 'missing_required_fields' as any,
            severity: 'error' as const,
            message: 'Missing required fields: name, description, brain, and tools are required',
            suggestion: 'Provide all required fields',
            autoFixable: false
          }]
        },
        { status: 400 }
      );
    }

    const issues: Issue[] = [];

    // 1. Validate all tools exist and load them
    const validTools: ToolSpec[] = [];
    const allTools = await loadAllToolsServer();
    const toolMap = new Map(allTools.map(t => [t.id, t]));
    
    for (const toolId of tools) {
      // Try exact match first
      let tool = toolMap.get(toolId);
      
      // Try with tool- prefix
      if (!tool) {
        tool = toolMap.get(`tool-${toolId}`);
      }
      
      // Try without tool- prefix if toolId has it
      if (!tool && toolId.startsWith('tool-')) {
        tool = toolMap.get(toolId.replace('tool-', ''));
      }
      
      if (tool) {
        validTools.push(tool);
      } else {
        // Find similar tool
        const similar = allTools.find(t => 
          t.id.includes(toolId) || 
          toolId.includes(t.id) ||
          t.name.toLowerCase().includes(toolId.toLowerCase())
        );
        
        issues.push({
          type: 'missing_tool',
          severity: 'error',
          tool: toolId,
          message: `Tool "${toolId}" not found in registry`,
          suggestion: similar ? `Use "${similar.id}" instead` : 'Remove this tool or check tool ID spelling',
          autoFixable: !!similar
        });
      }
    }

    // 3. Validate brain
    const validBrains = ['claude-3-5-sonnet', 'gpt-4', 'gpt-4-turbo', 'llama-3-70b', 'openai', 'anthropic', 'openclaw'];
    if (!validBrains.some(b => brain.toLowerCase().includes(b.toLowerCase()))) {
      issues.push({
        type: 'config_error',
        severity: 'error',
        message: `Invalid brain "${brain}". Must be one of: ${validBrains.join(', ')}`,
        suggestion: 'Use claude-3-5-sonnet (recommended)',
        autoFixable: true
      });
    }

    // 4. Analyze runtime requirements
    const requirements = analyzeRequirements(
      { name, description, config: { expectedTraffic: 'low' } },
      validTools
    );

    // 5. Runtime recommendation
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

    // 6. Calculate costs
    const selectedRuntime = (runtime || runtimeRec?.primary || 'vercel') as any;
    const runtimeCost = getRuntimeCost(selectedRuntime, requirements);
    const costEstimate = calculateCosts(validTools, selectedRuntime, runtimeCost);

    // 7. Collect required env vars (deduplicate)
    const envMap = new Map<string, { key: string; purpose: string; getFrom: string; required: boolean; example?: string }>();
    for (const tool of validTools) {
      for (const env of tool.requiredEnv) {
        if (!envMap.has(env.key)) {
          envMap.set(env.key, env);
        }
      }
    }
    const requiredEnvVars = Array.from(envMap.values());

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
      requiredEnv: requiredEnvVars,
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
