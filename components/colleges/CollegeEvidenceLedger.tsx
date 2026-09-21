import { ExternalLink, ShieldCheck } from 'lucide-react'
import { safeExternalUrl } from '@/lib/college-display'

export type CollegeEvidence = { id:string; field_key:string; claim_summary:string; source_name:string; source_url:string; checked_at:string; confidence_score:number; verification_status:string }

const fieldLabel:Record<string,string>={affiliation:'Affiliation',programs:'Programmes',fee:'Fees',admission_deadline:'Admission deadline',scholarship:'Scholarship',result:'Result',facilities:'Facilities',contact:'Contact'}

function publicClaim(claim:string){
  return claim
    .replace(/^Dataset records:\s*/i,'')
    .replace(/\s*Confirm per programme before publishing\.?/i,' Confirm the current programme availability with the college.')
    .trim()
}

function sourceDate(value:string){
  const date=new Date(value)
  return Number.isNaN(date.getTime())?null:date.toLocaleDateString('en-NP',{day:'numeric',month:'short',year:'numeric'})
}

export default function CollegeEvidenceLedger({items}:{items:CollegeEvidence[]}){
  if(!items.length)return null
  return <section className="border-y border-border py-6" aria-labelledby="evidence-heading"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true"/><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Source-linked details</p><h2 id="evidence-heading" className="mt-1 font-display text-xl font-bold text-ink">What the available sources say</h2><p className="mt-1 text-sm leading-6 text-ink-secondary">Use the official source for changing details such as intakes, fees and deadlines.</p></div></div><div className="mt-5 divide-y divide-[#e6e4df]">{items.map(item=>{const sourceUrl=safeExternalUrl(item.source_url),checked=sourceDate(item.checked_at);return <article key={item.id} className="py-4 first:pt-0 last:pb-0"><div className="flex flex-wrap items-start justify-between gap-3"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-wide text-ink-secondary">{fieldLabel[item.field_key]||item.field_key}</p><p className="mt-1 text-sm leading-6 text-ink">{publicClaim(item.claim_summary)}</p>{checked&&<p className="mt-2 text-xs text-ink-secondary">Source checked {checked}</p>}</div>{sourceUrl&&<a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Open official source<ExternalLink className="h-3.5 w-3.5" aria-hidden="true"/></a>}</div></article>})}</div></section>
}
