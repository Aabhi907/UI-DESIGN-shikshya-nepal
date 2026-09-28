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
import type { Notice } from '@/types'
import { AlertTriangle, Bell, RefreshCcw } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'University Notices Nepal | Admission, Exam & Results',
  description: 'Latest notices from TU, KU, PU and all universities in Nepal. Stay updated with admission deadlines and exam notices.',
}

const UNIVERSITIES = ['TU', 'KU', 'PU', 'PurU', 'NEB', 'CTEVT']

async function getNotices(sp: { q?: string; university?: string }) {
  const supabase = createServerSupabaseClient()
  // !inner turns the university join into an actual row filter (not just an
  // embed) — without it, filtering by university only hides the joined object,
  // not the row, so it has no effect on which rows are returned.
  const universityTable = sp.university ? 'universities!inner' : 'universities'
  let query = supabase
    .from('notices')
    .select(`*, university:${universityTable}(id, name, short_name, slug, website, created_at)`)
    .order('published_date', { ascending: false, nullsFirst: false })

  if (sp.q) query = query.ilike('title', `%${sp.q}%`)
  if (sp.university) query = query.ilike('university.short_name', sp.university)

  const { data, error } = await query.limit(100)
  if (error) {
    console.error('[notices:list]', { code: error.code, message: error.message })
    return { notices: [] as Notice[], error: true }
  }

  return { notices: (data || []) as Notice[], error: false }
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: { q?: string; university?: string }
}) {
  const { notices, error } = await getNotices(searchParams)
  const hasFilter = !!(searchParams.university || searchParams.q)

  function filterUrl(university: string) {
    const p = new URLSearchParams()
    if (searchParams.q) p.set('q', searchParams.q)
    if (university)     p.set('university', university)
    const s = p.toString()
    return `/notices${s ? `?${s}` : ''}`
  }

  const currentUrl = (() => {
    const p = new URLSearchParams()
    if (searchParams.q)          p.set('q', searchParams.q)
    if (searchParams.university) p.set('university', searchParams.university)
    const s = p.toString()
    return `/notices${s ? `?${s}` : ''}`
  })()

  return (
    <div className="bg-sn-ground min-h-screen">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-sn-surface border-b border-sn-border">
        <div className="max-w-sn mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-8">
          <SectionHeader as="h1" title="Official notices" description="Admission deadlines, exam schedules and official announcements from Nepal's universities" className="mb-6" />
          <SearchField className="[&_button[type=submit]]:!bg-sn-primary-hover" placeholder="Search notices..." redirectTo="/notices" initialValue={searchParams.q} />
        </div>

        {/* University chips */}
        <div className="max-w-sn mx-auto px-5 sm:px-8 lg:px-12 pb-5">
          <div className="flex flex-wrap gap-2">
            <Link href="/notices" className={!searchParams.university ? 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-ink bg-sn-ink px-4 py-2 text-sm font-bold text-white focus-visible:outline-sn-primary motion-control' : 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-border bg-sn-surface px-4 py-2 text-sm font-bold text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary-hover focus-visible:outline-sn-primary motion-control'}>
              All
            </Link>
            {UNIVERSITIES.map((u) => (
              <Link key={u} href={filterUrl(u)} className={searchParams.university === u ? 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-ink bg-sn-ink px-4 py-2 text-sm font-bold text-white focus-visible:outline-sn-primary motion-control' : 'inline-flex min-h-11 items-center rounded-sn-pill border border-sn-border bg-sn-surface px-4 py-2 text-sm font-bold text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary-hover focus-visible:outline-sn-primary motion-control'}>
                {u}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Notices list ─────────────────────────────────────── */}
      <div className="max-w-sn mx-auto px-5 sm:px-8 lg:px-12 py-6">

        {error ? (
          <Card className="py-16 text-center lg:py-16">
            <div className="w-14 h-14 bg-sn-confirm-bg rounded-sn-card flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-sn-confirm-ink" />
            </div>
            <h3 className="text-base font-semibold text-sn-ink mb-2">Notices could not be loaded</h3>
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
        <p className="mb-4 text-sm text-sn-ink-soft tabular-nums">
          <span className="font-bold text-sn-ink">{notices.length}</span>{' '}
          notice{notices.length !== 1 ? 's' : ''} found
          {searchParams.q && <> for &ldquo;{searchParams.q}&rdquo;</>}
        </p>

        {notices.length > 0 ? (
          <div className="space-y-3">
            {notices.map((notice, idx) => (
              <Fragment key={notice.id}>
                <Card as="article" interactive className="p-0 lg:p-0">
                  <Link href={`/notices/${notice.slug}`} className="block min-h-11 rounded-sn-card p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sn-primary">
                    <h2 className="font-baloo text-lg font-bold leading-snug text-sn-ink">{notice.title}</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-sn-ink-soft">
                      {notice.university?.short_name && <Pill tone="primary" className="!text-sn-ink-soft">{notice.university.short_name}</Pill>}
                      {notice.university?.name && <span>{notice.university.name}</span>}
                      {notice.content_type === 'pdf' && <Pill tone="neutral">PDF</Pill>}
                      {notice.content_type === 'image' && <Pill tone="neutral">Image</Pill>}
                      {notice.published_date && Date.now() - new Date(notice.published_date).getTime() < 86400000 && <Pill tone="primary" className="!text-sn-ink-soft">New</Pill>}
                      <PublishedDate value={notice.published_date} className="ml-auto text-sn-ink-soft" />
                    </div>
                  </Link>
                </Card>
                {idx === 4 && (
                  <AdUnit
                    key="ad-notices"
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
              <Bell className="w-7 h-7 text-sn-ink-soft" />
            </div>
            <h3 className="text-base font-semibold text-sn-ink mb-2">No notices found</h3>
            <p className="text-sm text-sn-ink-soft mb-6 max-w-xs mx-auto">
              {hasFilter
                ? 'Try removing some filters or searching with different keywords.'
                : 'New notices will appear here as soon as they are published.'}
            </p>
            {hasFilter && (
              <Button.Link href="/notices">
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
