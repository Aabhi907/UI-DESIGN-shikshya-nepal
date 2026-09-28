import { Metadata } from 'next'
import { Fragment } from 'react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import SearchField from '@/components/design-system/SearchField'
import Card from '@/components/design-system/Card'
import Pill from '@/components/design-system/Pill'
import SectionHeader from '@/components/design-system/SectionHeader'
import Button from '@/components/design-system/Button'
import PublishedDate from '@/components/ui/PublishedDate'
import type { Result } from '@/types'
import { AlertTriangle, FileText, RefreshCcw } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University Exam Results Nepal | TU, KU, NEB Results',
  description: 'Find published exam-result notices from TU, KU, PU, NEB and CTEVT, with links to the recorded source.',
}

const UNIVERSITIES = ['TU', 'KU', 'PU', 'PurU', 'NEB', 'CTEVT']
const PROGRAMS     = ['BCA', 'BBA', 'BE', 'MBBS', 'BBS', 'BSc', 'BA', 'MA', 'MBS']

// PostgREST "or" filter syntax uses , . ( ) as delimiters — quote the value so a
// program/search term containing them can't be mistaken for filter syntax.
function orValue(value: string) {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

async function getResults(sp: { q?: string; university?: string; program?: string }) {
  const supabase = createServerSupabaseClient()
  // !inner turns the university join into an actual row filter (not just an
  // embed) — without it, filtering by university only hides the joined object,
  // not the row, so it has no effect on which rows are returned.
  const universityTable = sp.university ? 'universities!inner' : 'universities'
  let query = supabase
    .from('results')
    .select(`*, university:${universityTable}(id, name, short_name, slug, website, created_at)`)
    .order('published_date', { ascending: false, nullsFirst: false })

  if (sp.q) query = query.ilike('title', `%${sp.q}%`)
  if (sp.university) query = query.ilike('university.short_name', sp.university)
  if (sp.program) {
    // Loose match at the query level (so a real match isn't excluded by the
    // 100-row cap before the precise whole-word check below can even see it).
    const term = orValue(`%${sp.program}%`)
    query = query.or(`program.ilike.${term},title.ilike.${term}`)
  }

  const { data, error } = await query.limit(100)
  if (error) {
    console.error('[results:list]', { code: error.code, message: error.message })
    return { results: [] as Result[], error: true }
  }

  let results = (data || []) as Result[]

  if (sp.program) {
    const program = sp.program.toLowerCase()
    // Whole word, allowing dotted forms (B.E., B.Sc.) but not BEd or BEcon for BE.
    const letters = program.replace(/[^a-z]/g, '').split('').join('\\.?')
    const wholeWord = new RegExp(`(^|[^a-z])${letters}\\.?(?![a-z])`, 'i')
    results = results.filter(
      (r) => r.program?.toLowerCase() === program || wholeWord.test(r.title)
    )
  }

  return { results, error: false }
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string; university?: string; program?: string }
}) {
  const { results, error } = await getResults(searchParams)
  const hasFilter = !!(searchParams.university || searchParams.program || searchParams.q)

  function filterUrl(key: string, val: string) {
    const p = new URLSearchParams()
    if (searchParams.q)          p.set('q',          searchParams.q)
    if (searchParams.university) p.set('university', searchParams.university)
    if (searchParams.program)    p.set('program',    searchParams.program)
    if (p.get(key) === val) p.delete(key)
    else p.set(key, val)
    const s = p.toString()
    return `/results${s ? `?${s}` : ''}`
  }

  const currentUrl = (() => {
    const p = new URLSearchParams()
    if (searchParams.q)          p.set('q',          searchParams.q)
    if (searchParams.university) p.set('university', searchParams.university)
    if (searchParams.program)    p.set('program',    searchParams.program)
    const s = p.toString()
    return `/results${s ? `?${s}` : ''}`
  })()

  return (
    <div className="bg-sn-ground min-h-screen">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-sn-surface border-b border-sn-border">
        <div className="max-w-sn mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-8">
          <SectionHeader as="h1" eyebrow="Exam results" title="University results" description="Latest exam results from universities and boards in Nepal" className="mb-6" />
          <SearchField className="[&_button[type=submit]]:!bg-sn-primary-hover" placeholder="Search results by title or program..." redirectTo="/results" initialValue={searchParams.q} />
        </div>

        {/* University chips */}
        <div className="max-w-sn mx-auto px-5 sm:px-8 lg:px-12 pb-5">
          <div className="flex flex-wrap gap-2">
            <Link href={filterUrl('university', '')} className={!searchParams.university ? 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-ink bg-sn-ink px-4 py-2 text-sm font-bold text-white focus-visible:outline-sn-primary motion-control' : 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-border bg-sn-surface px-4 py-2 text-sm font-bold text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary-hover focus-visible:outline-sn-primary motion-control'}>
              All
            </Link>
            {UNIVERSITIES.map((u) => (
              <Link key={u} href={filterUrl('university', u)} className={searchParams.university === u ? 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-ink bg-sn-ink px-4 py-2 text-sm font-bold text-white focus-visible:outline-sn-primary motion-control' : 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-border bg-sn-surface px-4 py-2 text-sm font-bold text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary-hover focus-visible:outline-sn-primary motion-control'}>
                {u}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Program chips + list ─────────────────────────────── */}
      <div className="max-w-sn mx-auto px-5 sm:px-8 lg:px-12 py-6">

        {/* Program filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {PROGRAMS.map((prog) => (
            <Link key={prog} href={filterUrl('program', prog)} className={searchParams.program === prog ? 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-ink bg-sn-ink px-4 py-2 text-sm font-bold text-white focus-visible:outline-sn-primary motion-control' : 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-border bg-sn-surface px-4 py-2 text-sm font-bold text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary-hover focus-visible:outline-sn-primary motion-control'}>
              {prog}
            </Link>
          ))}
        </div>

        {error ? (
          <Card className="py-16 text-center lg:py-16">
            <div className="w-14 h-14 bg-sn-confirm-bg rounded-sn-card flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-sn-confirm-ink" />
            </div>
            <h3 className="text-base font-semibold text-sn-ink mb-2">Results could not be loaded</h3>
            <p className="text-sm text-sn-ink-soft mb-6 max-w-xs mx-auto">
              This is a temporary problem, not an empty list. Your filters are safe. Please try again.
            </p>
            <Button.Link href={currentUrl}>
              <RefreshCcw className="w-4 h-4" />
              Try again
            </Button.Link>
          </Card>
        ) : (
        <>
        {/* Count */}
        <p className="text-sm text-sn-ink-soft mb-4 font-mono">
          <span className="font-bold text-sn-ink">{results.length}</span>{' '}
          result{results.length !== 1 ? 's' : ''} found
          {searchParams.q && <> for &ldquo;{searchParams.q}&rdquo;</>}
        </p>

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result, idx) => (
              <Fragment key={result.id}>
                <Card as="article" interactive className="p-0 lg:p-0">
                  <Link href={`/results/${result.slug}`} className="block min-h-11 rounded-sn-card p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sn-primary">
                    <h2 className="font-baloo text-lg font-bold leading-snug text-sn-ink">{result.title}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-sn-ink-soft">
                      {result.university?.short_name && <Pill tone="primary" className="!text-sn-ink-soft">{result.university.short_name}</Pill>}
                      {result.program && <Pill tone="neutral">{result.program}</Pill>}
                      {result.semester && <Pill tone="neutral">{result.semester}</Pill>}
                      {result.content_type === 'pdf' && <Pill tone="neutral">PDF</Pill>}
                      {result.content_type === 'image' && <Pill tone="neutral">Image</Pill>}
                      {result.published_date && Date.now() - new Date(result.published_date).getTime() < 86400000 && <Pill tone="primary" className="!text-sn-ink-soft">New</Pill>}
                      <PublishedDate value={result.published_date} className="ml-auto text-sn-ink-soft" />
                    </div>
                  </Link>
                </Card>
                {idx === 4 && (
                  <AdUnit
                    key="ad-results"
                    slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS ?? ''}
                    format="auto"
                    className="my-1 rounded-sn-card border border-sn-border bg-sn-surface min-h-[90px]"
                  />
                )}
              </Fragment>
            ))}
          </div>
        ) : (
          <Card className="py-16 text-center lg:py-16">
            <div className="w-14 h-14 bg-sn-surface-alt rounded-sn-card flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-sn-ink-soft" />
            </div>
            <h3 className="text-base font-semibold text-sn-ink mb-2">No results found</h3>
            <p className="text-sm text-sn-ink-soft mb-6 max-w-xs mx-auto">
              {hasFilter
                ? 'Try removing some filters or searching with different keywords.'
                : 'New exam results will appear here as soon as they are published.'}
            </p>
            {hasFilter && (
              <Button.Link href="/results">
                <RefreshCcw className="w-4 h-4" />
                Clear all filters
              </Button.Link>
            )}
          </Card>
        )}
        </>
        )}
      </div>
    </div>
  )
}
