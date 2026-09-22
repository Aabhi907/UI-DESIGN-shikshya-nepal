import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CollegeCard from '@/components/colleges/CollegeCard'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { College } from '@/types'

export const revalidate = 0

const titleCase = (value: string) => value.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' ')

async function load(location: string) {
  const safeSlug = decodeURIComponent(location).replace(/[^a-z0-9-]/gi, '')
  const name = titleCase(safeSlug)
  const db = createServerSupabaseClient()
  const { data } = await db.from('colleges').select('*,programs:college_programs(fee,fee_period,fee_source_url,fee_last_verified_at,scholarship_available,program:programs(id,name,slug,faculty,degree_level)),reviews(rating,is_approved)').or(`district.ilike.%${name}%,location.ilike.%${name}%`).or('status.eq.active,status.is.null').order('is_featured', { ascending: false }).limit(200)
  return { name, colleges: (data || []) as College[] }
}

export async function generateMetadata({ params }: { params: { location: string } }): Promise<Metadata> {
  const name = titleCase(params.location)
  return { title: `+2, Bachelor and Master Colleges in ${name}`, description: `Explore colleges listed in ${name}, Nepal by programs, affiliation, published fees, scholarships and admissions. Verify changing details with the linked official sources.`, alternates: { canonical: `/colleges/in/${params.location}` } }
}

export default async function Page({ params }: { params: { location: string } }) {
  const { name, colleges } = await load(params.location)
  if (!name) notFound()
  return (
    <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <nav className="text-sm text-sn-ink-muted"><Link href="/colleges" className="hover:text-sn-primary">Colleges</Link> / {name}</nav>
      <h1 className="mt-4 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">Colleges in {name}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">Explore post-SEE colleges for +2, Bachelor, Master and diploma study in {name}. Compare programs and verify details with official sources before applying.</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {colleges.map(college => <CollegeCard key={college.id} college={college} />)}
      </div>
      {!colleges.length && <p className="mt-12 rounded-sn-card border border-sn-border bg-sn-surface p-10 text-center text-sn-ink-soft">No active colleges are indexed for {name} yet.</p>}
    </div>
  )
}
