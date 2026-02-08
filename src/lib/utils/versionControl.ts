import { BuildState } from '@/lib/stores/buildStore'

export interface BuildVersion {
  id: string
  name: string
  description?: string
  timestamp: number
  buildState: BuildState
  author?: string
  tags?: string[]
}

export interface VersionHistory {
  versions: BuildVersion[]
  currentVersionId: string | null
}

const STORAGE_KEY = 'agentex-version-history'
const MAX_VERSIONS = 50 // Limit to prevent storage bloat

export function saveVersion(
  buildState: BuildState,
  name: string,
  description?: string,
  author?: string,
  tags?: string[]
): BuildVersion {
  const version: BuildVersion = {
    id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    timestamp: Date.now(),
    buildState: JSON.parse(JSON.stringify(buildState)), // Deep clone
    author,
    tags
  }

  const history = getVersionHistory()
  history.versions.unshift(version) // Add to beginning
  
  // Limit versions
  if (history.versions.length > MAX_VERSIONS) {
    history.versions = history.versions.slice(0, MAX_VERSIONS)
  }

  // Set as current if it's the first version
  if (history.versions.length === 1) {
    history.currentVersionId = version.id
  }

  saveVersionHistory(history)
  return version
}

export function getVersionHistory(): VersionHistory {
  if (typeof window === 'undefined') {
    return { versions: [], currentVersionId: null }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load version history:', error)
  }

  return { versions: [], currentVersionId: null }
}

export function saveVersionHistory(history: VersionHistory): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save version history:', error)
    // If storage is full, try to remove oldest versions
    if (error instanceof DOMException && error.code === 22) {
      const trimmed = {
        ...history,
        versions: history.versions.slice(0, 10)
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
      } catch (e) {
        console.error('Failed to save trimmed version history:', e)
      }
    }
  }
}

export function getVersion(versionId: string): BuildVersion | null {
  const history = getVersionHistory()
  return history.versions.find(v => v.id === versionId) || null
}

export function deleteVersion(versionId: string): boolean {
  const history = getVersionHistory()
  const index = history.versions.findIndex(v => v.id === versionId)
  
  if (index === -1) return false

  history.versions.splice(index, 1)
  
  // If deleted version was current, set to most recent
  if (history.currentVersionId === versionId) {
    history.currentVersionId = history.versions.length > 0 ? history.versions[0].id : null
  }

  saveVersionHistory(history)
  return true
}

export function setCurrentVersion(versionId: string): boolean {
  const history = getVersionHistory()
  const version = history.versions.find(v => v.id === versionId)
  
  if (!version) return false

  history.currentVersionId = versionId
  saveVersionHistory(history)
  return true
}

export function getCurrentVersion(): BuildVersion | null {
  const history = getVersionHistory()
  if (!history.currentVersionId) return null
  return getVersion(history.currentVersionId)
}

export function compareVersions(versionId1: string, versionId2: string): {
  differences: string[]
  similarity: number
} {
  const v1 = getVersion(versionId1)
  const v2 = getVersion(versionId2)

  if (!v1 || !v2) {
    return { differences: ['One or both versions not found'], similarity: 0 }
  }

  const differences: string[] = []
  let totalFields = 0
  let matchingFields = 0

  // Compare settings
  const settings1 = v1.buildState.settings
  const settings2 = v2.buildState.settings
  for (const key in settings1) {
    totalFields++
    if (settings1[key as keyof typeof settings1] !== settings2[key as keyof typeof settings2]) {
      differences.push(`Setting "${key}" changed`)
    } else {
      matchingFields++
    }
  }

  // Compare brain
  const brain1 = v1.buildState.brain
  const brain2 = v2.buildState.brain
  if (brain1?.component.id !== brain2?.component.id) {
    differences.push('Brain component changed')
  } else {
    matchingFields++
  }
  totalFields++

  // Compare tools count
  if (v1.buildState.tools.length !== v2.buildState.tools.length) {
    differences.push(`Tool count changed: ${v1.buildState.tools.length} → ${v2.buildState.tools.length}`)
  } else {
    matchingFields++
  }
  totalFields++

  // Compare runtime
  const runtime1 = v1.buildState.runtime
  const runtime2 = v2.buildState.runtime
  if (runtime1?.component.id !== runtime2?.component.id) {
    differences.push('Runtime component changed')
  } else {
    matchingFields++
  }
  totalFields++

  const similarity = totalFields > 0 ? (matchingFields / totalFields) * 100 : 0

  return { differences, similarity }
}

export function exportVersionHistory(): string {
  const history = getVersionHistory()
  return JSON.stringify(history, null, 2)
}

export function importVersionHistory(json: string): boolean {
  try {
    const history = JSON.parse(json) as VersionHistory
    saveVersionHistory(history)
    return true
  } catch (error) {
    console.error('Failed to import version history:', error)
    return false
  }
}
