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
        <div className="flex items-stretch rounded-sn-card border border-black/[0.08] bg-white/95 overflow-hidden
                        shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.95),0_4px_24px_rgba(15,23,42,0.04)]
                        focus-within:border-sn-primary/80 focus-within:shadow-[inset_0_1px_1.5px_rgba(255,255,255,1),0_8px_32px_rgba(224,102,58,0.14)]
                        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
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
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="motion-control focus-ring absolute right-1 flex h-11 w-11 items-center justify-center rounded-sn-control text-sn-ink-muted hover:bg-sn-surface-alt hover:text-sn-ink"><X className="h-4 w-4" /></button>}
          </div>
          <button
            type="submit"
            className="motion-control focus-ring m-1.5 flex-shrink-0 rounded-sn-control bg-sn-primary px-5 text-xs font-bold font-nunito text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_4px_14px_rgba(224,102,58,0.25)] sm:px-6 hover:bg-sn-primary-hover"
          >
            Search
          </button>
        </div>
      </form>

      <p id="hero-search-help" className="mt-2.5 text-xs leading-5 font-nunito text-sn-ink-muted">
        Search by college, programme, city, university, result or notice.
      </p>

      {/* ── Trending tags ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-xs font-nunito font-semibold text-sn-ink-muted">Trending:</span>
        {TRENDING.map((tag) => (
          <Link
            key={tag.label}
            href={tag.href}
            className="motion-control inline-flex min-h-11 items-center px-3.5 rounded-full text-xs font-nunito font-semibold text-sn-ink-soft
                       border border-black/[0.06] bg-white/75 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.95),0_1px_3px_rgba(0,0,0,0.02)]
                       hover:border-sn-primary/60 hover:bg-sn-primary-bg hover:text-sn-primary-hover hover:-translate-y-0.5
                       transition-all duration-200"
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
