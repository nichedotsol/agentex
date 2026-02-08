/**
 * Tool Loader Utility
 * Loads and validates tool specifications
 */

import { ToolSpec, ValidationResult } from '@/lib/types/tool-spec';

/**
 * Load a tool specification by ID
 */
export async function loadTool(toolId: string): Promise<ToolSpec> {
  try {
    // First try to load enhanced spec from /components/tools/
    try {
      const response = await fetch(`/components/tools/${toolId}.json`);
      if (response.ok) {
        const tool = await response.json();
        return validateToolSpec(tool);
      }
    } catch {
      // Fallback to legacy location
    }

    // Fallback to legacy component location
    const response = await fetch(`/components/${toolId}.json`);
    if (!response.ok) {
      throw new Error(`Tool "${toolId}" not found`);
    }
    
    const tool = await response.json();
    
    // Convert legacy tool to enhanced spec
    return convertLegacyTool(tool);
  } catch (error) {
    throw new Error(`Failed to load tool "${toolId}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load all tools from registry
 */
export async function loadAllTools(): Promise<ToolSpec[]> {
  try {
    const registryResponse = await fetch('/components/registry.json');
    if (!registryResponse.ok) {
      throw new Error('Failed to load component registry');
    }
    
    const registry = await registryResponse.json();
    const toolFiles = registry.components.tools || [];
    
    const tools = await Promise.all(
      toolFiles.map(async (filename: string) => {
        const toolId = filename.replace('.json', '');
        try {
          return await loadTool(toolId);
        } catch {
          return null;
        }
      })
    );
    
    return tools.filter((t): t is ToolSpec => t !== null);
  } catch (error) {
    console.error('Failed to load all tools:', error);
    return [];
  }
}

/**
 * Validate multiple tools exist
 */
export async function validateTools(toolIds: string[]): Promise<ValidationResult> {
  const results = await Promise.all(
    toolIds.map(async (id) => {
      try {
        await loadTool(id);
        return { id, exists: true, error: null };
      } catch (error) {
        return { 
          id, 
          exists: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    })
  );
  
  const missing = results.filter(r => !r.exists);
  
  return {
    valid: missing.length === 0,
    missingTools: missing.map(m => m.id),
    errors: missing.map(m => `Tool "${m.id}" not found: ${m.error}`),
    warnings: []
  };
}

/**
 * Find similar tools by name or capabilities
 */
export async function findSimilarTool(toolId: string): Promise<ToolSpec | null> {
  const allTools = await loadAllTools();
  
  // Try to find by partial ID match
  const partialMatch = allTools.find(t => 
    t.id.includes(toolId) || toolId.includes(t.id)
  );
  if (partialMatch) return partialMatch;
  
  // Try to find by name similarity
  const nameMatch = allTools.find(t => 
    t.name.toLowerCase().includes(toolId.toLowerCase()) ||
    toolId.toLowerCase().includes(t.name.toLowerCase())
  );
  if (nameMatch) return nameMatch;
  
  return null;
}

/**
 * Validate tool spec structure
 */
function validateToolSpec(tool: any): ToolSpec {
  // Basic validation
  if (!tool.id || !tool.name || !tool.type) {
    throw new Error('Invalid tool spec: missing required fields');
  }
  
  // Ensure all required fields exist
  return {
    ...tool,
    category: tool.category || 'utility',
    requiredEnv: tool.requiredEnv || [],
    implementation: tool.implementation || {},
    cost: tool.cost || { tier: 'free' },
    documentation: tool.documentation || ''
  };
}

/**
 * Convert legacy tool format to enhanced spec
 */
function convertLegacyTool(legacy: any): ToolSpec {
  // Extract environment variables from provider/auth info
  const requiredEnv: ToolSpec['requiredEnv'] = [];
  
  if (legacy.config?.auth_type === 'bearer' || legacy.config?.auth_type === 'api_key') {
    const envKey = `${legacy.provider?.toUpperCase() || 'API'}_API_KEY`;
    requiredEnv.push({
      key: envKey,
      purpose: `API key for ${legacy.name}`,
      getFrom: getProviderUrl(legacy.provider),
      required: true,
      example: 'your-api-key-here'
    });
  }
  
  // Determine category from tags or name
  const category = inferCategory(legacy);
  
  // Determine cost tier
  const cost = inferCost(legacy);
  
  // Build implementation
  const implementation: ToolSpec['implementation'] = {
    endpoint: legacy.config?.endpoint,
    npm: inferNpmPackages(legacy),
    template: `templates/tools/${legacy.id}.ts`
  };
  
  return {
    ...legacy,
    category,
    requiredEnv,
    implementation,
    cost,
    documentation: `https://docs.agentex.dev/tools/${legacy.id}`
  };
}

/**
 * Infer category from tool metadata
 */
function inferCategory(tool: any): ToolSpec['category'] {
  const tags = (tool.metadata?.tags || []).map((t: string) => t.toLowerCase());
  const name = (tool.name || '').toLowerCase();
  
  if (tags.includes('blockchain') || tags.includes('crypto') || name.includes('blockchain')) {
    return 'blockchain';
  }
  if (tags.includes('email') || tags.includes('slack') || tags.includes('twitter') || tags.includes('communication')) {
    return 'communication';
  }
  if (tags.includes('database') || tags.includes('vector') || tags.includes('storage')) {
    return 'storage';
  }
  if (tags.includes('ai') || tags.includes('image') || tags.includes('audio')) {
    return 'ai';
  }
  if (tags.includes('analytics') || tags.includes('query')) {
    return 'analytics';
  }
  
  return 'utility';
}

/**
 * Infer cost from rate limits and provider
 */
function inferCost(tool: any): ToolSpec['cost'] {
  const rateLimits = tool.resources?.rate_limits || {};
  
  // High rate limits usually indicate paid tier
  if (rateLimits.requests_per_second && rateLimits.requests_per_second > 10) {
    return {
      tier: 'freemium',
      estimate: 'Free tier available, paid plans start at $5/month',
      freeTier: {
        limit: `${rateLimits.requests_per_minute || 60} requests/minute`,
        description: 'Free tier available'
      }
    };
  }
  
  // Check provider for known free services
  const freeProviders = ['brave', 'coingecko'];
  if (freeProviders.includes(tool.provider?.toLowerCase())) {
    return {
      tier: 'free',
      estimate: 'Free tier available'
    };
  }
  
  return {
    tier: 'freemium',
    estimate: 'Check provider pricing'
  };
}

/**
 * Infer npm packages from tool type
 */
function inferNpmPackages(tool: any): string[] {
  const packages: string[] = [];
  
  if (tool.provider === 'alchemy') {
    packages.push('alchemy-sdk');
  }
  if (tool.name?.toLowerCase().includes('solana')) {
    packages.push('@solana/web3.js');
  }
  if (tool.name?.toLowerCase().includes('email')) {
    packages.push('resend');
  }
  if (tool.name?.toLowerCase().includes('slack')) {
    packages.push('@slack/web-api');
  }
  
  return packages;
}

/**
 * Get provider URL for API key
 */
function getProviderUrl(provider: string): string {
  const urls: Record<string, string> = {
    brave: 'https://brave.com/search/api',
    alchemy: 'https://www.alchemy.com',
    coingecko: 'https://www.coingecko.com/api',
    resend: 'https://resend.com/api-keys',
    slack: 'https://api.slack.com/apps',
    twitter: 'https://developer.twitter.com',
    openai: 'https://platform.openai.com/api-keys',
    anthropic: 'https://console.anthropic.com',
    helius: 'https://dev.helius.xyz'
  };
  
  return urls[provider?.toLowerCase()] || `https://${provider}.com`;
}
