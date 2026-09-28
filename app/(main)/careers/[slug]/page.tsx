import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BadgeCheck, BookOpen, BriefcaseBusiness, CircleCheck, ExternalLink, GraduationCap, Wrench } from 'lucide-react'
import { careerBySlug, careers } from '@/lib/careers'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'
import Card from '@/components/design-system/Card'
import Pill from '@/components/design-system/Pill'
import EvidenceChip from '@/components/design-system/EvidenceChip'

export function generateStaticParams() { return careers.map((career) => ({ slug: career.slug })) }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata { const career = careerBySlug(params.slug); return career ? { title: `${career.title} Career Guide`, description: `${career.summary} Explore Nepal study routes, skills and official sources.` } : {} }

// The same fixed date this guide set's own JSON-LD dateModified already used —
// not a live per-record field, so it's shown as a plain editorial-check date
// rather than invented per-career provenance.
const GUIDE_CHECKED_DATE = '2026-09-06'

const List = ({ items }: { items: string[] }) => <ul className="mt-4 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-sm leading-6 font-nunito text-sn-ink-soft"><CircleCheck className="mt-1 h-4 w-4 shrink-0 text-sn-primary" />{item}</li>)}</ul>

export default function CareerDetailPage({ params }: { params: { slug: string } }) {
  const career = careerBySlug(params.slug)
  if (!career) notFound()
  const pageUrl = absoluteUrl(`/careers/${career.slug}`)
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Occupation', '@id': `${pageUrl}#occupation`, name: career.title, description: career.summary, occupationalCategory: career.category, skills: career.skills.join(', '), educationRequirements: career.studyRoutes.join('; ') },
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: `${career.title} career guide for Nepal`, dateModified: GUIDE_CHECKED_DATE, mainEntity: { '@id': `${pageUrl}#occupation` }, citation: career.sourceUrl, isPartOf: { '@id': `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Career Explorer', path: '/careers' }, { name: career.title, path: `/careers/${career.slug}` }]),
  ] }
  return (
    <main className="min-h-screen bg-sn-ground">
      <JsonLd data={schema} />
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12">
          <Link href="/careers" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold font-nunito text-sn-primary hover:underline motion-control"><ArrowLeft className="h-4 w-4 motion-arrow" />All career guides</Link>
          <p className="mt-7 text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">{career.category}</p>
          <h1 className="mt-3 font-baloo text-4xl font-extrabold text-sn-ink sm:text-5xl">{career.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 font-nunito text-sn-ink-soft">{career.summary}</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-sn gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.45fr_0.75fr] lg:px-12">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-sn-primary" />
              <h2 className="font-baloo text-2xl font-bold text-sn-ink">A practical study route</h2>
            </div>
            <List items={career.studyRoutes} />
            <div className="mt-5 rounded-sn-control bg-sn-surface-alt p-4 text-sm leading-6 font-nunito text-sn-ink-soft"><strong className="text-sn-ink">Eligibility:</strong> {career.eligibility}</div>
          </Card>
          <div className="grid gap-6 sm:grid-cols-2">
            <Card>
              <BookOpen className="h-5 w-5 text-sn-primary" />
              <h2 className="mt-3 font-baloo text-xl font-bold text-sn-ink">Likely entrance steps</h2>
              <List items={career.entrance} />
            </Card>
            <Card>
              <Wrench className="h-5 w-5 text-sn-primary" />
              <h2 className="mt-3 font-baloo text-xl font-bold text-sn-ink">Skills to build early</h2>
              <List items={career.skills} />
            </Card>
          </div>
          <Card>
            <BriefcaseBusiness className="h-5 w-5 text-sn-primary" />
            <h2 className="mt-3 font-baloo text-2xl font-bold text-sn-ink">Where this can lead</h2>
            <div className="mt-4 flex flex-wrap gap-2">{career.roles.map((role) => <Pill key={role} tone="primary">{role}</Pill>)}</div>
            <h3 className="mt-6 font-bold font-nunito text-sn-ink">Portfolio and experience ideas</h3>
            <List items={career.portfolioIdeas} />
          </Card>
        </div>
        <aside className="space-y-5">
          <Card tone="alt" className="!bg-sn-ink !text-white">
            <BadgeCheck className="h-6 w-6 text-white/70" aria-hidden="true" />
            <h2 className="mt-4 font-baloo text-2xl font-bold">Verify before you decide</h2>
            <p className="mt-2 text-sm leading-6 font-nunito text-white/80">This guide was editorially checked. Requirements can change—always confirm them with the official institution or professional body.</p>
            <div className="mt-4"><EvidenceChip state="verified" source={career.sourceName} checkedDate={GUIDE_CHECKED_DATE} className="!bg-white/10 !text-white" /></div>
            <a href={career.sourceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-1 rounded-sn-control bg-white px-3 py-2.5 text-sm font-bold font-nunito text-sn-ink hover:bg-white/90 transition-colors motion-control">{career.sourceName}<ExternalLink className="h-4 w-4" /></a>
          </Card>
          <Card>
            <h2 className="font-baloo text-xl font-bold text-sn-ink">Turn this into a plan</h2>
            <p className="mt-2 text-sm leading-6 font-nunito text-sn-ink-soft">Use My Path to choose a stage, track admission steps and keep your shortlist in one private place.</p>
            <Link href="/my-path" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold font-nunito text-sn-primary hover:underline motion-control">Open My Path →</Link>
          </Card>
        </aside>
      </div>
    </main>
  )
}
