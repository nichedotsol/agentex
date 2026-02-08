import { BuildState } from '@/lib/stores/buildStore'
import { Component } from '@/hooks/useComponentRegistry'

export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  author: string
  version: string
  components: {
    brain: string
    tools: string[]
    runtime: string
  }
  settings: {
    name: string
    description: string
    author: string
    token_budget: number
    timeout?: number
    retry_policy?: string
  }
  config?: {
    temperature?: number
    max_tokens?: number
    system_prompt?: string
  }
}

export interface TemplateRegistry {
  version: string
  last_updated: string
  templates: string[]
  categories: {
    [key: string]: {
      name: string
      description: string
      color: string
    }
  }
}

export async function loadTemplateRegistry(): Promise<TemplateRegistry> {
  const response = await fetch('/templates/registry.json')
  if (!response.ok) throw new Error('Failed to load template registry')
  return response.json()
}

export async function loadTemplate(templateId: string): Promise<AgentTemplate> {
  const response = await fetch(`/templates/${templateId}.json`)
  if (!response.ok) throw new Error(`Failed to load template: ${templateId}`)
  return response.json()
}

export async function loadAllTemplates(): Promise<AgentTemplate[]> {
  const registry = await loadTemplateRegistry()
  const templates = await Promise.all(
    registry.templates.map(id => loadTemplate(id.replace('.json', '')))
  )
  return templates
}

export function applyTemplateToBuild(
  template: AgentTemplate,
  availableComponents: { brains: Component[], tools: Component[], runtimes: Component[] }
): Partial<BuildState> {
  const brain = availableComponents.brains.find(c => c.id === template.components.brain)
  const tools = template.components.tools
    .map(toolId => availableComponents.tools.find(c => c.id === toolId))
    .filter(Boolean) as Component[]
  const runtime = availableComponents.runtimes.find(c => c.id === template.components.runtime)

  if (!brain || !runtime) {
    throw new Error('Template references unavailable components')
  }

  return {
    settings: {
      ...template.settings,
      timeout: template.settings.timeout || 30,
      retry_policy: template.settings.retry_policy || 'none'
    },
    brain: brain ? {
      id: `brain_${Date.now()}`,
      component: brain,
      position: { x: 400, y: 300 },
      config: template.config || {}
    } : null,
    tools: tools.map((tool, i) => ({
      id: `tool_${Date.now()}_${i}`,
      component: tool,
      position: { x: 400 + Math.cos((i * 360 / tools.length) * Math.PI / 180) * 200, y: 300 + Math.sin((i * 360 / tools.length) * Math.PI / 180) * 200 },
      config: {}
    })),
    runtime: runtime ? {
      id: `runtime_${Date.now()}`,
      component: runtime,
      position: { x: 400, y: 600 },
      config: {}
    } : null,
    validation: { valid: true, errors: [], warnings: [] }
  }
}
