'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { districtsForProvince, NEPAL_PROVINCES } from '@/lib/nepal-geography'

const LOCATIONS = ['Kathmandu', 'Pokhara', 'Chitwan', 'Biratnagar', 'Butwal', 'Other']
const PROVINCES = NEPAL_PROVINCES

const AFFILIATIONS = [
  { label: 'TU',      value: 'Tribhuvan University',  hint: null },
  { label: 'KU',      value: 'Kathmandu University',  hint: null },
  { label: 'PU',      value: 'Pokhara University',    hint: null },
  { label: 'PurU',    value: 'Purbanchal University', hint: null },
  { label: 'NEB',     value: 'NEB',                   hint: '+2' },
  { label: 'Private', value: 'Private',               hint: null },
]

const FACULTIES = [
  'Science', 'Management', 'Humanities', 'Education',
  'IT', 'Engineering', 'Medical', 'Law', 'Nursing',
]

const LEVELS = [
  { label: '+2 / Intermediate', value: '+2'      },
  { label: 'Bachelor',          value: 'bachelor' },
  { label: 'Master',            value: 'master'   },
  { label: 'Diploma',           value: 'diploma'  },
]

const FILTER_LABELS: Record<string, string> = {
  location: 'Location', province: 'Province', district: 'District', affiliation: 'Affiliation',
  faculty: 'Faculty', level: 'Level', maxFee: 'Fee', feePeriod: 'Fee period', scholarship: 'Scholarship',
  verified: 'Verified', program: 'Program',
}

export type CollegeSearchParams = {
  q?:          string
  location?:   string
  affiliation?: string
  faculty?:    string
  level?:      string
  province?: string
  district?: string
  maxFee?: string
  feePeriod?: string
  scholarship?: string
  verified?: string
  program?: string
  sort?: string
  page?: string
}

function buildUrl(current: CollegeSearchParams, key: string, value: string): string {
  const p = new URLSearchParams()
  if (current.q)           p.set('q',           current.q)
  if (current.location)    p.set('location',    current.location)
  if (current.affiliation) p.set('affiliation', current.affiliation)
  if (current.faculty)     p.set('faculty',     current.faculty)
  if (current.level)       p.set('level',       current.level)
  if (current.province) p.set('province', current.province)
  if (current.district) p.set('district', current.district)
  if (current.maxFee) p.set('maxFee', current.maxFee)
  if (current.feePeriod) p.set('feePeriod', current.feePeriod)
  if (current.scholarship) p.set('scholarship', current.scholarship)
  if (current.verified) p.set('verified', current.verified)
  if (current.program) p.set('program', current.program)
  if (current.sort) p.set('sort', current.sort)
  // toggle: clicking an active filter removes it
  if (p.get(key) === value) p.delete(key)
  else p.set(key, value)
  if (key === 'province') p.delete('district')
  if (key === 'feePeriod' && p.get(key) !== value) p.delete('maxFee')
  p.delete('page')
  const str = p.toString()
  return `/colleges${str ? `?${str}` : ''}`
}

function clearUrl(current: CollegeSearchParams): string {
  const params = new URLSearchParams()
  if (current.q) params.set('q', current.q)
  if (current.sort) params.set('sort', current.sort)
  const query = params.toString()
  return `/colleges${query ? `?${query}` : ''}`
}

interface Props {
  searchParams:  CollegeSearchParams
  filteredCount: number
}

export default function CollegeFilters({ searchParams, filteredCount }: Props) {
  const [open, setOpen] = useState(false)
  // "More filters" starts open whenever one of its own filters is already
  // active, so a student who arrived via a link never loses sight of it.
  const moreActive = Boolean(searchParams.district || searchParams.maxFee || searchParams.feePeriod || searchParams.faculty || searchParams.scholarship || searchParams.verified)
  const [moreOpen, setMoreOpen] = useState(moreActive)

  const hasFilters  = !!(searchParams.location || searchParams.province || searchParams.district || searchParams.affiliation || searchParams.faculty || searchParams.level || searchParams.maxFee || searchParams.feePeriod || searchParams.scholarship || searchParams.verified || searchParams.program)
  const activeCount = [searchParams.location, searchParams.province, searchParams.district, searchParams.affiliation, searchParams.faculty, searchParams.level, searchParams.maxFee, searchParams.feePeriod, searchParams.scholarship, searchParams.verified, searchParams.program].filter(Boolean).length
  const activeFilters = Object.entries(searchParams).filter(([key, value]) => !['q', 'sort', 'page'].includes(key) && Boolean(value))

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = previous
    }
  }, [open])

  const pill = (isActive: boolean) =>
    `min-h-9 px-3 py-1.5 rounded-sn-pill text-xs font-bold font-nunito border transition-colors ${
      isActive
        ? 'bg-sn-primary text-white border-sn-primary'
        : 'bg-sn-surface text-sn-ink-soft border-sn-border hover:border-sn-primary/50 hover:text-sn-primary'
    }`

  const group = (label: string, content: React.ReactNode) => (
    <div>
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-sn-ink-muted">{label}</p>
      {content}
    </div>
  )

  // The few filters a student decides on first: what stage, where, which
  // university. Everything else sits behind "More filters" below.
  function PrimaryFilters() {
    return (
      <div className="space-y-5">
        {group('Degree level', <div className="flex flex-wrap gap-2">{LEVELS.map((lvl) => <Link key={lvl.value} href={buildUrl(searchParams, 'level', lvl.value)} onClick={() => setOpen(false)} className={pill(searchParams.level === lvl.value)}>{lvl.label}</Link>)}</div>)}
        {group('Province', <div className="flex flex-wrap gap-2">{PROVINCES.map(value => <Link key={value} href={buildUrl(searchParams, 'province', value)} onClick={() => setOpen(false)} className={pill(searchParams.province === value)}>{value}</Link>)}</div>)}
        {group('Affiliation', <div className="flex flex-wrap gap-2">{AFFILIATIONS.map((aff) => <Link key={aff.value} href={buildUrl(searchParams, 'affiliation', aff.value)} onClick={() => setOpen(false)} className={pill(searchParams.affiliation === aff.value)}>{aff.label}{aff.hint && <span className="ml-1 text-xs opacity-70">({aff.hint})</span>}</Link>)}</div>)}
      </div>
    )
  }

  function MoreFilters() {
    return (
      <div className="space-y-5">
        {group('Location', <div className="flex flex-wrap gap-2">{LOCATIONS.map((loc) => <Link key={loc} href={buildUrl(searchParams, 'location', loc)} onClick={() => setOpen(false)} className={pill(searchParams.location === loc)}>{loc}</Link>)}</div>)}
        {group('Faculty', <div className="flex flex-wrap gap-2">{FACULTIES.map((fac) => <Link key={fac} href={buildUrl(searchParams, 'faculty', fac)} onClick={() => setOpen(false)} className={pill(searchParams.faculty === fac)}>{fac}</Link>)}</div>)}
        {group('Trust & support', <div className="flex flex-wrap gap-2"><Link href={buildUrl(searchParams,'scholarship','true')} onClick={() => setOpen(false)} className={pill(searchParams.scholarship==='true')}>Scholarship available</Link><Link href={buildUrl(searchParams,'verified','true')} onClick={() => setOpen(false)} className={pill(searchParams.verified==='true')}>Verified colleges</Link></div>)}
        <form action="/colleges" className="grid gap-2 sm:grid-cols-3">
          {Object.entries(searchParams).filter(([key, value]) => value && !['district', 'maxFee', 'feePeriod', 'page'].includes(key)).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
          <label><span className="sr-only">District</span><select name="district" aria-label="District" defaultValue={searchParams.district || ''} disabled={!searchParams.province} className="min-h-11 w-full rounded-sn-control border border-sn-border-strong bg-sn-surface px-3 py-2 text-sm text-sn-ink disabled:bg-sn-surface-alt disabled:text-sn-ink-muted"><option value="">{searchParams.province ? `All districts in ${searchParams.province}` : 'Choose province first'}</option>{districtsForProvince(searchParams.province || '').map(district=><option key={district}>{district}</option>)}</select></label>
          <label><span className="sr-only">Fee period</span><select name="feePeriod" aria-label="Fee period" defaultValue={searchParams.feePeriod || ''} className="min-h-11 w-full rounded-sn-control border border-sn-border-strong bg-sn-surface px-3 py-2 text-sm text-sn-ink"><option value="">Choose fee period</option><option value="monthly">Monthly</option><option value="semester">Per semester</option><option value="annual">Per year</option><option value="total_program">Full programme</option><option value="one_time">One-time charge</option></select></label>
          <label><span className="sr-only">Maximum published program fee</span><select name="maxFee" aria-label="Maximum published programme fee" defaultValue={searchParams.maxFee || ''} className="min-h-11 w-full rounded-sn-control border border-sn-border-strong bg-sn-surface px-3 py-2 text-sm text-sn-ink"><option value="">Any amount</option><option value="100000">Under NPR 1 lakh</option><option value="250000">Under NPR 2.5 lakh</option><option value="500000">Under NPR 5 lakh</option><option value="1000000">Under NPR 10 lakh</option></select></label>
          <button className="min-h-11 rounded-sn-control bg-sn-ink px-3 py-2 text-sm font-bold font-nunito text-white sm:col-span-3">Apply location and fee</button>
        </form>
      </div>
    )
  }

  function FilterContent() {
    return (
      <div className="space-y-5">
        <PrimaryFilters />
        <div className="border-t border-sn-border pt-4">
          <button type="button" onClick={() => setMoreOpen(v => !v)} aria-expanded={moreOpen} className="flex min-h-11 w-full items-center justify-between text-sm font-bold text-sn-ink">
            More filters{moreActive && !moreOpen ? ' (active)' : ''}
            <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {moreOpen && <div className="mt-4">{MoreFilters()}</div>}
        </div>
      </div>
    )
  }

  return (
    <>
      {hasFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
          <span className="text-xs font-bold text-sn-ink-muted">Active:</span>
          {activeFilters.map(([key, value]) => (
            <Link key={key} href={buildUrl(searchParams, key, value!)} className="inline-flex items-center gap-1 rounded-sn-pill bg-sn-primary-bg px-2.5 py-1 text-xs font-bold text-sn-primary-hover hover:opacity-80" aria-label={`Remove ${FILTER_LABELS[key] || key} filter`}>
              {FILTER_LABELS[key] || key}: {key === 'scholarship' || key === 'verified' ? 'Yes' : value}<X className="h-3 w-3" />
            </Link>
          ))}
        </div>
      )}
      {/* ── Mobile trigger + result count ── */}
      <div className="mb-4 flex justify-end lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label={`Open college filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
          className={`flex min-h-11 items-center gap-2 rounded-sn-control border px-4 py-2 text-sm font-bold font-nunito transition-colors ${
            hasFilters
              ? 'border-sn-primary bg-sn-primary text-white'
              : 'border-sn-border-strong bg-sn-surface text-sn-ink hover:border-sn-primary/50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters{activeCount > 0 && ` (${activeCount})`}
        </button>
      </div>

      {/* ── Desktop filter panel ── */}
      <div className="mb-5 hidden rounded-sn-card border border-sn-border bg-sn-surface p-5 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-sn-ink-muted" />
            <span className="text-sm font-bold text-sn-ink">Filters</span>
          </div>
          {hasFilters && (
            <Link href={clearUrl(searchParams)} className="flex items-center gap-1 text-xs font-bold text-sn-confirm-ink hover:opacity-80">
              <X className="h-3.5 w-3.5" /> Clear all
            </Link>
          )}
        </div>
        <FilterContent />
      </div>

      {/* ── Mobile bottom sheet ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="college-filter-title" className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-sn-card bg-sn-surface p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-sn-ink" />
                <h3 id="college-filter-title" className="text-lg font-bold text-sn-ink">Filter colleges</h3>
              </div>
              <div className="flex items-center gap-3">
                {hasFilters && (
                  <Link href={clearUrl(searchParams)} onClick={() => setOpen(false)} className="text-sm font-bold text-sn-confirm-ink">
                    Clear all
                  </Link>
                )}
                <button onClick={() => setOpen(false)} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center rounded-full bg-sn-surface-alt transition-colors hover:opacity-80">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <FilterContent />

            <div className="mt-4 border-t border-sn-border pt-5">
              <button onClick={() => setOpen(false)} className="min-h-11 w-full rounded-sn-control bg-sn-primary py-3 font-bold font-nunito text-white transition-colors hover:bg-sn-primary-hover">
                Show {filteredCount} college{filteredCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
