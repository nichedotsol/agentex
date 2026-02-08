'use client'

interface SkeletonLoaderProps {
  width?: string
  height?: string
  className?: string
  rounded?: boolean
}

export default function SkeletonLoader({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  rounded = true 
}: SkeletonLoaderProps) {
  return (
    <div
      className={`skeleton ${rounded ? 'rounded' : ''} ${className}`}
      style={{ width, height }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <SkeletonLoader height="1rem" width="60%" />
      <SkeletonLoader height="0.875rem" width="80%" />
      <SkeletonLoader height="0.875rem" width="40%" />
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
