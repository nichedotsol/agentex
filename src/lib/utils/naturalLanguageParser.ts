import { Component } from '@/hooks/useComponentRegistry'

interface ParsedIntent {
  action: 'add' | 'remove' | 'configure' | 'deploy'
  componentType?: 'brain' | 'tool' | 'runtime'
  componentName?: string
  provider?: string
  config?: Record<string, any>
}

/**
 * Parse natural language input to extract agent building intent
 * This is a basic implementation - can be enhanced with LLM
 */
export function parseNaturalLanguage(
  input: string,
  availableComponents: {
    brains: Component[]
    tools: Component[]
    runtimes: Component[]
  }
): ParsedIntent | null {
  const lowerInput = input.toLowerCase()
  
  // Extract action
  let action: ParsedIntent['action'] = 'add'
  if (lowerInput.includes('remove') || lowerInput.includes('delete')) {
    action = 'remove'
  } else if (lowerInput.includes('configure') || lowerInput.includes('set') || lowerInput.includes('update')) {
    action = 'configure'
  } else if (lowerInput.includes('deploy') || lowerInput.includes('export')) {
    action = 'deploy'
  }

  // Extract component type
  let componentType: ParsedIntent['componentType'] | undefined
  if (lowerInput.includes('brain') || lowerInput.includes('llm') || lowerInput.includes('model')) {
    componentType = 'brain'
  } else if (lowerInput.includes('tool') || lowerInput.includes('capability')) {
    componentType = 'tool'
  } else if (lowerInput.includes('runtime') || lowerInput.includes('deploy') || lowerInput.includes('platform')) {
    componentType = 'runtime'
  }

  // Extract provider/component name
  let componentName: string | undefined
  let provider: string | undefined

  // Brain providers
  if (lowerInput.includes('claude') || lowerInput.includes('anthropic')) {
    componentType = 'brain'
    provider = 'anthropic'
    componentName = availableComponents.brains.find(c => 
      c.id.includes('claude') || c.provider === 'anthropic'
    )?.id
  } else if (lowerInput.includes('gpt') || lowerInput.includes('openai')) {
    componentType = 'brain'
    provider = 'openai'
    componentName = availableComponents.brains.find(c => 
      c.id.includes('gpt') || c.provider === 'openai'
    )?.id
  } else if (lowerInput.includes('llama')) {
    componentType = 'brain'
    provider = 'meta'
    componentName = availableComponents.brains.find(c => 
      c.id.includes('llama')
    )?.id
  } else if (lowerInput.includes('openclaw')) {
    componentType = 'brain'
    provider = 'openclaw'
    componentName = availableComponents.brains.find(c => 
      c.id.includes('openclaw')
    )?.id
  }

  // Tools
  if (lowerInput.includes('search') || lowerInput.includes('web search')) {
    componentType = 'tool'
    componentName = availableComponents.tools.find(c => 
      c.id.includes('web-search')
    )?.id
  } else if (lowerInput.includes('code') || lowerInput.includes('execute') || lowerInput.includes('python')) {
    componentType = 'tool'
    componentName = availableComponents.tools.find(c => 
      c.id.includes('code-execution')
    )?.id
  } else if (lowerInput.includes('blockchain') || lowerInput.includes('crypto') || lowerInput.includes('ethereum')) {
    componentType = 'tool'
    componentName = availableComponents.tools.find(c => 
      c.id.includes('blockchain')
    )?.id
  } else if (lowerInput.includes('price') || lowerInput.includes('token')) {
    componentType = 'tool'
    componentName = availableComponents.tools.find(c => 
      c.id.includes('token-price')
    )?.id
  } else if (lowerInput.includes('twitter') || lowerInput.includes('social')) {
    componentType = 'tool'
    componentName = availableComponents.tools.find(c => 
      c.id.includes('twitter')
    )?.id
  } else if (lowerInput.includes('agent builder') || lowerInput.includes('build agent')) {
    componentType = 'tool'
    componentName = availableComponents.tools.find(c => 
      c.id.includes('agent-builder')
    )?.id
  }

  // Runtimes
  if (lowerInput.includes('vercel') || lowerInput.includes('serverless')) {
    componentType = 'runtime'
    componentName = availableComponents.runtimes.find(c => 
      c.id.includes('vercel')
    )?.id
  } else if (lowerInput.includes('docker') || lowerInput.includes('local')) {
    componentType = 'runtime'
    componentName = availableComponents.runtimes.find(c => 
      c.id.includes('docker')
    )?.id
  }

  // Extract configuration parameters
  const config: Record<string, any> = {}
  
  // Temperature
  const tempMatch = lowerInput.match(/temperature[:\s]+([0-9.]+)/i)
  if (tempMatch) {
    config.temperature = parseFloat(tempMatch[1])
  }

  // Max tokens
  const tokensMatch = lowerInput.match(/(?:max[_\s]?tokens|tokens)[:\s]+([0-9]+)/i)
  if (tokensMatch) {
    config.max_tokens = parseInt(tokensMatch[1])
  }

  // System prompt
  const promptMatch = lowerInput.match(/system[_\s]?prompt[:\s]+["'](.+?)["']/i)
  if (promptMatch) {
    config.system_prompt = promptMatch[1]
  }

  if (!componentName && !action) {
    return null
  }

  return {
    action,
    componentType,
    componentName,
    provider,
    config: Object.keys(config).length > 0 ? config : undefined,
  }
}
