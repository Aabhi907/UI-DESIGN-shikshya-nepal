'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Program } from '@/types'

const levels: Program['degree_level'][] = ['+2', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate']
const lines = (value: string) => value.split(/[,\n]/).map(item => item.trim()).filter(Boolean)
const input = 'mt-1.5 min-h-11 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300/30'
const label = 'block text-sm font-semibold text-gray-200'

export default function ProgramForm({ initialData, id }: { initialData?: Partial<Program>; id?: string }) {
  const router = useRouter()
  const [form, setForm] = useState({
    ...initialData,
    name: initialData?.name || '', slug: initialData?.slug || '', duration: initialData?.duration || '',
    degree_level: initialData?.degree_level || 'bachelor', faculty: initialData?.faculty || '',
    overview: initialData?.overview || '', eligibility: initialData?.eligibility || '', entrance_requirements: initialData?.entrance_requirements || '',
    curriculum_highlights: initialData?.curriculum_highlights || [], career_paths: initialData?.career_paths || [],
    average_fee_min: initialData?.average_fee_min || '', average_fee_max: initialData?.average_fee_max || '', source_url: initialData?.source_url || '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSaving(true)
    const response = await fetch(id ? `/api/admin/programs/${id}` : '/api/admin/programs', {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, average_fee_min: form.average_fee_min === '' ? null : Number(form.average_fee_min), average_fee_max: form.average_fee_max === '' ? null : Number(form.average_fee_max) }),
    })
    const data = await response.json().catch(() => ({}))
    setSaving(false)
    if (!response.ok) return setError(data.error || 'Programme could not be saved. Check the source and required fields, then try again.')
    router.push('/admin/programs')
    router.refresh()
  }

  return <form onSubmit={submit} className="max-w-4xl space-y-5 p-8 text-white">
    <div><h1 className="text-2xl font-bold">{id ? 'Edit' : 'Add'} programme</h1><p className="mt-1 text-sm leading-6 text-gray-400">Programme facts are student-facing. Save them only with a current official source.</p></div>
    {error && <div role="alert" className="rounded-lg border border-red-800 bg-red-950/50 p-3 text-sm text-red-200"><strong>Programme not saved.</strong> {error}</div>}
    <div className="grid gap-4 rounded-xl bg-gray-800 p-6 sm:grid-cols-2">
      <label className={label}>Programme name *<input required className={input} value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
      <label className={label}>Slug <input className={input} placeholder="Generated from the name if blank" value={form.slug} onChange={event => setForm({ ...form, slug: event.target.value })} /></label>
      <label className={label}>Study level *<select className={input} value={form.degree_level} onChange={event => setForm({ ...form, degree_level: event.target.value as Program['degree_level'] })}>{levels.map(level => <option key={level} value={level}>{level === '+2' ? '+2' : level[0].toUpperCase() + level.slice(1)}</option>)}</select></label>
      <label className={label}>Faculty / field *<input required className={input} value={form.faculty} onChange={event => setForm({ ...form, faculty: event.target.value })} /></label>
      <label className={label}>Duration *<input required className={input} placeholder="e.g. 4 Years" value={form.duration} onChange={event => setForm({ ...form, duration: event.target.value })} /></label>
      <label className={label}>Official HTTPS source URL *<input required type="url" className={input} placeholder="https://university.edu.np/programme" value={form.source_url} onChange={event => setForm({ ...form, source_url: event.target.value })} /></label>
      <p className="sm:col-span-2 -mt-1 text-xs leading-5 text-gray-400">The source must support the programme’s name, level and duration. Saving refreshes its last-checked date.</p>
      <label className={`${label} sm:col-span-2`}>Overview<textarea className={input} rows={5} value={form.overview} onChange={event => setForm({ ...form, overview: event.target.value })} /></label>
      <label className={label}>Eligibility<textarea className={input} rows={4} value={form.eligibility} onChange={event => setForm({ ...form, eligibility: event.target.value })} /></label>
      <label className={label}>Entrance requirements<textarea className={input} rows={4} value={form.entrance_requirements} onChange={event => setForm({ ...form, entrance_requirements: event.target.value })} /></label>
      <label className={label}>Curriculum highlights <textarea className={input} rows={4} placeholder="One item per line" value={form.curriculum_highlights.join('\n')} onChange={event => setForm({ ...form, curriculum_highlights: lines(event.target.value) })} /></label>
      <label className={label}>Career paths <textarea className={input} rows={4} placeholder="One item per line" value={form.career_paths.join('\n')} onChange={event => setForm({ ...form, career_paths: lines(event.target.value) })} /></label>
      <label className={label}>Typical minimum fee (NPR)<input type="number" min="0" className={input} value={form.average_fee_min} onChange={event => setForm({ ...form, average_fee_min: event.target.value })} /></label>
      <label className={label}>Typical maximum fee (NPR)<input type="number" min="0" className={input} value={form.average_fee_max} onChange={event => setForm({ ...form, average_fee_max: event.target.value })} /></label>
    </div>
    <button disabled={saving} className="min-h-11 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving programme…' : 'Save programme'}</button>
  </form>
}
