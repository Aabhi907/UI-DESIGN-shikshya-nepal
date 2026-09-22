import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CollegeCard from '@/components/colleges/CollegeCard'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { College, Program } from '@/types'

export const revalidate = 0

async function load(slug: string) {
  const db = createServerSupabaseClient()
  const { data: program } = await db.from('programs').select('*').eq('slug', slug).single()
  if (!program) return null
  const { data } = await db.from('college_programs').select('college:colleges(*,programs:college_programs(fee,fee_period,fee_source_url,fee_last_verified_at,scholarship_available,program:programs(id,name,slug,faculty,degree_level)),reviews(rating,is_approved))').eq('program_id', program.id).limit(200)
  return { program: program as Program, colleges: (data || []).map(row => row.college).filter(Boolean) as unknown as College[] }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await load(params.slug)
  if (!data) return { title: 'Program not found' }
  return { title: `${data.program.name} Colleges in Nepal`, description: `Compare colleges offering ${data.program.name} in Nepal by location, fees, scholarships and current admissions.`, alternates: { canonical: `/colleges/program/${params.slug}` } }
}

export default async function Page({ params }: { params: { slug: string } }) {
  const data = await load(params.slug)
  if (!data) notFound()
  return (
    <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <nav className="text-sm text-sn-ink-muted"><Link href="/colleges" className="hover:text-sn-primary">Colleges</Link> / <Link href={`/programs/${data.program.slug}`} className="hover:text-sn-primary">{data.program.name}</Link></nav>
      <h1 className="mt-4 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">Colleges offering {data.program.name} in Nepal</h1>
      <p className="mt-3 text-sm leading-6 text-sn-ink-soft sm:text-base">Compare {data.colleges.length} listed college{data.colleges.length === 1 ? '' : 's'}, then check eligibility, official fees and admission deadlines.</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.colleges.map(college => <CollegeCard key={college.id} college={college} />)}
      </div>
    </div>
  )
}
