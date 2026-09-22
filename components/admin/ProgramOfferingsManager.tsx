'use client'

import { useState } from 'react'
import { ExternalLink, Pencil, Plus, X } from 'lucide-react'
import type { Program, University, UniversityProgramOffering } from '@/types'

const input = 'mt-1.5 min-h-11 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300/30'
const label = 'block text-sm font-semibold text-gray-200'
const lines = (value: string) => value.split(/[\n,]/).map(item => item.trim()).filter(Boolean)

type OfferingWithUniversity = UniversityProgramOffering & { university?: University | null }
type FormState = {
  university_id: string
  display_name: string
  duration: string
  eligibility: string
  entrance_requirements: string
  overview: string
  curriculum_highlights: string[]
  official_program_url: string
  source_name: string
  source_published_at: string
  status: UniversityProgramOffering['status']
}

const emptyForm: FormState = {
  university_id: '', display_name: '', duration: '', eligibility: '', entrance_requirements: '', overview: '',
  curriculum_highlights: [], official_program_url: '', source_name: '', source_published_at: '', status: 'draft',
}

function formFromOffering(item: OfferingWithUniversity): FormState {
  return {
    university_id: item.university_id,
    display_name: item.display_name || '',
    duration: item.duration,
    eligibility: item.eligibility || '',
    entrance_requirements: item.entrance_requirements || '',
    overview: item.overview || '',
    curriculum_highlights: item.curriculum_highlights || [],
    official_program_url: item.official_program_url,
    source_name: item.source_name,
    source_published_at: item.source_published_at?.slice(0, 10) || '',
    status: item.status,
  }
}

export default function ProgramOfferingsManager({ program, universities, initialOfferings }: { program: Program; universities: University[]; initialOfferings: OfferingWithUniversity[] }) {
  const [items, setItems] = useState(initialOfferings)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setOpen(true)
  }

  function startEdit(item: OfferingWithUniversity) {
    setEditingId(item.id)
    setForm(formFromOffering(item))
    setError('')
    setOpen(true)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const path = `/api/admin/programs/${program.id}/offerings${editingId ? `/${editingId}` : ''}`
    const response = await fetch(path, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await response.json().catch(() => ({}))
    setSaving(false)
    if (!response.ok) return setError(data.error || 'University programme details could not be saved.')
    setItems(current => editingId ? current.map(item => item.id === editingId ? data : item) : [data, ...current])
    setOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Awarding-university facts</p><h1 className="mt-2 text-2xl font-bold text-white">{program.name}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">Record duration, eligibility and entrance rules separately for each university. Only published variants appear to students.</p></div>
      <button onClick={startCreate} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-500"><Plus className="h-4 w-4"/>Add university variant</button>
    </div>

    {!items.length && !open && <div className="rounded-xl border border-amber-800 bg-amber-950/30 p-5 text-sm leading-6 text-amber-100"><strong>No university-specific facts are recorded.</strong><p className="mt-1 text-amber-100/75">The public page will continue to tell students to confirm university-specific requirements instead of presenting generic facts as universal.</p></div>}

    {items.length > 0 && <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800"><table className="min-w-[760px] w-full text-left text-sm"><thead className="border-b border-gray-700 bg-gray-900/50 text-xs uppercase tracking-wide text-gray-400"><tr><th className="px-5 py-3">University</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Evidence</th><th className="px-5 py-3"><span className="sr-only">Edit</span></th></tr></thead><tbody className="divide-y divide-gray-700">{items.map(item => <tr key={item.id}><td className="px-5 py-4 font-semibold text-white">{item.university?.name || 'University'}</td><td className="px-5 py-4 text-gray-300">{item.duration}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === 'published' ? 'bg-emerald-950 text-emerald-300' : item.status === 'archived' ? 'bg-gray-700 text-gray-300' : 'bg-amber-950 text-amber-300'}`}>{item.status}</span></td><td className="px-5 py-4 text-gray-300"><p>{item.source_name}</p><a href={item.official_program_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-white">Open source <ExternalLink className="h-3.5 w-3.5"/></a></td><td className="px-5 py-4 text-right"><button onClick={() => startEdit(item)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-600 px-3 text-xs font-bold text-white hover:border-blue-400 hover:bg-gray-700"><Pencil className="h-3.5 w-3.5"/>Edit</button></td></tr>)}</tbody></table></div>}

    {open && <form onSubmit={submit} className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-white">{editingId ? 'Edit' : 'Add'} university variant</h2><button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white" aria-label="Close form"><X className="h-5 w-5"/></button></div>
      <p className="mt-2 text-sm text-gray-400">Use the awarding university’s official programme or curriculum page. Saving refreshes the last-checked date.</p>
      {error && <p role="alert" className="mt-4 rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-200"><strong>Not saved.</strong> {error}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className={label}>Awarding university *<select required disabled={Boolean(editingId)} className={input} value={form.university_id} onChange={event => setForm({...form, university_id:event.target.value})}><option value="">Choose university</option>{universities.map(item => <option key={item.id} value={item.id}>{item.name} ({item.short_name})</option>)}</select></label>
        <label className={label}>Publication status *<select className={input} value={form.status} onChange={event => setForm({...form,status:event.target.value as FormState['status']})}><option value="draft">Draft — admin only</option><option value="published">Published — visible to students</option><option value="archived">Archived</option></select></label>
        <label className={label}>University programme name<input className={input} placeholder={program.name} value={form.display_name} onChange={event => setForm({...form,display_name:event.target.value})}/></label>
        <label className={label}>Duration *<input required className={input} placeholder="e.g. 4 years / 8 semesters" value={form.duration} onChange={event => setForm({...form,duration:event.target.value})}/></label>
        <label className={label}>Official source name *<input required className={input} placeholder="e.g. TU Faculty of Humanities" value={form.source_name} onChange={event => setForm({...form,source_name:event.target.value})}/></label>
        <label className={label}>Source publication date<input type="date" className={input} value={form.source_published_at} onChange={event => setForm({...form,source_published_at:event.target.value})}/></label>
        <label className={`${label} sm:col-span-2`}>Official HTTPS programme URL *<input required type="url" className={input} placeholder="https://university.edu.np/programme" value={form.official_program_url} onChange={event => setForm({...form,official_program_url:event.target.value})}/></label>
        <label className={`${label} sm:col-span-2`}>Overview<textarea className={input} rows={4} value={form.overview} onChange={event => setForm({...form,overview:event.target.value})}/></label>
        <label className={label}>Eligibility<textarea className={input} rows={5} value={form.eligibility} onChange={event => setForm({...form,eligibility:event.target.value})}/></label>
        <label className={label}>Entrance requirements<textarea className={input} rows={5} value={form.entrance_requirements} onChange={event => setForm({...form,entrance_requirements:event.target.value})}/></label>
        <label className={`${label} sm:col-span-2`}>Curriculum highlights<textarea className={input} rows={4} placeholder="One item per line" value={form.curriculum_highlights.join('\n')} onChange={event => setForm({...form,curriculum_highlights:lines(event.target.value)})}/></label>
      </div>
      <button disabled={saving} className="mt-5 min-h-11 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save university variant'}</button>
    </form>}
  </div>
}
