/**
 * Enhanced Tool Specification System
 * Extends the base component schema with production-ready details
 */

export type ToolCategory = 'blockchain' | 'communication' | 'data' | 'ai' | 'utility' | 'storage' | 'analytics';

export interface EnvironmentVariable {
  key: string;
  purpose: string;
  getFrom: string;        // URL where to get the key
  required: boolean;
  example?: string;
  description?: string;
}

export interface ToolImplementation {
  npm?: string[];        // Package dependencies
  endpoint?: string;      // External API endpoint
  template?: string;      // Path to code template
  python?: string[];      // Python package dependencies
  docker?: string;        // Docker image if needed
}

export interface ToolCost {
  tier: 'free' | 'freemium' | 'paid';
  estimate?: string;      // "~$2-10/month" or "Free tier: 100 req/s"
  freeTier?: {
    limit: string;         // "100 requests/second"
    description: string;
  };
  paidTier?: {
    startingAt: string;    // "$5/month"
    description: string;
  };
}

export interface ToolSpec {
  // Base component fields (from existing schema)
  id: string;
  type: 'tool';
  name: string;
  version: string;
  provider: string;
  config: {
    endpoint?: string;
    auth_type: 'bearer' | 'api_key' | 'none' | 'oauth';
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    parameters: {
      required: string[];
      optional: string[];
    };
  };
  interface: {
    inputs: string[];
    outputs: string[];
    capabilities: string[];
  };
  resources: {
    rate_limits?: {
      requests_per_minute?: number;
      requests_per_second?: number;
      requests_per_month?: number;
      [key: string]: number | undefined;
    };
  };
  metadata: {
    author: string;
    description: string;
    tags: string[];
    icon: string;
    color: string;
  };

  // Enhanced fields for production
  category: ToolCategory;
  requiredEnv: EnvironmentVariable[];
  implementation: ToolImplementation;
  cost: ToolCost;
  documentation: string;   // Link to docs
}

export interface ValidationResult {
  valid: boolean;
  missingTools: string[];
  errors: string[];
  warnings: string[];
}

export interface ToolSubstitution {
  original: string;
  replacement: string;
  reason: string;
}
