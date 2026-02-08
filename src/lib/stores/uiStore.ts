'use client'

import { create } from 'zustand'

export interface UIState {
  // Component Library
  componentLibraryVisible: boolean
  activeCategory: 'brains' | 'tools' | 'runtimes' | 'memories'
  searchQuery: string
  
  // Configuration Panel
  configPanelOpen: boolean
  selectedComponentId: string | null
  
  // Workspace
  workspaceZoom: number
  workspacePan: { x: number; y: number }
  workspaceView: 'default' | 'top' | 'side' | 'isometric'
  
  // Actions
  toggleComponentLibrary: () => void
  setActiveCategory: (category: 'brains' | 'tools' | 'runtimes' | 'memories') => void
  setSearchQuery: (query: string) => void
  openConfigPanel: (componentId: string | null) => void
  closeConfigPanel: () => void
  selectComponent: (componentId: string | null) => void
  setWorkspaceZoom: (zoom: number) => void
  setWorkspacePan: (pan: { x: number; y: number }) => void
  setWorkspaceView: (view: 'default' | 'top' | 'side' | 'isometric') => void
}

export const useUIStore = create<UIState>((set) => ({
  componentLibraryVisible: true,
  activeCategory: 'brains',
  searchQuery: '',
  configPanelOpen: false,
  selectedComponentId: null,
  workspaceZoom: 1,
  workspacePan: { x: 0, y: 0 },
  workspaceView: 'default',

  toggleComponentLibrary: () => {
    set((state) => ({
      componentLibraryVisible: !state.componentLibraryVisible
    }))
  },

  setActiveCategory: (category) => {
    set({ activeCategory: category })
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  openConfigPanel: (componentId) => {
    set({
      configPanelOpen: true,
      selectedComponentId: componentId
    })
  },

  closeConfigPanel: () => {
    set({
      configPanelOpen: false,
      selectedComponentId: null
    })
  },

  selectComponent: (componentId) => {
    set({
      selectedComponentId: componentId,
      configPanelOpen: componentId !== null
    })
  },

  setWorkspaceZoom: (zoom) => {
    set({ workspaceZoom: zoom })
  },

  setWorkspacePan: (pan) => {
    set({ workspacePan: pan })
  },

  setWorkspaceView: (view) => {
    set({ workspaceView: view })
  }
}))
