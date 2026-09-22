import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SchoolCard from '@/components/schools/SchoolCard'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { School } from '@/types'

export const revalidate = 0

const titleCase = (value: string) => value.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

async function load(municipality: string) {
  const safe = decodeURIComponent(municipality).replace(/[^a-z0-9-]/gi, '')
  const name = titleCase(safe)
  const { data } = await createServerSupabaseClient().from('schools').select('*').eq('status', 'active').ilike('local_level', `%${name}%`).order('verification_status', { ascending: false }).order('name').limit(200)
  return { name, schools: (data || []) as School[] }
}

export async function generateMetadata({ params }: { params: { municipality: string } }): Promise<Metadata> {
  const name = titleCase(params.municipality)
  return { title: `Schools in ${name}, Nepal – ECD to Grade 10`, description: `Find verified ECD through Grade 10 schools in ${name}, Nepal. Check school profiles, ownership, facilities and official sources.`, alternates: { canonical: `/schools/municipality/${params.municipality}` } }
}

export default async function MunicipalitySchoolsPage({ params }: { params: { municipality: string } }) {
  const { name, schools } = await load(params.municipality)
  if (!name) notFound()
  return (
    <main className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8">
          <nav className="text-sm text-sn-ink-muted"><Link href="/schools" className="hover:text-sn-primary">Schools</Link> / {name}</nav>
          <h1 className="mt-4 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">Schools in {name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">Browse ECD through Grade 10 schools in {name}. Verify official contact details and source information before applying.</p>
        </div>
      </section>
      <div className="mx-auto max-w-sn px-5 py-8 sm:px-8">
        <Link href="/schools" className="inline-block rounded-sn-control border border-sn-border-strong bg-sn-surface px-4 py-2 text-sm font-bold text-sn-ink">Browse all schools</Link>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{schools.map(school => <SchoolCard key={school.id} school={school} />)}</div>
        {!schools.length && <p className="mt-6 rounded-sn-card border border-dashed border-sn-border bg-sn-surface p-12 text-center text-sn-ink-soft">No active school profiles are indexed for {name} yet.</p>}
      </div>
    </main>
  )
}
