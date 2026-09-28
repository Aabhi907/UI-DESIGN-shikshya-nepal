import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, CalendarClock, CalendarPlus, CheckCircle2, ExternalLink, FileText, RefreshCcw, Search, SlidersHorizontal } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Input, Select } from '@/components/design-system/FormField'
import Button from '@/components/design-system/Button'
import EvidenceChip from '@/components/design-system/EvidenceChip'
import Card from '@/components/design-system/Card'
import type { EntranceExam } from '@/types'
import { publicListState } from '@/lib/public-list-state'
import { nepalDateOnly, addDaysToDateOnly } from '@/lib/admissions'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Entrance Exams in Nepal – Dates, Deadlines and Eligibility', description: 'Track verified entrance exam application deadlines, exam dates, fees, eligibility and official notices for study in Nepal.' }
const LEVELS = ['+2', 'Bachelor', 'Master', 'Diploma'] as const
// A repeated query key (e.g. `?q=a&q=b`) arrives as an array — treat it like
// any other value this page doesn't recognise: as if the param were unset.
const clean = (value?: string | string[]) => (Array.isArray(value) ? '' : (value || '')).replace(/[,().%]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
const validUrl = (value?: string | null) => { if (!value) return null; try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null } catch { return null } }
const validDate = (value?: string | null) => Boolean(value && Number.isFinite(new Date(value).getTime()))
const dateLabel = (value: string | null) => validDate(value) ? new Intl.DateTimeFormat('en-NP', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kathmandu' }).format(new Date(value!)) : 'Not announced'
// A calendar-day difference in Nepal time, not the server's local midnight
// (UTC on Vercel) — otherwise a deadline can read as "still open" for up to
// 5h45m after it has actually closed in Nepal. `now` defaults to the real
// current time and is only ever overridden by tests.
const dateKeyEpoch = (key: string) => Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10)))
const daysFromToday = (value: string, now = new Date()) => Math.round((dateKeyEpoch(nepalDateOnly(new Date(value))) - dateKeyEpoch(nepalDateOnly(now))) / 86400000)
const stateFor = (exam: EntranceExam, now = new Date()) => {
  if (!validDate(exam.application_deadline)) return { label: 'Deadline to be announced', tone: 'bg-sn-confirm-bg text-sn-confirm-ink', days: null }
  const days = daysFromToday(exam.application_deadline!, now)
  if (days < 0) return { label: 'Closed', tone: 'bg-sn-surface-alt text-sn-ink-soft', days }
  if (days === 0) return { label: 'Closes today', tone: 'bg-sn-confirm-bg text-sn-confirm-ink', days }
  if (days <= 7) return { label: `${days} day${days === 1 ? '' : 's'} left`, tone: 'bg-sn-confirm-bg text-sn-confirm-ink', days }
  return { label: 'Applications open', tone: 'bg-sn-verified-bg text-sn-ink-soft', days }
}
const authorityFor = (exam: EntranceExam) => exam.university?.name || exam.exam_body || 'Exam authority'
const fieldFor = (exam: EntranceExam) => exam.program || 'General entrance'
const calendarLink = (exam: EntranceExam) => {
  if (!validDate(exam.exam_date)) return null
  const start = new Date(exam.exam_date!); const end = new Date(start.getTime() + 60 * 60 * 1000)
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(exam.title)}&dates=${stamp(start)}/${stamp(end)}&details=${encodeURIComponent(`Confirm time and venue on the official notice: ${exam.exam_url || exam.source_url || ''}`)}`
}

type SearchParams = { q?: string; level?: string; status?: string; authority?: string; field?: string }

export default async function EntranceExamsPage({ searchParams }: { searchParams: SearchParams }) {
  const db = createServerSupabaseClient()
  // A repeated query key (e.g. `?status=all&status=open`) arrives as an array
  // — treat it like any other value this page doesn't recognise: as if unset.
  const one = (value?: string | string[]) => (Array.isArray(value) ? undefined : value)
  const q = clean(searchParams.q)
  const level = LEVELS.includes(one(searchParams.level) as typeof LEVELS[number]) ? (one(searchParams.level) as string) : ''
  const status = one(searchParams.status) === 'all' ? 'all' : 'open'
  const authority = clean(searchParams.authority)
  const field = clean(searchParams.field)
  const today = nepalDateOnly()
  // Ordering by deadline ascending with one flat cap pushes current and
  // upcoming exams out once enough old ones pile up. Fetch the open/upcoming
  // set (floored at today) and, only when shown, a separate recently-closed
  // set (floored 90 days back, newest miss first) so neither crowds the
  // other out of its own cap.
  const baseQuery = () => {
    let query = db.from('entrance_exams').select('*, university:universities(name,short_name)').eq('status', 'published')
    if (q) query = query.or(`title.ilike.%${q}%,program.ilike.%${q}%,exam_body.ilike.%${q}%`)
    if (level) query = query.eq('education_level', level)
    return query
  }
  const [upcomingResult, closedResult] = await Promise.all([
    baseQuery().or(`application_deadline.is.null,application_deadline.gte.${today}`).order('application_deadline', { ascending: true, nullsFirst: false }).limit(150),
    status === 'all'
      ? baseQuery().lt('application_deadline', today).gte('application_deadline', addDaysToDateOnly(today, -90)).order('application_deadline', { ascending: false }).limit(150)
      : Promise.resolve({ data: [] as EntranceExam[] | null, error: null }),
  ])
  if (upcomingResult.error) console.error('[entrance-exams:list]', { code: upcomingResult.error.code, message: upcomingResult.error.message })
  if (closedResult.error) console.error('[entrance-exams:list:closed]', { code: closedResult.error.code, message: closedResult.error.message })
  // A failed "recently closed" query must not quietly render as if those
  // exams simply didn't exist — show the same failure state a failed
  // open/upcoming query would.
  const { items: upcomingExams, loadError: upcomingLoadError } = publicListState({ data: upcomingResult.data as EntranceExam[] | null, error: upcomingResult.error })
  const loadError = upcomingLoadError || Boolean(closedResult.error)
  const exams = [...upcomingExams, ...((closedResult.data as EntranceExam[] | null) || [])]
  const retryParams = new URLSearchParams()
  const retryValues = { q, level, status: one(searchParams.status) || '', authority, field }
  for (const key of ['q', 'level', 'status', 'authority', 'field'] as const) {
    if (retryValues[key]) retryParams.set(key, retryValues[key])
  }
  const retryUrl = `/entrance-exams${retryParams.size ? `?${retryParams}` : ''}`
  const authorities = Array.from(new Set(exams.map(authorityFor))).sort((a, b) => a.localeCompare(b)).slice(0, 40)
  const fields = Array.from(new Set(exams.map(fieldFor).filter((item) => item !== 'General entrance'))).sort((a, b) => a.localeCompare(b)).slice(0, 40)
  const filtered = exams.filter((exam) => (!authority || authorityFor(exam) === authority) && (!field || fieldFor(exam) === field))
  const open = filtered.filter((exam) => stateFor(exam).days === null || stateFor(exam).days! >= 0)
  const closed = filtered.filter((exam) => { const days = stateFor(exam).days; return days !== null && days < 0 && days >= -90 })
  const visible = status === 'all' ? [...open, ...closed] : open
  const urgent = visible.filter((exam) => { const days = stateFor(exam).days; return days !== null && days >= 0 && days <= 7 }).length
  const hasFilters = Boolean(q || level || status === 'all' || authority || field)

  return <main className="min-h-screen bg-sn-ground"><div className="mx-auto max-w-sn px-5 py-14 sm:px-8 lg:px-12 lg:py-24 sm:py-10 lg:px-8">
    <header className="border-b border-sn-border pb-7 sm:flex sm:items-end sm:justify-between sm:gap-8"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-sn-ink-soft">Entrance planning</p><h1 className="mt-2 font-baloo text-4xl font-bold tracking-[-.03em] text-sn-ink sm:text-5xl">Entrance exams in Nepal</h1><p className="mt-3 max-w-2xl text-base leading-7 text-sn-ink-soft">Find the deadline, exam date, eligibility and official notice before you pay an application fee.</p></div><Link href="/deadlines?type=exam" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-sn-control bg-sn-ink px-4 text-sm font-bold text-white transition-colors hover:bg-sn-ink focus:outline-none focus:ring-2 focus:ring-sn-primary focus:ring-offset-2 sm:mt-0 motion-control">Open deadline calendar <ArrowRight className="h-4 w-4 motion-arrow" aria-hidden="true" /></Link></header>
    {loadError ? <div role="alert" className="mt-6 flex gap-3 rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg p-4 text-sm text-sn-confirm-ink"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div><p className="font-bold">Entrance exams could not be loaded</p><p className="mt-1">This is a temporary problem, not an empty list. Your filters are safe — please try again.</p><a href={retryUrl} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-sn-control bg-sn-ink px-4 font-bold text-white motion-control"><RefreshCcw className="h-4 w-4" aria-hidden="true" />Try again</a></div></div> : <div className="mt-7 grid gap-6 lg:grid-cols-[258px_minmax(0,1fr)]">
      <aside className="self-start rounded-sn-card border border-sn-border bg-sn-surface p-4 shadow-sn-card lg:sticky lg:top-5" aria-label="Filter entrance exams"><div className="flex items-center gap-2 border-b border-sn-border pb-3"><SlidersHorizontal className="h-4 w-4 text-sn-primary-hover" aria-hidden="true" /><h2 className="font-baloo text-lg font-bold text-sn-ink">Find an exam</h2></div><form className="mt-4 space-y-4" role="search"><label><span className="mb-1.5 block text-sm font-semibold text-sn-ink-soft">Exam or programme</span><span className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-sn-ink-soft" aria-hidden="true" /><Input name="q" maxLength={80} defaultValue={q} placeholder="IOE, CMAT, MBBS…" className="min-h-11 w-full rounded-sn-control border border-sn-border py-2.5 pl-9 pr-3 text-sm text-sn-ink outline-none focus:border-sn-primary focus:ring-2 focus:ring-sn-primary/15" /></span></label><FilterSelect label="Study level" name="level" value={level} options={LEVELS} allLabel="All study levels" /><FilterSelect label="Authority" name="authority" value={authority} options={authorities} allLabel="All authorities" /><FilterSelect label="Programme / field" name="field" value={field} options={fields} allLabel="All programmes" /><FilterSelect label="Application status" name="status" value={status} options={['open', 'all']} labels={{ open: 'Open or date pending', all: 'Include recently closed' }} /><Button className="flex min-h-11 w-full items-center justify-center rounded-sn-control bg-sn-ink px-4 text-sm font-bold text-white transition-colors hover:bg-sn-ink focus:outline-none focus:ring-2 focus:ring-sn-primary focus:ring-offset-2 motion-control">Show exams</Button>{hasFilters && <Link href="/entrance-exams" className="flex min-h-11 items-center justify-center text-sm font-bold text-sn-primary-hover hover:underline">Clear filters</Link>}</form></aside>
      <section aria-labelledby="exam-list-heading" className="min-w-0"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-sn-border pb-4"><div><h2 id="exam-list-heading" className="font-baloo text-2xl font-bold text-sn-ink">{status === 'all' ? 'Current and recently closed' : 'Open and upcoming'}</h2><p className="mt-1 text-sm text-sn-ink-soft">{visible.length} exam{visible.length === 1 ? '' : 's'} match your filters{urgent > 0 ? ` · ${urgent} closing within seven days` : ''}.</p></div><p className="text-xs leading-5 text-sn-ink-soft">Only published exams are shown.</p></div>{visible.length ? <div className="mt-4 grid gap-4 xl:grid-cols-2">{visible.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div> : <div className="mt-4 rounded-sn-card border border-sn-border bg-sn-surface px-6 py-14 text-center"><CalendarClock className="mx-auto h-10 w-10 text-sn-ink-soft" aria-hidden="true" /><h3 className="mt-3 font-baloo text-xl font-bold text-sn-ink">No matching exams</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-sn-ink-soft">Try a broader authority, programme or level. New exams appear after an official notice is checked and published.</p>{hasFilters && <Link href="/entrance-exams" className="mt-5 inline-flex min-h-11 items-center rounded-sn-control bg-sn-ink px-4 text-sm font-bold text-white motion-control">See all open exams</Link>}</div>}<section className="mt-6 border-l-2 border-sn-primary bg-sn-surface px-4 py-4 text-sm leading-6 text-sn-ink-soft" aria-label="Before you apply"><h2 className="font-semibold text-sn-ink">Before you apply</h2><p className="mt-1">Check eligibility, payment method, admit-card date, exam time and venue in the original notice. Dates and fees can change after publication.</p></section></section>
    </div>}</div></main>
}

function FilterSelect({ label, name, value, options, allLabel, labels }: { label: string; name: string; value: string; options: readonly string[]; allLabel?: string; labels?: Record<string, string> }) { return <label><span className="mb-1.5 block text-sm font-semibold text-sn-ink-soft">{label}</span><Select name={name} defaultValue={value} className="min-h-11 w-full rounded-sn-control border border-sn-border bg-sn-surface px-3 text-sm text-sn-ink outline-none focus:border-sn-primary focus:ring-2 focus:ring-sn-primary/15">{allLabel && <option value="">{allLabel}</option>}{options.map((option) => <option key={option} value={option}>{labels?.[option] || option}</option>)}</Select></label> }

function ExamCard({ exam }: { exam: EntranceExam }) {
  const state = stateFor(exam); const official = validUrl(exam.exam_url) || validUrl(exam.source_url); const syllabus = validUrl(exam.syllabus_url); const calendar = calendarLink(exam); const authority = authorityFor(exam)
  return <Card as="article" className={`flex min-w-0 flex-col rounded-sn-card border border-sn-border bg-sn-surface p-5 shadow-sn-card motion-interactive-card hover:shadow-sn-float ${state.days !== null && state.days < 0 ? 'opacity-75' : ''}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.1em] text-sn-primary-hover">{exam.education_level || 'Entrance'} · {authority}</p><h3 className="mt-2 font-baloo text-xl font-bold leading-7 text-sn-ink">{exam.title}</h3>{exam.program && <p className="mt-1 text-sm text-sn-ink-soft">{exam.program}</p>}</div><span className={`shrink-0 rounded-sn-pill px-2.5 py-1 text-xs font-bold ${state.tone}`}>{state.label}</span></div><dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-sn-border py-4 text-sm"><div><dt className="text-xs text-sn-ink-soft">Apply by</dt><dd className="mt-1 font-semibold text-sn-ink">{dateLabel(exam.application_deadline)}</dd></div><div><dt className="text-xs text-sn-ink-soft">Exam date</dt><dd className="mt-1 font-semibold text-sn-ink">{dateLabel(exam.exam_date)}</dd></div>{exam.fee != null && <div><dt className="text-xs text-sn-ink-soft">Application fee</dt><dd className="mt-1 font-semibold text-sn-ink">NPR {Number(exam.fee).toLocaleString()}</dd></div>}<div><dt className="text-xs text-sn-ink-soft">Last checked</dt><dd className="mt-1 flex items-center gap-1 font-medium text-sn-ink-soft"><CheckCircle2 className={`h-3.5 w-3.5 ${exam.last_verified_at ? 'text-sn-verified' : 'text-sn-confirm-ink'}`} aria-hidden="true" />{exam.last_verified_at ? dateLabel(exam.last_verified_at) : 'Check notice'}</dd></div></dl><div className="mt-4">{exam.source_url && exam.last_verified_at ? <EvidenceChip state="verified" className="!text-sn-ink-soft" source={authority} checkedDate={exam.last_verified_at} /> : official ? <EvidenceChip state="confirm" label="Confirm exam dates at source" /> : <EvidenceChip state="limited" className="!text-sn-ink-soft" label="Official source not recorded" />}</div>{exam.eligibility && <p className="mt-4 text-sm leading-6 text-sn-ink-soft"><strong className="text-sn-ink">Eligibility:</strong> {exam.eligibility}</p>}<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">{official ? <a href={official} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-sn-primary-hover hover:underline">Official notice <ExternalLink className="h-4 w-4" aria-hidden="true" /></a> : <span className="inline-flex min-h-11 items-center text-sm font-semibold text-sn-ink-soft">Official link not available</span>}{syllabus && <a href={syllabus} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-sn-ink-soft hover:text-sn-primary-hover hover:underline"><FileText className="h-4 w-4" aria-hidden="true" />Syllabus</a>}{calendar && <a href={calendar} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-sn-ink-soft hover:text-sn-primary-hover hover:underline"><CalendarPlus className="h-4 w-4" aria-hidden="true" />Add exam date</a>}</div></Card>
}
