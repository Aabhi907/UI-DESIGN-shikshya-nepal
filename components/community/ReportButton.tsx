'use client'

import { useState } from 'react'

export default function ReportButton({ targetType, targetId }: { targetType: 'post' | 'comment'; targetId: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  async function report() {
    if (state === 'sending' || state === 'done') return
    setState('sending')
    try {
      const response = await fetch('/api/community/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target_type: targetType, target_id: targetId, reason: 'other' }) })
      setState(response.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }
  const label = state === 'done' ? 'Reported for review' : state === 'sending' ? 'Sending report…' : state === 'error' ? 'Try reporting again' : 'Report'
  return <div className="inline-flex flex-col items-start gap-1"><button type="button" onClick={report} disabled={state === 'sending' || state === 'done'} aria-busy={state === 'sending'} className="text-xs font-semibold text-gray-400 hover:text-red-600 disabled:cursor-default disabled:hover:text-gray-400">{label}</button>{state === 'error' && <p role="alert" className="text-xs text-red-700">The report could not be sent. Please try again.</p>}</div>
}
