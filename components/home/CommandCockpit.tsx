'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  BookOpen,
  FileCheck2,
  Bell,
} from 'lucide-react'
import type { Admission } from '@/types'
import CountdownPill from './CountdownPill'

interface CommandCockpitProps {
  admissions?: Admission[]
}

const PLACEHOLDERS = [
  'BCA colleges in Kathmandu',
  'IOE entrance date',
  'TU results',
  'MBBS fee in Nepal',
]

const CATEGORY_TABS = [
  { id: 'colleges', label: 'Colleges', href: '/colleges', icon: Building2 },
  { id: 'programs', label: 'Programs', href: '/programs', icon: BookOpen },
  { id: 'results', label: 'Results', href: '/results', icon: FileCheck2 },
  { id: 'notices', label: 'Notices', href: '/notices', icon: Bell },
]

const TRENDING_CHIPS = [
  { label: 'Admissions open', href: '/admissions?deadline=open' },
  { label: 'Results', href: '/results' },
  { label: 'BCA Colleges', href: '/colleges?q=BCA' },
  { label: 'Scholarships', href: '/scholarships' },
]

const QUICK_SUGGESTIONS = [
  { label: 'BCA Colleges in Kathmandu', href: '/colleges?q=BCA' },
  { label: 'IOE Pulchowk Entrance 2082', href: '/admissions' },
  { label: 'TU CSIT 6th Sem Result', href: '/results?university=TU' },
  { label: 'KU Computer Science Fees', href: '/programs?faculty=it' },
  { label: 'NEB Grade 12 Verification', href: '/results?university=NEB' },
]

export default function CommandCockpit({ admissions = [] }: CommandCockpitProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Cycle animated placeholder every 3.5s
  useEffect(() => {
    if (isFocused || query) return
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [isFocused, query])

  // Global ⌘K and / shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Spotlight mouse tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetQuery = query.trim() || PLACEHOLDERS[placeholderIndex]
    if (targetQuery) {
      router.push(`/search?q=${encodeURIComponent(targetQuery)}`)
    } else {
      router.push('/colleges')
    }
    setIsFocused(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full transition-all duration-300 mx-auto max-w-3xl ${
        isFocused ? 'scale-[1.01]' : ''
      }`}
    >
      {/* Soft spotlight radial glow behind cockpit */}
      <div
        className="pointer-events-none absolute -inset-3 rounded-[36px] opacity-0 transition-opacity duration-300"
        style={{
          opacity: isFocused ? 0.35 : 0.15,
          background: `radial-gradient(320px circle at ${mousePos.x}px ${mousePos.y}px, rgba(191, 227, 240, 0.45), transparent 80%)`,
        }}
        aria-hidden="true"
      />

      {/* Double-Bezel Precision Island */}
      <div className="p-1.5 sm:p-2 rounded-[28px] bg-white/70 dark:bg-[#0C2229]/75 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_16px_48px_rgba(11,43,51,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="rounded-[22px] bg-white/95 dark:bg-[#081B20]/95 border border-black/[0.06] dark:border-white/[0.08] overflow-hidden">
          {/* ── 1. Top Deck: Integrated Live Radar Header ─────── */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015]">
            <CountdownPill admissions={admissions} variant="embedded" />

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-nunito font-semibold text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Gazette Synced 2082</span>
            </div>
          </div>

          {/* ── 2. Middle Deck: Raised Glass Search Console ──── */}
          <div className={`p-2 sm:p-3 relative ${isFocused ? 'hero-search-gradient-border' : ''}`}>
            <form
              onSubmit={handleSubmit}
              role="search"
              aria-label="Search colleges, programs and board results"
              className="relative flex items-center h-13 sm:h-15 w-full rounded-2xl bg-white dark:bg-[#0C2229] border border-black/[0.06] dark:border-white/[0.08] px-3.5 sm:px-4 shadow-sm transition-all duration-200"
            >
              {/* Search Icon */}
              <Search className="w-5 h-5 text-slate-400 dark:text-slate-400 flex-shrink-0 mr-3 transition-colors group-focus-within:text-primary dark:group-focus-within:text-[#F5A524]" />

              {/* Input Field with Animated Placeholder */}
              <div className="relative flex-1 h-full flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  aria-label="Search colleges, programs, entrances, or board results"
                  autoComplete="off"
                  enterKeyHint="search"
                  inputMode="search"
                  className="w-full bg-transparent text-sm sm:text-base font-nunito font-semibold text-slate-900 dark:text-[#E6F2F5] placeholder-transparent focus:outline-none pr-8"
                />

                {/* Cycling animated placeholder text */}
                {!query && (
                  <span
                    onClick={() => inputRef.current?.focus()}
                    className="pointer-events-none absolute left-0 text-sm sm:text-base font-nunito text-slate-400 dark:text-slate-400 select-none transition-all duration-300 truncate pr-4"
                  >
                    {PLACEHOLDERS[placeholderIndex]}
                  </span>
                )}
              </div>

              {/* Clear button when query exists */}
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  aria-label="Clear search query"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Desktop ⌘K Hint */}
              <div className="hidden sm:flex items-center gap-1.5 mr-2 pointer-events-none select-none">
                <kbd className="px-2 py-0.5 rounded-md border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.03] dark:bg-white/[0.06] text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  ⌘K
                </kbd>
              </div>

              {/* Action Search Button */}
              <button
                type="submit"
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-[#0B2B33] hover:bg-[#1F4E5F] text-white dark:bg-[#F5A524] dark:text-[#061519] dark:hover:bg-[#ffb43a] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold font-nunito shadow-sm active:scale-[0.98] transition-all duration-200"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </form>

            {/* Dropdown Suggestions & Tabs when Focused */}
            {isFocused && (
              <div className="absolute top-[calc(100%+6px)] left-2 right-2 z-30 overflow-hidden rounded-2xl border border-black/[0.08] dark:border-white/[0.1] bg-white/98 dark:bg-[#0C2229]/98 backdrop-blur-2xl p-4 shadow-xl dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)] motion-menu-enter">
                {/* Category Quick Tabs */}
                <div className="flex items-center gap-1.5 pb-3 border-b border-black/[0.06] dark:border-white/[0.08] overflow-x-auto no-scrollbar">
                  {CATEGORY_TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <Link
                        key={tab.id}
                        href={tab.href}
                        onClick={() => setIsFocused(false)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-nunito font-semibold text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex-shrink-0"
                      >
                        <Icon className="w-3.5 h-3.5 text-primary dark:text-[#F5A524]" />
                        <span>{tab.label}</span>
                      </Link>
                    )
                  })}
                </div>

                {/* Quick Suggestions List */}
                <div className="pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-2 font-nunito flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Popular Searches
                  </p>
                  <div className="space-y-1">
                    {QUICK_SUGGESTIONS.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setIsFocused(false)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-nunito font-semibold text-slate-800 dark:text-slate-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors group"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-primary dark:group-hover:text-[#F5A524] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. Bottom Deck: Docked Quick Exploration Deck ─ */}
          <div className="px-3.5 sm:px-5 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.05] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[11px] font-nunito font-bold text-slate-500 dark:text-slate-400 flex-shrink-0 mr-1">
                Trending:
              </span>
              {TRENDING_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="rounded-full px-2.5 py-1 text-xs font-nunito font-semibold text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08] bg-white/70 dark:bg-white/[0.04] hover:border-primary/50 dark:hover:border-[#F5A524]/60 hover:text-primary dark:hover:text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex-shrink-0"
                >
                  {chip.label}
                </Link>
              ))}
            </div>

            <Link
              href="/programs"
              className="group inline-flex items-center gap-1 text-xs font-nunito font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-[#F5A524] transition-colors flex-shrink-0 self-end sm:self-auto"
            >
              <span>Browse all programs</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
