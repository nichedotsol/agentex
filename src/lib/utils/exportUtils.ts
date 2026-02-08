import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { generateCode, GeneratedFile } from './codeGenerator'
import { BuildState } from '@/lib/stores/buildStore'

export interface ExportProgress {
  step: string
  progress: number
  status: 'idle' | 'processing' | 'success' | 'error'
  message?: string
  error?: string
}

export async function exportToZip(
  buildState: BuildState,
  format: 'typescript' | 'python',
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  try {
    onProgress?.({
      step: 'Generating code',
      progress: 0,
      status: 'processing',
      message: 'Generating code files...'
    })

    const files = generateCode(buildState, {
      format,
      includeDependencies: true,
      includeReadme: true
    })

    onProgress?.({
      step: 'Creating ZIP',
      progress: 50,
      status: 'processing',
      message: 'Creating ZIP archive...'
    })

    const zip = new JSZip()
    
    files.forEach(file => {
      zip.file(file.path, file.content)
    })

    const blob = await zip.generateAsync({ type: 'blob' })
    const filename = `${buildState.settings.name.toLowerCase().replace(/\s+/g, '-')}-${format}-${Date.now()}.zip`
    
    onProgress?.({
      step: 'Downloading',
      progress: 90,
      status: 'processing',
      message: 'Preparing download...'
    })

    saveAs(blob, filename)

    onProgress?.({
      step: 'Complete',
      progress: 100,
      status: 'success',
      message: 'Export completed successfully!'
    })
  } catch (error) {
    onProgress?.({
      step: 'Error',
      progress: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
    throw error
  }
}

export async function exportToGitHub(
  buildState: BuildState,
  format: 'typescript' | 'python',
  githubToken: string,
  repoName: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<string> {
  try {
    onProgress?.({
      step: 'Generating code',
      progress: 10,
      status: 'processing',
      message: 'Generating code files...'
    })

    const files = generateCode(buildState, {
      format,
      includeDependencies: true,
      includeReadme: true
    })

    onProgress?.({
      step: 'Creating repository',
      progress: 50,
      status: 'processing',
      message: 'Creating GitHub repository...'
    })

    const response = await fetch('/api/github/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        githubToken,
        repoName,
        files: files.map(f => ({
          path: f.path,
          content: f.content
        }))
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to export to GitHub')
    }

    const result = await response.json()

    onProgress?.({
      step: 'Complete',
      progress: 100,
      status: 'success',
      message: `Repository created: ${result.repoUrl}`
    })

    return result.repoUrl
  } catch (error) {
    onProgress?.({
      step: 'Error',
      progress: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
    throw error
  }
}

export async function exportToVercel(
  buildState: BuildState,
  vercelToken: string,
  projectName: string,
  onProgress?: (progress: ExportProgress) => void
): Promise<string> {
  try {
    onProgress?.({
      step: 'Generating code',
      progress: 10,
      status: 'processing',
      message: 'Generating code files...'
    })

    const files = generateCode(buildState, {
      format: 'typescript',
      includeDependencies: true,
      includeReadme: true
    })

    onProgress?.({
      step: 'Creating Vercel project',
      progress: 40,
      status: 'processing',
      message: 'Creating Vercel project...'
    })

    const response = await fetch('/api/vercel/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vercelToken,
        projectName: projectName || buildState.settings.name.toLowerCase().replace(/\s+/g, '-'),
        files: files.map(f => ({
          path: f.path,
          content: f.content
        }))
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to deploy to Vercel')
    }

    const result = await response.json()

    onProgress?.({
      step: 'Deployment initiated',
      progress: 80,
      status: 'processing',
      message: 'Deployment is being processed...'
    })

    // Poll for deployment status (simplified - in production, use webhooks)
    onProgress?.({
      step: 'Complete',
      progress: 100,
      status: 'success',
      message: `Deployment initiated! Visit ${result.deploymentUrl} (may take a few minutes)`
    })

    return result.deploymentUrl
  } catch (error) {
    onProgress?.({
      step: 'Error',
      progress: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
    throw error
  }
}

export function exportToCursor(buildState: BuildState): string {
  // Generate Cursor deep link
  const buildConfig = JSON.stringify(buildState, null, 2)
  const encoded = encodeURIComponent(buildConfig)
  // This would be a Cursor-specific URL scheme
  return `cursor://import?config=${encoded}`
}
