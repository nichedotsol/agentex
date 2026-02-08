'use client'

import { useState, useEffect } from 'react'

interface BrainConfigProps {
  component: any
  onUpdate: (config: any) => void
}

export default function BrainConfig({ component, onUpdate }: BrainConfigProps) {
  const [config, setConfig] = useState(component.config || {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setConfig(component.config || {})
  }, [component])

  const handleChange = (field: string, value: any) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (field === 'temperature' && (value < 0 || value > 1)) {
      newErrors.temperature = 'Temperature must be between 0.0 and 1.0'
    }
    if (field === 'max_tokens' && (value < 1 || value > 100000)) {
      newErrors.max_tokens = 'Max tokens must be between 1 and 100,000'
    }
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onUpdate(newConfig)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          MODEL
        </label>
        <input
          type="text"
          value={config.model || ''}
          onChange={(e) => handleChange('model', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
          placeholder="claude-sonnet-4-20250514"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          TEMPERATURE: {config.temperature || 0.7}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={config.temperature || 0.7}
          onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
          className="w-full"
        />
        {errors.temperature && (
          <div className="font-mono text-[9px] text-ax-red mt-1">{errors.temperature}</div>
        )}
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          MAX TOKENS
        </label>
        <input
          type="number"
          min="1"
          max="100000"
          value={config.max_tokens || 4096}
          onChange={(e) => handleChange('max_tokens', parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        />
        {errors.max_tokens && (
          <div className="font-mono text-[9px] text-ax-red mt-1">{errors.max_tokens}</div>
        )}
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          SYSTEM PROMPT
        </label>
        <textarea
          value={config.system_prompt || ''}
          onChange={(e) => handleChange('system_prompt', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all resize-none"
          placeholder="Optional system prompt..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="streaming"
          checked={config.streaming !== false}
          onChange={(e) => handleChange('streaming', e.target.checked)}
          className="w-4 h-4 accent-ax-cyan"
        />
        <label htmlFor="streaming" className="font-mono text-[10px] text-ax-text-dim">
          ENABLE STREAMING
        </label>
      </div>

    </div>
  )
}
