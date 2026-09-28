'use client'

import { Command, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useDialogFocus } from '@/components/motion'

const shortcuts = [
  ['Find a college', '/colleges'], ['Admissions open', '/admissions?deadline=open'],
  ['My Path', '/my-path'], ['Check results', '/results'],
  ['Scholarships', '/scholarships'], ['Latest notices', '/notices'],
]

export default function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useDialogFocus({ open, dialogRef, initialFocusRef: inputRef, onEscape: () => setOpen(false) })

  useEffect(() => {
    const showSearch = () => setOpen(true)
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('open-site-search', showSearch)
    window.addEventListener('keydown', handleShortcut)
    return () => {
      window.removeEventListener('open-site-search', showSearch)
      window.removeEventListener('keydown', handleShortcut)
    }
  }, [])

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = query.trim()
    if (!value) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }

  function navigate(href: string) {
    setOpen(false)
    router.push(href)
  }

  if (!open) return null

  return (
    <div className="motion-scrim-enter fixed inset-0 z-[400] flex items-start justify-center bg-sn-ink/45 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
      <div ref={dialogRef} className="motion-dialog-enter w-full max-w-xl overflow-hidden rounded-sn-card border border-sn-border bg-sn-surface shadow-sn-float" role="dialog" aria-modal="true" aria-label="Search SikshyaNepal">
        <form onSubmit={submit} className="flex items-center gap-3 border-b border-sn-border px-4">
          <Search className="h-5 w-5 shrink-0 text-sn-primary" aria-hidden="true" />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search colleges, results, notices…" aria-label="Search SikshyaNepal" className="h-14 min-w-0 flex-1 bg-transparent text-sm text-sn-ink outline-none placeholder:text-sn-ink-muted" />
          <button type="button" onClick={() => setOpen(false)} className="motion-control flex h-11 w-11 shrink-0 items-center justify-center rounded-sn-control text-sn-ink-muted hover:bg-sn-surface-alt hover:text-sn-ink" aria-label="Close search"><X className="h-5 w-5" aria-hidden="true" /></button>
        </form>
        <div className="p-3">
          <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-widest text-sn-ink-muted">Quick actions</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {shortcuts.map(([label, href]) => <button key={href} type="button" onClick={() => navigate(href)} className="motion-control group flex min-h-11 items-center justify-between rounded-sn-control px-3 py-3 text-left text-sm font-semibold text-sn-ink-soft hover:bg-sn-primary-bg hover:text-sn-primary-hover"><span>{label}</span><span className="motion-arrow text-sn-ink-muted group-hover:text-sn-primary" aria-hidden="true">→</span></button>)}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-sn-border px-4 py-2.5 text-[11px] text-sn-ink-muted">
          <span>Search uses SikshyaNepal&apos;s sourced information.</span>
          <span className="inline-flex shrink-0 items-center gap-1"><Command className="h-3 w-3" aria-hidden="true" />K</span>
        </div>
      </div>
    </div>
  )
}
