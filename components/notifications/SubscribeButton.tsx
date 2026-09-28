'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, CheckCircle2, Loader2, Mail, X } from 'lucide-react'
import { useDialogFocus } from '@/components/motion'

type Variant = 'float' | 'header'
type SubscriptionState = 'idle' | 'loading' | 'success' | 'error'

interface Props {
  variant: Variant
}

/**
 * Result alerts are email subscriptions, not browser push notifications.
 * This keeps the promise visible to students aligned with the delivery service
 * that is actually configured and avoids a broken third-party push prompt.
 */
export default function SubscribeButton({ variant }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [email, setEmail] = useState('')
  const [state, setState] = useState<SubscriptionState>('idle')
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setSubscribed(localStorage.getItem('sn_email_alert_subscribed') === '1')
    setDismissed(localStorage.getItem('sn_alert_prompt_dismissed') === '1')
  }, [])

  const handleDismiss = useCallback(() => {
    setModalOpen(false)
    setDismissed(true)
    localStorage.setItem('sn_alert_prompt_dismissed', '1')
  }, [])

  useDialogFocus({ open: modalOpen, dialogRef, initialFocusRef: closeRef, onEscape: handleDismiss })

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = email.trim().toLowerCase()
    if (!address) {
      setError('Enter your email address to receive alerts.')
      setState('error')
      return
    }

    setState('loading')
    setError('')

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: address }),
      })
      const payload = await response.json().catch(() => ({})) as { error?: string }

      if (!response.ok) {
        setError(payload.error || 'We could not save your alert request. Please try again.')
        setState('error')
        return
      }

      localStorage.setItem('sn_email_alert_subscribed', '1')
      localStorage.setItem('sn_alert_prompt_dismissed', '1')
      setSubscribed(true)
      setDismissed(true)
      setEmail('')
      setState('success')
    } catch {
      setError('Your connection interrupted the request. Please try again.')
      setState('error')
    }
  }, [email])

  const modal = modalOpen && (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="notification-dialog-title">
      <button aria-label="Close notification dialog" className="motion-scrim-enter absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm" onClick={handleDismiss} />

      <div ref={dialogRef} className="motion-dialog-enter relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button
          ref={closeRef}
          type="button"
          onClick={handleDismiss}
          aria-label="Close notification dialog"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <Bell aria-hidden="true" className="h-7 w-7 text-blue-700" />
        </div>

        <h3 id="notification-dialog-title" className="mb-2 text-center text-lg font-bold text-slate-950">
          Get result and notice alerts
        </h3>
        <p className="mb-5 text-center text-sm leading-5 text-slate-600">
          Enter your email and we&apos;ll send an alert when SikshyaNepal publishes a TU, KU, NEB or CTEVT update.
        </p>

        {state === 'success' ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center" role="status">
            <CheckCircle2 aria-hidden="true" className="mx-auto mb-1 h-5 w-5 text-emerald-700" />
            <p className="text-sm font-semibold text-emerald-900">Email alerts are on.</p>
            <p className="mt-1 text-xs leading-5 text-emerald-800">You can unsubscribe at any time from an alert email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="result-alert-email" className="mb-1.5 block text-sm font-semibold text-slate-800">Email address</label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Mail aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  id="result-alert-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); if (state === 'error') setState('idle') }}
                  aria-describedby={error ? 'result-alert-error' : 'result-alert-help'}
                  aria-invalid={state === 'error'}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-950 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                type="submit"
                disabled={state === 'loading'}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state === 'loading' && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
                {state === 'loading' ? 'Saving' : 'Get alerts'}
              </button>
            </div>
            {error ? (
              <p id="result-alert-error" role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm leading-5 text-red-800">{error}</p>
            ) : (
              <p id="result-alert-help" className="mt-3 text-xs leading-5 text-slate-500">No spam. You can unsubscribe at any time.</p>
            )}
          </form>
        )}

        <button type="button" onClick={handleDismiss} className="mt-4 w-full rounded-lg py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          {state === 'success' ? 'Done' : 'Maybe later'}
        </button>
      </div>
    </div>
  )

  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={() => !subscribed && setModalOpen(true)}
          title={subscribed ? 'Email alerts enabled' : 'Get result and notice alerts'}
          aria-label={subscribed ? 'Email alerts enabled' : 'Get result and notice alerts'}
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 ${subscribed ? 'cursor-default bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
        >
          <Bell aria-hidden="true" className="h-5 w-5" />
        </button>
        {modal}
      </>
    )
  }

  if (subscribed || dismissed) return null

  return (
    <>
      <button type="button" onClick={() => setModalOpen(true)} className="fixed bottom-20 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 lg:hidden">
        <Bell aria-hidden="true" className="h-4 w-4" />
        Get alerts
      </button>
      {modal}
    </>
  )
}
