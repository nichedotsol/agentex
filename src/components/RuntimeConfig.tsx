'use client'

import { useState, useEffect } from 'react'

interface RuntimeConfigProps {
  component: any
  onUpdate: (config: any) => void
}

export default function RuntimeConfig({ component, onUpdate }: RuntimeConfigProps) {
  const [config, setConfig] = useState(component.config || {})
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string }>>([])

  useEffect(() => {
    setConfig(component.config || {})
    if (component.config?.environment) {
      const required = (component.config.environment.required_env_vars || []).map((key: string) => ({ key, value: '' }))
      const optional = (component.config.environment.optional_env_vars || []).map((key: string) => ({ key, value: '' }))
      setEnvVars([...required, ...optional])
    }
  }, [component])

  const handleChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    onUpdate(newConfig)
  }

  const handleEnvVarChange = (index: number, field: 'key' | 'value', value: string) => {
    const newEnvVars = [...envVars]
    newEnvVars[index] = { ...newEnvVars[index], [field]: value }
    setEnvVars(newEnvVars)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          PLATFORM
        </label>
        <select
          value={config.platform || 'local'}
          onChange={(e) => handleChange('platform', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        >
          <option value="vercel">VERCEL</option>
          <option value="local">LOCAL</option>
          <option value="railway">RAILWAY</option>
        </select>
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          FRAMEWORK
        </label>
        <select
          value={config.framework || 'nextjs'}
          onChange={(e) => handleChange('framework', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        >
          <option value="nextjs">NEXT.JS</option>
          <option value="fastapi">FASTAPI</option>
          <option value="express">EXPRESS</option>
        </select>
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          LANGUAGE
        </label>
        <select
          value={config.language || 'typescript'}
          onChange={(e) => handleChange('language', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        >
          <option value="typescript">TYPESCRIPT</option>
          <option value="python">PYTHON</option>
        </select>
      </div>

      {envVars.length > 0 && (
        <div>
          <div className="font-mono text-[10px] text-ax-cyan uppercase mb-2">
            ENVIRONMENT VARIABLES
          </div>
          <div className="space-y-2">
            {envVars.map((envVar, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={envVar.key}
                  readOnly
                  className="flex-1 px-2 py-1 bg-ax-bg/50 border border-ax-border text-ax-text-dim font-mono text-[9px]"
                />
                <input
                  type="text"
                  value={envVar.value}
                  onChange={(e) => handleEnvVarChange(i, 'value', e.target.value)}
                  placeholder="value"
                  className="flex-1 px-2 py-1 bg-ax-bg border border-ax-border text-ax-text font-mono text-[9px] outline-none focus:border-ax-cyan transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {component.resources?.pricing && (
        <div className="pt-2 border-t border-ax-border">
          <div className="font-mono text-[9px] text-ax-text-dim">
            PRICING: {component.resources.pricing}
          </div>
        </div>
      )}
    </div>
  )
}
