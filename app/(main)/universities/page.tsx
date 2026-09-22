import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, ExternalLink, GraduationCap } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { safeExternalUrl } from '@/lib/college-display'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl } from '@/lib/seo'
import type { University } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Universities in Nepal: Programs, Colleges and Official Updates',
  description: 'Explore Nepal universities with linked programs, colleges, entrance exams, results, notices and official sources.',
  alternates: { canonical: '/universities' },
}

export default async function UniversitiesPage() {
  const db = createServerSupabaseClient()
  const [{ data: universityRows, error }, { data: offeringRows }] = await Promise.all([
    db.from('universities').select('*').order('name'),
    db.from('university_program_offerings').select('id,university_id').eq('status', 'published'),
  ])
  const universities = (universityRows || []) as University[]
  const counts = new Map<string, number>()
  for (const item of offeringRows || []) counts.set(item.university_id, (counts.get(item.university_id) || 0) + 1)
  const schema = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Universities in Nepal', url: absoluteUrl('/universities'), mainEntity: universities.map(item => ({ '@type': 'CollegeOrUniversity', name: item.name, url: absoluteUrl(`/universities/${item.slug}`), sameAs: safeExternalUrl(item.website) || undefined })) }

  return <main className="min-h-screen bg-[#f8f7f3]">
    <JsonLd data={schema}/>
    <section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><p className="page-kicker mb-3">Awarding institutions</p><h1 className="page-title">Universities in Nepal</h1><p className="page-lede mt-4 max-w-3xl">Start with the institution that awards the degree, then compare its programme rules, affiliated colleges, entrance exams and official updates.</p></div></section>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {error ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><h2 className="font-display text-lg font-bold">Universities could not load</h2><p className="mt-2 text-sm">This is a temporary data connection problem. Please try again shortly.</p></div> : universities.length ? <><p className="mb-5 text-sm text-gray-500"><strong className="text-ink">{universities.length}</strong> awarding institutions listed</p><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{universities.map(item => { const programmeCount = counts.get(item.id) || 0; const website = safeExternalUrl(item.website); return <article key={item.id} className="flex min-h-56 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-primary"><Building2 aria-hidden="true" className="h-5 w-5"/></div><span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">{item.short_name}</span></div><h2 className="mt-5 font-display text-xl font-bold text-ink"><Link href={`/universities/${item.slug}`} className="hover:text-primary">{item.name}</Link></h2><p className="mt-2 flex items-center gap-2 text-sm text-gray-500"><GraduationCap aria-hidden="true" className="h-4 w-4"/>{programmeCount ? `${programmeCount} verified programme variant${programmeCount === 1 ? '' : 's'}` : 'Programme variants are being documented'}</p><div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4"><Link href={`/universities/${item.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary">View university <ArrowRight aria-hidden="true" className="h-4 w-4"/></Link>{website && <a href={website} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} official website`} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-primary"><ExternalLink aria-hidden="true" className="h-4 w-4"/></a>}</div></article>})}</div></> : <div className="rounded-xl border border-gray-200 bg-white p-10 text-center"><Building2 aria-hidden="true" className="mx-auto h-9 w-9 text-gray-300"/><h2 className="mt-3 font-display text-xl font-bold text-ink">University profiles are being prepared</h2><p className="mt-2 text-sm text-gray-500">No public university records are available yet.</p></div>}
    </div>
  </main>
}
