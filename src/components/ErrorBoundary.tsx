'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: (error: Error) => React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: (error: Error) => React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error)
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-4 text-red-400">Error</h1>
            <pre className="text-sm text-gray-400 overflow-auto">{this.state.error.message}</pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
