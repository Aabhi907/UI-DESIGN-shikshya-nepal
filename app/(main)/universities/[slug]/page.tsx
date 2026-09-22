import type { Metadata } from 'next'
import { cache } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, Building2, CalendarClock, ExternalLink, FileText, GraduationCap } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { safeExternalUrl } from '@/lib/college-display'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'
import type { EntranceExam, Notice, Program, Result, University, UniversityProgramOffering } from '@/types'

export const dynamic = 'force-dynamic'

type Offering = UniversityProgramOffering & { program?: Program | null }
type LinkedCollege = { id: string; name: string; slug: string; location: string | null }

const getUniversity = cache(async (slug: string) => {
  const db = createServerSupabaseClient()
  const { data: university } = await db.from('universities').select('*').eq('slug', slug).single()
  if (!university) return null
  const [{ data: offerings }, { data: entranceExams }, { data: results }, { data: notices }] = await Promise.all([
    db.from('university_program_offerings').select('*, program:programs(*)').eq('university_id', university.id).eq('status', 'published').order('updated_at', { ascending: false }),
    db.from('entrance_exams').select('*').eq('university_id', university.id).eq('status', 'published').order('application_deadline', { ascending: true, nullsFirst: false }).limit(6),
    db.from('results').select('*').eq('university_id', university.id).order('published_date', { ascending: false }).limit(6),
    db.from('notices').select('*').eq('university_id', university.id).order('published_date', { ascending: false }).limit(6),
  ])
  const typedOfferings = (offerings || []) as Offering[]
  const offeringIds = typedOfferings.map(item => item.id)
  const { data: collegeLinks } = offeringIds.length
    ? await db.from('college_programs').select('college:colleges!inner(id,name,slug,location,status)').in('university_program_offering_id', offeringIds).eq('college.status', 'active')
    : { data: [] }
  const collegeMap = new Map<string, LinkedCollege>()
  for (const row of collegeLinks || []) {
    const college = row.college as unknown as LinkedCollege | null
    if (college) collegeMap.set(college.id, college)
  }
  return { university: university as University, offerings: typedOfferings, colleges: Array.from(collegeMap.values()), entranceExams: (entranceExams || []) as EntranceExam[], results: (results || []) as Result[], notices: (notices || []) as Notice[] }
})

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getUniversity(params.slug)
  if (!data) return { title: 'University Not Found' }
  const description = `Explore ${data.university.name} programs, linked colleges, entrance exams, results, notices and official sources in Nepal.`
  return { title: `${data.university.name}: Programs, Colleges, Results and Notices`, description, alternates: { canonical: `/universities/${data.university.slug}` }, openGraph: { title: data.university.name, description, url: `/universities/${data.university.slug}`, type: 'website' } }
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function UniversityPage({ params }: { params: { slug: string } }) {
  const data = await getUniversity(params.slug)
  if (!data) notFound()
  const { university, offerings, colleges, entranceExams, results, notices } = data
  const website = safeExternalUrl(university.website)
  const pageUrl = absoluteUrl(`/universities/${university.slug}`)
  const schema = { '@context': 'https://schema.org', '@graph': [{ '@type': 'CollegeOrUniversity', '@id': `${pageUrl}#university`, name: university.name, alternateName: university.short_name, url: website || pageUrl, sameAs: website || undefined }, { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: university.name, mainEntity: { '@id': `${pageUrl}#university` } }, breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Universities', path: '/universities' }, { name: university.name, path: `/universities/${university.slug}` }])] }

  return <main className="min-h-screen bg-[#f8f7f3]">
    <JsonLd data={schema}/>
    <section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><Link href="/universities" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary"><ArrowLeft aria-hidden="true" className="h-4 w-4"/>All universities</Link><div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-3"><span className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-primary">{university.short_name}</span><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Awarding institution</p></div><h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">{university.name}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">Review source-backed programme rules and linked institutions before choosing where to apply.</p></div>{website && <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-bold text-ink hover:border-primary hover:text-primary">Official website <ExternalLink aria-hidden="true" className="h-4 w-4"/></a>}</div></div></section>
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="University coverage"><Stat icon={<GraduationCap aria-hidden="true" className="h-5 w-5"/>} value={offerings.length} label="verified programme variants"/><Stat icon={<Building2 aria-hidden="true" className="h-5 w-5"/>} value={colleges.length} label="exactly linked colleges"/><Stat icon={<CalendarClock aria-hidden="true" className="h-5 w-5"/>} value={entranceExams.length} label="published entrance exams"/><Stat icon={<FileText aria-hidden="true" className="h-5 w-5"/>} value={results.length + notices.length} label="recent results and notices"/></section>

      <section className="rounded-xl border border-gray-200 bg-white p-6"><div className="flex items-center gap-2"><BookOpen aria-hidden="true" className="h-5 w-5 text-primary"/><h2 className="font-display text-xl font-bold text-ink">Programmes</h2></div>{offerings.length ? <div className="mt-5 divide-y divide-gray-100">{offerings.map(item => <article key={item.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"><div>{item.program?.slug ? <Link href={`/programs/${item.program.slug}`} className="font-bold text-ink hover:text-primary">{item.display_name || item.program.name}</Link> : <h3 className="font-bold text-ink">{item.display_name || item.program?.name || 'Programme'}</h3>}<p className="mt-1 text-sm text-gray-500">{item.duration}{item.program?.faculty ? ` · ${item.program.faculty}` : ''}</p></div><div className="flex flex-wrap items-center gap-3"><span className="text-xs text-gray-500">Checked {formatDate(item.last_verified_at)}</span><a href={item.official_program_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary">Source <ExternalLink aria-hidden="true" className="h-3.5 w-3.5"/></a></div></article>)}</div> : <EmptyState title="Programme details are being documented" body="No source-backed university programme variants have been published yet. Use the official university website for current information."/>}</section>

      <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-xl border border-gray-200 bg-white p-6"><h2 className="font-display text-xl font-bold text-ink">Linked colleges</h2><p className="mt-2 text-sm text-gray-500">Only colleges matched to an exact university programme variant appear here.</p>{colleges.length ? <div className="mt-4 divide-y divide-gray-100">{colleges.map(item => <Link key={item.id} href={`/colleges/${item.slug}`} className="block py-3 first:pt-0 last:pb-0"><strong className="text-sm text-ink hover:text-primary">{item.name}</strong>{item.location && <span className="mt-1 block text-xs text-gray-500">{item.location}</span>}</Link>)}</div> : <EmptyState title="No colleges are linked yet" body="College affiliations must be matched programme by programme before they appear here."/>}</section><section className="rounded-xl border border-gray-200 bg-white p-6"><h2 className="font-display text-xl font-bold text-ink">Entrance exams</h2>{entranceExams.length ? <div className="mt-4 divide-y divide-gray-100">{entranceExams.map(item => <Link key={item.id} href={`/entrance-exams?q=${encodeURIComponent(item.title)}`} className="block py-3 first:pt-0 last:pb-0"><strong className="text-sm text-ink hover:text-primary">{item.title}</strong><span className="mt-1 block text-xs text-gray-500">{item.application_deadline ? `Deadline: ${formatDate(item.application_deadline)}` : 'Open the exam listing for the current deadline'}</span></Link>)}</div> : <EmptyState title="No current entrance exam listed" body="This section will show source-backed exam cycles when they are published."/>}</section></div>

      <div className="grid gap-6 lg:grid-cols-2"><UpdateList title="Recent results" items={results.map(item => ({ id: item.id, title: item.title, href: `/results/${item.slug}`, date: item.published_date }))} empty="No results are linked to this university yet."/><UpdateList title="Recent notices" items={notices.map(item => ({ id: item.id, title: item.title, href: `/notices/${item.slug}`, date: item.published_date }))} empty="No notices are linked to this university yet."/></div>
    </div>
  </main>
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) { return <div className="rounded-xl border border-gray-200 bg-white p-4"><div className="text-primary">{icon}</div><p className="mt-3 font-display text-2xl font-bold text-ink">{value}</p><p className="mt-1 text-xs leading-5 text-gray-500">{label}</p></div> }
function EmptyState({ title, body }: { title: string; body: string }) { return <div className="mt-5 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5"><h3 className="text-sm font-bold text-ink">{title}</h3><p className="mt-1 text-xs leading-5 text-gray-500">{body}</p></div> }
function UpdateList({ title, items, empty }: { title: string; items: { id: string; title: string; href: string; date: string | null }[]; empty: string }) { return <section className="rounded-xl border border-gray-200 bg-white p-6"><h2 className="font-display text-xl font-bold text-ink">{title}</h2>{items.length ? <div className="mt-4 divide-y divide-gray-100">{items.map(item => { const date = formatDate(item.date); return <Link key={item.id} href={item.href} className="block py-3 first:pt-0 last:pb-0"><strong className="text-sm text-ink hover:text-primary">{item.title}</strong>{date && <span className="mt-1 block text-xs text-gray-500">{date}</span>}</Link> })}</div> : <EmptyState title={empty} body="New source-linked updates will appear here when available."/>}</section> }
