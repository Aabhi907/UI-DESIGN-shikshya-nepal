import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CollegeCard from '@/components/colleges/CollegeCard'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { College } from '@/types'

export const revalidate = 0

const provinces = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']
const resolve = (slug: string) => provinces.find(p => p.toLowerCase() === decodeURIComponent(slug).toLowerCase()) || null

export async function generateMetadata({ params }: { params: { province: string } }): Promise<Metadata> {
  const name = resolve(params.province)
  return name
    ? { title: `+2, Bachelor and Master Colleges in ${name}`, description: `Explore post-SEE colleges in ${name}, Nepal by programs, fees, affiliation and admissions.`, alternates: { canonical: `/colleges/province/${params.province}` } }
    : { title: 'Province not found' }
}

export default async function Page({ params }: { params: { province: string } }) {
  const province = resolve(params.province)
  if (!province) notFound()
  const { data } = await createServerSupabaseClient().from('colleges').select('*,programs:college_programs(fee,fee_period,fee_source_url,fee_last_verified_at,scholarship_available,program:programs(id,name,slug,faculty,degree_level)),reviews(rating,is_approved)').eq('province', province).or('status.eq.active,status.is.null').order('is_featured', { ascending: false }).order('name').limit(300)
  const colleges = (data || []) as College[]
  return (
    <div className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12">
          <nav className="text-sm text-sn-ink-muted"><Link href="/colleges" className="hover:text-sn-primary">Colleges</Link> / {province}</nav>
          <h1 className="mt-4 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">Colleges in {province}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">Explore +2, Bachelor, Master and diploma colleges across {province}. Compare programs, fees, affiliations and admissions.</p>
          <Link href={`/colleges?province=${province}`} className="mt-5 inline-block rounded-sn-control bg-sn-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-sn-primary-hover">Filter colleges in {province}</Link>
        </div>
      </section>
      <div className="mx-auto max-w-sn px-5 py-8 sm:px-8 lg:px-12">
        <p className="mb-5 text-sm text-sn-ink-soft"><strong className="text-sn-ink">{colleges.length}</strong> listed colleges</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map(c => <CollegeCard key={c.id} college={c} />)}
        </div>
        {!colleges.length && <p className="rounded-sn-card border border-sn-border bg-sn-surface p-10 text-center text-sn-ink-soft">No colleges are indexed for {province} yet.</p>}
      </div>
    </div>
  )
}
