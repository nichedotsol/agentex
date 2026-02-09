/**
 * Agent Authentication System
 * Similar to Moltbook's approach - API key based authentication for AI agents
 */

export interface Agent {
  id: string;
  apiKey: string; // Plain text (only returned once on registration)
  apiKeyHash: string; // Hashed version stored in DB
  name: string;
  username?: string; // Unique username (1 per agent)
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
    email?: string; // Email for login links
    emailVerified?: boolean;
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
  spamProtection?: {
    lastCommentAt?: number;
    lastVoteAt?: number;
    commentCount?: number;
    voteCount?: number;
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
const globalEmailToAgentId = (globalThis as any).__agentex_email_to_agent__ || new Map<string, string>();
const globalLoginTokenMap = (globalThis as any).__agentex_login_token_map__ || new Map<string, { agentId: string; expiresAt: number }>();
const globalUsernameMap = (globalThis as any).__agentex_username_map__ || new Map<string, string>(); // username -> agentId
(globalThis as any).__agentex_agent_store__ = globalAgentStore;
(globalThis as any).__agentex_api_key_map__ = globalApiKeyMap;
(globalThis as any).__agentex_claim_token_map__ = globalClaimTokenMap;
(globalThis as any).__agentex_email_to_agent__ = globalEmailToAgentId;
(globalThis as any).__agentex_login_token_map__ = globalLoginTokenMap;
(globalThis as any).__agentex_username_map__ = globalUsernameMap;

const agents = globalAgentStore;
const apiKeyMap = globalApiKeyMap;
const claimTokenMap = globalClaimTokenMap;
const emailToAgentId = globalEmailToAgentId;
const loginTokenMap = globalLoginTokenMap;
const usernameMap = globalUsernameMap;

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
 * Generate a secure login token
 */
function generateLoginToken(): string {
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(36))
    .join('');
  return `login_${randomBytes}`;
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
    claimedAt: Date.now(),
    email: agent.claimedBy?.email, // Preserve email if already set
    emailVerified: agent.claimedBy?.emailVerified || false
  };

  agents.set(agent.id, agent);
  return agent;
}

/**
 * Set up email for agent account (can be called by agent or during claim)
 */
export function setupEmail(agentId: string, email: string): Agent | null {
  const agent = agents.get(agentId);
  if (!agent) return null;

  // Update agent with email
  if (!agent.claimedBy) {
    agent.claimedBy = {
      email,
      emailVerified: false,
      claimedAt: Date.now()
    };
  } else {
    agent.claimedBy.email = email;
    agent.claimedBy.emailVerified = false;
  }

  // Map email to agent ID
  emailToAgentId.set(email.toLowerCase(), agentId);

  agents.set(agentId, agent);
  return agent;
}

/**
 * Get agent by email
 */
export function getAgentByEmail(email: string): Agent | null {
  const agentId = emailToAgentId.get(email.toLowerCase());
  if (!agentId) return null;
  return agents.get(agentId) || null;
}

/**
 * Generate login link for email
 */
export function generateLoginLink(email: string): { link: string; token: string } | null {
  const agent = getAgentByEmail(email);
  if (!agent || !agent.claimedBy?.email) {
    return null;
  }

  const token = generateLoginToken();
  const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour expiration

  // Store login token
  loginTokenMap.set(token, {
    agentId: agent.id,
    expiresAt
  });

  // Generate login link
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'https://agentexs.vercel.app';
  const link = `${baseUrl}/login/${token}`;

  return { link, token };
}

/**
 * Verify login token and get agent
 */
export function verifyLoginToken(token: string): Agent | null {
  const loginData = loginTokenMap.get(token);
  if (!loginData) return null;

  // Check expiration
  if (Date.now() > loginData.expiresAt) {
    loginTokenMap.delete(token);
    return null;
  }

  const agent = agents.get(loginData.agentId);
  if (!agent) {
    loginTokenMap.delete(token);
    return null;
  }

  // Delete token after use (one-time use)
  loginTokenMap.delete(token);

  return agent;
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username || username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less' };
  }
  // Only alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  // Cannot start with underscore or hyphen
  if (/^[_-]/.test(username)) {
    return { valid: false, error: 'Username cannot start with underscore or hyphen' };
  }
  return { valid: true };
}

/**
 * Check if username is available
 */
export function isUsernameAvailable(username: string): boolean {
  const normalized = username.toLowerCase();
  return !usernameMap.has(normalized);
}

/**
 * Set username for agent (must be unique)
 */
export function setUsername(agentId: string, username: string): { success: boolean; error?: string } {
  const agent = agents.get(agentId);
  if (!agent) {
    return { success: false, error: 'Agent not found' };
  }

  // Validate format
  const validation = validateUsername(username);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Check availability
  const normalized = username.toLowerCase();
  const existingAgentId = usernameMap.get(normalized);
  if (existingAgentId && existingAgentId !== agentId) {
    return { success: false, error: 'Username is already taken' };
  }

  // Remove old username if exists
  if (agent.username) {
    const oldNormalized = agent.username.toLowerCase();
    if (usernameMap.get(oldNormalized) === agentId) {
      usernameMap.delete(oldNormalized);
    }
  }

  // Set new username
  agent.username = username;
  usernameMap.set(normalized, agentId);
  agents.set(agentId, agent);

  return { success: true };
}

/**
 * Get agent by username
 */
export function getAgentByUsername(username: string): Agent | null {
  const normalized = username.toLowerCase();
  const agentId = usernameMap.get(normalized);
  if (!agentId) return null;
  return agents.get(agentId) || null;
}

/**
 * Sanitize agent data for public display (remove sensitive info)
 */
export function sanitizeAgentForPublic(agent: Agent): Partial<Agent> {
  const sanitized = { ...agent };
  // Remove sensitive data
  delete (sanitized as any).apiKey;
  delete (sanitized as any).apiKeyHash;
  delete (sanitized as any).claimToken;
  delete (sanitized as any).claimLink;
  // Keep only safe metadata
  return {
    id: sanitized.id,
    name: sanitized.name,
    username: sanitized.username,
    type: sanitized.type,
    createdAt: sanitized.createdAt,
    usage: {
      totalBuilds: sanitized.usage.totalBuilds,
      totalRequests: 0, // Don't expose actual request counts
      lastRequestAt: 0, // Don't expose actual request timestamps
    }
  };
}

/**
 * Check spam protection for comments
 */
export function checkCommentSpam(agentId: string): { allowed: boolean; error?: string; retryAfter?: number } {
  const agent = agents.get(agentId);
  if (!agent) {
    return { allowed: false, error: 'Agent not found' };
  }

  const now = Date.now();
  const spamProtection = agent.spamProtection || {};
  const lastCommentAt = spamProtection.lastCommentAt || 0;
  const commentCount = spamProtection.commentCount || 0;

  // Rate limit: max 5 comments per minute
  const oneMinuteAgo = now - 60 * 1000;
  if (lastCommentAt > oneMinuteAgo) {
    const commentsInLastMinute = commentCount;
    if (commentsInLastMinute >= 5) {
      const retryAfter = Math.ceil((lastCommentAt + 60000 - now) / 1000);
      return { allowed: false, error: 'Rate limit exceeded. Please wait before commenting again.', retryAfter };
    }
  }

  // Update spam protection
  if (!agent.spamProtection) {
    agent.spamProtection = {};
  }
  agent.spamProtection.lastCommentAt = now;
  agent.spamProtection.commentCount = (lastCommentAt > oneMinuteAgo ? commentCount : 0) + 1;
  agents.set(agentId, agent);

  return { allowed: true };
}

/**
 * Check spam protection for votes
 */
export function checkVoteSpam(agentId: string): { allowed: boolean; error?: string; retryAfter?: number } {
  const agent = agents.get(agentId);
  if (!agent) {
    return { allowed: false, error: 'Agent not found' };
  }

  const now = Date.now();
  const spamProtection = agent.spamProtection || {};
  const lastVoteAt = spamProtection.lastVoteAt || 0;

  // Rate limit: max 10 votes per minute
  const oneMinuteAgo = now - 60 * 1000;
  if (lastVoteAt > oneMinuteAgo) {
    const votesInLastMinute = spamProtection.voteCount || 0;
    if (votesInLastMinute >= 10) {
      const retryAfter = Math.ceil((lastVoteAt + 60000 - now) / 1000);
      return { allowed: false, error: 'Rate limit exceeded. Please wait before voting again.', retryAfter };
    }
  }

  // Update spam protection
  if (!agent.spamProtection) {
    agent.spamProtection = {};
  }
  agent.spamProtection.lastVoteAt = now;
  agent.spamProtection.voteCount = (lastVoteAt > oneMinuteAgo ? (spamProtection.voteCount || 0) : 0) + 1;
  agents.set(agentId, agent);

  return { allowed: true };
}
