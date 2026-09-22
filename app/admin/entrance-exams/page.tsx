'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CalendarClock, ExternalLink, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { EntranceExam } from '@/types'
import ConfirmDialog, { CONFIRM_CLOSED, type ConfirmState } from '@/components/ui/ConfirmDialog'
import { ToastList, useToast } from '@/components/ui/Toast'

type ExamForm = {
  title: string; exam_body: string; program: string; education_level: string
  application_deadline: string; exam_date: string; fee: string; eligibility: string
  source_name: string; source_url: string; exam_url: string; syllabus_url: string
  status: EntranceExam['status']
}

const empty: ExamForm = {
  title: '', exam_body: '', program: '', education_level: 'Bachelor', application_deadline: '', exam_date: '', fee: '', eligibility: '', source_name: '', source_url: '', exam_url: '', syllabus_url: '', status: 'draft',
}

function toLocalInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function itemToForm(item: EntranceExam): ExamForm {
  return { title: item.title, exam_body: item.exam_body || '', program: item.program || '', education_level: item.education_level || '', application_deadline: toLocalInput(item.application_deadline), exam_date: toLocalInput(item.exam_date), fee: item.fee === null ? '' : String(item.fee), eligibility: item.eligibility || '', source_name: item.source_name || '', source_url: item.source_url || '', exam_url: item.exam_url || '', syllabus_url: item.syllabus_url || '', status: item.status }
}

function displayDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not announced'
}

export default function AdminEntranceExamsPage() {
  const [items, setItems] = useState<EntranceExam[]>([])
  const [form, setForm] = useState<ExamForm>(empty)
  const [editing, setEditing] = useState<EntranceExam | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialog, setDialog] = useState<ConfirmState>(CONFIRM_CLOSED)
  const { toasts, toast, dismiss } = useToast()
  const field = 'mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-blue-500'

  async function load() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/entrance-exams', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok || !Array.isArray(data)) throw new Error(data?.error || 'Could not load entrance exams')
      setItems(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load entrance exams')
    } finally {
      setLoading(false)
    }
  }

  // load is intentionally run only when this admin page opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load() }, [])

  function update<K extends keyof ExamForm>(key: K, value: ExamForm[K]) { setForm((current) => ({ ...current, [key]: value })) }
  function cancelEdit() { setEditing(null); setForm(empty) }
  function startEdit(item: EntranceExam) { setEditing(item); setForm(itemToForm(item)); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(editing ? `/api/admin/entrance-exams/${editing.id}` : '/api/admin/entrance-exams', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not save entrance exam')
      toast.success(editing ? 'Entrance exam updated and rechecked.' : 'Entrance exam saved.')
      cancelEdit()
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save entrance exam')
    } finally { setSaving(false) }
  }

  async function changeStatus(item: EntranceExam, status: EntranceExam['status']) {
    try {
      const response = await fetch(`/api/admin/entrance-exams/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not change status')
      setItems((all) => all.map((exam) => exam.id === item.id ? data : exam))
      toast.success(`${item.title} is now ${status}.`)
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not change status') }
  }

  function remove(item: EntranceExam) {
    setDialog({ isOpen: true, title: 'Delete entrance exam', message: `Delete “${item.title}”? This cannot be undone.`, confirmLabel: 'Delete', variant: 'danger', onConfirm: async () => {
      setDialog(CONFIRM_CLOSED)
      try {
        const response = await fetch(`/api/admin/entrance-exams/${item.id}`, { method: 'DELETE' })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Could not delete entrance exam')
        setItems((all) => all.filter((exam) => exam.id !== item.id))
        if (editing?.id === item.id) cancelEdit()
        toast.success('Entrance exam deleted.')
      } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not delete entrance exam') }
    } })
  }

  return <div className="p-5 text-gray-100 sm:p-8">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h1 className="flex items-center gap-2 text-2xl font-bold"><CalendarClock className="h-6 w-6 text-cyan-400" />Entrance Exams</h1><p className="mt-1 max-w-2xl text-sm text-gray-400">Maintain the official source, application form and time-sensitive details students use before applying.</p></div><p className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300">{items.length} records</p></div>

    <section aria-labelledby="exam-editor" className="mb-8 rounded-xl border border-gray-700 bg-gray-800 p-5"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 id="exam-editor" className="text-lg font-bold text-white">{editing ? 'Edit entrance exam' : 'Add entrance exam'}</h2><p className="mt-1 text-sm text-gray-400">The official source and form link are required so students can verify every listing.</p></div>{editing && <button type="button" onClick={cancelEdit} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-600 px-3 text-sm font-semibold text-gray-200 hover:bg-gray-700"><X className="h-4 w-4" />Cancel edit</button>}</div>
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-gray-200">Exam title <span className="text-red-300">*</span><input required maxLength={220} className={field} value={form.title} onChange={(e) => update('title', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Exam authority<input maxLength={160} className={field} placeholder="e.g. TU Faculty of Management" value={form.exam_body} onChange={(e) => update('exam_body', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Programme(s)<input maxLength={500} className={field} placeholder="e.g. BBA, BBM, BITM" value={form.program} onChange={(e) => update('program', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Education level<select className={field} value={form.education_level} onChange={(e) => update('education_level', e.target.value)}><option value="+2">+2</option><option value="Bachelor">Bachelor</option><option value="Master">Master</option><option value="Diploma">Diploma</option><option value="Other">Other</option></select></label>
        <label className="text-sm font-medium text-gray-200">Application deadline<input type="datetime-local" className={field} value={form.application_deadline} onChange={(e) => update('application_deadline', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Exam date and time<input type="datetime-local" className={field} value={form.exam_date} onChange={(e) => update('exam_date', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Application fee (NPR)<input type="number" min="0" max="10000000" inputMode="numeric" className={field} value={form.fee} onChange={(e) => update('fee', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Publication status<select className={field} value={form.status} onChange={(e) => update('status', e.target.value as EntranceExam['status'])}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></label>
        <label className="text-sm font-medium text-gray-200">Official source name <span className="text-red-300">*</span><input required maxLength={160} className={field} placeholder="e.g. TU Faculty of Management" value={form.source_name} onChange={(e) => update('source_name', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Official notice/source URL <span className="text-red-300">*</span><input required type="url" className={field} placeholder="https://..." value={form.source_url} onChange={(e) => update('source_url', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Official application form URL<input type="url" className={field} placeholder="Leave blank only when the source page is the form" value={form.exam_url} onChange={(e) => update('exam_url', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200">Official syllabus URL<input type="url" className={field} placeholder="Optional" value={form.syllabus_url} onChange={(e) => update('syllabus_url', e.target.value)} /></label>
        <label className="text-sm font-medium text-gray-200 md:col-span-2">Eligibility summary<textarea maxLength={2000} className={`${field} min-h-28 resize-y`} placeholder="Only include requirements stated in the official source." value={form.eligibility} onChange={(e) => update('eligibility', e.target.value)} /></label>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-700 pt-4 md:col-span-2"><p className="text-xs text-gray-500">Saving updates the last-checked date. Students will only see published records.</p><button disabled={saving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"><Plus className="h-4 w-4" />{saving ? 'Saving…' : editing ? 'Save changes' : 'Add entrance exam'}</button></div>
      </form>
    </section>

    <section aria-label="Entrance exam records" className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">{loading ? <p className="py-16 text-center text-sm text-gray-400">Loading entrance exams…</p> : items.length ? <div className="divide-y divide-gray-700/60">{items.map((item) => <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-white">{item.title}</h2><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${item.status === 'published' ? 'bg-emerald-900/50 text-emerald-300' : item.status === 'closed' ? 'bg-gray-700 text-gray-300' : 'bg-amber-900/50 text-amber-300'}`}>{item.status}</span></div><p className="mt-1 text-xs text-gray-400">{item.exam_body || 'No authority listed'} · Deadline: {displayDate(item.application_deadline)} · Checked: {displayDate(item.last_verified_at)}</p></div><div className="flex flex-wrap items-center gap-2">{item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-cyan-300 hover:bg-gray-700"><ExternalLink className="h-4 w-4" />Source</a>}<select aria-label={`Change publication status for ${item.title}`} value={item.status} onChange={(e) => void changeStatus(item, e.target.value as EntranceExam['status'])} className="min-h-11 rounded-lg border border-gray-600 bg-gray-900 px-3 text-sm text-gray-100 outline-none focus:border-blue-500"><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select><button onClick={() => startEdit(item)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-600 px-3 text-sm font-semibold text-gray-200 hover:bg-gray-700"><Pencil className="h-4 w-4" />Edit</button><button aria-label={`Delete ${item.title}`} onClick={() => remove(item)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-400 hover:bg-red-900/30 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></div></article>)}</div> : <p className="py-16 text-center text-sm text-gray-500">No entrance exams added yet.</p>}</section>
    <ConfirmDialog {...dialog} onCancel={() => setDialog(CONFIRM_CLOSED)} />
    <ToastList toasts={toasts} onDismiss={dismiss} />
  </div>
}
