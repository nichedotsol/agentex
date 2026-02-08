import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Load registry
    const registryResponse = await fetch(`${request.nextUrl.origin}/components/registry.json`)
    const registry = await registryResponse.json()

    const components = {
      brains: [],
      tools: [],
      runtimes: []
    }

    // Load all components
    for (const brainId of registry.components.brains) {
      const comp = await fetch(`${request.nextUrl.origin}/components/${brainId}`)
      components.brains.push(await comp.json())
    }
    for (const toolId of registry.components.tools) {
      const comp = await fetch(`${request.nextUrl.origin}/components/${toolId}`)
      components.tools.push(await comp.json())
    }
    for (const runtimeId of registry.components.runtimes) {
      const comp = await fetch(`${request.nextUrl.origin}/components/${runtimeId}`)
      components.runtimes.push(await comp.json())
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
