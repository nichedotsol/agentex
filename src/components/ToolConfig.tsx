'use client'

import { useState, useEffect } from 'react'

interface ToolConfigProps {
  component: any
  onUpdate: (config: any) => void
}

export default function ToolConfig({ component, onUpdate }: ToolConfigProps) {
  const [config, setConfig] = useState(component.config || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setConfig(component.config || {})
  }, [component])

  const handleChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    onUpdate(newConfig)
  }

  const handleParameterChange = (type: 'required' | 'optional', index: number, value: string) => {
    const newConfig = { ...config }
    if (!newConfig.parameters) {
      newConfig.parameters = { required: [], optional: [] }
    }
    if (!newConfig.parameters[type]) {
      newConfig.parameters[type] = []
    }
    newConfig.parameters[type][index] = value
    setConfig(newConfig)
    onUpdate(newConfig)
  }

  return (
    <div className="space-y-4">
      {config.endpoint && (
        <div>
          <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
            ENDPOINT
          </label>
          <input
            type="text"
            value={config.endpoint || ''}
            onChange={(e) => handleChange('endpoint', e.target.value)}
            className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
            placeholder="https://api.example.com"
          />
        </div>
      )}

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          AUTH TYPE
        </label>
        <select
          value={config.auth_type || 'none'}
          onChange={(e) => handleChange('auth_type', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        >
          <option value="none">NONE</option>
          <option value="bearer">BEARER</option>
          <option value="api_key">API KEY</option>
        </select>
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          METHOD
        </label>
        <select
          value={config.method || 'GET'}
          onChange={(e) => handleChange('method', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {config.parameters && (
        <div>
          <div className="font-mono text-[10px] text-ax-cyan uppercase mb-2">
            PARAMETERS
          </div>
          {config.parameters.required && config.parameters.required.length > 0 && (
            <div className="mb-3">
              <div className="font-mono text-[9px] text-ax-text-dim mb-1">REQUIRED:</div>
              <div className="space-y-1">
                {config.parameters.required.map((param: string, i: number) => (
                  <div key={i} className="px-2 py-1 bg-ax-bg border border-ax-border font-mono text-[9px] text-ax-text-dim">
                    {param}
                  </div>
                ))}
              </div>
            </div>
          )}
          {config.parameters.optional && config.parameters.optional.length > 0 && (
            <div>
              <div className="font-mono text-[9px] text-ax-text-dim mb-1">OPTIONAL:</div>
              <div className="space-y-1">
                {config.parameters.optional.map((param: string, i: number) => (
                  <div key={i} className="px-2 py-1 bg-ax-bg border border-ax-border font-mono text-[9px] text-ax-text-dim">
                    {param}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {component.resources?.rate_limits && (
        <div className="pt-2 border-t border-ax-border">
          <div className="font-mono text-[9px] text-ax-text-dim">
            RATE LIMITS:
          </div>
          {Object.entries(component.resources.rate_limits).map(([key, value]) => (
            <div key={key} className="font-mono text-[9px] text-ax-text-dim">
              {key}: {String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
