import { ExternalLink, ShieldCheck } from 'lucide-react'
import { safeExternalUrl } from '@/lib/college-display'
import EvidenceChip from '@/components/design-system/EvidenceChip'

export type CollegeEvidence = { id:string; field_key:string; claim_summary:string; source_name:string; source_url:string; checked_at:string; confidence_score:number; verification_status:string }

const fieldLabel:Record<string,string>={affiliation:'Affiliation',programs:'Programmes',fee:'Fees',admission_deadline:'Admission deadline',scholarship:'Scholarship',result:'Result',facilities:'Facilities',contact:'Contact'}

function publicClaim(claim:string){
  return claim
    .replace(/^Dataset records:\s*/i,'')
    .replace(/\s*Confirm per programme before publishing\.?/i,' Confirm the current programme availability with the college.')
    .trim()
}

// Every row here is pre-filtered to source_verified/editor_verified in the
// query (see app/(main)/colleges/[slug]/page.tsx), so it always renders the
// Verified evidence-chip state — never a bare claim.
export default function CollegeEvidenceLedger({items}:{items:CollegeEvidence[]}){
  if(!items.length)return null
  return (
    <section className="rounded-sn-card border border-sn-border bg-sn-surface p-5 sm:p-6" aria-labelledby="evidence-heading">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sn-verified" aria-hidden="true" />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-sn-primary-hover">Source-linked details</p>
          <h2 id="evidence-heading" className="mt-1 font-baloo text-xl font-bold text-sn-ink">What the available sources say</h2>
          <p className="mt-1 text-sm leading-6 font-nunito text-sn-ink-soft">Use the official source for changing details such as intakes, fees and deadlines.</p>
        </div>
      </div>
      <div className="mt-5 divide-y divide-sn-border">
        {items.map(item => {
          const sourceUrl = safeExternalUrl(item.source_url)
          return (
            <article key={item.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-xl">
                  <p className="text-xs font-bold uppercase tracking-wide font-nunito text-sn-ink-muted">{fieldLabel[item.field_key] || item.field_key}</p>
                  <p className="mt-1 text-sm leading-6 font-nunito text-sn-ink">{publicClaim(item.claim_summary)}</p>
                  <div className="mt-2"><EvidenceChip state="verified" source={item.source_name || 'Official source'} checkedDate={item.checked_at} /></div>
                </div>
                {sourceUrl && (
                  <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sn-primary">
                    Open official source<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
