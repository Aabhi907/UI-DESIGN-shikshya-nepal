'use client'

import Link from 'next/link'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { districtsForProvince, NEPAL_PROVINCES } from '@/lib/nepal-geography'

export type SchoolSearchParams = {
  q?: string
  province?: string
  district?: string
  ownership?: string
  level?: string
  medium?: string
  grade?: string
  verified?: string
  page?: string
}

const field = 'h-11 w-full rounded-sn-control border border-sn-border-strong bg-sn-surface px-3 text-sm text-sn-ink outline-none transition focus:border-sn-primary focus:ring-2 focus:ring-sn-primary/10 disabled:cursor-not-allowed disabled:bg-sn-surface-alt disabled:text-sn-ink-muted'

function FilterFields({ searchParams, province, setProvince, district, setDistrict, moreOpen, setMoreOpen }: {
  searchParams: SchoolSearchParams
  province: string
  setProvince: (v: string) => void
  district: string
  setDistrict: (v: string) => void
  moreOpen: boolean
  setMoreOpen: (v: boolean) => void
}) {
  const provinceDistricts = province ? districtsForProvince(province) : []
  return (
    <>
      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-sn-ink-muted">School name</span>
        <span className="relative block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sn-ink-muted" />
          <input name="q" defaultValue={searchParams.q} placeholder="Search by name…" className={`${field} pl-9`} />
        </span>
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-bold text-sn-ink-muted">Province</span>
        <select name="province" value={province} onChange={(event) => { setProvince(event.target.value); setDistrict('') }} className={field}>
          <option value="">All provinces</option>
          {NEPAL_PROVINCES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-bold text-sn-ink-muted">District</span>
        <select name="district" value={district} onChange={(event) => setDistrict(event.target.value)} className={field} disabled={!province}>
          <option value="">{province ? `All districts in ${province}` : 'Choose a province first'}</option>
          {provinceDistricts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-bold text-sn-ink-muted">Level</span>
        <select name="level" defaultValue={searchParams.level || ''} className={field}>
          <option value="">All levels</option>
          <option value="pre_primary">ECD / Pre-primary</option>
          <option value="basic">Basic (Grades 1–8)</option>
          <option value="secondary">Secondary (Grades 9–10)</option>
          <option value="multiple">Multiple levels (up to Grade 10)</option>
        </select>
      </label>

      <div className="mt-5 border-t border-sn-border pt-4">
        <button type="button" onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen} className="flex min-h-11 w-full items-center justify-between text-sm font-bold text-sn-ink">
          More filters
          <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {moreOpen && (
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-sn-ink-muted">School type</span>
              <select name="ownership" defaultValue={searchParams.ownership || ''} className={field}>
                <option value="">All types</option>
                <option value="community">Community</option>
                <option value="institutional">Private / Institutional</option>
                <option value="public">Public</option>
                <option value="religious">Religious</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-sn-ink-muted">Entry grade</span>
              <select name="grade" defaultValue={searchParams.grade || ''} className={field}>
                <option value="">Any grade range</option>
                <option value="0">ECD / pre-primary</option>
                {Array.from({ length: 10 }, (_, index) => index + 1).map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-sn-ink-muted">Medium of instruction</span>
              <select name="medium" defaultValue={searchParams.medium || ''} className={field}>
                <option value="">Any medium</option>
                <option value="English">English</option>
                <option value="Nepali">Nepali</option>
                <option value="Both">English and Nepali</option>
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-sn-control border border-sn-border-strong px-3 py-2.5 text-sm text-sn-ink-soft">
              <input type="checkbox" name="verified" value="true" defaultChecked={searchParams.verified === 'true'} className="h-4 w-4 accent-sn-primary" />
              Verified information only
            </label>
          </div>
        )}
      </div>
    </>
  )
}

export default function SchoolFilters({ searchParams, resultCount }: { searchParams: SchoolSearchParams; resultCount: number }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [province, setProvince] = useState(searchParams.province || '')
  const [district, setDistrict] = useState(searchParams.district || '')
  const moreActive = Boolean(searchParams.ownership || searchParams.grade || searchParams.medium || searchParams.verified)
  const [moreOpen, setMoreOpen] = useState(moreActive)
  const activeFilterCount = Object.entries(searchParams).filter(([key, value]) => key !== 'page' && Boolean(value)).length
  const hasFilters = activeFilterCount > 0

  useEffect(() => {
    if (!mobileOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false) }
    document.addEventListener('keydown', closeOnEscape)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = previous }
  }, [mobileOpen])

  return (
    <>
      {/* ── Mobile trigger ── */}
      <div className="mb-4 flex justify-end lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label={`Open school filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
          className={`flex min-h-11 items-center gap-2 rounded-sn-control border px-4 py-2 text-sm font-bold font-nunito transition-colors ${hasFilters ? 'border-sn-primary bg-sn-primary text-white' : 'border-sn-border-strong bg-sn-surface text-sn-ink hover:border-sn-primary/50'}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>
      </div>

      {/* ── Desktop sidebar panel ── */}
      <aside className="hidden rounded-sn-card border border-sn-border bg-sn-surface p-5 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-sn-primary" /><h2 className="text-sm font-bold text-sn-ink">Find a school</h2></div>
          {hasFilters && <Link href="/schools" className="flex items-center gap-1 text-xs font-bold text-sn-confirm-ink"><X className="h-3 w-3" />Clear</Link>}
        </div>
        <form action="/schools" method="get" className="space-y-0">
          <FilterFields searchParams={searchParams} province={province} setProvince={setProvince} district={district} setDistrict={setDistrict} moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
          <button className="mt-5 w-full rounded-sn-control bg-sn-primary px-4 py-3 text-sm font-bold font-nunito text-white transition hover:bg-sn-primary-hover">Apply filters</button>
          <p className="mt-3 text-center text-xs text-sn-ink-muted">Currently showing {resultCount.toLocaleString()} matching school{resultCount === 1 ? '' : 's'}</p>
        </form>
      </aside>

      {/* ── Mobile bottom sheet ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="school-filter-title" className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-sn-card bg-sn-surface p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-sn-ink" /><h3 id="school-filter-title" className="text-lg font-bold text-sn-ink">Find a school</h3></div>
              <div className="flex items-center gap-3">
                {hasFilters && <Link href="/schools" onClick={() => setMobileOpen(false)} className="text-sm font-bold text-sn-confirm-ink">Clear all</Link>}
                <button onClick={() => setMobileOpen(false)} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center rounded-full bg-sn-surface-alt transition-colors hover:opacity-80"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <form action="/schools" method="get">
              <FilterFields searchParams={searchParams} province={province} setProvince={setProvince} district={district} setDistrict={setDistrict} moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
              <div className="mt-5 border-t border-sn-border pt-5">
                <button className="min-h-11 w-full rounded-sn-control bg-sn-primary py-3 text-sm font-bold font-nunito text-white transition hover:bg-sn-primary-hover">Show {resultCount} school{resultCount !== 1 ? 's' : ''}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
