import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SchoolCard from '@/components/schools/SchoolCard'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { School } from '@/types'

export const revalidate = 0

const titleCase = (value: string) => value.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

async function load(district: string) {
  const safe = decodeURIComponent(district).replace(/[^a-z0-9-]/gi, '')
  const name = titleCase(safe)
  const { data } = await createServerSupabaseClient().from('schools').select('*').eq('status', 'active').ilike('district', `%${name}%`).order('verification_status', { ascending: false }).order('name').limit(200)
  return { name, schools: (data || []) as School[] }
}

export async function generateMetadata({ params }: { params: { district: string } }): Promise<Metadata> {
  const name = titleCase(params.district)
  return { title: `Schools in ${name}, Nepal – ECD to Grade 10`, description: `Find schools in ${name}, Nepal offering ECD through Grade 10. Compare location, ownership, facilities and verified information.`, alternates: { canonical: `/schools/in/${params.district}` } }
}

export default async function DistrictSchoolsPage({ params }: { params: { district: string } }) {
  const { name, schools } = await load(params.district)
  if (!name) notFound()
  return (
    <main className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8">
          <nav className="text-sm text-sn-ink-muted"><Link href="/schools" className="hover:text-sn-primary">Schools</Link> / {name}</nav>
          <h1 className="mt-4 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">Schools in {name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">Explore ECD through Grade 10 schools in {name}. Check official sources, contact details, ownership, facilities, and verification before deciding.</p>
        </div>
      </section>
      <div className="mx-auto max-w-sn px-5 py-8 sm:px-8">
        <div className="mb-5 flex flex-wrap gap-2 text-sm">
          <Link href={`/schools?district=${encodeURIComponent(name)}`} className="rounded-sn-control bg-sn-primary px-4 py-2 font-bold text-white hover:bg-sn-primary-hover">Filter directory</Link>
          <Link href="/schools" className="rounded-sn-control border border-sn-border-strong bg-sn-surface px-4 py-2 font-bold text-sn-ink">All schools</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{schools.map(school => <SchoolCard key={school.id} school={school} />)}</div>
        {!schools.length && <p className="rounded-sn-card border border-dashed border-sn-border bg-sn-surface p-12 text-center text-sn-ink-soft">No active school profiles are indexed for {name} yet. Try the main directory or return after the official data import.</p>}
      </div>
    </main>
  )
}
