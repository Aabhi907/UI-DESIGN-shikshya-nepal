'use client'

import React from 'react'

export default function WindowControls({
  title = 'Sikshya Nepal',
}: {
  title?: string
}) {
  return (
    <header className="window-header" aria-label="Window bar">
      {/* Soft monochromatic window dots matching the reference */}
      <div className="flex items-center gap-1.5 w-16">
        <span className="window-dot" aria-hidden="true" />
        <span className="window-dot" aria-hidden="true" />
        <span className="window-dot" aria-hidden="true" />
      </div>

      {/* Centered title */}
      <span className="text-[12.5px] font-semibold tracking-tight text-slate-800 dark:text-slate-200">
        {title}
      </span>

      {/* Balance spacer */}
      <div className="w-16" aria-hidden="true" />
    </header>
  )
}
