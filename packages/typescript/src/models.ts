/**
 * AgentEX API Models
 */

export interface AgentConfig {
  temperature?: number;
  maxTokens?: number;
  cronSchedule?: string;
  timeout?: number;
}

export interface ValidateRequest {
  name: string;
  description: string;
  brain: string;
  tools: string[];
  runtime?: string;
  config?: AgentConfig;
}

export interface Issue {
  severity: 'error' | 'warning';
  message: string;
  field?: string;
}

export interface RuntimeRecommendation {
  primary: string;
  reasoning: string;
  alternatives: string[];
  cost: string;
  limitations: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
}

export interface CostEstimate {
  total: string;
  breakdown: Array<{ service: string; cost: string }>;
}

export interface EnvironmentVariable {
  key: string;
  purpose: string;
  getFrom: string;
  required: boolean;
  example?: string;
}

export interface ValidateResponse {
  valid: boolean;
  issues: Issue[];
  recommendation?: RuntimeRecommendation;
  estimatedCost?: CostEstimate;
  requiredEnv: EnvironmentVariable[];
}

export interface GenerateRequest {
  name: string;
  description: string;
  brain: string;
  tools: string[];
  runtime: string;
  config?: AgentConfig;
}

export interface GenerateResponse {
  buildId: string;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  estimatedTime: string;
  statusUrl: string;
}

export interface BuildResult {
  downloadUrl?: string;
  previewUrl?: string;
  setupInstructionsUrl?: string;
  deployUrl?: string;
  deployId?: string;
  sourceCode?: {
    typescript?: string;
    python?: string;
  };
}

export interface BuildError {
  message: string;
  code: string;
  canRetry: boolean;
  suggestedFix?: string;
}

export interface BuildStatus {
  buildId: string;
  status: 'queued' | 'generating' | 'complete' | 'failed' | 'deploying';
  progress: number;
  createdAt: number;
  updatedAt: number;
  result?: BuildResult;
  error?: BuildError;
}

export interface DeployRequest {
  buildId: string;
  platform: 'vercel' | 'github' | 'railway';
  credentials: {
    apiKey: string;
    projectName: string;
  };
}

export interface DeployResponse {
  deployId: string;
  status: 'queued' | 'deploying' | 'complete' | 'failed';
  estimatedTime: string;
  statusUrl: string;
}

export interface ToolSearchRequest {
  query?: string;
  category?: string;
  capabilities?: string[];
}

export interface ToolSummary {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ToolSearchResponse {
  tools: ToolSummary[];
  total: number;
}

export interface ToolImplementation {
  npm?: string[];
  endpoint?: string;
  template?: string;
}

export interface ToolCost {
  tier: 'free' | 'freemium' | 'paid';
  estimate?: string;
}

export interface ToolSpec {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredEnv: EnvironmentVariable[];
  implementation?: ToolImplementation;
  cost?: ToolCost;
  capabilities: string[];
  documentation?: string;
}
