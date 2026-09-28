'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'

const TRENDING = [
  { label: 'Admissions open', href: '/admissions' },
  { label: 'TU Results',   href: '/results?university=TU' },
  { label: 'KU Notices',   href: '/notices?university=KU' },
  { label: 'BCA Colleges', href: '/colleges?q=BCA' },
  { label: 'NEB Results',  href: '/results?university=NEB' },
  { label: 'Scholarships', href: '/scholarships' },
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="w-full">
      {/* ── Search bar ─────────────────────────────────── */}
      <form onSubmit={handleSubmit} role="search" aria-label="Search SikshyaNepal">
        <div className="flex items-stretch rounded-sn-card border-2 border-sn-border-strong bg-sn-surface overflow-hidden
                        shadow-sn-card focus-within:border-sn-primary focus-within:shadow-sn-float
                        transition-[border-color,box-shadow] duration-150">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-sn-ink-muted pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “BCA colleges in Kathmandu”"
              aria-label="Search colleges, programs and results"
              aria-describedby="hero-search-help"
              autoComplete="off"
              enterKeyHint="search"
              inputMode="search"
              className="h-14 w-full min-w-0 bg-transparent pl-11 pr-11 text-sm font-nunito text-sn-ink placeholder:text-sn-ink-muted focus:outline-none sm:pl-12 sm:pr-12"
            />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-1 flex h-11 w-11 items-center justify-center rounded-sn-control text-sn-ink-muted hover:bg-sn-surface-alt hover:text-sn-ink"><X className="h-4 w-4" /></button>}
          </div>
          <button
            type="submit"
            className="m-1.5 flex-shrink-0 rounded-sn-control bg-sn-primary px-4 text-sm font-bold font-nunito text-white shadow-sn-button sm:px-6
                       hover:bg-sn-primary-hover transition-colors duration-150 active:scale-[0.98]"
          >
            Search
          </button>
        </div>
      </form>

      <p id="hero-search-help" className="mt-2 text-xs leading-5 font-nunito text-sn-ink-muted">
        Search by college, programme, city, university, result or notice.
      </p>

      {/* ── Trending tags ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mt-3.5">
        <span className="text-xs font-nunito font-medium text-sn-ink-muted">Trending:</span>
        {TRENDING.map((tag) => (
          <Link
            key={tag.label}
            href={tag.href}
            className="inline-flex min-h-11 items-center px-3 rounded-sn-pill text-xs font-nunito font-medium text-sn-ink-soft
                       border border-sn-border
                       hover:border-sn-primary hover:bg-sn-primary-bg hover:text-sn-primary-hover
                       transition-[background-color,box-shadow,transform] duration-150 active:translate-y-px"
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
