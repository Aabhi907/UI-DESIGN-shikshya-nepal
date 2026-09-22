'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function EmailSubscribe() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()

      if (res.ok) {
        setState('success')
        setEmail('')
      } else {
        setErrorMsg(data.error || 'Something went wrong. Try again.')
        setState('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center justify-center gap-3 py-4 px-6 bg-white rounded-sn-card border border-sn-verified max-w-md mx-auto">
        <CheckCircle className="w-5 h-5 text-sn-verified flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-bold font-nunito text-sn-verified-ink">
          You&apos;ll be notified when results drop
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" aria-hidden="true" />
          <input
            type="email"
            aria-label="Email address for result alerts"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
            placeholder="your@email.com"
            className="w-full rounded-sn-control border border-white/30 bg-white/15 pl-9 pr-3 py-3 text-sm font-nunito text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        <button
          type="submit"
          disabled={state === 'loading'}
          className="flex items-center gap-2 whitespace-nowrap rounded-sn-control bg-white px-5 py-3 text-sm font-bold font-nunito text-sn-primary-hover transition-colors hover:bg-sn-primary-bg disabled:opacity-60"
        >
          {state === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Subscribing…</>
          ) : (
            'Subscribe for result alerts'
          )}
        </button>
      </form>
      {state === 'error' && (
        <p className="mt-2 text-xs font-nunito text-white text-center">{errorMsg}</p>
      )}
      <p className="mt-2 text-xs font-nunito text-white/75 text-center">
        No spam. Unsubscribe any time. By subscribing, you accept our <Link href="/privacy" className="font-bold underline">privacy policy</Link>.
      </p>
    </div>
  )
}
