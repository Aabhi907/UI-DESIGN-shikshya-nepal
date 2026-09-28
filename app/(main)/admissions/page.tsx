import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, CalendarCheck2, CheckCircle2, Clock3, RefreshCcw } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import AdmissionCard from '@/components/admissions/AdmissionCard'
import AdmissionFilters, { type AdmissionSearchParams } from '@/components/admissions/AdmissionFilters'
import Mascot from '@/components/design-system/Mascot'
import { addDaysToDateOnly, deadlineState, nepalDateOnly } from '@/lib/admissions'
import type { Admission } from '@/types'
import { publicListState } from '@/lib/public-list-state'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Admissions Open in Nepal – Colleges and Universities',
  description: 'Find verified admission openings, eligibility, entrance dates and application deadlines for colleges and universities in Nepal.',
  alternates: { canonical: '/admissions' },
}

// Next.js hands back an array for a repeated query key (e.g. `?q=a&q=b`). Treat
// that, and any other value this page doesn't recognise, the same way: as if
// the param were never set, rather than guessing which value the visitor meant.
type RawParams = Record<string, string | string[] | undefined>
const one = (value?: string | string[]): string | undefined => (Array.isArray(value) ? undefined : value)
// The filter UI only ever sends "open" or a small day count ("7", "30"). Match
// that shape; anything else (a word, an out-of-range or huge number) is ignored.
const DEADLINE_WINDOW = /^[1-9][0-9]{0,3}$/
const cleanDeadline = (value?: string): string => (value === 'open' || (value && DEADLINE_WINDOW.test(value)) ? value : '')

function parseAdmissionParams(searchParams: AdmissionSearchParams): Required<AdmissionSearchParams> {
  const raw = searchParams as RawParams
  const q = one(raw.q)?.replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || ''
  return {
    q,
    institution: one(raw.institution) || '',
    level: one(raw.level) || '',
    type: one(raw.type) || '',
    verified: one(raw.verified) || '',
    deadline: cleanDeadline(one(raw.deadline)),
  }
}

async function getAdmissions(sp: Required<AdmissionSearchParams>) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('admissions').select('*, college:colleges(id,name,slug,location)').eq('status', 'published').order('is_featured', { ascending: false }).order('application_deadline', { ascending: true, nullsFirst: false }).limit(200)
  if (sp.q) query = query.or(`title.ilike.%${sp.q}%,institution_name.ilike.%${sp.q}%`)
  if (sp.institution) query = query.eq('institution_type', sp.institution)
  if (sp.level) query = query.ilike('education_level', sp.level)
  if (sp.type) query = query.eq('admission_type', sp.type)
  if (sp.verified === 'true') query = query.in('verification_status', ['source_verified', 'institution_verified'])
  if (sp.deadline) {
    const today = nepalDateOnly(); query = query.gte('application_deadline', today)
    if (sp.deadline !== 'open') query = query.lt('application_deadline', addDaysToDateOnly(today, Number(sp.deadline) + 1))
  }
  const { data, error } = await query
  if (error) console.error('[admissions]', { code: error.code, message: error.message })
  const state = publicListState({ data: data as Admission[] | null, error })
  return { admissions: state.items, loadError: state.loadError }
}

export default async function AdmissionsPage({ searchParams }: { searchParams: AdmissionSearchParams }) {
  const params = parseAdmissionParams(searchParams)
  const { admissions, loadError } = await getAdmissions(params)
  const retryParams = new URLSearchParams()
  for (const key of ['q', 'institution', 'level', 'type', 'verified', 'deadline'] as const) {
    if (params[key]) retryParams.set(key, params[key])
  }
  const retryUrl = `/admissions${retryParams.size ? `?${retryParams}` : ''}`
  const open = admissions.filter((item) => deadlineState(item.application_deadline) !== 'closed').length
  const soon = admissions.filter((item) => deadlineState(item.application_deadline) === 'closing_soon').length
  const verified = admissions.filter((item) => item.verification_status !== 'unverified').length
  return (
    <div className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Admission calendar</p>
          <h1 className="mt-2 font-baloo text-3xl font-extrabold leading-tight text-sn-ink sm:text-4xl">Never miss an admission deadline.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">Verified openings for colleges and universities—with eligibility, entrance dates and original sources in one place.</p>
        </div>
      </section>
      <div className="mx-auto max-w-sn px-5 py-8 sm:px-8 lg:px-12">
        <nav aria-label="Admission status" className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <Link href="/admissions" aria-current={!params.deadline ? 'page' : undefined} className={`min-h-11 whitespace-nowrap rounded-sn-control border px-4 py-3 text-sm font-bold font-nunito transition-colors motion-control ${!params.deadline ? 'border-sn-primary bg-sn-primary text-white' : 'border-sn-border-strong bg-sn-surface text-sn-ink-soft'}`}>All admissions</Link>
          <Link href="/admissions?deadline=open" aria-current={params.deadline === 'open' ? 'page' : undefined} className={`min-h-11 whitespace-nowrap rounded-sn-control border px-4 py-3 text-sm font-bold font-nunito transition-colors motion-control ${params.deadline === 'open' ? 'border-sn-primary bg-sn-primary text-white' : 'border-sn-border-strong bg-sn-surface text-sn-ink-soft'}`}>Open now</Link>
          <Link href="/admissions?deadline=7" aria-current={params.deadline === '7' ? 'page' : undefined} className={`min-h-11 whitespace-nowrap rounded-sn-control border px-4 py-3 text-sm font-bold font-nunito transition-colors motion-control ${params.deadline === '7' ? 'border-sn-primary bg-sn-primary text-white' : 'border-sn-border-strong bg-sn-surface text-sn-ink-soft'}`}>Closing in 7 days</Link>
          <Link href="/admissions/planner" className="min-h-11 whitespace-nowrap rounded-sn-control border border-sn-border-strong bg-sn-surface px-4 py-3 text-sm font-bold font-nunito text-sn-ink-soft transition-colors motion-control hover:border-sn-primary hover:text-sn-primary">My planner</Link>
        </nav>
        {!loadError && <div className="mb-6 grid grid-cols-3 gap-3">
          {[{ Icon: CalendarCheck2, value: open, label: 'Open' }, { Icon: Clock3, value: soon, label: 'Closing soon' }, { Icon: CheckCircle2, value: verified, label: 'Verified' }].map(({ Icon, value, label }) => (
            <div key={label} className="rounded-sn-card border border-sn-border bg-sn-surface p-4">
              <Icon className="mb-2 h-5 w-5 text-sn-primary" />
              <p className="font-baloo text-2xl font-extrabold text-sn-ink">{value}</p>
              <p className="text-xs font-nunito text-sn-ink-muted">{label}</p>
            </div>
          ))}
        </div>}

        {loadError ? (
          <div role="alert" className="rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg p-8 text-center text-sn-confirm-ink">
            <AlertTriangle className="mx-auto h-8 w-8" aria-hidden="true" />
            <h2 className="mt-3 font-baloo text-xl font-bold">Admissions could not be loaded</h2>
            <p className="mt-2 text-sm">This is a temporary problem, not an empty list. Your filters are safe — please try again.</p>
            <a href={retryUrl} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sn-control bg-sn-ink px-4 text-sm font-bold text-white motion-control hover:bg-sn-ink/90"><RefreshCcw className="h-4 w-4" aria-hidden="true" />Try again</a>
          </div>
        ) : <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <AdmissionFilters searchParams={params} count={admissions.length} />
          <main>
            {admissions.length ? (
              <div className="grid gap-5 md:grid-cols-2">{admissions.map((item) => <AdmissionCard key={item.id} admission={item} />)}</div>
            ) : (
              <div className="rounded-sn-card border border-sn-border bg-sn-surface py-20 text-center">
                <Mascot pose="point" size={72} className="mx-auto mb-4" />
                <h2 className="font-baloo text-xl font-bold text-sn-ink">No matching admissions</h2>
                <p className="mt-2 text-sm text-sn-ink-soft">Try clearing a filter or return soon for newly verified openings.</p>
                <Link href="/admissions" className="mt-5 inline-block min-h-11 rounded-sn-control bg-sn-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-sn-primary-hover motion-control">View all</Link>
              </div>
            )}
          </main>
        </div>}
      </div>
    </div>
  )
}
