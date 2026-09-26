import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import CollegeCard from '@/components/colleges/CollegeCard'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { College, Program } from '@/types'
import { publicListState } from '@/lib/public-list-state'

export const revalidate = 0

async function load(slug: string) {
  const db = createServerSupabaseClient()
  const { data: program, error: programError } = await db.from('programs').select('*').eq('slug', slug).maybeSingle()
  if (programError) {
    console.error('[colleges:program]', { code: programError.code, message: programError.message })
    return { program: null, colleges: [] as College[], loadError: true }
  }
  if (!program) return { program: null, colleges: [] as College[], loadError: false }
  const { data, error } = await db.from('college_programs').select('college:colleges(id,name,slug,location,district,province,local_level,affiliation,logo_url,cover_url,is_featured,verification_status,programs_offered,education_levels,is_sponsored,sponsor_label,sponsor_starts_at,sponsor_ends_at,sponsor_disclosure,programs:college_programs(fee,fee_period,fee_source_url,fee_last_verified_at,scholarship_available,program:programs(id,name,slug,faculty,degree_level)),reviews(rating,is_approved))').eq('program_id', program.id).limit(200)
  if (error) console.error('[colleges:program-colleges]', { code: error.code, message: error.message })
  const { items, loadError } = publicListState({ data, error })
  return { program: program as Program, colleges: items.map(row => row.college).filter(Boolean) as unknown as College[], loadError }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await load(params.slug)
  if (data.loadError) return { title: 'Colleges by Program' }
  if (!data.program) return { title: 'Program not found' }
  return { title: `${data.program.name} Colleges in Nepal`, description: `Compare colleges offering ${data.program.name} in Nepal by location, fees, scholarships and current admissions.`, alternates: { canonical: `/colleges/program/${params.slug}` } }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const data = await load(params.slug)
  if (!data.program && !data.loadError) notFound()
  return (
    <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      {data.loadError ? <div role="alert" className="rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg p-8 text-center text-sn-confirm-ink"><AlertTriangle className="mx-auto h-8 w-8" aria-hidden="true" /><h1 className="mt-3 font-baloo text-xl font-bold">Colleges could not be loaded</h1><p className="mt-2 text-sm">This is a temporary problem, not an empty list. Please try again.</p><a href={`/colleges/program/${params.slug}`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sn-control bg-sn-ink px-4 text-sm font-bold text-white"><RefreshCcw className="h-4 w-4" aria-hidden="true" />Try again</a></div> : <>
      <nav className="text-sm text-sn-ink-muted"><Link href="/colleges" className="hover:text-sn-primary">Colleges</Link> / <Link href={`/programs/${data.program!.slug}`} className="hover:text-sn-primary">{data.program!.name}</Link></nav>
      <h1 className="mt-4 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">Colleges offering {data.program!.name} in Nepal</h1>
      <p className="mt-3 text-sm leading-6 text-sn-ink-soft sm:text-base">Compare {data.colleges.length} listed college{data.colleges.length === 1 ? '' : 's'}, then check eligibility, official fees and admission deadlines.</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.colleges.map(college => <CollegeCard key={college.id} college={college} />)}
      </div>
      {!data.colleges.length && <p className="mt-12 rounded-sn-card border border-sn-border bg-sn-surface p-10 text-center text-sn-ink-soft">No colleges are indexed for this program yet.</p>}
      </>}
    </div>
  )
}
