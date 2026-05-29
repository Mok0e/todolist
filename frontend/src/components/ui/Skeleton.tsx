import React from 'react'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)' }: SkeletonProps) {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius,
    background: 'var(--bg-secondary)',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  }

  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div style={style} />
    </>
  )
}
