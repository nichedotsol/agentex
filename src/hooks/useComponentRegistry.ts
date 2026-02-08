'use client'

import { useState, useEffect, useMemo } from 'react'

export interface Component {
  id: string
  type: 'brain' | 'tool' | 'runtime' | 'memory'
  name: string
  version: string
  provider: string
  config: any
  interface: any
  resources: any
  metadata: {
    author: string
    description: string
    tags: string[]
    icon?: string
    color: string
  }
}

export interface RegistryData {
  version: string
  last_updated: string
  components: {
    brains: string[]
    tools: string[]
    runtimes: string[]
    memories?: string[]
  }
  categories: {
    [key: string]: {
      name: string
      description: string
      icon: string
      color: string
    }
  }
}

export function useComponentRegistry() {
  const [registry, setRegistry] = useState<RegistryData | null>(null)
  const [components, setComponents] = useState<{
    brains: Component[]
    tools: Component[]
    runtimes: Component[]
    memories: Component[]
  }>({
    brains: [],
    tools: [],
    runtimes: [],
    memories: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRegistry() {
      try {
        // Load registry index
        const registryResponse = await fetch('/components/registry.json')
        if (!registryResponse.ok) throw new Error('Failed to load registry')
        const registryData: RegistryData = await registryResponse.json()
        setRegistry(registryData)

        // Load all component files
        const loadedComponents: {
          brains: Component[]
          tools: Component[]
          runtimes: Component[]
          memories: Component[]
        } = {
          brains: [],
          tools: [],
          runtimes: [],
          memories: []
        }

        // Load brains
        for (const filename of registryData.components.brains) {
          try {
            const response = await fetch(`/components/${filename}`)
            if (response.ok) {
              const component: Component = await response.json()
              loadedComponents.brains.push(component)
            }
          } catch (err) {
            console.warn(`Failed to load ${filename}:`, err)
          }
        }

        // Load tools
        for (const filename of registryData.components.tools) {
          try {
            const response = await fetch(`/components/${filename}`)
            if (response.ok) {
              const component: Component = await response.json()
              loadedComponents.tools.push(component)
            }
          } catch (err) {
            console.warn(`Failed to load ${filename}:`, err)
          }
        }

        // Load runtimes
        for (const filename of registryData.components.runtimes) {
          try {
            const response = await fetch(`/components/${filename}`)
            if (response.ok) {
              const component: Component = await response.json()
              loadedComponents.runtimes.push(component)
            }
          } catch (err) {
            console.warn(`Failed to load ${filename}:`, err)
          }
        }

        // Load memories
        if (registryData.components.memories) {
          for (const filename of registryData.components.memories) {
            try {
              const response = await fetch(`/components/${filename}`)
              if (response.ok) {
                const component: Component = await response.json()
                loadedComponents.memories.push(component)
              }
            } catch (err) {
              console.warn(`Failed to load ${filename}:`, err)
            }
          }
        }

        setComponents(loadedComponents)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load registry')
        setLoading(false)
      }
    }

    loadRegistry()
  }, [])

  return {
    registry,
    components,
    loading,
    error
  }
}

export function useComponentSearch(
  components: { brains: Component[]; tools: Component[]; runtimes: Component[]; memories?: Component[] },
  searchQuery: string,
  activeCategory: 'brains' | 'tools' | 'runtimes' | 'memories' | 'all'
) {
  const filteredComponents = useMemo(() => {
    let allComponents: Component[] = []

    if (activeCategory === 'all' || activeCategory === 'brains') {
      allComponents = [...allComponents, ...components.brains]
    }
    if (activeCategory === 'all' || activeCategory === 'tools') {
      allComponents = [...allComponents, ...components.tools]
    }
    if (activeCategory === 'all' || activeCategory === 'runtimes') {
      allComponents = [...allComponents, ...components.runtimes]
    }
    if (activeCategory === 'all' || activeCategory === 'memories') {
      allComponents = [...allComponents, ...(components.memories || [])]
    }

    if (!searchQuery.trim()) {
      return allComponents
    }

    const query = searchQuery.toLowerCase()
    return allComponents.filter(comp => {
      const nameMatch = comp.name.toLowerCase().includes(query)
      const descMatch = comp.metadata.description.toLowerCase().includes(query)
      const tagMatch = comp.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      const providerMatch = comp.provider.toLowerCase().includes(query)
      
      return nameMatch || descMatch || tagMatch || providerMatch
    })
  }, [components, searchQuery, activeCategory])

  return filteredComponents
}
