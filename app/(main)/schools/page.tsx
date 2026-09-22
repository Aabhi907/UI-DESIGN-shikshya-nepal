import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import SchoolCard from '@/components/schools/SchoolCard'
import SchoolFilters, { type SchoolSearchParams } from '@/components/schools/SchoolFilters'
import ProgramFinderBanner from '@/components/design-system/ProgramFinderBanner'
import Mascot from '@/components/design-system/Mascot'
import type { School } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Schools in Nepal – Find and Compare School Information',
  description: 'Search Nepal schools offering ECD through Grade 10 by district, level and ownership. View sourced profiles, contact details and facilities.',
  alternates: { canonical: '/schools' },
}

async function getSchools(sp: SchoolSearchParams) {
  const supabase = createServerSupabaseClient()
  const page = Math.max(1, Number.parseInt(sp.page || '1', 10) || 1)
  const pageSize = 24
  let query = supabase.from('schools').select('id,iemis_code,name,slug,ownership_type,school_level,grades_from,grades_to,province,district,local_level,location,logo_url,cover_url,student_count,verification_status,is_featured', { count: 'exact' }).eq('status', 'active').or('grades_to.lte.10,grades_to.is.null').order('is_featured', { ascending: false }).order('name')
  const searchTerm = sp.q?.trim().slice(0, 100)
  if (searchTerm) query = query.ilike('name', `%${searchTerm}%`)
  if (sp.province) query = query.eq('province', sp.province)
  if (sp.district) query = query.eq('district', sp.district)
  if (sp.ownership) query = query.eq('ownership_type', sp.ownership)
  if (sp.level) query = query.eq('school_level', sp.level)
  if (sp.medium) query = query.contains('medium_of_instruction', [sp.medium])
  const grade = Number(sp.grade)
  if (sp.grade !== undefined && Number.isInteger(grade) && grade >= 0 && grade <= 10) {
    query = query.or(`grades_from.lte.${grade},grades_from.is.null`).or(`grades_to.gte.${grade},grades_to.is.null`)
  }
  if (sp.verified === 'true') query = query.in('verification_status', ['source_verified', 'institution_verified'])
  const from = (page - 1) * pageSize
  const { data, error, count } = await query.range(from, from + pageSize - 1)
  if (error) console.error('[schools] query failed:', error.message)
  return { schools: (data || []) as School[], total: count || 0, page, pageSize, failed: Boolean(error) }
}

export default async function SchoolsPage({ searchParams }: { searchParams: SchoolSearchParams }) {
  const { schools, total, page, pageSize, failed } = await getSchools(searchParams)
  const verifiedCount = schools.filter((s) => s.verification_status !== 'unverified').length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pageHref = (nextPage: number) => { const params = new URLSearchParams(); Object.entries(searchParams).forEach(([key, value]) => { if (value && key !== 'page') params.set(key, value) }); if (nextPage > 1) params.set('page', String(nextPage)); const query = params.toString(); return `/schools${query ? `?${query}` : ''}` }

  return (
    <div className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Nepal school directory</p>
              <h1 className="mt-2 font-baloo text-3xl font-extrabold leading-tight text-sn-ink sm:text-4xl">Find the right school, with facts you can check.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">Explore ECD to Grade 10 schools by province, district, level and ownership. For +2, Bachelor or Master study, use the Colleges directory.</p>
            </div>
            <Link href="/schools#data-quality" className="inline-flex items-center gap-2 rounded-sn-control border border-sn-border-strong bg-sn-primary-bg px-4 py-3 text-sm font-bold text-sn-primary-hover"><ShieldCheck className="h-4 w-4" />How verification works</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-sn px-5 py-8 sm:px-8 lg:px-12">
        <ProgramFinderBanner className="mb-6" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <SchoolFilters searchParams={searchParams} resultCount={total} />
          <main>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-sn-ink-soft"><strong className="text-sn-ink">{total.toLocaleString()}</strong> matching school{total === 1 ? '' : 's'}</p>
              {schools.length > 0 && <p className="text-xs text-sn-ink-muted">Page {page} of {totalPages} · {verifiedCount} source-checked on this page</p>}
            </div>
            {failed ? (
              <div role="alert" className="rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg px-6 py-16 text-center">
                <Building2 className="mx-auto h-10 w-10 text-sn-confirm-ink" />
                <h2 className="mt-4 font-baloo text-xl font-bold text-sn-ink">School directory is temporarily unavailable</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-sn-ink-soft">Your filters are fine. We could not reach the directory just now—please try again in a moment.</p>
                <Link href={pageHref(page)} className="mt-5 inline-block rounded-sn-control bg-sn-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-sn-primary-hover">Try again</Link>
              </div>
            ) : schools.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{schools.map((school) => <SchoolCard key={school.id} school={school} />)}</div>
            ) : (
              <div className="rounded-sn-card border border-sn-border bg-sn-surface px-6 py-20 text-center">
                <Mascot pose="point" size={72} className="mx-auto mb-4" />
                <h2 className="font-baloo text-xl font-bold text-sn-ink">No schools match these filters</h2>
                <p className="mt-2 text-sm text-sn-ink-soft">Try a broader location or clear the filters.</p>
                <Link href="/schools" className="mt-5 inline-block rounded-sn-control bg-sn-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-sn-primary-hover">View all schools</Link>
              </div>
            )}
            {totalPages > 1 && (
              <nav aria-label="Schools pages" className="mt-8 flex items-center justify-between rounded-sn-control border border-sn-border bg-sn-surface p-3">
                <Link href={pageHref(page - 1)} aria-disabled={page <= 1} className={`inline-flex items-center gap-1 rounded-sn-control px-3 py-2 text-sm font-bold ${page <= 1 ? 'pointer-events-none text-sn-ink-muted/50' : 'text-sn-primary hover:bg-sn-primary-bg'}`}><ChevronLeft className="h-4 w-4" />Previous</Link>
                <span className="text-xs font-bold text-sn-ink-muted">{page} / {totalPages}</span>
                <Link href={pageHref(page + 1)} aria-disabled={page >= totalPages} className={`inline-flex items-center gap-1 rounded-sn-control px-3 py-2 text-sm font-bold ${page >= totalPages ? 'pointer-events-none text-sn-ink-muted/50' : 'text-sn-primary hover:bg-sn-primary-bg'}`}>Next<ChevronRight className="h-4 w-4" /></Link>
              </nav>
            )}
          </main>
        </div>

        <section id="data-quality" className="mt-12 rounded-sn-card bg-sn-ink p-7 text-white sm:p-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div><ShieldCheck className="mb-4 h-7 w-7 text-sn-primary-bg" /><h2 className="font-baloo text-xl font-bold">Verification you can see</h2><p className="mt-2 text-sm leading-relaxed text-white/70">Source-verified profiles link to the dataset or official page used. Institution-verified profiles were additionally confirmed by an authorized representative.</p></div>
            <div><h3 className="font-bold">Our source order</h3><ol className="mt-3 space-y-2 text-sm text-white/70"><li>1. Government and IEMIS datasets</li><li>2. Official school publications</li><li>3. Institution-confirmed submissions</li></ol></div>
            <div><h3 className="font-bold">Information changes</h3><p className="mt-3 text-sm leading-relaxed text-white/70">Every profile includes a correction form. Reports enter a review queue and are checked before publication.</p></div>
          </div>
        </section>
      </div>
    </div>
  )
}
