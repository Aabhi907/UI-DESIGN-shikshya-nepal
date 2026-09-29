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
        className={`inline-flex h-8 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-200 opacity-60 ${compact ? 'w-8' : 'px-3 gap-1.5'} ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        {!compact && (
          <span className="hidden md:inline text-xs font-nunito font-bold text-slate-700 dark:text-slate-200">
            Light
          </span>
        )}
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
          ? 'border-white/20 bg-white/10 hover:bg-white/15 hover:border-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.3)]'
          : 'border-slate-300 bg-slate-100 hover:bg-slate-200 hover:border-slate-400 shadow-sm'
      } ${compact ? 'h-8 w-8' : 'h-8 px-3 gap-1.5'} ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="h-3.5 w-3.5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="h-3.5 w-3.5 text-slate-800 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </span>
      {!compact && (
        <span
          className={`hidden md:inline text-xs font-nunito font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}
