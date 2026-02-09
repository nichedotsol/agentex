/**
 * In-Memory Build Status Store
 * TODO: Replace with database (Redis/Postgres) for production
 */

export interface BuildStatus {
  buildId: string;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  progress: number; // 0-100
  createdAt: number;
  updatedAt: number;
  agentId?: string; // Track which agent owns this build
  config?: any;
  result?: {
    downloadUrl?: string;
    previewUrl?: string;
    setupInstructionsUrl?: string;
    deployUrl?: string;
    deployId?: string;
    sourceCode?: {
      typescript?: string;
      python?: string;
    };
  };
  error?: {
    message: string;
    code: string;
    canRetry: boolean;
    suggestedFix?: string;
  };
}

// In-memory store (replace with database in production)
// Using globalThis to persist across serverless function invocations in the same process
const globalBuildStore = (globalThis as any).__agentex_build_store__ || new Map<string, BuildStatus>();
(globalThis as any).__agentex_build_store__ = globalBuildStore;
const buildStore = globalBuildStore;

export function createBuild(buildId: string, config: any): BuildStatus {
  const build: BuildStatus = {
    buildId,
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    config
  };
  
  buildStore.set(buildId, build);
  return build;
}

export function getBuildStatus(buildId: string): BuildStatus | null {
  return buildStore.get(buildId) || null;
}

export function updateBuildStatus(
  buildId: string,
  updates: Partial<BuildStatus>
): BuildStatus | null {
  const build = buildStore.get(buildId);
  if (!build) return null;
  
  const updated: BuildStatus = {
    ...build,
    ...updates,
    updatedAt: Date.now()
  };
  
  buildStore.set(buildId, updated);
  return updated;
}

export function deleteBuild(buildId: string): boolean {
  return buildStore.delete(buildId);
}

// Cleanup old builds (older than 24 hours)
export function cleanupOldBuilds() {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  for (const [buildId, build] of buildStore.entries()) {
    if (build.updatedAt < oneDayAgo) {
      buildStore.delete(buildId);
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldBuilds, 60 * 60 * 1000);
}
