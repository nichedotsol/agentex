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
  // This would require Vercel API integration
  onProgress?.({
    step: 'Vercel Export',
    progress: 0,
    status: 'processing',
    message: 'Vercel export requires API integration'
  })
  
  throw new Error('Vercel export not yet implemented. Use local export instead.')
}

export function exportToCursor(buildState: BuildState): string {
  // Generate Cursor deep link
  const buildConfig = JSON.stringify(buildState, null, 2)
  const encoded = encodeURIComponent(buildConfig)
  // This would be a Cursor-specific URL scheme
  return `cursor://import?config=${encoded}`
}
