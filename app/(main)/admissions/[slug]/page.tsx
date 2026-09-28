import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarPlus, CheckCircle2, ExternalLink, FileCheck2, Mail, Phone, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import AdmissionStatusBadge from '@/components/admissions/AdmissionStatusBadge'
import AddToPlannerButton from '@/components/admissions/AddToPlannerButton'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import ApplyNowButton from '@/components/colleges/ApplyNowButton'
import EvidenceChip from '@/components/design-system/EvidenceChip'
import Card from '@/components/design-system/Card'
import Pill from '@/components/design-system/Pill'
import { admissionState } from '@/lib/admissions'
import type { Admission } from '@/types'
import ShareButton from '@/components/ui/ShareButton'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type AdmissionWithHistory = Admission & { deadline_history: { id: string; previous_deadline: string | null; new_deadline: string | null; changed_at: string }[] }
async function getAdmission(slug: string) {
  const db = createServerSupabaseClient()
  const { data } = await db.from('admissions').select('*, college:colleges(id,name,slug,location)').eq('slug', slug).eq('status', 'published').single()
  if (!data) return null
  const { data: history } = await db.from('admission_deadline_history').select('id,previous_deadline,new_deadline,changed_at').eq('admission_id', data.id).order('changed_at', { ascending: false }).limit(10)
  return { ...data, deadline_history: history || [] } as AdmissionWithHistory
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const item = await getAdmission(params.slug)
  if (!item) return { title: 'Admission not found' }
  return { title: `${item.title} – Eligibility and Deadline`, description: item.summary || `Admission details, eligibility and deadline for ${item.institution_name}.`, alternates: { canonical: `/admissions/${item.slug}` } }
}

function date(value: string | null) { return value ? new Date(value).toLocaleString('en-NP', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not announced' }

export default async function AdmissionPage({ params }: { params: { slug: string } }) {
  const item = await getAdmission(params.slug); if (!item) notFound()
  const status = admissionState(item)
  const closed = status === 'closed'
  const upcoming = status === 'upcoming'
  const sourceBacked = Boolean(item.last_verified_at)
  const pageUrl = absoluteUrl(`/admissions/${item.slug}`)
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'EducationEvent', '@id': `${pageUrl}#admission`, name: item.title, description: item.summary || item.details || undefined, startDate: item.application_open_at || undefined, endDate: item.application_deadline || undefined, eventStatus: closed ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled', organizer: { '@type': 'EducationalOrganization', name: item.institution_name, url: item.application_url || item.source_url }, url: pageUrl, mainEntityOfPage: { '@id': `${pageUrl}#webpage` } },
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: item.title, datePublished: item.published_at || item.created_at, dateModified: item.updated_at, mainEntity: { '@id': `${pageUrl}#admission` }, citation: item.source_url, isPartOf: { '@id': `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Admissions', path: '/admissions' }, { name: item.title, path: `/admissions/${item.slug}` }]),
  ] }
  return (
    <div className="min-h-screen bg-sn-ground">
      <JsonLd data={jsonLd} />
      <section className="bg-sn-ink text-white">
        <div className="mx-auto max-w-sn px-5 py-10 sm:px-8 lg:px-12">
          <nav className="mb-6 text-xs text-white/70"><Link href="/admissions" className="hover:text-white">Admissions</Link> <span className="mx-2">/</span> {item.institution_name}</nav>
          <div className="flex flex-wrap items-center gap-2">
            <AdmissionStatusBadge admission={item} />
            <VerificationBadge status={item.verification_status} />
            {item.is_sponsored && <Pill tone="confirm">{item.sponsor_label || 'Sponsored placement'}</Pill>}
          </div>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-white/70">{item.admission_type} admission</p>
              <h1 className="mt-2 max-w-4xl font-baloo text-3xl font-extrabold leading-tight sm:text-4xl">{item.title}</h1>
              <p className="mt-4 text-lg font-bold font-nunito text-white/90">{item.institution_name}</p>
            </div>
            <ShareButton title={`${item.title} | SikshyaNepal`} />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-sn gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_320px] lg:gap-10 lg:px-12">
        <main className="space-y-6">
          <Card>
            <h2 className="font-baloo text-xl font-bold text-sn-ink">Admission overview</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 font-nunito text-sn-ink-soft">{item.details || item.summary || 'Additional details have not been published.'}</p>
            {item.programs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold font-nunito text-sn-ink">Available programs</h3>
                <div className="mt-3 flex flex-wrap gap-2">{item.programs.map((p) => <Pill key={p} tone="primary">{p}</Pill>)}</div>
              </div>
            )}
          </Card>

          {item.eligibility && (
            <Card>
              <h2 className="flex items-center gap-2 font-baloo text-xl font-bold text-sn-ink"><CheckCircle2 className="h-5 w-5 text-sn-verified" />Eligibility</h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-7 font-nunito text-sn-ink-soft">{item.eligibility}</p>
            </Card>
          )}

          {item.required_documents.length > 0 && (
            <Card>
              <h2 className="flex items-center gap-2 font-baloo text-xl font-bold text-sn-ink"><FileCheck2 className="h-5 w-5 text-sn-primary" />Documents required</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">{item.required_documents.map((doc) => <li key={doc} className="flex items-start gap-2 rounded-sn-control bg-sn-surface-alt p-3 text-sm font-nunito text-sn-ink-soft"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-sn-verified" />{doc}</li>)}</ul>
            </Card>
          )}

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-baloo text-xl font-bold text-sn-ink">Verification and source</h2><p className="mt-1 text-sm font-nunito text-sn-ink-muted">Always confirm critical dates on the original notice.</p></div>
              <VerificationBadge status={item.verification_status} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-sn-border pt-4">
              {sourceBacked ? (
                <EvidenceChip state="verified" source={item.source_name} checkedDate={item.last_verified_at!} />
              ) : (
                <EvidenceChip state="limited" label="Check-date not recorded yet" />
              )}
              {item.source_url && (
                <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">
                  View original announcement <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </Card>

          {item.deadline_history.length > 0 && (
            <Card>
              <h2 className="font-baloo text-xl font-bold text-sn-ink">Deadline change history</h2>
              <p className="mt-1 text-sm font-nunito text-sn-ink-muted">Dates were updated from the original source. The newest change appears first.</p>
              <ol className="mt-5 space-y-3">{item.deadline_history.map(change => <li key={change.id} className="rounded-sn-control bg-sn-confirm-bg p-4 text-sm font-nunito text-sn-confirm-ink"><p className="font-bold">{date(change.previous_deadline)} → {date(change.new_deadline)}</p><p className="mt-1 text-xs">Updated {date(change.changed_at)}</p></li>)}</ol>
            </Card>
          )}
        </main>

        <aside className="space-y-5">
          <Card>
            <h2 className="font-bold font-nunito text-sn-ink">Important dates</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className="text-xs font-nunito text-sn-ink-muted">Applications open</dt><dd className="mt-1 font-bold font-nunito text-sn-ink">{date(item.application_open_at)}</dd></div>
              <div><dt className="text-xs font-nunito text-sn-ink-muted">Application deadline</dt><dd className="mt-1 font-bold font-nunito text-sn-ink">{date(item.application_deadline)}</dd></div>
              {item.entrance_exam_at && <div><dt className="text-xs font-nunito text-sn-ink-muted">Entrance examination</dt><dd className="mt-1 font-bold font-nunito text-sn-ink">{date(item.entrance_exam_at)}</dd></div>}
            </dl>
            <div className="mt-3">
              {sourceBacked ? (
                <EvidenceChip state="verified" source={item.source_name} checkedDate={item.last_verified_at!} />
              ) : (
                <EvidenceChip state="confirm" label="Confirm dates with the institution" />
              )}
            </div>
            {item.application_deadline && <a href={`/api/admissions/${item.id}/calendar`} className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-sn-control border border-sn-border-strong px-4 text-sm font-bold font-nunito text-sn-ink hover:border-sn-primary hover:text-sn-primary transition-colors motion-control"><CalendarPlus className="h-4 w-4 text-sn-primary" />Add deadline to calendar</a>}
          </Card>

          <Card>
            <h2 className="font-bold font-nunito text-sn-ink">Application</h2>
            {item.application_fee != null && <p className="mt-3 text-sm font-nunito text-sn-ink-soft">Application fee <strong className="text-sn-ink">NPR {item.application_fee.toLocaleString()}</strong></p>}
            {item.available_seats != null && <p className="mt-2 text-sm font-nunito text-sn-ink-soft">Available seats <strong className="text-sn-ink">{item.available_seats}</strong></p>}
            {(item.application_fee != null || item.available_seats != null) && (
              <div className="mt-2">
                {sourceBacked ? (
                  <EvidenceChip state="verified" source={item.source_name} checkedDate={item.last_verified_at!} />
                ) : (
                  <EvidenceChip state="confirm" label="Confirm amount with the institution" />
                )}
              </div>
            )}
            {closed ? (
              <div className="mt-4 rounded-sn-control bg-sn-surface-alt p-3 text-center text-sm font-bold font-nunito text-sn-ink-muted">This deadline has passed</div>
            ) : upcoming ? (
              <div className="mt-4 rounded-sn-control bg-sn-primary-bg p-3 text-center text-sm font-bold font-nunito text-sn-primary-hover">Applications open {date(item.application_open_at)}. Save or share this page so you can return on time.</div>
            ) : (
              <>
                <AddToPlannerButton admissionId={item.id} />
                {item.college_id ? (
                  <ApplyNowButton collegeName={item.institution_name} collegeId={item.college_id} isSponsored={item.is_sponsored} programs={(item.programs.length ? item.programs : ['Not sure yet']).map((name) => ({ name }))} />
                ) : item.application_url ? (
                  <a href={item.application_url} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-sn-control bg-sn-primary px-4 py-3 text-sm font-bold font-nunito text-white shadow-sn-button hover:bg-sn-primary-hover motion-control">Apply on official website <ExternalLink className="h-4 w-4" /></a>
                ) : (
                  <p className="mt-3 text-sm font-nunito text-sn-ink-soft">Contact the institution using the details below.</p>
                )}
              </>
            )}
            {item.contact_phone && <a href={`tel:${item.contact_phone}`} className="mt-3 flex items-center gap-2 text-sm font-bold font-nunito text-sn-ink-soft hover:text-sn-primary transition-colors"><Phone className="h-4 w-4 text-sn-primary" />{item.contact_phone}</a>}
            {item.contact_email && <a href={`mailto:${item.contact_email}`} className="mt-2 flex items-center gap-2 text-sm font-bold font-nunito text-sn-ink-soft hover:text-sn-primary transition-colors"><Mail className="h-4 w-4 text-sn-primary" />{item.contact_email}</a>}
          </Card>

          <div className="rounded-sn-card border border-sn-primary/20 bg-sn-primary-bg p-5 text-sm font-nunito text-sn-primary-hover">
            <ShieldCheck className="mb-2 h-5 w-5" />
            <strong>Student safety:</strong>
            <p className="mt-1 leading-6">Pay fees only through official institution channels. SikshyaNepal never asks you to transfer admission fees to personal accounts.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
