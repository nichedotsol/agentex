import { BuildState } from '@/lib/stores/buildStore'

export function formatBuildForExport(buildState: BuildState) {
  const buildId = `build_${Date.now()}`
  const timestamp = new Date().toISOString()

  return {
    agentex_version: '0.1.0',
    build: {
      id: buildId,
      name: buildState.settings.name,
      description: buildState.settings.description,
      created: timestamp,
      author: buildState.settings.author
    },
    components: {
      brain: buildState.brain ? {
        ...buildState.brain.component,
        config: buildState.brain.config
      } : {},
      tools: buildState.tools.map(t => ({
        ...t.component,
        config: t.config
      })),
      runtime: buildState.runtime ? {
        ...buildState.runtime.component,
        config: buildState.runtime.config
      } : {}
    },
    connections: generateConnections(buildState),
    settings: buildState.settings
  }
}

export function generateConnections(buildState: BuildState) {
  const connections: any[] = []
  
  if (buildState.brain) {
    // Brain to tools
    buildState.tools.forEach(tool => {
      connections.push({
        from: buildState.brain!.id,
        to: tool.id,
        type: 'data_flow',
        config: {}
      })
    })
    
    // Brain to runtime
    if (buildState.runtime) {
      connections.push({
        from: buildState.brain.id,
        to: buildState.runtime.id,
        type: 'deployment',
        config: {}
      })
    }
  }
  
  // Tools to runtime
  buildState.tools.forEach(tool => {
    if (buildState.runtime) {
      connections.push({
        from: tool.id,
        to: buildState.runtime.id,
        type: 'data_flow',
        config: {}
      })
    }
  })
  
  return connections
}

export function loadBuildConfig(config: any): Partial<BuildState> {
  return {
    brain: config.components.brain ? {
      id: `brain_${Date.now()}`,
      component: config.components.brain,
      position: { x: 400, y: 300 },
      config: config.components.brain.config || {}
    } : null,
    tools: (config.components.tools || []).map((tool: any, i: number) => ({
      id: `tool_${Date.now()}_${i}`,
      component: tool,
      position: {
        x: 400 + Math.cos((i * 360 / 8) * Math.PI / 180) * 200,
        y: 300 + Math.sin((i * 360 / 8) * Math.PI / 180) * 200
      },
      config: tool.config || {}
    })),
    runtime: config.components.runtime ? {
      id: `runtime_${Date.now()}`,
      component: config.components.runtime,
      position: { x: 400, y: 600 },
      config: config.components.runtime.config || {}
    } : null,
    settings: config.settings || {
      token_budget: 1000,
      timeout: 30,
      retry_policy: 'none',
      name: 'BUILD_001',
      description: '',
      author: ''
    }
  }
}

export function generateDefaultBuildSettings() {
  return {
    token_budget: 1000,
    timeout: 30,
    retry_policy: 'none',
    name: `BUILD_${Date.now().toString().slice(-6)}`,
    description: '',
    author: ''
  }
}
