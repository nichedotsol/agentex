/**
 * AgentEX API Client
 */

import {
  ValidateRequest,
  ValidateResponse,
  GenerateRequest,
  GenerateResponse,
  BuildStatus,
  DeployRequest,
  DeployResponse,
  ToolSearchRequest,
  ToolSearchResponse,
  ToolSpec
} from './models';

export interface ClientOptions {
  baseUrl?: string;
  apiKey?: string;
}

export class AgentEXClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = options.baseUrl || 'https://agentexs.vercel.app/api/agentex/v2';
    this.apiKey = options.apiKey;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Validate agent requirements
   */
  async validate(request: ValidateRequest): Promise<ValidateResponse> {
    return this.request<ValidateResponse>('POST', '/validate', request);
  }

  /**
   * Generate agent code
   */
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('POST', '/generate', request);
  }

  /**
   * Get build status
   */
  async getStatus(buildId: string): Promise<BuildStatus> {
    return this.request<BuildStatus>('GET', `/status/${buildId}`);
  }

  /**
   * Wait for build to complete
   */
  async waitForCompletion(
    buildId: string,
    timeout: number = 300000,
    pollInterval: number = 5000
  ): Promise<BuildStatus> {
    const startTime = Date.now();

    while (true) {
      const status = await this.getStatus(buildId);

      if (status.status === 'complete' || status.status === 'failed') {
        return status;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error(`Build ${buildId} did not complete within ${timeout}ms`);
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Deploy agent
   */
  async deploy(request: DeployRequest): Promise<DeployResponse> {
    return this.request<DeployResponse>('POST', '/deploy', request);
  }

  /**
   * Search tools
   */
  async searchTools(request: ToolSearchRequest): Promise<ToolSearchResponse> {
    return this.request<ToolSearchResponse>('POST', '/tools/search', request);
  }

  /**
   * Get tool details
   */
  async getTool(toolId: string): Promise<ToolSpec> {
    return this.request<ToolSpec>('GET', `/tools/${toolId}`);
  }
}
