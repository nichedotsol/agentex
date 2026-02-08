'use client'

import { motion } from 'framer-motion'

export interface ExportTargetProps {
  type: 'github' | 'vercel' | 'cursor' | 'local'
  icon: string
  name: string
  description: string
  requirements?: string
  onClick: () => void
  disabled?: boolean
}

export default function ExportTarget({
  type,
  icon,
  name,
  description,
  requirements,
  onClick,
  disabled = false
}: ExportTargetProps) {
  const colors = {
    github: 'border-ax-text-dim hover:border-ax-text',
    vercel: 'border-ax-blue/50 hover:border-ax-blue',
    cursor: 'border-ax-cyan/50 hover:border-ax-cyan',
    local: 'border-ax-cyan/50 hover:border-ax-cyan'
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`w-full p-4 bg-ax-bg/50 border ${colors[type]} transition-all text-left ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <div className="font-mono text-xs text-ax-cyan mb-1">{name}</div>
          <div className="font-mono text-[10px] text-ax-text-dim mb-2 leading-relaxed">
            {description}
          </div>
          {requirements && (
            <div className="font-mono text-[9px] text-ax-text-dim opacity-70">
              {requirements}
            </div>
          )}
        </div>
        {disabled && (
          <div className="font-mono text-[9px] text-ax-text-dim">COMING SOON</div>
        )}
      </div>
    </motion.button>
  )
}
