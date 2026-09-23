import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Award, Calendar, CheckCircle2, ExternalLink, Search, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Input, Select } from '@/components/design-system/FormField'
import Button from '@/components/design-system/Button'
import type { Scholarship } from '@/types'
import EvidenceChip from '@/components/design-system/EvidenceChip'
import Card from '@/components/design-system/Card'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Scholarship Finder Nepal – Check Funding Options', description: 'Match scholarships in Nepal by study level, funding type and student eligibility, with official sources and verified deadlines.' }
const LEVELS = ['+2', 'Bachelor', 'Master', 'Diploma'] as const
const GROUPS: Record<string, string> = { merit: 'Merit-based', need_based: 'Financial need', female: 'Female students', disability: 'Students with disabilities', dalit: 'Dalit students', janajati: 'Janajati students', remote_area: 'Remote-area students' }
const cleanSearch = (value?: string) => (value || '').replace(/[,().%]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
const validUrl = (value?: string | null) => { if (!value) return null; try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null } catch { return null } }
// A date-only deadline (entered via <input type="date">) is stored as midnight
// UTC for that calendar day — verified directly against the database. Comparing
// against the exact current instant fails this check the moment "now" passes
// midnight on the deadline's own day, even though it should stay open all day.
// Compare against the start of today (UTC, matching how the bare date was
// stored) instead — this also naturally covers a same-day timestamp with a
// real time component, matching the day-granularity "Closes today" label below.
const startOfTodayIso = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.toISOString() }
const displayDate = (value: string) => new Intl.DateTimeFormat('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
const deadlineLabel = (value: string | null) => {
  if (!value || !Number.isFinite(new Date(value).getTime())) return { text: 'Deadline not announced', tone: 'text-sn-ink-soft', open: true }
  const deadline = new Date(value); const today = new Date(); deadline.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0)
  const days = Math.round((deadline.getTime() - today.getTime()) / 86400000)
  if (days < 0) return { text: `Closed ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`, tone: 'text-sn-ink-soft', open: false }
  if (days === 0) return { text: 'Closes today', tone: 'text-sn-confirm-ink', open: true }
  if (days === 1) return { text: 'Closes tomorrow', tone: 'text-sn-confirm-ink', open: true }
  return { text: `${days} days left`, tone: days <= 7 ? 'text-sn-confirm-ink' : 'text-sn-confirm-ink', open: true }
}
const freshness = (value?: string | null) => {
  if (!value || !Number.isFinite(new Date(value).getTime())) return { text: 'Not recently rechecked', fresh: false }
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000))
  return { text: days === 0 ? 'Checked today' : days === 1 ? 'Checked yesterday' : `Checked ${days} days ago`, fresh: days <= 30 }
}
type Params = { q?: string; level?: string; group?: string; status?: string; open?: string }

export default async function ScholarshipsPage({ searchParams }: { searchParams: Params }) {
  const db = createServerSupabaseClient()
  const q = cleanSearch(searchParams.q)
  const level = LEVELS.includes(searchParams.level as typeof LEVELS[number]) ? searchParams.level! : ''
  const group = searchParams.group && GROUPS[searchParams.group] ? searchParams.group : ''
  const status = searchParams.status === 'all' || searchParams.open === 'false' ? 'all' : 'open'
  let query = db.from('scholarships').select('*, college:colleges(name,slug,location)').eq('is_active', true).order('deadline', { ascending: true, nullsFirst: false }).limit(100)
  if (q) query = query.or(`title.ilike.%${q}%,provider_name.ilike.%${q}%,eligibility.ilike.%${q}%`)
  if (level) query = query.contains('education_levels', [level])
  if (group) query = query.contains('target_groups', [group])
  if (status === 'open') query = query.or(`deadline.gte.${startOfTodayIso()},deadline.is.null`)
  let { data, error } = await query
  let schemaLimited = false
  if (error?.code === '42703') {
    schemaLimited = true
    let fallback = db.from('scholarships').select('*, college:colleges(name,slug,location)').eq('is_active', true).order('deadline', { ascending: true, nullsFirst: false }).limit(100)
    if (q) fallback = fallback.ilike('title', `%${q}%`)
    if (status === 'open') fallback = fallback.or(`deadline.gte.${startOfTodayIso()},deadline.is.null`)
    const fallbackResult = await fallback
    data = fallbackResult.data
    error = fallbackResult.error
  }
  if (error) console.error('[scholarships:list]', { code: error.code, message: error.message })
  const items = ((schemaLimited && (level || group)) ? [] : (data || [])) as Scholarship[]
  const hasFilters = Boolean(q || level || group || status === 'all')

  return <main className="min-h-screen bg-sn-ground"><div className="mx-auto max-w-sn px-5 py-14 sm:px-8 lg:px-12 lg:py-24 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-sn-ink-soft">Scholarships</p><h1 className="mt-2 font-baloo text-4xl font-bold text-sn-ink">Scholarships in Nepal</h1><p className="mt-3 leading-7 text-sn-ink-soft">Filter by study level, eligibility and deadline. Confirm every requirement with the provider.</p></div>
    <form className="mt-7 grid gap-3 rounded-sn-card border border-sn-border bg-sn-surface p-4 shadow-sn-card md:grid-cols-4" role="search"><label><span className="mb-1.5 block text-xs font-bold text-sn-ink-soft">Keyword or provider</span><span className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-sn-ink-soft"/><Input name="q" defaultValue={q} maxLength={80} placeholder="Search scholarships" className="w-full rounded-sn-control border border-sn-border py-3 pl-9 pr-3 text-sm"/></span></label><label><span className="mb-1.5 block text-xs font-bold text-sn-ink-soft">Study level</span><Select name="level" defaultValue={level} className="h-11 w-full rounded-sn-control border border-sn-border bg-sn-surface px-3 text-sm"><option value="">Any study level</option>{LEVELS.map(x=><option key={x}>{x}</option>)}</Select></label><label><span className="mb-1.5 block text-xs font-bold text-sn-ink-soft">Eligibility</span><Select name="group" defaultValue={group} className="h-11 w-full rounded-sn-control border border-sn-border bg-sn-surface px-3 text-sm"><option value="">Any eligibility group</option>{Object.entries(GROUPS).map(([value,label])=><option value={value} key={value}>{label}</option>)}</Select></label><label><span className="mb-1.5 block text-xs font-bold text-sn-ink-soft">Deadline</span><Select name="status" defaultValue={status} className="h-11 w-full rounded-sn-control border border-sn-border bg-sn-surface px-3 text-sm"><option value="open">Open or date pending</option><option value="all">Include closed</option></Select></label><div className="flex flex-wrap items-center gap-3 md:col-span-4"><Button className="rounded-sn-control !bg-sn-ink hover:!bg-sn-ink px-5 py-3 text-sm font-bold text-white hover:bg-sn-ink">Show my matches</Button>{hasFilters&&<Link href="/scholarships" className="px-2 py-3 text-sm font-bold text-sn-primary-hover">Clear filters</Link>}<Link href="/my-path" className="ml-auto inline-flex min-h-11 items-center text-sm font-bold text-sn-ink-soft hover:text-sn-primary-hover">Use with My Path →</Link></div></form>
    {error&&<div role="alert" className="mt-6 flex gap-3 rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg p-4 text-sm text-sn-confirm-ink"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="font-bold">Scholarships could not be loaded</p><p className="mt-1">Your filters are safe. Refresh the page or try again shortly.</p></div></div>}
    {!error&&schemaLimited&&<div role="status" className="mt-6 flex gap-3 rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg p-4 text-sm text-sn-confirm-ink"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="font-bold">Scholarship matching is temporarily unavailable</p><p className="mt-1">Basic scholarship listings are still available. Check again later for matching tools.</p></div></div>}
    {!error&&<><div className="mt-8"><h2 className="font-baloo text-xl font-bold text-sn-ink">{hasFilters?'Matching opportunities':'Current opportunities'}</h2><p className="mt-1 text-sm text-sn-ink-soft">{items.length} scholarship{items.length===1?'':'s'} listed{status==='open'?' with an open or pending deadline':''}</p></div>
    {items.length?<div className="mt-4 grid gap-5 md:grid-cols-2">{items.map(s=>{const deadline=deadlineLabel(s.deadline);const checked=freshness(s.last_verified_at);const applicationUrl=validUrl(s.application_url);const sourceUrl=validUrl(s.source_url);const matchReasons=[level&&`Study level: ${level}`,group&&GROUPS[group]].filter(Boolean);return <Card as="article" key={s.id} className={`flex flex-col rounded-sn-card border bg-sn-surface p-5 shadow-sn-card ${deadline.open?'border-sn-border':'border-sn-border opacity-75'}`}><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold uppercase tracking-wide text-sn-ink-soft">{s.scholarship_type||'Scholarship'}</p>{!deadline.open&&<span className="rounded-sn-pill bg-sn-surface-alt px-2 py-0.5 text-[10px] font-bold uppercase text-sn-ink-soft">Closed</span>}</div><h3 className="mt-1 text-lg font-bold text-sn-ink">{s.title}</h3><p className="mt-1 text-sm text-sn-ink-soft">{s.provider_name||s.college?.name||'Provider not listed'}</p></div><Award className="h-6 w-6 shrink-0 text-sn-confirm-ink"/></div>{matchReasons.length>0&&<div className="mt-4 rounded-sn-control border border-sn-primary/20 bg-sn-primary-bg px-3 py-2 text-xs text-sn-ink-soft"><strong>Why this matched:</strong> {matchReasons.join(' · ')}</div>}{s.coverage&&<p className="mt-3 rounded-sn-control bg-sn-verified-bg px-3 py-2 text-sm font-semibold text-sn-ink-soft">{s.coverage}</p>}<div className="mt-4 flex flex-wrap gap-2">{(s.education_levels||[]).map(x=><span key={x} className="rounded-sn-pill bg-sn-primary-bg px-2.5 py-1 text-xs font-bold text-sn-ink-soft">{x}</span>)}{(s.target_groups||[]).slice(0,3).map(x=><span key={x} className="rounded-sn-pill bg-sn-surface-alt px-2.5 py-1 text-xs text-sn-ink-soft">{GROUPS[x]||x.replaceAll('_',' ')}</span>)}</div>{s.eligibility&&<p className="mt-4 line-clamp-3 text-sm leading-6 text-sn-ink-soft"><strong className="text-sn-ink">Who should check:</strong> {s.eligibility}</p>}<div className="mt-auto pt-5"><div className="mb-3">{sourceUrl && s.last_verified_at ? <EvidenceChip state="verified" className="!text-sn-ink-soft" source={s.source_name || s.provider_name || 'Linked source'} checkedDate={s.last_verified_at} /> : sourceUrl ? <EvidenceChip state="confirm" label="Confirm with provider" /> : <EvidenceChip state="limited" className="!text-sn-ink-soft" label="Source not recorded" />}</div><div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-sn-border pt-4 text-xs">{s.deadline?<span className={`flex items-center gap-1 font-bold ${deadline.tone}`}><Calendar className="h-3.5 w-3.5"/>{deadline.text} · {displayDate(s.deadline)}</span>:<span className="flex items-center gap-1 font-bold text-sn-ink-soft"><Calendar className="h-3.5 w-3.5"/>{deadline.text}</span>}<span className={`flex items-center gap-1 ${checked.fresh?'text-sn-ink-soft':'text-sn-confirm-ink'}`}><ShieldCheck className="h-3.5 w-3.5"/>{checked.text}</span></div><div className="mt-4 flex flex-wrap items-center gap-3">{applicationUrl?<a href={applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-sn-control bg-sn-ink px-3 py-2 text-xs font-bold text-white">Apply on official site <ExternalLink className="h-3.5 w-3.5"/></a>:<span className="rounded-sn-control bg-sn-surface-alt px-3 py-2 text-xs font-semibold text-sn-ink-soft">Application link not published</span>}{sourceUrl&&sourceUrl!==applicationUrl&&<a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-sn-primary-hover">Check source <CheckCircle2 className="h-3.5 w-3.5"/></a>}{s.college?.slug&&<Link href={`/colleges/${s.college.slug}`} className="text-xs font-bold text-sn-primary-hover">College profile →</Link>}</div></div></Card>})}</div>:<div className="mt-4 rounded-sn-card border border-sn-border bg-sn-surface py-16 text-center"><Award className="mx-auto h-10 w-10 text-sn-ink-soft"/><h3 className="mt-3 font-bold text-sn-ink">No matching scholarships</h3><p className="mx-auto mt-1 max-w-md text-sm text-sn-ink-soft">Try a broader study level or eligibility group. New opportunities only appear after their source has been reviewed.</p>{hasFilters&&<Link href="/scholarships" className="mt-5 inline-flex rounded-sn-control bg-sn-ink px-4 py-2.5 text-sm font-bold text-white">See all open scholarships</Link>}</div>}</>}
    <div className="mt-8 rounded-sn-card border border-sn-border bg-sn-surface p-5 text-sm leading-6 text-sn-ink-soft"><strong className="text-sn-ink">Before you apply:</strong> confirm the deadline, required documents, award coverage and whether fees are refundable on the provider’s official page. SikshyaNepal does not guarantee selection and should never ask you to pay to “secure” a scholarship.</div>
  </div></main>
}
