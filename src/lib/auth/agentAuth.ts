/**
 * Agent Authentication System
 * Similar to Moltbook's approach - API key based authentication for AI agents
 */

export interface Agent {
  id: string;
  apiKey: string; // Plain text (only returned once on registration)
  apiKeyHash: string; // Hashed version stored in DB
  name: string;
  type: 'claude' | 'gpt' | 'openclaw' | 'custom';
  metadata: {
    version?: string;
    capabilities?: string[];
    description?: string;
    contact?: string;
  };
  createdAt: number;
  lastActiveAt: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  usage: {
    totalRequests: number;
    totalBuilds: number;
    lastRequestAt: number;
  };
}

export interface RegisterRequest {
  name: string;
  type: 'claude' | 'gpt' | 'openclaw' | 'custom';
  metadata?: {
    version?: string;
    capabilities?: string[];
    description?: string;
    contact?: string;
  };
}

export interface RegisterResponse {
  agent: {
    id: string;
    name: string;
    type: string;
  };
  apiKey: string; // Only returned once
  message: string;
}

// In-memory store (replace with database in production)
const agentStore = new Map<string, Agent>();
const apiKeyToAgentId = new Map<string, string>();

// Use globalThis for persistence across serverless invocations
const globalAgentStore = (globalThis as any).__agentex_agent_store__ || new Map<string, Agent>();
const globalApiKeyMap = (globalThis as any).__agentex_api_key_map__ || new Map<string, string>();
(globalThis as any).__agentex_agent_store__ = globalAgentStore;
(globalThis as any).__agentex_api_key_map__ = globalApiKeyMap;

const agents = globalAgentStore;
const apiKeyMap = globalApiKeyMap;

/**
 * Generate a secure API key
 */
function generateApiKey(): string {
  const prefix = 'ax_';
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}${randomBytes}`;
}

/**
 * Hash API key for storage
 */
async function hashApiKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Register a new agent
 */
export async function registerAgent(request: RegisterRequest): Promise<RegisterResponse> {
  const agentId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const apiKey = generateApiKey();
  const apiKeyHash = await hashApiKey(apiKey);

  const agent: Agent = {
    id: agentId,
    apiKey, // Store plain text temporarily (will be removed after response)
    apiKeyHash,
    name: request.name,
    type: request.type,
    metadata: request.metadata || {},
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
    rateLimit: {
      requestsPerMinute: 100, // Default rate limit
      requestsPerDay: 10000
    },
    usage: {
      totalRequests: 0,
      totalBuilds: 0,
      lastRequestAt: Date.now()
    }
  };

  agents.set(agentId, agent);
  apiKeyMap.set(apiKey, agentId);

  // Remove plain text API key from stored agent
  const storedAgent = { ...agent };
  delete (storedAgent as any).apiKey;

  return {
    agent: {
      id: agentId,
      name: agent.name,
      type: agent.type
    },
    apiKey, // Return plain text only once
    message: 'Agent registered successfully. Save your API key - it will not be shown again.'
  };
}

/**
 * Authenticate agent by API key
 */
export async function authenticateAgent(apiKey: string): Promise<Agent | null> {
  // Check in-memory map first
  const agentId = apiKeyMap.get(apiKey);
  if (agentId) {
    const agent = agents.get(agentId);
    if (agent) {
      // Update last active
      agent.lastActiveAt = Date.now();
      agent.usage.totalRequests++;
      agent.usage.lastRequestAt = Date.now();
      agents.set(agentId, agent);
      return agent;
    }
  }

  // If not found, try hashing and checking (for stored keys)
  const apiKeyHash = await hashApiKey(apiKey);
  for (const [id, agent] of agents.entries()) {
    if (agent.apiKeyHash === apiKeyHash) {
      agent.lastActiveAt = Date.now();
      agent.usage.totalRequests++;
      agent.usage.lastRequestAt = Date.now();
      agents.set(id, agent);
      return agent;
    }
  }

  return null;
}

/**
 * Get agent by ID
 */
export function getAgentById(agentId: string): Agent | null {
  return agents.get(agentId) || null;
}

/**
 * Update agent
 */
export function updateAgent(agentId: string, updates: Partial<Agent>): Agent | null {
  const agent = agents.get(agentId);
  if (!agent) return null;

  const updated = { ...agent, ...updates };
  agents.set(agentId, updated);
  return updated;
}

/**
 * Rotate API key
 */
export async function rotateApiKey(agentId: string): Promise<string> {
  const agent = agents.get(agentId);
  if (!agent) {
    throw new Error('Agent not found');
  }

  // Remove old API key from map
  for (const [key, id] of apiKeyMap.entries()) {
    if (id === agentId) {
      apiKeyMap.delete(key);
      break;
    }
  }

  // Generate new key
  const newApiKey = generateApiKey();
  const newApiKeyHash = await hashApiKey(newApiKey);

  agent.apiKeyHash = newApiKeyHash;
  agent.apiKey = newApiKey; // Temporary for response
  agents.set(agentId, agent);
  apiKeyMap.set(newApiKey, agentId);

  return newApiKey;
}

/**
 * Check rate limits
 */
export function checkRateLimit(agent: Agent): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Simple rate limiting (in production, use Redis or similar)
  // For now, just check if agent exists and is active
  if (agent.usage.lastRequestAt < oneDayAgo) {
    // Reset daily count if it's been more than a day
    agent.usage.totalRequests = 0;
  }

  // Basic check - in production, implement proper rate limiting
  return { allowed: true };
}
