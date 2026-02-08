'use client'

export default function BackgroundLayers() {
  return (
    <>
      {/* Subtle grid background */}
      <div className="fixed inset-0 grid-subtle pointer-events-none z-0" />
      
      {/* Ambient gradient layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
            filter: 'blur(80px)',
          }}
        />
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: 'radial-gradient(circle at 70% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
            filter: 'blur(100px)',
          }}
        />
      </div>
    </>
  )
}
