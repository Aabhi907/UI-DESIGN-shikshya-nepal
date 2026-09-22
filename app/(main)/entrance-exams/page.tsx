import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, CalendarClock, CalendarPlus, CheckCircle2, ExternalLink, FileText, Search, SlidersHorizontal } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { EntranceExam } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Entrance Exams in Nepal – Dates, Deadlines and Eligibility', description: 'Track verified entrance exam application deadlines, exam dates, fees, eligibility and official notices for study in Nepal.' }
const LEVELS = ['+2', 'Bachelor', 'Master', 'Diploma'] as const
const clean = (value?: string) => (value || '').replace(/[,().%]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
const validUrl = (value?: string | null) => { if (!value) return null; try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null } catch { return null } }
const validDate = (value?: string | null) => Boolean(value && Number.isFinite(new Date(value).getTime()))
const dateLabel = (value: string | null) => validDate(value) ? new Intl.DateTimeFormat('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value!)) : 'Not announced'
const daysFromToday = (value: string) => { const end = new Date(value); const today = new Date(); end.setHours(0, 0, 0, 0); today.setHours(0, 0, 0, 0); return Math.round((end.getTime() - today.getTime()) / 86400000) }
const stateFor = (exam: EntranceExam) => {
  if (!validDate(exam.application_deadline)) return { label: 'Deadline to be announced', tone: 'bg-amber-50 text-amber-800', days: null }
  const days = daysFromToday(exam.application_deadline!)
  if (days < 0) return { label: 'Closed', tone: 'bg-gray-100 text-gray-600', days }
  if (days === 0) return { label: 'Closes today', tone: 'bg-red-50 text-red-700', days }
  if (days <= 7) return { label: `${days} day${days === 1 ? '' : 's'} left`, tone: 'bg-red-50 text-red-700', days }
  return { label: 'Applications open', tone: 'bg-emerald-50 text-emerald-700', days }
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
  const q = clean(searchParams.q)
  const level = LEVELS.includes(searchParams.level as typeof LEVELS[number]) ? searchParams.level! : ''
  const status = searchParams.status === 'all' ? 'all' : 'open'
  const authority = clean(searchParams.authority)
  const field = clean(searchParams.field)
  let query = db.from('entrance_exams').select('*, university:universities(name,short_name)').eq('status', 'published').order('application_deadline', { ascending: true, nullsFirst: false }).limit(150)
  if (q) query = query.or(`title.ilike.%${q}%,program.ilike.%${q}%,exam_body.ilike.%${q}%`)
  if (level) query = query.eq('education_level', level)
  const { data, error } = await query
  if (error) console.error('[entrance-exams:list]', { code: error.code, message: error.message })
  const exams = (data || []) as EntranceExam[]
  const authorities = Array.from(new Set(exams.map(authorityFor))).sort((a, b) => a.localeCompare(b)).slice(0, 40)
  const fields = Array.from(new Set(exams.map(fieldFor).filter((item) => item !== 'General entrance'))).sort((a, b) => a.localeCompare(b)).slice(0, 40)
  const filtered = exams.filter((exam) => (!authority || authorityFor(exam) === authority) && (!field || fieldFor(exam) === field))
  const open = filtered.filter((exam) => stateFor(exam).days === null || stateFor(exam).days! >= 0)
  const closed = filtered.filter((exam) => { const days = stateFor(exam).days; return days !== null && days < 0 && days >= -90 })
  const visible = status === 'all' ? [...open, ...closed] : open
  const urgent = visible.filter((exam) => { const days = stateFor(exam).days; return days !== null && days >= 0 && days <= 7 }).length
  const hasFilters = Boolean(q || level || status === 'all' || authority || field)

  return <main className="min-h-screen bg-[#f8f7f3]"><div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
    <header className="border-b border-[#ddd9d0] pb-7 sm:flex sm:items-end sm:justify-between sm:gap-8"><div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a302c]">Entrance planning</p><h1 className="mt-2 font-display text-4xl font-bold tracking-[-.03em] text-ink sm:text-5xl">Entrance exams in Nepal</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Find the deadline, exam date, eligibility and official notice before you pay an application fee.</p></div><Link href="/deadlines?type=exam" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2 sm:mt-0">Open deadline calendar <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></header>
    {error ? <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /><div><p className="font-bold">Entrance exams could not be loaded</p><p className="mt-1">Please refresh or try again shortly.</p></div></div> : <div className="mt-7 grid gap-6 lg:grid-cols-[258px_minmax(0,1fr)]">
      <aside className="self-start rounded-xl border border-[#dedbd4] bg-white p-4 shadow-sm lg:sticky lg:top-5" aria-label="Filter entrance exams"><div className="flex items-center gap-2 border-b border-gray-100 pb-3"><SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" /><h2 className="font-display text-lg font-bold text-ink">Find an exam</h2></div><form className="mt-4 space-y-4" role="search"><label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Exam or programme</span><span className="relative block"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" aria-hidden="true" /><input name="q" maxLength={80} defaultValue={q} placeholder="IOE, CMAT, MBBS…" className="min-h-11 w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></span></label><FilterSelect label="Study level" name="level" value={level} options={LEVELS} allLabel="All study levels" /><FilterSelect label="Authority" name="authority" value={authority} options={authorities} allLabel="All authorities" /><FilterSelect label="Programme / field" name="field" value={field} options={fields} allLabel="All programmes" /><FilterSelect label="Application status" name="status" value={status} options={['open', 'all']} labels={{ open: 'Open or date pending', all: 'Include recently closed' }} /><button className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2">Show exams</button>{hasFilters && <Link href="/entrance-exams" className="flex min-h-11 items-center justify-center text-sm font-bold text-primary hover:underline">Clear filters</Link>}</form></aside>
      <section aria-labelledby="exam-list-heading" className="min-w-0"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ddd9d0] pb-4"><div><h2 id="exam-list-heading" className="font-display text-2xl font-bold text-ink">{status === 'all' ? 'Current and recently closed' : 'Open and upcoming'}</h2><p className="mt-1 text-sm text-slate-600">{visible.length} exam{visible.length === 1 ? '' : 's'} match your filters{urgent > 0 ? ` · ${urgent} closing within seven days` : ''}.</p></div><p className="text-xs leading-5 text-slate-500">Only published exams are shown.</p></div>{visible.length ? <div className="mt-4 grid gap-4 xl:grid-cols-2">{visible.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div> : <div className="mt-4 rounded-xl border border-gray-200 bg-white px-6 py-14 text-center"><CalendarClock className="mx-auto h-10 w-10 text-gray-300" aria-hidden="true" /><h3 className="mt-3 font-display text-xl font-bold text-ink">No matching exams</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Try a broader authority, programme or level. New exams appear after an official notice is checked and published.</p>{hasFilters && <Link href="/entrance-exams" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-bold text-white">See all open exams</Link>}</div>}<section className="mt-6 border-l-2 border-[#c93b37] bg-white px-4 py-4 text-sm leading-6 text-slate-600" aria-label="Before you apply"><h2 className="font-semibold text-ink">Before you apply</h2><p className="mt-1">Check eligibility, payment method, admit-card date, exam time and venue in the original notice. Dates and fees can change after publication.</p></section></section>
    </div>}</div></main>
}

function FilterSelect({ label, name, value, options, allLabel, labels }: { label: string; name: string; value: string; options: readonly string[]; allLabel?: string; labels?: Record<string, string> }) { return <label><span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span><select name={name} defaultValue={value} className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">{allLabel && <option value="">{allLabel}</option>}{options.map((option) => <option key={option} value={option}>{labels?.[option] || option}</option>)}</select></label> }

function ExamCard({ exam }: { exam: EntranceExam }) {
  const state = stateFor(exam); const official = validUrl(exam.exam_url) || validUrl(exam.source_url); const syllabus = validUrl(exam.syllabus_url); const calendar = calendarLink(exam); const authority = authorityFor(exam)
  return <article className={`flex min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${state.days !== null && state.days < 0 ? 'opacity-75' : ''}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.1em] text-primary">{exam.education_level || 'Entrance'} · {authority}</p><h3 className="mt-2 font-display text-xl font-bold leading-7 text-ink">{exam.title}</h3>{exam.program && <p className="mt-1 text-sm text-slate-600">{exam.program}</p>}</div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${state.tone}`}>{state.label}</span></div><dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-gray-100 py-4 text-sm"><div><dt className="text-xs text-slate-500">Apply by</dt><dd className="mt-1 font-semibold text-ink">{dateLabel(exam.application_deadline)}</dd></div><div><dt className="text-xs text-slate-500">Exam date</dt><dd className="mt-1 font-semibold text-ink">{dateLabel(exam.exam_date)}</dd></div>{exam.fee != null && <div><dt className="text-xs text-slate-500">Application fee</dt><dd className="mt-1 font-semibold text-ink">NPR {Number(exam.fee).toLocaleString()}</dd></div>}<div><dt className="text-xs text-slate-500">Last checked</dt><dd className="mt-1 flex items-center gap-1 font-medium text-slate-700"><CheckCircle2 className={`h-3.5 w-3.5 ${exam.last_verified_at ? 'text-emerald-600' : 'text-amber-600'}`} aria-hidden="true" />{exam.last_verified_at ? dateLabel(exam.last_verified_at) : 'Check notice'}</dd></div></dl>{exam.eligibility && <p className="mt-4 text-sm leading-6 text-slate-600"><strong className="text-ink">Eligibility:</strong> {exam.eligibility}</p>}<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">{official ? <a href={official} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary hover:underline">Official notice <ExternalLink className="h-4 w-4" aria-hidden="true" /></a> : <span className="inline-flex min-h-11 items-center text-sm font-semibold text-slate-500">Official link not available</span>}{syllabus && <a href={syllabus} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-slate-700 hover:text-primary hover:underline"><FileText className="h-4 w-4" aria-hidden="true" />Syllabus</a>}{calendar && <a href={calendar} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-slate-700 hover:text-primary hover:underline"><CalendarPlus className="h-4 w-4" aria-hidden="true" />Add exam date</a>}</div></article>
}
