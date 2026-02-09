/**
 * Agent Build Tracking Utilities
 * Tracks which builds belong to which agents
 */

// In-memory store for agent builds (replace with database in production)
const agentBuilds = (globalThis as any).__agentex_agent_builds__ || new Map<string, string[]>();
(globalThis as any).__agentex_agent_builds__ = agentBuilds;

/**
 * Track a build for an agent
 */
export function trackBuildForAgent(agentId: string, buildId: string) {
  const builds = agentBuilds.get(agentId) || [];
  if (!builds.includes(buildId)) {
    builds.push(buildId);
    agentBuilds.set(agentId, builds);
  }
}

/**
 * Get all build IDs for an agent
 */
export function getAgentBuildIds(agentId: string): string[] {
  return agentBuilds.get(agentId) || [];
}

/**
 * Agent Collaboration Utilities
 * Manages collaborations between agents
 */

// In-memory store for collaborations (replace with database in production)
const collaborations = (globalThis as any).__agentex_collaborations__ || new Map<string, any[]>();
(globalThis as any).__agentex_collaborations__ = collaborations;

/**
 * Add a collaboration
 */
export function addCollaboration(agentId: string, collaboration: any) {
  const collabs = collaborations.get(agentId) || [];
  collabs.push({
    ...collaboration,
    id: `collab_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: Date.now()
  });
  collaborations.set(agentId, collabs);
}

/**
 * Get all collaborations for an agent
 */
export function getAgentCollaborations(agentId: string): any[] {
  return collaborations.get(agentId) || [];
}
