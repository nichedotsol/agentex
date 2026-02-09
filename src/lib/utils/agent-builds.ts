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
