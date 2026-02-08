'use client'

import { motion } from 'framer-motion'

interface ConnectionLineProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color?: string
  animated?: boolean
}

export default function ConnectionLine({ from, to, color = '#00ff9f', animated = true }: ConnectionLineProps) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  // Calculate midpoint for animated dot
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2

  return (
    <>
      {/* Connection line */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${from.x}px`,
          top: `${from.y}px`,
          width: `${distance}px`,
          transform: `rotate(${angle}deg)`,
          transformOrigin: '0 50%',
        }}
      >
        <svg width={distance} height="2" className="overflow-visible">
          <defs>
            <linearGradient id={`gradient-${from.x}-${from.y}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="50%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
          </defs>
          <line
            x1="0"
            y1="1"
            x2={distance}
            y2="1"
            stroke={animated ? `url(#gradient-${from.x}-${from.y})` : color}
            strokeWidth="2"
            strokeOpacity={animated ? 0.6 : 0.4}
          />
        </svg>
      </div>

      {/* Animated flow dot */}
      {animated && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`
          }}
          initial={{ x: from.x - 3, y: from.y - 3 }}
          animate={{ x: to.x - 3, y: to.y - 3 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      )}
    </>
  )
}
