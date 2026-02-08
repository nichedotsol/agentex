'use client'

import { create } from 'zustand'
import { Component, RegistryData } from '@/hooks/useComponentRegistry'

export interface RegistryState {
  registry: RegistryData | null
  components: {
    brains: Component[]
    tools: Component[]
    runtimes: Component[]
  }
  loading: boolean
  error: string | null
  
  // Actions
  loadRegistry: () => Promise<void>
  getComponentById: (id: string) => Component | undefined
  getComponentsByType: (type: 'brain' | 'tool' | 'runtime') => Component[]
}

export const useRegistryStore = create<RegistryState>((set, get) => ({
  registry: null,
  components: {
    brains: [],
    tools: [],
    runtimes: []
  },
  loading: false,
  error: null,

  loadRegistry: async () => {
    set({ loading: true, error: null })
    
    try {
      // Load registry index
      const registryResponse = await fetch('/components/registry.json')
      if (!registryResponse.ok) throw new Error('Failed to load registry')
      const registryData: RegistryData = await registryResponse.json()

      // Load all component files
      const loadedComponents: {
        brains: Component[]
        tools: Component[]
        runtimes: Component[]
      } = {
        brains: [],
        tools: [],
        runtimes: []
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

      set({
        registry: registryData,
        components: loadedComponents,
        loading: false
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load registry',
        loading: false
      })
    }
  },

  getComponentById: (id) => {
    const state = get()
    const allComponents = [
      ...state.components.brains,
      ...state.components.tools,
      ...state.components.runtimes
    ]
    return allComponents.find(comp => comp.id === id)
  },

  getComponentsByType: (type) => {
    const state = get()
    if (type === 'brain') return state.components.brains
    if (type === 'tool') return state.components.tools
    if (type === 'runtime') return state.components.runtimes
    return []
  }
}))
