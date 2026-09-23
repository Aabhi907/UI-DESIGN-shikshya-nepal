import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { BookOpen, Clock, ArrowLeft, Building2, BadgeCheck, BriefcaseBusiness, CircleDollarSign, ExternalLink, GraduationCap } from 'lucide-react'
import Pill from '@/components/design-system/Pill'
import Card from '@/components/design-system/Card'
import IconTile from '@/components/design-system/IconTile'
import EvidenceChip from '@/components/design-system/EvidenceChip'
import type { Program, CollegeProgram, Admission, Scholarship } from '@/types'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'
import { cache } from 'react'
import { collegeDisplayAffiliation, collegeDisplayLocation, safeExternalUrl } from '@/lib/college-display'

export const revalidate = 0

function metaDescription(program: Program) {
  const fallback = `Explore eligibility, fees, colleges, scholarships and admissions for ${program.name} in Nepal.`
  const text = (program.overview || fallback).replace(/\s+/g, ' ').trim()
  return text.length > 157 ? `${text.slice(0, 154).trimEnd()}...` : text
}

function conciseAnswer(value: string, limit = 420) {
  const text = value.replace(/\s+/g, ' ').trim()
  if (text.length <= limit) return text
  const shortened = text.slice(0, limit)
  const sentenceEnd = shortened.lastIndexOf('. ')
  if (sentenceEnd > limit * 0.55) return shortened.slice(0, sentenceEnd + 1)
  const wordEnd = shortened.lastIndexOf(' ')
  return `${shortened.slice(0, wordEnd > 0 ? wordEnd : limit).trimEnd()}...`
}

function sourceLabel(url: string | null): string {
  if (!url) return 'Official source'
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return 'Official source' }
}

const getProgram = cache(async function getProgram(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data: program } = await supabase.from('programs').select('*').eq('slug', slug).single()
  if (!program) return null

  const { data: colleges } = await supabase
    .from('college_programs')
    .select('*, college:colleges(*)')
    .eq('program_id', program.id)
    .limit(20)

  const visibleColleges = ((colleges || []) as CollegeProgram[]).filter(item => item.college && (item.college.status === 'active' || item.college.status == null))
  const collegeIds = visibleColleges.map(item => item.college_id)
  const today = new Date().toISOString()
  const [{ data: admissions }, { data: scholarships }] = await Promise.all([
    supabase.from('admissions').select('id,title,slug,institution_name,application_deadline,status,programs').eq('status','published').contains('programs',[program.name]).or(`application_deadline.is.null,application_deadline.gte.${today}`).order('application_deadline',{ascending:true,nullsFirst:false}).limit(8),
    collegeIds.length ? supabase.from('scholarships').select('*,college:colleges(id,name,slug)').in('college_id',collegeIds).eq('is_active',true).or(`deadline.is.null,deadline.gte.${today}`).order('deadline',{ascending:true,nullsFirst:false}).limit(8) : Promise.resolve({ data: [] }),
  ])

  return { program: program as Program, colleges: visibleColleges, admissions: (admissions || []) as Admission[], scholarships: (scholarships || []) as Scholarship[] }
})

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProgram(params.slug)
  if (!data) return { title: 'Program Not Found' }
  const description = metaDescription(data.program)
  return {
    title: `${data.program.name} in Nepal: Eligibility, Fees and Colleges`,
    description,
    alternates: { canonical: `/programs/${data.program.slug}` },
    openGraph: { title: `${data.program.name} in Nepal | SikshyaNepal`, description, url: `/programs/${data.program.slug}`, type: 'website' },
    twitter: { card: 'summary', title: `${data.program.name} in Nepal | SikshyaNepal`, description },
  }
}

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const data = await getProgram(params.slug)
  if (!data) notFound()

  const { program, colleges, admissions, scholarships } = data
  const sourceBacked = Boolean(program.source_url && program.last_verified_at)
  const durationLabel = sourceBacked ? program.duration : 'Confirm with university'
  const fees = colleges.map(item => item.fee).filter((fee): fee is number => fee != null)
  const feeMin = program.average_fee_min ?? (fees.length ? Math.min(...fees) : null)
  const feeMax = program.average_fee_max ?? (fees.length ? Math.max(...fees) : null)
  const feeAnswer = feeMin != null
    ? `The currently published fee range starts at NPR ${feeMin.toLocaleString()}${feeMax && feeMax !== feeMin ? ` and reaches NPR ${feeMax.toLocaleString()}` : ''}. Confirm whether a quoted amount is annual, semester-based or total.`
    : 'No reliable fee range is recorded yet. Ask each college whether its quote is annual, semester-based or the total programme cost.'
  const programAnswers = [
    { question: `What is ${program.name} in Nepal?`, answer: program.overview && sourceBacked ? conciseAnswer(program.overview) : sourceBacked ? `${program.name} is a ${program.degree_level} programme in the ${program.faculty} field. Its source-backed duration is ${program.duration}.` : `${program.name} is listed as a ${program.degree_level} programme in the ${program.faculty} field. Its duration and entry rules still need an original university or regulator source.` },
    { question: `Who is eligible for ${program.name}?`, answer: program.eligibility || 'Eligibility differs by university and intake. Confirm the required previous qualification, subjects, grades and entrance process in the current official admission notice.' },
    { question: `How much does ${program.name} cost in Nepal?`, answer: feeAnswer },
    { question: `Where can I study ${program.name} in Nepal?`, answer: colleges.length ? `SikshyaNepal currently links ${colleges.length} active college profile${colleges.length === 1 ? '' : 's'} offering this programme. Review the list below and confirm the current intake with each college.` : 'No active college profile is linked to this programme yet. Check again later or verify options with the relevant university.' },
  ]
  const pageUrl = absoluteUrl(`/programs/${program.slug}`)
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'EducationalOccupationalProgram', '@id': `${pageUrl}#program`, name: program.name, url: pageUrl, description: program.overview || undefined, educationalCredentialAwarded: program.degree_level, occupationalCategory: program.career_paths || [], provider: colleges.slice(0, 10).filter(item => item.college).map(item => ({ '@type': 'CollegeOrUniversity', name: item.college!.name, url: absoluteUrl(`/colleges/${item.college!.slug}`) })) },
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: `${program.name} in Nepal`, datePublished: program.created_at, dateModified: program.updated_at || program.last_verified_at || program.created_at, mainEntity: { '@id': `${pageUrl}#program` }, citation: program.source_url || undefined, isPartOf: { '@id': `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Programs', path: '/programs' }, { name: program.name, path: `/programs/${program.slug}` }]),
    { '@type': 'FAQPage', '@id': `${pageUrl}#questions`, mainEntity: programAnswers.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
  ] }

  return (
    <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
      <JsonLd data={jsonLd} />
      <Link href="/programs" className="mb-6 inline-flex items-center gap-2 text-sm font-bold font-nunito text-sn-ink-muted hover:text-sn-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Programs
      </Link>

      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <IconTile icon={BookOpen} tint="peach" size={56} />
          <div>
            <h1 className="font-baloo text-2xl font-bold text-sn-ink mb-2">{program.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="primary" className="capitalize">{program.degree_level}</Pill>
              <Pill tone="neutral">{program.faculty}</Pill>
              <span className="flex items-center gap-1 text-sm font-nunito text-sn-ink-muted">
                <Clock className="w-3.5 h-3.5" /> {durationLabel}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card tone="alt" className="mb-6" aria-labelledby="program-quick-answer">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Quick answer</p>
        <h2 id="program-quick-answer" className="mt-2 font-baloo text-lg font-bold text-sn-ink">What should I know about {program.name}?</h2>
        <p className="mt-3 text-sm leading-6 font-nunito text-sn-ink-soft">
          {sourceBacked ? `${program.name} is a ${program.degree_level} programme in ${program.faculty}, with a source-backed duration of ${program.duration}.` : `The programme name, level and linked colleges are listed here, but its duration and entry rules are awaiting an original university or regulator source.`} {colleges.length ? `${colleges.length} active college profile${colleges.length === 1 ? ' is' : 's are'} currently linked below.` : 'No active college profile is linked yet.'}
        </p>
        <div className="mt-3">
          {sourceBacked ? (
            <EvidenceChip state="verified" source={sourceLabel(safeExternalUrl(program.source_url))} checkedDate={program.last_verified_at!} />
          ) : (
            <EvidenceChip state="limited" label="Confirm changing details with the university or college" />
          )}
        </div>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <GraduationCap className="h-5 w-5 text-sn-primary" />
          <h2 className="mt-3 font-baloo font-bold text-sn-ink">Eligibility</h2>
          <p className="mt-2 text-sm leading-6 font-nunito text-sn-ink-soft">{program.eligibility || 'Confirm current eligibility with the awarding university or college.'}</p>
        </Card>
        <Card>
          <CircleDollarSign className="h-5 w-5 text-sn-verified" />
          <h2 className="mt-3 font-baloo font-bold text-sn-ink">Published fee range</h2>
          <p className="mt-2 text-sm font-nunito text-sn-ink-soft">{feeMin != null ? `NPR ${feeMin.toLocaleString()}${feeMax && feeMax !== feeMin ? ` – ${feeMax.toLocaleString()}` : ''}` : 'Fees vary by college.'}</p>
          {feeMin != null && (
            <div className="mt-2">
              {sourceBacked && program.average_fee_min != null ? (
                <EvidenceChip state="verified" source={sourceLabel(safeExternalUrl(program.source_url))} checkedDate={program.last_verified_at!} />
              ) : (
                <EvidenceChip state="confirm" label="Confirm whether annual, semester or total" />
              )}
            </div>
          )}
        </Card>
        <Card>
          <BadgeCheck className="h-5 w-5 text-sn-primary" />
          <h2 className="mt-3 font-baloo font-bold text-sn-ink">Entrance</h2>
          <p className="mt-2 text-sm leading-6 font-nunito text-sn-ink-soft">{program.entrance_requirements || 'Check the latest university admission notice.'}</p>
        </Card>
      </div>
      {program.overview && (
        <Card className="mb-6">
          <h2 className="font-baloo text-xl font-bold text-sn-ink">About {program.name}</h2>
          <p className="mt-3 whitespace-pre-line leading-7 font-nunito text-sn-ink-soft">{program.overview}</p>
        </Card>
      )}
      {(program.curriculum_highlights?.length || program.career_paths?.length) ? (
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {program.curriculum_highlights?.length ? (
            <Card>
              <h2 className="flex items-center gap-2 font-baloo text-lg font-bold text-sn-ink"><BookOpen className="h-5 w-5 text-sn-primary" />Curriculum highlights</h2>
              <ul className="mt-4 space-y-2 text-sm font-nunito text-sn-ink-soft">{program.curriculum_highlights.map(item => <li key={item}>• {item}</li>)}</ul>
            </Card>
          ) : null}
          {program.career_paths?.length ? (
            <Card>
              <h2 className="flex items-center gap-2 font-baloo text-lg font-bold text-sn-ink"><BriefcaseBusiness className="h-5 w-5 text-sn-verified" />Career paths</h2>
              <ul className="mt-4 space-y-2 text-sm font-nunito text-sn-ink-soft">{program.career_paths.map(item => <li key={item}>• {item}</li>)}</ul>
            </Card>
          ) : null}
        </div>
      ) : null}

      <Card>
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-sn-primary" />
          <h2 className="text-lg font-baloo font-bold text-sn-ink">
            Colleges offering {program.name}
          </h2>
          <Pill tone="neutral">{colleges.length}</Pill>
        </div>

        {colleges.length > 0 ? (
          <div className="space-y-3">
            {colleges.filter(cp => cp.college).map((cp) => {
              const feeSource = safeExternalUrl(cp.fee_source_url)
              const feeIsVerifiable = Boolean(feeSource) && Boolean(cp.fee_last_verified_at)
              return (
                <Link key={cp.college_id} href={`/colleges/${cp.college?.slug}`} className="group block">
                  <div className="flex flex-col gap-3 rounded-sn-control border border-sn-border bg-sn-surface-alt p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold font-nunito text-sn-ink group-hover:text-sn-primary transition-colors">
                        {cp.college?.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs font-nunito text-sn-ink-muted">{collegeDisplayLocation(cp.college!) || 'Location not listed'}</span>
                        {cp.college?.affiliation && (
                          <Pill tone="neutral">{collegeDisplayAffiliation(cp.college.affiliation)}</Pill>
                        )}
                        {cp.scholarship_available && <Pill tone="verified">Scholarship</Pill>}
                      </div>
                    </div>
                    {cp.fee != null && (
                      <div className="sm:text-right">
                        <p className="font-bold font-nunito text-sn-ink text-sm">NPR {cp.fee.toLocaleString()}</p>
                        {cp.seats != null && <p className="text-xs font-nunito text-sn-ink-muted">{cp.seats} seats</p>}
                        <div className="mt-1.5 sm:flex sm:justify-end">
                          {feeIsVerifiable ? (
                            <EvidenceChip state="verified" source={sourceLabel(feeSource)} checkedDate={cp.fee_last_verified_at!} />
                          ) : (
                            <EvidenceChip state="confirm" label="Confirm fee with the college" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-sn-control bg-sn-surface-alt p-5 text-sm font-nunito text-sn-ink-soft">
            <p>No active college profile is linked to this program yet.</p>
            <Link href={`/colleges?program=${program.slug}`} className="mt-3 inline-flex font-bold font-nunito text-sn-primary">Search the college directory →</Link>
          </div>
        )}
      </Card>
      {admissions.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-baloo text-lg font-bold text-sn-ink">Current admissions</h2>
          <div className="mt-4 space-y-3">{admissions.map(item => (
            <Link key={item.id} href={`/admissions/${item.slug}`} className="flex justify-between rounded-sn-control bg-sn-primary-bg p-4 text-sm font-nunito">
              <span><strong className="text-sn-ink">{item.title}</strong><span className="block text-sn-ink-muted">{item.institution_name}</span></span>
              <span className="font-bold text-sn-primary-hover">View →</span>
            </Link>
          ))}</div>
        </Card>
      )}
      {scholarships.length > 0 && (
        <Card className="mt-6">
          <h2 className="font-baloo text-lg font-bold text-sn-ink">Related scholarships</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">{scholarships.map(item => (
            <div key={item.id} className="rounded-sn-control border border-sn-border p-4">
              <p className="font-bold font-nunito text-sn-ink">{item.title}</p>
              <p className="mt-1 text-xs font-nunito text-sn-ink-muted">{item.college?.name}</p>
            </div>
          ))}</div>
        </Card>
      )}
      <Card className="mt-6" aria-labelledby="program-questions">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">Student questions</p>
        <h2 id="program-questions" className="mt-2 font-baloo text-lg font-bold text-sn-ink">Questions about {program.name}</h2>
        <div className="mt-5 divide-y divide-sn-border">{programAnswers.map(item => (
          <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
            <summary className="cursor-pointer list-none pr-8 text-sm font-bold font-nunito text-sn-ink marker:hidden">{item.question}<span className="float-right text-sn-primary group-open:rotate-45">+</span></summary>
            <p className="mt-3 max-w-2xl text-sm leading-6 font-nunito text-sn-ink-soft">{item.answer}</p>
          </details>
        ))}</div>
      </Card>
      <Card className="mt-6">
        <p className="font-bold font-nunito text-sn-ink">Source and freshness</p>
        <div className="mt-2">
          {sourceBacked ? (
            <EvidenceChip state="verified" source={sourceLabel(safeExternalUrl(program.source_url))} checkedDate={program.last_verified_at!} />
          ) : (
            <EvidenceChip state="limited" label="A last-checked date has not been recorded yet" />
          )}
        </div>
        <p className="mt-3 text-sm font-nunito text-sn-ink-soft">{program.source_url ? 'Confirm changing requirements on the linked original source.' : 'A primary source link has not been recorded; confirm all requirements with the university or college.'}</p>
        {program.source_url && <a href={program.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">Official program source <ExternalLink className="h-4 w-4" /></a>}
      </Card>
    </div>
  )
}
