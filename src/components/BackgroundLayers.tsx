'use client'

export default function BackgroundLayers() {
  return (
    <>
      {/* Grid background */}
      <div className="fixed inset-0 grid-dots opacity-40 pointer-events-none z-0" />
      
      {/* Blurred imagery layer - Garden Intel style */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(0, 255, 159, 0.15) 0%, transparent 50%)',
            filter: 'blur(100px)',
          }}
        />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: 'radial-gradient(circle at 70% 50%, rgba(0, 217, 255, 0.15) 0%, transparent 50%)',
            filter: 'blur(120px)',
          }}
        />
      </div>

      {/* Noise texture */}
      <div className="fixed inset-0 noise-bg pointer-events-none z-0" />
    </>
  )
}
