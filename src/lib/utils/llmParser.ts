import { Component } from '@/hooks/useComponentRegistry'

export interface ParsedIntent {
  action: 'add' | 'remove' | 'configure' | 'deploy' | 'test' | 'save'
  componentType?: 'brain' | 'tool' | 'runtime' | 'memory'
  componentName?: string
  componentId?: string
  config?: Record<string, any>
  description?: string
  confidence: number
}

export interface LLMParseResult {
  intent: ParsedIntent
  suggestions?: string[]
  alternativeIntents?: ParsedIntent[]
}

/**
 * LLM-powered natural language parser for AgentEX
 * Uses pattern matching and semantic analysis to understand user intent
 */
export class LLMParser {
  private components: {
    brains: Component[]
    tools: Component[]
    runtimes: Component[]
    memories: Component[]
  }

  constructor(components: {
    brains: Component[]
    tools: Component[]
    runtimes: Component[]
    memories: Component[]
  }) {
    this.components = components
  }

  /**
   * Parse natural language input into structured intent
   */
  async parse(input: string): Promise<LLMParseResult> {
    const normalized = input.toLowerCase().trim()
    
    // Extract action keywords
    const actionPatterns = {
      add: ['add', 'create', 'new', 'include', 'use', 'with', 'need'],
      remove: ['remove', 'delete', 'drop', 'take out', 'exclude'],
      configure: ['set', 'configure', 'change', 'update', 'modify', 'adjust'],
      deploy: ['deploy', 'export', 'publish', 'ship', 'release'],
      test: ['test', 'try', 'run', 'check'],
      save: ['save', 'store', 'version', 'snapshot']
    }

    // Determine action
    let action: ParsedIntent['action'] = 'add'
    let actionConfidence = 0.5

    for (const [act, patterns] of Object.entries(actionPatterns)) {
      for (const pattern of patterns) {
        if (normalized.includes(pattern)) {
          action = act as ParsedIntent['action']
          actionConfidence = 0.9
          break
        }
      }
      if (actionConfidence > 0.5) break
    }

    // Extract component type
    const componentType = this.extractComponentType(normalized)
    
    // Extract component name/ID
    const componentMatch = this.findComponentMatch(normalized, componentType)
    
    // Extract configuration
    const config = this.extractConfiguration(normalized, componentType)

    const intent: ParsedIntent = {
      action,
      componentType,
      componentName: componentMatch?.id,
      componentId: componentMatch?.id,
      config,
      confidence: actionConfidence * (componentMatch ? 0.9 : 0.6)
    }

    // Generate suggestions
    const suggestions = this.generateSuggestions(intent, normalized)

    // Generate alternative intents
    const alternativeIntents = this.generateAlternatives(intent, normalized)

    return {
      intent,
      suggestions,
      alternativeIntents
    }
  }

  /**
   * Extract component type from input
   */
  private extractComponentType(input: string): ParsedIntent['componentType'] | undefined {
    const typePatterns = {
      brain: ['brain', 'llm', 'model', 'ai', 'claude', 'gpt', 'gemini', 'mistral', 'llama', 'openclaw'],
      tool: ['tool', 'function', 'capability', 'search', 'email', 'calendar', 'database', 'file', 'api'],
      runtime: ['runtime', 'deploy', 'host', 'server', 'vercel', 'docker', 'lambda', 'cloudflare', 'railway'],
      memory: ['memory', 'storage', 'vector', 'database', 'redis', 'sql']
    }

    for (const [type, patterns] of Object.entries(typePatterns)) {
      for (const pattern of patterns) {
        if (input.includes(pattern)) {
          return type as ParsedIntent['componentType']
        }
      }
    }

    return undefined
  }

  /**
   * Find matching component from registry
   */
  private findComponentMatch(
    input: string,
    componentType?: ParsedIntent['componentType']
  ): Component | null {
    const searchSpace = componentType
      ? this.components[componentType === 'brain' ? 'brains' : 
                        componentType === 'tool' ? 'tools' :
                        componentType === 'runtime' ? 'runtimes' : 'memories']
      : [...this.components.brains, ...this.components.tools, ...this.components.runtimes, ...this.components.memories]

    // Direct ID match
    for (const comp of searchSpace) {
      if (input.includes(comp.id.replace(/-/g, ' ')) || input.includes(comp.id)) {
        return comp
      }
    }

    // Name match
    for (const comp of searchSpace) {
      const nameWords = comp.name.toLowerCase().split(/[-_\s]+/)
      for (const word of nameWords) {
        if (word.length > 3 && input.includes(word)) {
          return comp
        }
      }
    }

    // Provider match (for brains)
    const providerPatterns: Record<string, string[]> = {
      claude: ['claude', 'anthropic', 'sonnet', 'haiku'],
      gpt: ['gpt', 'openai', 'chatgpt'],
      gemini: ['gemini', 'google'],
      mistral: ['mistral'],
      llama: ['llama', 'meta'],
      openclaw: ['openclaw', 'claw']
    }

    for (const [provider, patterns] of Object.entries(providerPatterns)) {
      for (const pattern of patterns) {
        if (input.includes(pattern)) {
          const match = searchSpace.find(c => 
            c.provider?.toLowerCase().includes(provider) ||
            c.id.toLowerCase().includes(provider)
          )
          if (match) return match
        }
      }
    }

    // Tool-specific matches
    const toolKeywords: Record<string, string[]> = {
      'tool-web-search': ['web search', 'search', 'google', 'bing'],
      'tool-code-execution': ['code', 'execute', 'run code', 'python'],
      'tool-email': ['email', 'mail', 'send email'],
      'tool-calendar': ['calendar', 'schedule', 'event'],
      'tool-database-query': ['database', 'db', 'query', 'sql'],
      'tool-file-operations': ['file', 'read', 'write', 'upload'],
      'tool-twitter-post': ['twitter', 'tweet', 'post'],
      'tool-image-generation': ['image', 'generate', 'dalle', 'midjourney'],
      'tool-slack': ['slack', 'message'],
      'tool-api-client': ['api', 'http', 'request']
    }

    for (const [toolId, keywords] of Object.entries(toolKeywords)) {
      for (const keyword of keywords) {
        if (input.includes(keyword)) {
          const match = searchSpace.find(c => c.id === toolId)
          if (match) return match
        }
      }
    }

    return null
  }

  /**
   * Extract configuration from input
   */
  private extractConfiguration(
    input: string,
    componentType?: ParsedIntent['componentType']
  ): Record<string, any> {
    const config: Record<string, any> = {}

    // Temperature
    const tempMatch = input.match(/temperature[:\s]+([0-9.]+)/i)
    if (tempMatch) {
      config.temperature = parseFloat(tempMatch[1])
    }

    // Max tokens
    const tokensMatch = input.match(/(?:max[_\s]?)?tokens?[:\s]+([0-9]+)/i)
    if (tokensMatch) {
      config.max_tokens = parseInt(tokensMatch[1])
    }

    // System prompt
    const promptMatch = input.match(/system[_\s]?prompt[:\s]+"([^"]+)"/i) ||
                     input.match(/prompt[:\s]+"([^"]+)"/i)
    if (promptMatch) {
      config.system_prompt = promptMatch[1]
    }

    // Model selection
    const modelMatch = input.match(/model[:\s]+([a-z0-9-]+)/i)
    if (modelMatch) {
      config.model = modelMatch[1]
    }

    return config
  }

  /**
   * Generate context-aware suggestions
   */
  private generateSuggestions(intent: ParsedIntent, input: string): string[] {
    const suggestions: string[] = []

    if (intent.action === 'add' && intent.componentType === 'brain' && !intent.componentName) {
      suggestions.push('Try: "Add Claude brain" or "Use GPT-4"')
    }

    if (intent.action === 'add' && intent.componentType === 'tool' && !intent.componentName) {
      suggestions.push('Try: "Add web search tool" or "Include email capability"')
    }

    if (intent.action === 'add' && !intent.componentType) {
      suggestions.push('Specify component type: "Add brain", "Add tool", or "Add runtime"')
    }

    if (intent.action === 'configure' && !intent.componentId) {
      suggestions.push('Select a component first, then configure it')
    }

    if (intent.confidence < 0.7) {
      suggestions.push('Be more specific about what you want to add or configure')
    }

    // Context-aware suggestions based on current build state
    if (intent.action === 'add' && intent.componentType === 'brain') {
      suggestions.push('Consider adding tools after the brain for full functionality')
    }

    return suggestions
  }

  /**
   * Generate alternative intents
   */
  private generateAlternatives(intent: ParsedIntent, input: string): ParsedIntent[] {
    const alternatives: ParsedIntent[] = []

    // If action is unclear, suggest alternatives
    if (intent.confidence < 0.6) {
      if (!input.includes('add') && !input.includes('remove')) {
        alternatives.push({
          ...intent,
          action: 'add',
          confidence: 0.5
        })
      }
    }

    // Suggest similar components
    if (intent.componentName) {
      const component = this.findComponentMatch(input, intent.componentType)
      if (component) {
        const similar = this.findSimilarComponents(component)
        for (const sim of similar.slice(0, 2)) {
          alternatives.push({
            ...intent,
            componentName: sim.id,
            componentId: sim.id,
            confidence: 0.6
          })
        }
      }
    }

    return alternatives
  }

  /**
   * Find similar components
   */
  private findSimilarComponents(component: Component): Component[] {
    const allComponents = [
      ...this.components.brains,
      ...this.components.tools,
      ...this.components.runtimes,
      ...this.components.memories
    ]

    return allComponents
      .filter(c => 
        c.id !== component.id &&
        c.type === component.type &&
        c.provider === component.provider
      )
      .slice(0, 3)
  }

  /**
   * Multi-step parsing for complex requests
   */
  async parseMultiStep(input: string): Promise<ParsedIntent[]> {
    // Split by common conjunctions
    const steps = input.split(/\s+(?:and|then|also|plus|,)\s+/i)
    
    if (steps.length === 1) {
      const result = await this.parse(input)
      return [result.intent]
    }

    const intents: ParsedIntent[] = []
    for (const step of steps) {
      const result = await this.parse(step.trim())
      intents.push(result.intent)
    }

    return intents
  }
}
