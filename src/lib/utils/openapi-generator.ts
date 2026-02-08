/**
 * OpenAPI Specification Generator
 * Generates OpenAPI specs programmatically
 */

import { ToolSpec } from '@/lib/types/tool-spec';

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
  };
}

/**
 * Generate OpenAPI spec from current API structure
 */
export function generateOpenAPISpec(baseUrl: string = 'https://agentexs.vercel.app'): OpenAPISpec {
  return {
    openapi: '3.0.3',
    info: {
      title: 'AgentEX Skill API',
      version: '2.0.0',
      description: 'API for autonomous AI agents to programmatically build other agents.'
    },
    servers: [
      {
        url: `${baseUrl}/api/agentex/v2`,
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000/api/agentex/v2',
        description: 'Local development server'
      }
    ],
    paths: {
      '/validate': {
        post: {
          tags: ['Validation'],
          summary: 'Validate agent requirements',
          operationId: 'validateAgent',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidateRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Validation successful',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ValidateResponse' }
                }
              }
            }
          }
        }
      },
      '/generate': {
        post: {
          tags: ['Generation'],
          summary: 'Generate agent code',
          operationId: 'generateAgent',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GenerateRequest' }
              }
            }
          },
          responses: {
            '202': {
              description: 'Generation started',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/GenerateResponse' }
                }
              }
            }
          }
        }
      },
      '/status/{buildId}': {
        get: {
          tags: ['Generation'],
          summary: 'Get build status',
          operationId: 'getBuildStatus',
          parameters: [
            {
              name: 'buildId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Build status',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BuildStatus' }
                }
              }
            }
          }
        }
      },
      '/deploy': {
        post: {
          tags: ['Deployment'],
          summary: 'Deploy agent',
          operationId: 'deployAgent',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeployRequest' }
              }
            }
          },
          responses: {
            '202': {
              description: 'Deployment started',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/DeployResponse' }
                }
              }
            }
          }
        }
      },
      '/tools/search': {
        post: {
          tags: ['Tools'],
          summary: 'Search tools',
          operationId: 'searchTools',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ToolSearchRequest' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Search results',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ToolSearchResponse' }
                }
              }
            }
          }
        }
      },
      '/tools/{toolId}': {
        get: {
          tags: ['Tools'],
          summary: 'Get tool details',
          operationId: 'getTool',
          parameters: [
            {
              name: 'toolId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Tool details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ToolSpec' }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        ValidateRequest: {
          type: 'object',
          required: ['name', 'description', 'brain', 'tools'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            brain: { type: 'string' },
            tools: { type: 'array', items: { type: 'string' } },
            runtime: { type: 'string' },
            config: { $ref: '#/components/schemas/AgentConfig' }
          }
        },
        ValidateResponse: {
          type: 'object',
          properties: {
            valid: { type: 'boolean' },
            issues: { type: 'array', items: { $ref: '#/components/schemas/Issue' } },
            recommendation: { $ref: '#/components/schemas/RuntimeRecommendation' },
            estimatedCost: { $ref: '#/components/schemas/CostEstimate' },
            requiredEnv: { type: 'array', items: { $ref: '#/components/schemas/EnvironmentVariable' } }
          }
        },
        GenerateRequest: {
          type: 'object',
          required: ['name', 'description', 'brain', 'tools'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            brain: { type: 'string' },
            tools: { type: 'array', items: { type: 'string' } },
            runtime: { type: 'string' },
            config: { $ref: '#/components/schemas/AgentConfig' }
          }
        },
        GenerateResponse: {
          type: 'object',
          properties: {
            buildId: { type: 'string' },
            status: { type: 'string', enum: ['queued', 'generating', 'complete', 'failed'] },
            estimatedTime: { type: 'string' },
            statusUrl: { type: 'string' }
          }
        },
        BuildStatus: {
          type: 'object',
          properties: {
            buildId: { type: 'string' },
            status: { type: 'string', enum: ['queued', 'generating', 'complete', 'failed', 'deploying'] },
            progress: { type: 'number', minimum: 0, maximum: 100 },
            createdAt: { type: 'number' },
            updatedAt: { type: 'number' },
            result: { $ref: '#/components/schemas/BuildResult' },
            error: { $ref: '#/components/schemas/BuildError' }
          }
        },
        BuildResult: {
          type: 'object',
          properties: {
            downloadUrl: { type: 'string' },
            previewUrl: { type: 'string' },
            setupInstructionsUrl: { type: 'string' },
            deployUrl: { type: 'string' },
            deployId: { type: 'string' },
            sourceCode: {
              type: 'object',
              properties: {
                typescript: { type: 'string' },
                python: { type: 'string' }
              }
            }
          }
        },
        BuildError: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            canRetry: { type: 'boolean' },
            suggestedFix: { type: 'string' }
          }
        },
        DeployRequest: {
          type: 'object',
          required: ['buildId', 'platform', 'credentials'],
          properties: {
            buildId: { type: 'string' },
            platform: { type: 'string', enum: ['vercel', 'github', 'railway'] },
            credentials: {
              type: 'object',
              properties: {
                apiKey: { type: 'string' },
                projectName: { type: 'string' }
              }
            }
          }
        },
        DeployResponse: {
          type: 'object',
          properties: {
            deployId: { type: 'string' },
            status: { type: 'string', enum: ['queued', 'deploying', 'complete', 'failed'] },
            estimatedTime: { type: 'string' },
            statusUrl: { type: 'string' }
          }
        },
        ToolSearchRequest: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            category: { type: 'string' },
            capabilities: { type: 'array', items: { type: 'string' } }
          }
        },
        ToolSearchResponse: {
          type: 'object',
          properties: {
            tools: { type: 'array', items: { $ref: '#/components/schemas/ToolSummary' } },
            total: { type: 'number' }
          }
        },
        ToolSummary: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' }
          }
        },
        ToolSpec: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            requiredEnv: { type: 'array', items: { $ref: '#/components/schemas/EnvironmentVariable' } },
            implementation: { $ref: '#/components/schemas/ToolImplementation' },
            cost: { $ref: '#/components/schemas/ToolCost' },
            capabilities: { type: 'array', items: { type: 'string' } },
            documentation: { type: 'string' }
          }
        },
        AgentConfig: {
          type: 'object',
          properties: {
            temperature: { type: 'number', minimum: 0, maximum: 2, default: 0.7 },
            maxTokens: { type: 'number', default: 4096 },
            cronSchedule: { type: 'string' },
            timeout: { type: 'number', default: 30 }
          }
        },
        RuntimeRecommendation: {
          type: 'object',
          properties: {
            primary: { type: 'string' },
            reasoning: { type: 'string' },
            alternatives: { type: 'array', items: { type: 'string' } },
            cost: { type: 'string' },
            limitations: { type: 'array', items: { type: 'string' } },
            difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
            estimatedTime: { type: 'string' }
          }
        },
        CostEstimate: {
          type: 'object',
          properties: {
            total: { type: 'string' },
            breakdown: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  cost: { type: 'string' }
                }
              }
            }
          }
        },
        Issue: {
          type: 'object',
          properties: {
            severity: { type: 'string', enum: ['error', 'warning'] },
            message: { type: 'string' },
            field: { type: 'string' }
          }
        },
        EnvironmentVariable: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            purpose: { type: 'string' },
            getFrom: { type: 'string' },
            required: { type: 'boolean' },
            example: { type: 'string' }
          }
        },
        ToolImplementation: {
          type: 'object',
          properties: {
            npm: { type: 'array', items: { type: 'string' } },
            endpoint: { type: 'string' },
            template: { type: 'string' }
          }
        },
        ToolCost: {
          type: 'object',
          properties: {
            tier: { type: 'string', enum: ['free', 'freemium', 'paid'] },
            estimate: { type: 'string' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                code: { type: 'string' },
                details: { type: 'object' }
              }
            }
          }
        }
      }
    }
  };
}
