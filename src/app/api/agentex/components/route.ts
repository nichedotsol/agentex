import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Load registry
    const registryResponse = await fetch(`${request.nextUrl.origin}/components/registry.json`)
    const registry = await registryResponse.json()

    const components: {
      brains: any[]
      tools: any[]
      runtimes: any[]
    } = {
      brains: [],
      tools: [],
      runtimes: []
    }

    // Load all components
    for (const brainId of registry.components.brains) {
      const comp = await fetch(`${request.nextUrl.origin}/components/${brainId}`)
      const componentData = await comp.json()
      components.brains.push(componentData)
    }
    for (const toolId of registry.components.tools) {
      const comp = await fetch(`${request.nextUrl.origin}/components/${toolId}`)
      const componentData = await comp.json()
      components.tools.push(componentData)
    }
    for (const runtimeId of registry.components.runtimes) {
      const comp = await fetch(`${request.nextUrl.origin}/components/${runtimeId}`)
      const componentData = await comp.json()
      components.runtimes.push(componentData)
    }

    return NextResponse.json(components)
  } catch (error: any) {
    console.error('AgentEX components error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to load components' },
      { status: 500 }
    )
  }
}
