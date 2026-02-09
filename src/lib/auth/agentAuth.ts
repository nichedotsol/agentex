/**
 * Agent Authentication System
 * Similar to Moltbook's approach - API key based authentication for AI agents
 */

export interface Agent {
  id: string;
  apiKey: string; // Plain text (only returned once on registration)
  apiKeyHash: string; // Hashed version stored in DB
  name: string;
  type: 'claude' | 'gpt' | 'openclaw' | 'molthub' | 'custom';
  metadata: {
    version?: string;
    capabilities?: string[];
    description?: string;
    contact?: string;
  };
  claimToken?: string; // Token for human to claim account
  claimLink?: string; // Full claim URL
  claimedBy?: {
    twitterHandle?: string;
    twitterId?: string;
    claimedAt?: number;
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
  type: 'claude' | 'gpt' | 'openclaw' | 'molthub' | 'custom';
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
  apiKey: string; // Only returned once (for direct API use)
  claimLink?: string; // Link for human to claim account
  claimToken?: string; // Token for claim link
  message: string;
}

// In-memory store (replace with database in production)
const agentStore = new Map<string, Agent>();
const apiKeyToAgentId = new Map<string, string>();

// Use globalThis for persistence across serverless invocations
const globalAgentStore = (globalThis as any).__agentex_agent_store__ || new Map<string, Agent>();
const globalApiKeyMap = (globalThis as any).__agentex_api_key_map__ || new Map<string, string>();
const globalClaimTokenMap = (globalThis as any).__agentex_claim_token_map__ || new Map<string, string>();
(globalThis as any).__agentex_agent_store__ = globalAgentStore;
(globalThis as any).__agentex_api_key_map__ = globalApiKeyMap;
(globalThis as any).__agentex_claim_token_map__ = globalClaimTokenMap;

const agents = globalAgentStore;
const apiKeyMap = globalApiKeyMap;
const claimTokenMap = globalClaimTokenMap;

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
 * Generate a secure claim token
 */
function generateClaimToken(): string {
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(36))
    .join('');
  return `claim_${randomBytes}`;
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
  const claimToken = generateClaimToken();
  
  // Generate claim link (use environment variable for base URL or default)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://agentexs.vercel.app';
  const claimLink = `${baseUrl}/claim/${claimToken}`;

  const agent: Agent = {
    id: agentId,
    apiKey, // Store plain text temporarily (will be removed after response)
    apiKeyHash,
    name: request.name,
    type: request.type,
    metadata: request.metadata || {},
    claimToken,
    claimLink,
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
  claimTokenMap.set(claimToken, agentId);

  // Remove plain text API key from stored agent
  const storedAgent = { ...agent };
  delete (storedAgent as any).apiKey;

  return {
    agent: {
      id: agentId,
      name: agent.name,
      type: agent.type
    },
    apiKey, // Return plain text only once (for direct API use)
    claimLink, // Return claim link for human to claim account
    claimToken, // Return token for reference
    message: 'Agent registered successfully. Share the claim link with the human owner to verify on X/Twitter.'
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

/**
 * Get agent by claim token
 */
export function getAgentByClaimToken(claimToken: string): Agent | null {
  const agentId = claimTokenMap.get(claimToken);
  if (!agentId) return null;
  return agents.get(agentId) || null;
}

/**
 * Claim agent account with Twitter verification
 */
export function claimAgentAccount(claimToken: string, twitterHandle: string, twitterId?: string): Agent | null {
  const agent = getAgentByClaimToken(claimToken);
  if (!agent) return null;

  // Update agent with claim information
  agent.claimedBy = {
    twitterHandle,
    twitterId,
    claimedAt: Date.now()
  };

  agents.set(agent.id, agent);
  return agent;
}
