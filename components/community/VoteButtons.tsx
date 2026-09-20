'use client'

import { useState } from 'react'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'

export default function VoteButtons({ targetType, targetId, initialScore = 0 }: { targetType: 'post' | 'comment'; targetId: string; initialScore?: number }) {
  const [score, setScore] = useState(initialScore)
  const [choice, setChoice] = useState<-1 | 0 | 1>(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function vote(value: -1 | 1) {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/community/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target_type: targetType, target_id: targetId, value }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || typeof result.score !== 'number') {
        setError(result.error || 'Your vote could not be saved. Please try again.')
        return
      }
      setScore(result.score)
      setChoice(current => current === value ? 0 : value)
    } catch {
      setError('We could not reach SikshyaNepal. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }
  return <div className="inline-flex flex-col items-start gap-1"><div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-0.5" aria-label={`Vote score ${score}`}><button type="button" disabled={busy} onClick={()=>void vote(1)} aria-label="Helpful" aria-pressed={choice===1} aria-busy={busy} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait ${choice===1?'bg-blue-100 text-blue-700':'text-gray-400 hover:text-blue-700'}`}><ArrowBigUp className="h-4 w-4"/></button><span aria-live="polite" className="min-w-7 text-center text-xs font-bold text-gray-700">{score}</span><button type="button" disabled={busy} onClick={()=>void vote(-1)} aria-label="Not helpful" aria-pressed={choice===-1} aria-busy={busy} className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait ${choice===-1?'bg-red-100 text-red-700':'text-gray-400 hover:text-red-700'}`}><ArrowBigDown className="h-4 w-4"/></button></div>{error && <p role="alert" className="max-w-56 text-xs leading-5 text-red-700">{error}</p>}</div>
}
