'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface ThemeToggleProps {
  className?: string
  compact?: boolean
}

export default function ThemeToggle({ className = '', compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid layout shift before mount
  if (!mounted) {
    return (
      <button
        type="button"
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-sn-border bg-sn-surface text-sn-ink-muted opacity-60 ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center rounded-full border transition-all duration-200 active:scale-95 motion-control focus-ring ${
        isDark
          ? 'border-white/[0.12] bg-white/[0.06] text-amber-300 hover:bg-white/[0.12] hover:border-white/[0.2] hover:text-amber-200'
          : 'border-black/[0.08] bg-black/[0.04] text-slate-700 hover:bg-black/[0.08] hover:border-black/[0.16] hover:text-slate-900'
      } ${compact ? 'h-8 w-8' : 'h-8 px-2.5 gap-1.5'} ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </span>
      {!compact && (
        <span className="hidden md:inline text-[11px] font-mono lowercase tracking-wide font-medium">
          {isDark ? 'light' : 'dark'}
        </span>
      )}
    </button>
  )
}
