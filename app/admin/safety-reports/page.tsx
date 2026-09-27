'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, CheckCircle2, MailWarning } from 'lucide-react'

type Report = {
  id: string
  concern_type: 'safety' | 'privacy' | 'other'
  source_page: 'safety' | 'privacy'
  message: string
  contact: string | null
  status: 'open' | 'resolved'
  email_sent: boolean
  created_at: string
}

export default function SafetyReportsPage() {
  const [items, setItems] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showResolved, setShowResolved] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/safety-reports', { cache: 'no-store' })
      .then(async (r) => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error)
        setItems(d)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function resolve(item: Report) {
    setBusy(item.id)
    setError('')
    const r = await fetch(`/api/admin/safety-reports/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: item.status === 'open' ? 'resolved' : 'open' }),
    })
    if (!r.ok) {
      setBusy(null)
      return setError('Update failed.')
    }
    const updated = await r.json()
    setItems((all) => all.map((x) => (x.id === updated.id ? updated : x)))
    setBusy(null)
  }

  const openCount = items.filter((i) => i.status === 'open').length
  const shown = items.filter((i) => (showResolved ? true : i.status === 'open'))

  return (
    <div className="p-5 text-gray-100 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldAlert className="h-6 w-6 text-amber-400" />
            Safety &amp; privacy reports
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">
            Interim reports collected from the safety and privacy pages while the sikshyanepal.com email domain is
            unregistered. Review these directly; move to the working email route once the domain is live (Build Brief 10).
          </p>
        </div>
        <p className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-400">{openCount} open</p>
      </div>

      {error && <p role="alert" className="mt-5 rounded-lg bg-red-950/50 p-3 text-red-300">{error}</p>}

      {!loading && (
        <>
          <div className="mt-6 flex gap-2" role="group" aria-label="Filter safety reports">
            <button
              onClick={() => setShowResolved(false)}
              aria-pressed={!showResolved}
              className={`min-h-11 rounded-lg px-4 text-sm font-bold ${!showResolved ? 'bg-blue-600 text-white' : 'border border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'}`}
            >
              Open
            </button>
            <button
              onClick={() => setShowResolved(true)}
              aria-pressed={showResolved}
              className={`min-h-11 rounded-lg px-4 text-sm font-bold ${showResolved ? 'bg-blue-600 text-white' : 'border border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'}`}
            >
              All
            </button>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {shown.map((item) => (
              <article key={item.id} className={`rounded-xl border bg-gray-800 p-5 ${item.status === 'open' ? 'border-amber-700' : 'border-gray-700'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-900/50 px-2 py-1 text-[10px] font-bold uppercase text-amber-300">{item.concern_type}</span>
                    <span className="text-xs text-gray-400">from /{item.source_page}</span>
                    {!item.email_sent && (
                      <span className="inline-flex items-center gap-1 rounded bg-red-950 px-2 py-1 text-[10px] font-bold text-red-300">
                        <MailWarning className="h-3 w-3" /> email not sent
                      </span>
                    )}
                    {item.status === 'resolved' && (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 px-2 py-1 text-[10px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <button
                    disabled={busy === item.id}
                    onClick={() => void resolve(item)}
                    className="min-h-11 rounded-lg border border-gray-600 bg-gray-700 px-3 text-xs font-bold text-gray-100 disabled:opacity-50"
                  >
                    {item.status === 'open' ? 'Mark resolved' : 'Reopen'}
                  </button>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-300">{item.message}</p>
                <div className="mt-4 border-t border-gray-700 pt-3 text-xs leading-5 text-gray-500">
                  Contact: {item.contact || 'none provided'}
                  <br />
                  {new Date(item.created_at).toLocaleString('en-NP')}
                </div>
              </article>
            ))}
            {!shown.length && <p className="rounded-xl border border-gray-700 bg-gray-800 p-8 text-sm text-gray-500">No reports in this view.</p>}
          </div>
        </>
      )}
      {loading && <p className="py-16 text-gray-500">Loading reports…</p>}
    </div>
  )
}
