'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { validateBuild, ValidationResult } from '@/lib/validator'
import { Component } from '@/hooks/useComponentRegistry'

export interface BuildComponent {
  id: string
  component: Component
  position: { x: number; y: number }
  config: any
}

export interface BuildSettings {
  token_budget: number
  timeout: number
  retry_policy: string
  name: string
  description: string
  author: string
}

export interface BuildState {
  // Components
  brain: BuildComponent | null
  tools: BuildComponent[]
  runtime: BuildComponent | null
  
  // Settings
  settings: BuildSettings
  
  // Validation
  validation: ValidationResult | null
  
  // Actions
  addComponent: (component: Component, position: { x: number; y: number }) => void
  removeComponent: (componentId: string) => void
  updateComponentConfig: (componentId: string, config: any) => void
  updateComponentPosition: (componentId: string, position: { x: number; y: number }) => void
  updateBuildSettings: (settings: Partial<BuildSettings>) => void
  validateBuild: () => ValidationResult
  exportBuild: () => any
  loadBuild: (config: any) => void
  resetBuild: () => void
  getAllComponents: () => BuildComponent[]
  setBuildState: (state: Partial<BuildState>) => void
}

const defaultSettings: BuildSettings = {
  token_budget: 1000,
  timeout: 30,
  retry_policy: 'none',
  name: 'BUILD_001',
  description: '',
  author: ''
}

export const useBuildStore = create<BuildState>()(
  persist(
    (set, get) => ({
      brain: null,
      tools: [],
      runtime: null,
      settings: defaultSettings,
      validation: null,

      addComponent: (component, position) => {
        const timestamp = Date.now()
        const buildComponent: BuildComponent = {
          id: `${component.type}_${timestamp}`,
          component,
          position,
          config: component.config || {}
        }

        set((state) => {
          let newState: Partial<BuildState> = {}
          
          if (component.type === 'brain') {
            newState.brain = buildComponent
          } else if (component.type === 'tool') {
            newState.tools = [...state.tools, buildComponent]
          } else if (component.type === 'runtime') {
            newState.runtime = buildComponent
          }

          // Validate after adding
          const buildConfig = getBuildConfig({ ...state, ...newState })
          const validation = validateBuild(buildConfig)
          newState.validation = validation

          return newState as BuildState
        })
      },

      removeComponent: (componentId) => {
        set((state) => {
          let newState: Partial<BuildState> = {}
          
          if (state.brain?.id === componentId) {
            newState.brain = null
          } else if (state.runtime?.id === componentId) {
            newState.runtime = null
          } else {
            newState.tools = state.tools.filter(t => t.id !== componentId)
          }

          // Validate after removing
          const buildConfig = getBuildConfig({ ...state, ...newState })
          const validation = validateBuild(buildConfig)
          newState.validation = validation

          return newState as BuildState
        })
      },

      updateComponentConfig: (componentId, config) => {
        set((state) => {
          let newState: Partial<BuildState> = {}
          
          if (state.brain?.id === componentId) {
            newState.brain = { ...state.brain, config: { ...state.brain.config, ...config } }
          } else if (state.runtime?.id === componentId) {
            newState.runtime = { ...state.runtime, config: { ...state.runtime.config, ...config } }
          } else {
            newState.tools = state.tools.map(t => 
              t.id === componentId 
                ? { ...t, config: { ...t.config, ...config } }
                : t
            )
          }

          // Validate after update
          const buildConfig = getBuildConfig({ ...state, ...newState })
          const validation = validateBuild(buildConfig)
          newState.validation = validation

          return newState as BuildState
        })
      },

      updateComponentPosition: (componentId, position) => {
        set((state) => {
          let newState: Partial<BuildState> = {}
          
          if (state.brain?.id === componentId) {
            newState.brain = { ...state.brain, position }
          } else if (state.runtime?.id === componentId) {
            newState.runtime = { ...state.runtime, position }
          } else {
            newState.tools = state.tools.map(t => 
              t.id === componentId ? { ...t, position } : t
            )
          }

          return newState as BuildState
        })
      },

      updateBuildSettings: (settings) => {
        set((state) => {
          const newSettings = { ...state.settings, ...settings }
          const buildConfig = getBuildConfig({ ...state, settings: newSettings })
          const validation = validateBuild(buildConfig)
          
          return {
            settings: newSettings,
            validation
          }
        })
      },

      validateBuild: () => {
        const state = get()
        const buildConfig = getBuildConfig(state)
        const validation = validateBuild(buildConfig)
        set({ validation })
        return validation
      },

      exportBuild: () => {
        const state = get()
        const buildConfig = getBuildConfig(state)
        return {
          agentex_version: '0.1.0',
          build: {
            id: `build_${Date.now()}`,
            name: state.settings.name,
            description: state.settings.description,
            created: new Date().toISOString(),
            author: state.settings.author
          },
          components: {
            brain: state.brain ? {
              ...state.brain.component,
              config: state.brain.config
            } : {},
            tools: state.tools.map(t => ({
              ...t.component,
              config: t.config
            })),
            runtime: state.runtime ? {
              ...state.runtime.component,
              config: state.runtime.config
            } : {}
          },
          connections: getConnections(state),
          settings: state.settings
        }
      },

      loadBuild: (config) => {
        // Implementation for loading a saved build
        set({
          brain: config.components.brain ? {
            id: `brain_${Date.now()}`,
            component: config.components.brain,
            position: { x: 400, y: 300 },
            config: config.components.brain.config || {}
          } : null,
          tools: (config.components.tools || []).map((tool: any, i: number) => ({
            id: `tool_${Date.now()}_${i}`,
            component: tool,
            position: { x: 400 + Math.cos(i) * 200, y: 300 + Math.sin(i) * 200 },
            config: tool.config || {}
          })),
          runtime: config.components.runtime ? {
            id: `runtime_${Date.now()}`,
            component: config.components.runtime,
            position: { x: 400, y: 600 },
            config: config.components.runtime.config || {}
          } : null,
          settings: config.settings || defaultSettings
        })
      },

      resetBuild: () => {
        set({
          brain: null,
          tools: [],
          runtime: null,
          settings: defaultSettings,
          validation: null
        })
      },

      getAllComponents: () => {
        const state = get()
        const components: BuildComponent[] = []
        if (state.brain) components.push(state.brain)
        components.push(...state.tools)
        if (state.runtime) components.push(state.runtime)
        return components
      },

      setBuildState: (newState) => {
        set((state) => {
          const mergedState = { ...state, ...newState }
          const buildConfig = getBuildConfig(mergedState as BuildState)
          const validation = validateBuild(buildConfig)
          return {
            ...mergedState,
            validation
          } as BuildState
        })
      }
    }),
    {
      name: 'agentex-build-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        brain: state.brain,
        tools: state.tools,
        runtime: state.runtime,
        settings: state.settings
      })
    }
  )
)

function getBuildConfig(state: BuildState) {
  return {
    components: {
      brain: state.brain ? state.brain.component : null,
      tools: state.tools.map(t => t.component),
      runtime: state.runtime ? state.runtime.component : null
    },
    settings: state.settings
  }
}

function getConnections(state: BuildState) {
  const connections: any[] = []
  
  if (state.brain) {
    state.tools.forEach(tool => {
      connections.push({
        from: state.brain!.id,
        to: tool.id,
        type: 'data_flow'
      })
    })
    
    if (state.runtime) {
      connections.push({
        from: state.brain.id,
        to: state.runtime.id,
        type: 'deployment'
      })
    }
  }
  
  state.tools.forEach(tool => {
    if (state.runtime) {
      connections.push({
        from: tool.id,
        to: state.runtime.id,
        type: 'data_flow'
      })
    }
  })
  
  return connections
}
