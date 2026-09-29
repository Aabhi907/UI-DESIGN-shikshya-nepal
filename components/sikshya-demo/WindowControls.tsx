'use client'

import React from 'react'
import { PanelLeft, Plus } from 'lucide-react'

export default function WindowControls({
  title = 'Ask Sikshya Nepal',
}: {
  title?: string
}) {
  return (
    <header className="window-header" aria-label="Window bar">
      {/* Mac window dots: red, yellow, green */}
      <div className="flex items-center gap-2">
        <span
          className="header-dot bg-[#FF5F56]"
          style={{ width: 11, height: 11 }}
          aria-hidden="true"
        />
        <span
          className="header-dot bg-[#FFBD2E]"
          style={{ width: 11, height: 11 }}
          aria-hidden="true"
        />
        <span
          className="header-dot bg-[#27C93F]"
          style={{ width: 11, height: 11 }}
          aria-hidden="true"
        />
        <span className="ml-3 hidden text-[13px] font-semibold text-[#7E756E] dark:text-[#A89F97] sm:inline-block">
          {title}
        </span>
      </div>

      {/* Subtle round header buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="header-button"
          aria-label="Toggle sidebar context"
          title="Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="header-button"
          aria-label="New inquiry"
          title="New inquiry"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
