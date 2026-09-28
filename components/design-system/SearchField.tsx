'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

// sn--styled search input for the Phase 2 listing pages. Mirrors
// components/ui/SearchBar's redirect-on-submit behaviour, kept as a separate
// component rather than restyling SearchBar in place — that component is
// still used by notices, results and news, which aren't converted yet.
export default function SearchField({
  placeholder = 'Search…',
  redirectTo,
  initialValue = '',
  className,
}: {
  placeholder?: string
  redirectTo: string
  initialValue?: string
  className?: string
}) {
  const [query, setQuery] = useState(initialValue)
  const router = useRouter()
  const inputId = useId()

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    router.push(query.trim() ? `${redirectTo}?q=${encodeURIComponent(query.trim())}` : redirectTo)
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sn-ink-muted" aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">{placeholder}</label>
        <input
          id={inputId}
          name="q"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-sn-control border border-sn-border-strong bg-sn-surface pl-12 pr-32 text-sm font-nunito text-sn-ink placeholder:text-sn-ink-muted focus:border-sn-primary focus:outline-none focus:ring-2 focus:ring-sn-primary/20"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-[5.75rem] top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-sn-control text-sn-ink-muted hover:bg-sn-surface-alt hover:text-sn-ink motion-control">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button type="submit" aria-label="Submit search" className="absolute right-2 top-1/2 min-h-11 -translate-y-1/2 rounded-sn-control bg-sn-primary px-5 py-2 text-sm font-bold font-nunito text-white hover:bg-sn-primary-hover motion-control">
          Search
        </button>
      </div>
    </form>
  )
}
