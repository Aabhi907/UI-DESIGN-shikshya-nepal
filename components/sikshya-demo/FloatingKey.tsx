'use client'

import React from 'react'

export type DepthLevel = 'near' | 'middle' | 'far'

export type FloatingKeyProps = {
  x: string
  y: string
  rotate: number
  depth?: DepthLevel
  symbol: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function FloatingKey({
  x,
  y,
  rotate,
  depth = 'middle',
  symbol,
  className = '',
  style = {},
}: FloatingKeyProps) {
  const depthClass =
    depth === 'near'
      ? 'depth-near'
      : depth === 'far'
      ? 'depth-far'
      : 'depth-middle'

  return (
    <div
      className={`floating-key ${depthClass} ${className}`}
      style={{
        left: x,
        top: y,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
      aria-hidden="true"
    >
      {symbol}
    </div>
  )
}
