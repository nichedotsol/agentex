/**
 * GitHub Integration
 * Allows agents to link builds to GitHub repositories
 */

export interface GitHubRepo {
  owner: string;
  repo: string;
  url: string;
  branch?: string;
}

/**
 * Create or link a GitHub repository for a build
 */
export async function linkGitHubRepo(
  buildId: string,
  githubToken: string,
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  // In production, this would:
  // 1. Create a GitHub repository if it doesn't exist
  // 2. Push the generated code to the repository
  // 3. Set up webhooks for build status updates
  
  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
    branch: 'main'
  };
}

/**
 * Get GitHub repository info for a build
 */
export function getBuildGitHubRepo(buildId: string): GitHubRepo | null {
  const githubLinks = (globalThis as any).__agentex_github_links__ || new Map<string, GitHubRepo>();
  (globalThis as any).__agentex_github_links__ = githubLinks;
  return githubLinks.get(buildId) || null;
}

/**
 * Store GitHub repository link for a build
 */
export function setBuildGitHubRepo(buildId: string, repo: GitHubRepo) {
  const githubLinks = (globalThis as any).__agentex_github_links__ || new Map<string, GitHubRepo>();
  (globalThis as any).__agentex_github_links__ = githubLinks;
  githubLinks.set(buildId, repo);
}
