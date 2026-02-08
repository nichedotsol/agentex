'use client'

import { useState } from 'react'

interface BuildSettingsProps {
  settings: any
  onUpdate: (settings: any) => void
}

export default function BuildSettings({ settings, onUpdate }: BuildSettingsProps) {
  const [buildSettings, setBuildSettings] = useState({
    token_budget: settings?.token_budget || 1000,
    timeout: settings?.timeout || 30,
    retry_policy: settings?.retry_policy || 'none',
    name: settings?.name || 'BUILD_001',
    description: settings?.description || '',
    author: settings?.author || '',
    ...settings
  })

  const handleChange = (field: string, value: any) => {
    const newSettings = { ...buildSettings, [field]: value }
    setBuildSettings(newSettings)
    onUpdate(newSettings)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          BUILD NAME
        </label>
        <input
          type="text"
          value={buildSettings.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          DESCRIPTION
        </label>
        <textarea
          value={buildSettings.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all resize-none"
          placeholder="Build description..."
        />
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          TOKEN BUDGET
        </label>
        <input
          type="number"
          min="100"
          max="100000"
          value={buildSettings.token_budget}
          onChange={(e) => handleChange('token_budget', parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          TIMEOUT (SECONDS)
        </label>
        <input
          type="number"
          min="1"
          max="300"
          value={buildSettings.timeout}
          onChange={(e) => handleChange('timeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          RETRY POLICY
        </label>
        <select
          value={buildSettings.retry_policy}
          onChange={(e) => handleChange('retry_policy', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
        >
          <option value="none">NONE</option>
          <option value="linear">LINEAR</option>
          <option value="exponential">EXPONENTIAL</option>
        </select>
      </div>

      <div>
        <label className="font-mono text-[10px] text-ax-cyan uppercase mb-2 block">
          AUTHOR
        </label>
        <input
          type="text"
          value={buildSettings.author}
          onChange={(e) => handleChange('author', e.target.value)}
          className="w-full px-3 py-2 bg-ax-bg border border-ax-border text-ax-text font-mono text-xs outline-none focus:border-ax-cyan focus:shadow-[0_0_10px_rgba(0,255,159,0.2)] transition-all"
          placeholder="Your name"
        />
      </div>
    </div>
  )
}
