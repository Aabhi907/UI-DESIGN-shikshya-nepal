'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Save } from 'lucide-react'

type Item = {
  id: string
  program_id: string
  university_program_offering_id: string | null
  fee: number | null
  fee_period: string
  fee_academic_year: string | null
  fee_source_url: string | null
  fee_last_verified_at: string | null
  program: { name: string; degree_level: string } | null
}

type Offering = {
  id: string
  program_id: string
  duration: string
  status: 'draft' | 'published'
  university: { id: string; name: string; short_name: string } | null
}

const periods = [['unknown', 'Period not documented'], ['monthly', 'Monthly'], ['semester', 'Per semester'], ['annual', 'Annual'], ['total_program', 'Total programme'], ['one_time', 'One-time']]

export default function CollegeProgramFees({ collegeId }: { collegeId: string }) {
  const [items, setItems] = useState<Item[]>([])
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`/api/admin/colleges/${collegeId}/program-fees`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setItems(data.items || [])
        setOfferings(data.offerings || [])
      })
      .catch(error => setMessage(error.message))
      .finally(() => setLoading(false))
  }, [collegeId])

  const set = (id: string, key: keyof Item, value: string | number | null) => setItems(all => all.map(item => item.id === id ? { ...item, [key]: value } : item))

  async function save(item: Item) {
    setSaving(item.id)
    setMessage('')
    const response = await fetch(`/api/admin/colleges/${collegeId}/program-fees`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    const data = await response.json().catch(() => ({}))
    setSaving('')
    setMessage(response.ok ? `${item.program?.name || 'Programme'} evidence saved.` : data.error || 'Programme evidence could not be saved.')
  }

  const field = 'min-h-11 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500'

  return <section className="mx-8 mb-10 max-w-4xl rounded-xl border border-gray-700 bg-gray-800 p-5 text-gray-100">
    <h2 className="text-lg font-bold text-white">Programme and fee evidence</h2>
    <p className="mt-1 text-sm leading-6 text-gray-400">Match every college programme to its exact awarding-university variant. Record fees with their payment period, intake, source and checked date.</p>
    {message && <p role="status" className="mt-4 rounded-lg bg-gray-900 p-3 text-sm text-amber-200">{message}</p>}
    {loading ? <p className="mt-5 text-sm text-gray-400">Loading programme evidence…</p> : <div className="mt-5 space-y-4">{items.map(item => {
      const choices = offerings.filter(offering => offering.program_id === item.program_id)
      const selected = choices.find(offering => offering.id === item.university_program_offering_id)
      return <article key={item.id} className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{item.program?.name || 'Programme'}</h3><span className="text-xs text-gray-500">{item.program?.degree_level}</span></div>
        <div className="mt-4 rounded-lg border border-gray-700 bg-gray-900 p-3">
          <label className="text-xs font-semibold text-gray-300">Awarding-university variant<select value={item.university_program_offering_id || ''} onChange={event => set(item.id, 'university_program_offering_id', event.target.value || null)} className={field}><option value="">Not matched yet</option>{choices.map(offering => <option key={offering.id} value={offering.id}>{offering.university?.name || 'University'} — {offering.duration}{offering.status === 'draft' ? ' (draft)' : ''}</option>)}</select></label>
          {!choices.length ? <p className="mt-2 flex gap-2 text-xs leading-5 text-amber-300"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/>Create a university variant from the Programmes admin area before matching this college.</p> : selected ? <p className="mt-2 flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4"/>{selected.university?.short_name || 'University'} variant selected.</p> : <p className="mt-2 text-xs text-amber-300">Students will see the programme, but university-specific duration and entry rules will remain unconfirmed.</p>}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-gray-300">Fee amount (NPR)<input type="number" min="0" inputMode="numeric" value={item.fee ?? ''} onChange={event => set(item.id, 'fee', event.target.value === '' ? null : Number(event.target.value))} className={field}/></label>
          <label className="text-xs font-semibold text-gray-300">Payment period<select value={item.fee_period || 'unknown'} onChange={event => set(item.id, 'fee_period', event.target.value)} className={field}>{periods.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-xs font-semibold text-gray-300">Academic year / intake<input value={item.fee_academic_year || ''} onChange={event => set(item.id, 'fee_academic_year', event.target.value)} placeholder="2083/84" className={field}/></label>
          <label className="text-xs font-semibold text-gray-300">Last checked<input type="date" value={item.fee_last_verified_at?.slice(0, 10) || ''} onChange={event => set(item.id, 'fee_last_verified_at', event.target.value)} className={field}/></label>
          <label className="text-xs font-semibold text-gray-300 md:col-span-2">Official fee source<input type="url" value={item.fee_source_url || ''} onChange={event => set(item.id, 'fee_source_url', event.target.value)} placeholder="https://" className={field}/></label>
        </div>
        <button onClick={() => void save(item)} disabled={saving === item.id} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white disabled:opacity-60">{saving === item.id ? <Save className="h-4 w-4 animate-pulse"/> : <CheckCircle2 className="h-4 w-4"/>}{saving === item.id ? 'Saving…' : 'Save programme evidence'}</button>
      </article>
    })}{!items.length && <p className="rounded-lg border border-dashed border-gray-700 p-5 text-sm text-gray-400">No programmes are linked to this college yet. Link programmes before entering university or fee evidence.</p>}</div>}
  </section>
}
