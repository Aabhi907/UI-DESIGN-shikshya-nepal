import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SchoolCard from '@/components/schools/SchoolCard'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { School } from '@/types'

export const revalidate = 0

const provinces = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']
const resolve = (slug: string) => provinces.find(p => p.toLowerCase() === decodeURIComponent(slug).toLowerCase()) || null

export async function generateMetadata({ params }: { params: { province: string } }): Promise<Metadata> {
  const name = resolve(params.province)
  return name
    ? { title: `Schools in ${name}, Nepal – ECD to Grade 10`, description: `Find ECD through Grade 10 schools in ${name}, Nepal by district, ownership and verified information.`, alternates: { canonical: `/schools/province/${params.province}` } }
    : { title: 'Province not found' }
}

export default async function Page({ params }: { params: { province: string } }) {
  const province = resolve(params.province)
  if (!province) notFound()
  const { data } = await createServerSupabaseClient().from('schools').select('*').eq('status', 'active').eq('province', province).or('grades_to.lte.10,grades_to.is.null').order('verification_status', { ascending: false }).order('name').limit(300)
  const schools = (data || []) as School[]
  return (
    <main className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8">
          <nav className="text-sm text-sn-ink-muted"><Link href="/schools" className="hover:text-sn-primary">Schools</Link> / {province}</nav>
          <h1 className="mt-4 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">Schools in {province}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">Explore ECD through Grade 10 schools across {province}. Use the filters to narrow by district, entry grade, ownership and medium.</p>
          <Link href={`/schools?province=${province}`} className="mt-5 inline-block rounded-sn-control bg-sn-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-sn-primary-hover">Filter schools in {province}</Link>
        </div>
      </section>
      <div className="mx-auto max-w-sn px-5 py-8 sm:px-8">
        <p className="mb-5 text-sm text-sn-ink-soft"><strong className="text-sn-ink">{schools.length}</strong> active profiles</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{schools.map(s => <SchoolCard key={s.id} school={s} />)}</div>
        {!schools.length && <p className="rounded-sn-card border border-sn-border bg-sn-surface p-10 text-center text-sn-ink-soft">No active school profiles are indexed for {province} yet.</p>}
      </div>
    </main>
  )
}
