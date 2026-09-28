import Link from 'next/link'
import { ArrowRight, Building2, CalendarDays, MapPin } from 'lucide-react'
import AdmissionStatusBadge from './AdmissionStatusBadge'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import EvidenceChip from '@/components/design-system/EvidenceChip'
import Pill from '@/components/design-system/Pill'
import { admissionLocation } from '@/lib/admissions'
import type { Admission } from '@/types'

export default function AdmissionCard({ admission }: { admission: Admission }) {
  const location = admissionLocation(admission)
  return <Link href={`/admissions/${admission.slug}`} aria-label={`View ${admission.title} admission details`} className="group flex h-full flex-col overflow-hidden rounded-sn-card border border-sn-border bg-sn-surface p-5 shadow-sn-card motion-interactive-card hover:shadow-sn-float">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><AdmissionStatusBadge admission={admission} />{admission.is_sponsored ? <Pill tone="confirm">{admission.sponsor_label || 'Sponsored'}</Pill> : <VerificationBadge status={admission.verification_status} compact />}</div>
    <p className="mb-2 text-xs font-bold font-nunito uppercase tracking-wide text-sn-primary-hover">{admission.admission_type.replaceAll('_', ' ')} admission</p>
    <h2 className="font-baloo text-lg font-bold leading-6 text-sn-ink transition-colors group-hover:text-sn-primary">{admission.title}</h2>
    <p className="mt-2 flex items-center gap-1.5 text-sm font-bold font-nunito text-sn-ink-soft"><Building2 className="h-4 w-4 text-sn-ink-muted" aria-hidden="true" />{admission.institution_name}</p>
    {location && <p className="mt-2 flex items-center gap-1.5 text-xs font-nunito text-sn-ink-muted"><MapPin className="h-3.5 w-3.5 text-sn-ink-muted" aria-hidden="true" />{location}</p>}
    {admission.summary && <p className="mt-4 line-clamp-3 text-sm leading-6 font-nunito text-sn-ink-soft">{admission.summary}</p>}
    {admission.programs.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{admission.programs.slice(0, 3).map((program) => <span key={program} className="rounded-sn-pill bg-sn-surface-alt px-2 py-1 text-[11px] font-nunito font-medium text-sn-ink-soft">{program}</span>)}{admission.programs.length > 3 && <span className="px-1 py-1 text-[11px] font-nunito text-sn-ink-muted">+{admission.programs.length - 3}</span>}</div>}
    <div className="mt-auto space-y-2 border-t border-sn-border pt-4">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-1 font-nunito text-sn-ink-soft"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{admission.application_deadline ? new Date(admission.application_deadline).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : 'See official notice'}</span>
        <span className="flex shrink-0 items-center gap-1 font-bold font-nunito text-sn-primary">View details <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" /></span>
      </div>
      {admission.application_deadline && (
        admission.last_verified_at ? (
          <EvidenceChip state="verified" source={admission.source_name} checkedDate={admission.last_verified_at} />
        ) : (
          <EvidenceChip state="confirm" label="Confirm date with the institution" />
        )
      )}
    </div>
  </Link>
}
