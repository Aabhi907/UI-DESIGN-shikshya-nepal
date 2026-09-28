import type { Metadata } from 'next'
import Link from 'next/link'
import { AlarmClock, AlertTriangle, CalendarPlus, CheckCircle2, ExternalLink, Filter, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Select } from '@/components/design-system/FormField'
import Button from '@/components/design-system/Button'
import EvidenceChip from '@/components/design-system/EvidenceChip'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Student Deadline Calendar Nepal', description: 'Track verified admission, entrance exam, scholarship, internship and student opportunity deadlines across Nepal.' }

type DeadlineType = 'admission' | 'exam' | 'scholarship' | 'opportunity'
type Deadline = { id:string; type:DeadlineType; title:string; organisation:string; deadline:string; href:string; source:string|null; level:string|null; checked:string|null }
const LABELS:Record<DeadlineType,string>={admission:'Admission',exam:'Entrance exam',scholarship:'Scholarship',opportunity:'Opportunity'}
const TONES:Record<DeadlineType,string>={admission:'bg-sn-primary-bg text-sn-ink-soft',exam:'bg-sn-limited-bg text-sn-ink-soft',scholarship:'bg-sn-confirm-bg text-sn-confirm-ink',opportunity:'bg-sn-verified-bg text-sn-ink-soft'}
const NEPAL_TIME_ZONE = 'Asia/Kathmandu'
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const dateForDisplay = (value:string) => DATE_ONLY.test(value) ? new Date(`${value}T12:00:00+05:45`) : new Date(value)
const nepalDateKey = (value:Date) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: NEPAL_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value)
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || ''
  return `${read('year')}-${read('month')}-${read('day')}`
}
const deadlineKey = (value:string) => DATE_ONLY.test(value) ? value : nepalDateKey(new Date(value))
const keyEpoch = (key:string) => Date.UTC(Number(key.slice(0,4)), Number(key.slice(5,7)) - 1, Number(key.slice(8,10)))
const shiftKey = (key:string, days:number) => nepalDateKey(new Date(keyEpoch(key) + days * 86400000))
const date=(value:string)=>new Intl.DateTimeFormat('en-NP',{timeZone:NEPAL_TIME_ZONE,weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(dateForDisplay(value))
const validDate=(value:string)=>Number.isFinite(dateForDisplay(value).getTime())
const checkedLabel=(value:string|null, hasSource:boolean)=>{
  if(!value||!validDate(value))return {text:hasSource?'Source linked. Confirm before applying':'Source check not recorded',fresh:false}
  const days=Math.max(0,Math.floor((Date.now()-new Date(value).getTime())/86400000))
  if(days===0)return {text:'Checked today',fresh:true}
  if(days===1)return {text:'Checked yesterday',fresh:true}
  return {text:`Checked ${days} days ago`,fresh:days<=30}
}
const calendarLink=(item:Deadline)=>{const start=deadlineKey(item.deadline);const end=shiftKey(start,1);const compact=(key:string)=>key.replaceAll('-','');return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=${compact(start)}/${compact(end)}&details=${encodeURIComponent(`Deadline from SikshyaNepal. Verify before applying: ${item.source||item.href}`)}`}

export default async function DeadlinesPage({searchParams}:{searchParams:{type?:string;range?:string;level?:string}}){
  const db=createServerSupabaseClient()
  // A repeated query key (e.g. `?level=a&level=b`) arrives as an array — treat
  // it like any other value this page doesn't recognise: as if unset.
  const one=(value?:string|string[])=>Array.isArray(value)?undefined:value
  const type=one(searchParams.type)
  const level=one(searchParams.level)
  const range=one(searchParams.range)||'30'
  const rangeDays=range==='7'?7:range==='90'?90:30
  const isPast=range==='past'
  const todayKey=nepalDateKey(new Date()), todayEpoch=keyEpoch(todayKey)
  // Without a floor, ordering by deadline ascending and capping the row count
  // returns the OLDEST rows once a table holds more than the cap, hiding
  // current and upcoming deadlines behind expired ones. Floor each query at
  // today (or 90 days back, for "recently missed", with today as the ceiling
  // and the newest misses first) so the cap only ever trims the window this
  // view actually shows.
  const floorKey=isPast?shiftKey(todayKey,-90):todayKey
  const order={ascending:!isPast}
  let admissionsQuery=db.from('admissions').select('id,title,slug,institution_name,education_level,application_deadline,source_url,last_verified_at').eq('status','published').not('application_deadline','is',null).gte('application_deadline',floorKey)
  let examsQuery=db.from('entrance_exams').select('id,title,exam_body,education_level,application_deadline,source_url,exam_url,last_verified_at').eq('status','published').not('application_deadline','is',null).gte('application_deadline',floorKey)
  let scholarshipsQuery=db.from('scholarships').select('id,title,provider_name,deadline,application_url,source_url,last_verified_at,education_levels').eq('is_active',true).not('deadline','is',null).gte('deadline',floorKey)
  let opportunitiesQuery=db.from('student_opportunities').select('id,title,organisation,opportunity_type,deadline,application_url,source_url,last_verified_at').eq('is_published',true).not('deadline','is',null).gte('deadline',floorKey)
  if(isPast){
    admissionsQuery=admissionsQuery.lt('application_deadline',todayKey)
    examsQuery=examsQuery.lt('application_deadline',todayKey)
    scholarshipsQuery=scholarshipsQuery.lt('deadline',todayKey)
    opportunitiesQuery=opportunitiesQuery.lt('deadline',todayKey)
  }
  const [admissions,exams,scholarships,opportunities]=await Promise.all([
    admissionsQuery.order('application_deadline',order).limit(150),
    examsQuery.order('application_deadline',order).limit(100),
    scholarshipsQuery.order('deadline',order).limit(100),
    opportunitiesQuery.order('deadline',order).limit(100),
  ])
  let items:Deadline[]=[
    ...(admissions.data||[]).map(x=>({id:x.id,type:'admission' as const,title:x.title,organisation:x.institution_name||'Institution',deadline:x.application_deadline!,href:`/admissions/${x.slug}`,source:x.source_url,level:x.education_level,checked:x.last_verified_at})),
    ...(exams.data||[]).map(x=>({id:x.id,type:'exam' as const,title:x.title,organisation:x.exam_body||'Exam authority',deadline:x.application_deadline!,href:x.exam_url||x.source_url||'/entrance-exams',source:x.source_url,level:x.education_level,checked:x.last_verified_at})),
    ...(scholarships.data||[]).map(x=>({id:x.id,type:'scholarship' as const,title:x.title,organisation:x.provider_name||'Scholarship provider',deadline:x.deadline!,href:x.application_url||x.source_url||'/scholarships',source:x.source_url,level:x.education_levels?.join(', ')||null,checked:x.last_verified_at})),
    ...(opportunities.data||[]).map(x=>({id:x.id,type:'opportunity' as const,title:x.title,organisation:x.organisation,deadline:x.deadline!,href:x.application_url||x.source_url||'/opportunities',source:x.source_url,level:x.opportunity_type,checked:x.last_verified_at})),
  ]
  const unavailable=[admissions.error&&'admissions',exams.error&&'entrance exams',scholarships.error&&'scholarships',opportunities.error&&'opportunities'].filter(Boolean) as string[]
  if(type&&type in LABELS)items=items.filter(x=>x.type===type)
  if(level)items=items.filter(x=>(x.level||'').toLowerCase().includes(level.toLowerCase()))
  items=items.filter(x=>validDate(x.deadline)).filter(x=>{const time=keyEpoch(deadlineKey(x.deadline));return isPast?time<todayEpoch&&time>=todayEpoch-90*86400000:time>=todayEpoch&&time<=todayEpoch+rangeDays*86400000}).sort((a,b)=>isPast?keyEpoch(deadlineKey(b.deadline))-keyEpoch(deadlineKey(a.deadline)):keyEpoch(deadlineKey(a.deadline))-keyEpoch(deadlineKey(b.deadline)))
  return <main className="min-h-screen bg-sn-ground"><section className="border-b border-sn-border bg-sn-surface"><div className="mx-auto max-w-sn px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><p className="text-xs font-bold uppercase tracking-[.14em] text-sn-ink-soft">One calendar, fewer missed chances</p><h1 className="mt-2 font-baloo text-4xl font-bold text-sn-ink sm:text-5xl">Student deadline centre</h1><p className="mt-3 max-w-2xl text-lg leading-8 text-sn-ink-soft">Admissions, entrance forms, scholarships and opportunities, sorted by what closes next.</p></div></section><div className="mx-auto max-w-sn px-5 py-14 sm:px-8 lg:px-12 lg:py-24">
    <form className="grid gap-3 rounded-sn-card border border-sn-border bg-sn-surface p-4 shadow-sn-card sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]"><label><span className="mb-1.5 block text-xs font-bold text-sn-ink-soft">Deadline type</span><Select name="type" defaultValue={type||''} className="w-full rounded-sn-control border border-sn-border bg-sn-surface px-3 py-3 text-sm"><option value="">Everything</option>{Object.entries(LABELS).map(([key,label])=><option key={key} value={key}>{label}</option>)}</Select></label><label><span className="mb-1.5 block text-xs font-bold text-sn-ink-soft">Time window</span><Select name="range" defaultValue={range} className="w-full rounded-sn-control border border-sn-border bg-sn-surface px-3 py-3 text-sm"><option value="7">Next 7 days</option><option value="30">Next 30 days</option><option value="90">Next 3 months</option><option value="past">Recently missed</option></Select></label><label><span className="mb-1.5 block text-xs font-bold text-sn-ink-soft">Study level</span><Select name="level" defaultValue={level||''} className="w-full rounded-sn-control border border-sn-border bg-sn-surface px-3 py-3 text-sm"><option value="">All levels</option><option value="+2">+2</option><option value="Bachelor">Bachelor</option><option value="Master">Master</option><option value="Diploma">Diploma</option></Select></label><Button className="mt-auto flex items-center justify-center gap-2 rounded-sn-control bg-sn-ink px-5 py-3 text-sm font-bold text-white motion-control"><Filter className="h-4 w-4"/>Apply</Button></form>
    {unavailable.length>0&&<div role="status" className="mt-5 flex gap-3 rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg p-4 text-sm text-sn-confirm-ink"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="font-bold">Some deadline sources are temporarily unavailable</p><p className="mt-0.5">Showing everything we could load. Missing: {unavailable.join(', ')}. Check again shortly.</p></div></div>}
    <div className="mt-8 flex items-end justify-between"><div><h2 className="font-baloo text-2xl font-bold text-sn-ink">{range==='past'?'Recently missed':'Coming up'}</h2><p className="mt-1 text-sm text-sn-ink-soft">{items.length} deadline{items.length===1?'':'s'} found{range==='past'?' from the last 90 days':''}</p></div><Link href="/deadlines" className="inline-flex min-h-11 items-center text-sm font-bold text-sn-ink-soft">Reset</Link></div>
    {items.length?<div className="mt-4 overflow-hidden rounded-sn-card border border-sn-border bg-sn-surface">{items.map((item,index)=>{const key=deadlineKey(item.deadline);const days=Math.round((keyEpoch(key)-todayEpoch)/86400000);const external=item.href.startsWith('http');const evidence=checkedLabel(item.checked,Boolean(item.source));const monthYear=new Intl.DateTimeFormat('en-NP',{timeZone:NEPAL_TIME_ZONE,month:'short',year:'numeric'}).format(dateForDisplay(item.deadline));return <article key={`${item.type}-${item.id}`} className={`grid gap-4 p-5 sm:grid-cols-[100px_1fr_auto] sm:items-center ${index?'border-t border-sn-border':''} transition-colors hover:bg-sn-surface-alt/50`}><div><p className={`text-2xl font-bold ${days>=0&&days<=7?'text-sn-confirm-ink':'text-sn-ink'}`}>{key.slice(8,10).replace(/^0/,'')}</p><p className="text-xs font-bold uppercase text-sn-ink-soft">{monthYear}</p><p className={`mt-1 text-xs ${days>=0&&days<=7?'font-bold text-sn-confirm-ink':'text-sn-ink-soft'}`}>{days===0?'Closes today':days>0?`${days} days left`:`Closed ${Math.abs(days)} day${Math.abs(days)===1?'':'s'} ago`}</p></div><div><span className={`rounded-sn-pill px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${TONES[item.type]}`}>{LABELS[item.type]}</span><h3 className="mt-2 font-bold text-sn-ink">{item.title}</h3><p className="mt-1 text-sm text-sn-ink-soft">{item.organisation}{item.level?` · ${item.level}`:''}</p><div className="mt-2">{item.source && item.checked ? <EvidenceChip state="verified" className="!text-sn-ink-soft" source={item.organisation} checkedDate={item.checked} /> : item.source ? <EvidenceChip state="confirm" label="Confirm deadline at source" /> : <EvidenceChip state="limited" className="!text-sn-ink-soft" label="Source not recorded" />}</div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs"><span className="flex items-center gap-1 font-medium text-sn-ink-soft"><CheckCircle2 className="h-3.5 w-3.5 text-sn-verified"/>Deadline: {date(item.deadline)}</span><span className={`flex items-center gap-1 ${evidence.fresh?'text-sn-ink-soft':'text-sn-confirm-ink'}`}><ShieldCheck className="h-3.5 w-3.5"/>{evidence.text}</span>{item.source&&<a href={item.source} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold text-sn-primary-hover hover:underline">Official source</a>}</div></div><div className="flex flex-wrap gap-2 sm:justify-end"><a href={calendarLink(item)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 rounded-sn-control border border-sn-border px-3 py-2 text-xs font-bold text-sn-ink-soft hover:border-sn-primary hover:text-sn-primary motion-control"><CalendarPlus className="h-4 w-4"/>Add to calendar</a><Link href={item.href} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined} className="inline-flex min-h-11 items-center gap-1 rounded-sn-control bg-sn-ink px-3 py-2 text-xs font-bold text-white motion-control hover:bg-sn-ink/90">View details <ExternalLink className="h-3.5 w-3.5"/></Link></div></article>})}</div>:<div className="mt-4 rounded-sn-card border border-dashed border-sn-border-strong bg-sn-surface py-16 text-center"><AlarmClock className="mx-auto h-9 w-9 text-sn-ink-soft"/><h3 className="mt-3 font-bold text-sn-ink">No deadlines in this window</h3><p className="mt-1 text-sm text-sn-ink-soft">{unavailable.length?'Some sources could not be checked. Try again shortly.':'Try the next 3 months or another deadline type.'}</p></div>}
    <p className="mt-5 text-xs leading-5 text-sn-ink-soft">Dates can change after publication. Always confirm on the official page before paying a fee or submitting an application.</p>
  </div></main>
}
