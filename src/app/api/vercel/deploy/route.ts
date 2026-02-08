import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vercelToken, projectName, files } = body

    if (!vercelToken || !projectName || !files) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Step 1: Create Vercel project
    const createProjectResponse = await fetch('https://api.vercel.com/v9/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        framework: 'nextjs',
        gitRepository: null, // We'll deploy directly
      }),
    })

    if (!createProjectResponse.ok) {
      const error = await createProjectResponse.json()
      // If project already exists, that's okay - we'll use it
      if (error.error?.code !== 'project_already_exists') {
        return NextResponse.json(
          { error: error.error?.message || 'Failed to create Vercel project' },
          { status: createProjectResponse.status }
        )
      }
    }

    const project = await createProjectResponse.ok 
      ? await createProjectResponse.json()
      : { name: projectName }

    // Step 2: Create deployment
    // Vercel API v13 uses a different format - we'll use the deployment API
    // Convert files to the format Vercel expects
    const vercelFiles: Record<string, string> = {}
    files.forEach((file: { path: string; content: string }) => {
      vercelFiles[file.path] = file.content
    })

    const deploymentResponse = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: project.name || projectName,
        files: vercelFiles,
        projectSettings: {
          framework: 'nextjs',
          buildCommand: 'npm run build',
          outputDirectory: '.next',
          installCommand: 'npm install',
        },
        target: 'production',
      }),
    })

    if (!deploymentResponse.ok) {
      const error = await deploymentResponse.json()
      return NextResponse.json(
        { error: error.error?.message || 'Failed to create deployment' },
        { status: deploymentResponse.status }
      )
    }

    const deployment = await deploymentResponse.json()

    return NextResponse.json({
      success: true,
      deploymentUrl: deployment.url || `https://${project.name}.vercel.app`,
      deploymentId: deployment.id,
      projectId: project.id || project.name,
      message: 'Deployment initiated successfully. It may take a few minutes to complete.',
    })
  } catch (error: any) {
    console.error('Vercel deployment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to deploy to Vercel' },
      { status: 500 }
    )
  }
}
