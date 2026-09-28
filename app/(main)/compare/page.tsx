'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GitCompare, X, Plus, MapPin, Star, Building2, Search, Award, BookOpen, Check, GraduationCap, AlertCircle, Share2 } from 'lucide-react'
import { cleanCollegeText } from '@/lib/college-display'
import ComparisonEvidenceGraph from '@/components/colleges/ComparisonEvidenceGraph'

interface College {
  id: string
  name: string
  slug: string
  location: string
  affiliation: string | null
  established_year: number | null
  avg_rating?: number
  review_count?: number
  program_count?: number
  scholarship_count?: number
  education_levels?: string[]
  facilities?: string[]
  verification_status?: string
}

interface CollegeDetail {
  programs: { fee: number | null; fee_period: string | null; fee_academic_year: string | null; seats: number | null; scholarship_available: boolean; program: { name: string; degree_level: string } | null }[]
  reviews: { rating: number }[]
  scholarships: number
}

const MAX = 3

const ROW_LABELS = [
  { key: 'location', label: 'Location', icon: MapPin },
  { key: 'affiliation', label: 'Affiliation', icon: Building2 },
  { key: 'established_year', label: 'Established', icon: null },
  { key: 'program_count', label: 'Programs', icon: BookOpen },
  { key: 'program_names', label: 'Named Programs', icon: BookOpen },
  { key: 'avg_rating', label: 'Avg Rating', icon: Star },
  { key: 'review_count', label: 'Reviews', icon: null },
  { key: 'scholarship_count', label: 'Scholarships', icon: Award },
  { key: 'fee_range', label: 'Published programme fees', icon: null },
  { key: 'seat_count', label: 'Published Seats', icon: null },
  { key: 'program_scholarships', label: 'Programs Marked Scholarship', icon: Award },
  { key: 'education_levels', label: 'Levels', icon: GraduationCap },
  { key: 'facilities', label: 'Facilities', icon: null },
  { key: 'verification_status', label: 'Verification', icon: Check },
]

const feePeriodLabel: Record<string, string> = {
  monthly: 'per month',
  semester: 'per semester',
  annual: 'per year',
  total_program: 'total programme',
  one_time: 'one-time',
  unknown: 'period not documented',
}

function normaliseProgramName(value: string) {
  return value.trim().toLocaleLowerCase('en-US').replace(/\s+/g, ' ')
}

function feeEvidenceLabel(programs: CollegeDetail['programs'], programName?: string) {
  const matchingPrograms = programName
    ? programs.filter((program) => program.program?.name && normaliseProgramName(program.program.name) === normaliseProgramName(programName))
    : programs
  const documented = matchingPrograms.filter((program) => program.fee != null)
  if (!documented.length) return 'Not listed'
  const visible = documented.slice(0, 4).map((program) => {
    const amount = `NPR ${program.fee!.toLocaleString()}`
    const period = feePeriodLabel[program.fee_period || 'unknown'] || 'period not documented'
    const year = program.fee_academic_year ? `, ${program.fee_academic_year}` : ''
    const name = program.program?.name ? ` (${program.program.name})` : ''
    return `${amount} ${period}${year}${name}`
  })
  return `${visible.join('; ')}${documented.length > visible.length ? `; +${documented.length - visible.length} more` : ''}`
}


export default function ComparePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<College[]>([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<College[]>([])
  const [searching, setSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [detailData, setDetailData] = useState<Record<string, CollegeDetail>>({})
  const [error, setError] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [initializing, setInitializing] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState('')
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)
  const searchDialogRef = useRef<HTMLDivElement>(null)
  const focusBeforeSearchRef = useRef<HTMLElement | null>(null)

  const openCollegeSearch = () => {
    focusBeforeSearchRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setShowSearch(true)
  }

  const searchColleges = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return }
    setSearching(true)
    setError('')
    try {
      const res = await fetch(`/api/colleges/compare?q=${encodeURIComponent(q.trim())}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json()
      setResults(Array.isArray(data.colleges) ? data.colleges : [])
    } catch {
      setResults([])
      setError('College search is unavailable right now. Please try again.')
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => searchColleges(search), 300)
    return () => clearTimeout(t)
  }, [search, searchColleges])

  useEffect(() => {
    if (!showSearch) return
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const handleDialogKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setShowSearch(false)
        return
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(searchDialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) || [])
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleDialogKeys)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => searchDialogRef.current?.querySelector<HTMLElement>('input')?.focus())
    return () => {
      document.removeEventListener('keydown', handleDialogKeys)
      document.body.style.overflow = previousOverflow
      if (focusBeforeSearchRef.current?.isConnected) focusBeforeSearchRef.current.focus()
    }
  }, [showSearch])

  const loadDetail = useCallback(async (college: College) => {
    if (detailData[college.id]) return
    try {
      const response = await fetch(`/api/colleges/compare?slugs=${encodeURIComponent(college.slug)}`)
      const result = await response.json()
      if (!response.ok || !result.details?.[college.id]) throw new Error()
      setDetailData(prev => ({ ...prev, [college.id]: result.details[college.id] }))
    } catch {
      setError(`Some comparison details for ${college.name} could not be loaded. Please retry.`)
    }
  }, [detailData])

  useEffect(() => {
    const slugs = ['college1', 'college2', 'college3']
      .map(key => new URLSearchParams(window.location.search).get(key))
      .filter((slug): slug is string => Boolean(slug) && /^[a-z0-9-]+$/i.test(slug!))
      .slice(0, MAX)
    if (!slugs.length) { setInitializing(false); return }
    const loadInitial = async () => {
      try {
        const res = await fetch(`/api/colleges/compare?slugs=${encodeURIComponent(slugs.join(','))}`)
        if (!res.ok) throw new Error('Unable to load comparison')
        const data = await res.json() as {colleges:College[];details:Record<string,CollegeDetail>}
        const ordered = slugs.map(slug => data.colleges.find(college => college.slug === slug)).filter((college): college is College => Boolean(college))
        setSelected(ordered)
        setDetailData(data.details || {})
      } catch {
        setError('We could not load the colleges in this comparison link.')
      } finally {
        setInitializing(false)
      }
    }
    loadInitial()
    // URL selection is intentionally loaded once on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (initializing) return
    const params = new URLSearchParams()
    selected.forEach((college, index) => params.set(`college${index + 1}`, college.slug))
    router.replace(`/compare${params.size ? `?${params.toString()}` : ''}`, { scroll: false })
  }, [selected, initializing, router])

  const sharedPrograms = useMemo(() => {
    const occurrences = new Map<string, { label: string; collegeIds: Set<string> }>()
    selected.forEach((college) => {
      const seenAtCollege = new Set<string>()
      detailData[college.id]?.programs.forEach((item) => {
        if (!item.program?.name) return
        const key = normaliseProgramName(item.program.name)
        if (!key || seenAtCollege.has(key)) return
        seenAtCollege.add(key)
        const current = occurrences.get(key) || { label: item.program.name.trim(), collegeIds: new Set<string>() }
        current.collegeIds.add(college.id)
        occurrences.set(key, current)
      })
    })
    return Array.from(occurrences.values())
      .filter((item) => item.collegeIds.size >= 2)
      .sort((left, right) => left.label.localeCompare(right.label, 'en'))
      .map((item) => item.label)
  }, [detailData, selected])

  useEffect(() => {
    if (selectedProgram && !sharedPrograms.some((program) => normaliseProgramName(program) === normaliseProgramName(selectedProgram))) {
      setSelectedProgram('')
    }
  }, [selectedProgram, sharedPrograms])

  const addCollege = (college: College) => {
    if (selected.length >= MAX || selected.find(c => c.id === college.id)) return
    setSelected(prev => [...prev, college])
    loadDetail(college)
    setSearch('')
    setResults([])
    setShowSearch(false)
  }

  const removeCollege = (id: string) => setSelected(prev => prev.filter(c => c.id !== id))

  const getVal = (college: College, key: string) => {
    const d = detailData[college.id]
    switch (key) {
      case 'location': return cleanCollegeText(college.location) || 'Not listed'
      case 'affiliation': return cleanCollegeText(college.affiliation) || 'Not listed'
      case 'established_year': return college.established_year?.toString() || 'Not listed'
      case 'program_count': return d ? d.programs.length.toString() : 'Loading…'
      case 'program_names': { const names=d?.programs.map(p=>p.program?.name).filter((name):name is string=>Boolean(name))||[];return d?(names.length?names.slice(0,6).join(', ')+(names.length>6?` +${names.length-6} more`:''):'Not listed'):'Loading…' }
      case 'avg_rating': return d && d.reviews.length > 0 ? (d.reviews.reduce((a, r) => a + r.rating, 0) / d.reviews.length).toFixed(1) : d ? 'No reviews yet' : 'Loading…'
      case 'review_count': return d ? d.reviews.length.toString() : 'Loading…'
      case 'scholarship_count': return d ? d.scholarships.toString() : 'Loading…'
      case 'fee_range': return d ? feeEvidenceLabel(d.programs, selectedProgram || undefined) : 'Loading…'
      case 'seat_count': { const seats=d?.programs.map(p=>p.seats).filter((count):count is number=>count!=null)||[];return seats.length?`${seats.reduce((sum,count)=>sum+count,0).toLocaleString()} across ${seats.length} program${seats.length===1?'':'s'}`:d?'Not listed':'Loading…' }
      case 'program_scholarships': { const count=d?.programs.filter(p=>p.scholarship_available).length;return d?(count?`${count} of ${d.programs.length}`:'None documented'):'Loading…' }
      case 'education_levels': return college.education_levels?.map(x=>x==='plus_two'?'+2':x.charAt(0).toUpperCase()+x.slice(1)).join(', ')||'Not listed'
      case 'facilities': return college.facilities?.slice(0,5).join(', ')||'Not listed'
      case 'verification_status': return ['institution_verified', 'source_verified'].includes(college.verification_status || '') ? 'Verified' : 'Unverified'
      default: return 'Not listed'
    }
  }

  const detailsLoaded = selected.every((college) => Boolean(detailData[college.id]))
  const displayedRows = showOnlyDifferences && detailsLoaded
    ? ROW_LABELS.filter(({ key }) => new Set(selected.map((college) => getVal(college, key).trim().toLocaleLowerCase('en-US'))).size > 1)
    : ROW_LABELS

  const copyComparisonLink = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(window.location.href)
      setShareStatus('Comparison link copied')
    } catch {
      setShareStatus('Copy the link from your browser address bar')
    }
    window.setTimeout(() => setShareStatus(''), 2500)
  }

  const shareComparison = async () => {
    const collegeNames = selected.map((college) => college.name).join(' and ')
    const shareData = {
      title: `College comparison: SikshyaNepal`,
      text: `Compare ${collegeNames} on SikshyaNepal.`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShareStatus('Comparison shared')
        window.setTimeout(() => setShareStatus(''), 2500)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    await copyComparisonLink()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-6 h-6 text-blue-600" />
          <h1 className="font-display text-3xl font-extrabold text-gray-900">Compare colleges</h1>
        </div>
        <p className="text-gray-500">Compare up to {MAX} colleges using published fees, programs, scholarships and moderated student reviews.</p>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-gray-500">Each published fee shows its programme, payment period and recorded academic year where available. Values with different programmes or periods are not a direct total-cost comparison; confirm the current written fee structure before paying.</p>
      </div>

      {error && <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

      {/* College Slots */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => {
          const college = selected[i]
          return (
            <div key={i} className="relative">
              {college ? (
                <div className="bg-white rounded-xl border-2 border-blue-200 p-4">
                  <button onClick={() => removeCollege(college.id)}
                    aria-label={`Remove ${college.name} from comparison`}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-lg mb-3">
                    {college.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight pr-6">{college.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {cleanCollegeText(college.location) || 'Location not listed'}
                  </p>
                  <Link href={`/colleges/${college.slug}`}
                    className="mt-3 inline-block text-xs text-blue-600 hover:underline">View Profile →</Link>
                </div>
              ) : (
                <button
                  onClick={openCollegeSearch}
                  className="w-full bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center hover:border-blue-300 transition-colors group motion-control">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm text-gray-500 group-hover:text-blue-600">Add College {i + 1}</p>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4 motion-backdrop" onClick={() => setShowSearch(false)}>
          <div ref={searchDialogRef} role="dialog" aria-modal="true" aria-labelledby="college-search-title" tabIndex={-1} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg motion-dialog-enter" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100">
              <h2 id="college-search-title" className="mb-3 font-display text-lg font-bold text-ink">Add a college</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search colleges by name…"
                  aria-label="Search colleges to compare"
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {searching && <div className="text-center py-8 text-gray-400 text-sm">Searching...</div>}
              {!searching && search.trim().length >= 2 && results.length === 0 && !error && (
                <div className="text-center py-8 text-gray-400 text-sm">No colleges found</div>
              )}
              {!searching && search.trim().length < 2 && (
                <div className="text-center py-8 text-gray-400 text-sm">Type at least two letters to search colleges</div>
              )}
              {results.map(college => {
                const alreadyAdded = !!selected.find(c => c.id === college.id)
                return (
                  <button key={college.id} onClick={() => !alreadyAdded && addCollege(college)} disabled={alreadyAdded}
                    aria-label={alreadyAdded ? `${college.name} is already in this comparison` : `Add ${college.name} to comparison`}
                    className={`w-full flex items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors last:border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${alreadyAdded ? 'cursor-not-allowed bg-slate-50 text-slate-500' : 'hover:bg-gray-50'}`}>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                      {college.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{college.name}</p>
                      <p className="text-xs text-gray-500">{cleanCollegeText(college.location) || 'Location not listed'} {cleanCollegeText(college.affiliation) && `• ${cleanCollegeText(college.affiliation)}`}</p>
                    </div>
                    {alreadyAdded && <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-slate-600"><Check className="h-4 w-4 text-[#16736c]" aria-hidden="true" />Added</span>}
                  </button>
                )
              })}
            </div>
            <div className="p-3 border-t border-gray-100">
              <button onClick={() => setShowSearch(false)} className="w-full rounded-lg py-2 text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selected.length >= 2 ? (
        <div>
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-4">
              {sharedPrograms.length > 0 && <label className="block text-xs font-semibold text-gray-700">Compare fees for the same programme<select value={selectedProgram} onChange={(event) => setSelectedProgram(event.target.value)} className="mt-1 block min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"><option value="">All recorded programmes</option>{sharedPrograms.map((program) => <option key={program} value={program}>{program}</option>)}</select></label>}
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-gray-700"><input type="checkbox" checked={showOnlyDifferences} onChange={(event) => setShowOnlyDifferences(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />Only show differences</label>
            </div>
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2"><p className="text-xs text-gray-500 sm:hidden">Swipe sideways to see every college.</p><span aria-live="polite" className="text-xs text-gray-500">{shareStatus || (showOnlyDifferences ? detailsLoaded ? `${displayedRows.length} differing fields` : 'Loading comparison details…' : '')}</span><button type="button" onClick={() => void shareComparison()} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:border-blue-300 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors motion-control"><Share2 className="h-3.5 w-3.5" aria-hidden="true" />Share comparison</button></div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full">
              <caption className="sr-only">Side-by-side comparison of selected colleges. {showOnlyDifferences ? 'Only fields with different recorded values are shown. ' : ''}Missing information is labelled as not listed.</caption>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th scope="col" className="sticky left-0 z-[1] bg-gray-50 text-left px-6 py-4 text-sm font-semibold text-gray-700 w-40">Feature</th>
                  {selected.map(c => (
                    <th scope="col" key={c.id} className="px-6 py-4 text-center">
                      <div className="font-semibold text-gray-900 text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{c.location}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedRows.map(({ key, label }, idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <th scope="row" className={`sticky left-0 z-[1] px-6 py-4 text-left text-sm font-medium text-gray-600 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>{key === 'fee_range' && selectedProgram ? `${selectedProgram} fees` : label}</th>
                    {selected.map(college => {
                      const val = getVal(college, key)
                      return (
                        <td key={college.id} className="px-6 py-4 text-center text-sm text-gray-800">
                          {key === 'avg_rating' && /^\d/.test(val) ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                              <span className="font-semibold">{val}</span>
                            </span>
                          ) : (
                            <span className={val === 'Not listed' || val === 'Not documented' || val === 'No reviews yet' ? 'text-gray-500' : 'font-medium'}>{val}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">Profile</td>
                  {selected.map(c => (
                    <td key={c.id} className="px-6 py-4 text-center">
                      <Link href={`/colleges/${c.slug}`}
                        className="inline-flex min-h-11 items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors motion-control">
                        View Profile
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {showOnlyDifferences && detailsLoaded && displayedRows.length === 0 && <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">The recorded fields are currently the same. Turn off “Only show differences” to inspect the full evidence.</p>}
        {detailsLoaded && <ComparisonEvidenceGraph colleges={selected} details={detailData} />}
        <p className="mt-4 text-xs leading-5 text-gray-500">Fees, seats and scholarships can change during admission season. Select a shared programme above to compare fees like-for-like; otherwise each college shows all recorded programme fees. Counts cover only programs recorded in SikshyaNepal. Treat “Not listed” as unavailable data, not as “none”, and confirm final details with the college.</p>
        </div>
      ) : selected.length === 1 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <GitCompare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Add at least one more college to start comparing</p>
          <button onClick={openCollegeSearch}
            className="mt-4 inline-flex min-h-11 items-center px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors motion-control">
            + Add College
          </button>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <GitCompare className="w-14 h-14 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-2">No Colleges Selected</h3>
          <p className="text-sm text-gray-400 mb-5 max-w-sm mx-auto">Choose up to three colleges to compare programs, published fees and student reviews.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3"><button onClick={openCollegeSearch}
            className="min-h-11 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-control">
            Start comparing
          </button><Link href="/account/saved" className="inline-flex min-h-11 items-center rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-primary hover:border-blue-300 hover:bg-blue-50 transition-colors motion-control">Choose from saved colleges</Link></div>
        </div>
      )}
    </div>
  )
}
