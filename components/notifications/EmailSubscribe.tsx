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
      <div className="flex items-center justify-center gap-3 py-4 px-6 bg-[#151518] rounded-sn-card border border-[#CAFFA6]/30 max-w-md mx-auto">
        <CheckCircle className="w-5 h-5 text-[#CAFFA6] flex-shrink-0" aria-hidden="true" />
        <p className="text-sm font-bold font-nunito text-[#CAFFA6]">
          You&apos;ll be notified when results drop
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sn-ink-muted pointer-events-none" aria-hidden="true" />
          <input
            type="email"
            aria-label="Email address for result alerts"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
            placeholder="your@email.com"
            className="w-full rounded-sn-control border border-white/[0.1] bg-[#151518] pl-9 pr-3 py-3 text-sm font-nunito text-[#f5f5f6] placeholder-sn-ink-muted focus:outline-none focus:ring-2 focus:ring-sn-primary/40 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
          />
        </div>
        <button
          type="submit"
          disabled={state === 'loading'}
          className="flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-sn-control bg-sn-primary px-5 py-3 text-sm font-bold font-nunito text-white shadow-sn-button hover:bg-sn-primary-hover disabled:opacity-60 motion-control"
        >
          {state === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Subscribing…</>
          ) : (
            'Subscribe for alerts'
          )}
        </button>
      </form>
      {state === 'error' && (
        <p className="mt-2 text-xs font-nunito text-sn-danger text-center">{errorMsg}</p>
      )}
      <p className="mt-2.5 text-xs font-nunito text-sn-ink-muted text-center">
        No spam. Unsubscribe any time. By subscribing, you accept our <Link href="/privacy" className="font-bold text-sn-ink underline hover:text-sn-primary">privacy policy</Link>.
      </p>
    </div>
  )
}
