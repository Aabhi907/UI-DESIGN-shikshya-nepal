'use client'

import { useState, useRef, FormEvent } from 'react'
import { X, Send, CheckCircle, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useDialogFocus } from '@/components/motion'

interface Program {
  name: string
}

interface Props {
  collegeName: string
  collegeId:   string
  isSponsored: boolean
  programs:    Program[]
  onClose:     () => void
}

export default function ApplyNowModal({
  collegeName, collegeId, isSponsored, programs, onClose,
}: Props) {
  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    email:   '',
    program: '',
    message: '',
    website: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [reference,setReference]=useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [errors,   setErrors]   = useState<Record<string, string>>({})
  const [consent, setConsent] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  useDialogFocus({ open: true, dialogRef, initialFocusRef: closeRef, onEscape: onClose })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim())    errs.name    = 'Full name is required'
    if (!form.phone.trim())   errs.phone   = 'Phone number is required'
    else if (!/^[9][6-9]\d{8}$|^\d{2}-\d{6,7}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid Nepali phone number'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address'
    if (!form.program)        errs.program = 'Please select a program'
    if (!consent) errs.consent = 'Please confirm that we may use these details for this enquiry'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch('/api/apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, consent, college_id: collegeId, college_name: collegeName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setReference(typeof data.reference==='string'?data.reference:'')
      setSuccess(true)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `min-h-11 w-full rounded-sn-control border px-3.5 py-2.5 text-sm font-nunito text-sn-ink placeholder:text-sn-ink-muted
     focus:outline-none focus:ring-2 focus:ring-sn-primary/20 focus:border-sn-primary transition-colors
     ${errors[field] ? 'border-sn-confirm bg-sn-confirm-bg' : 'border-sn-border-strong bg-sn-surface'}`

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="admission-enquiry-title">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="motion-scrim-enter absolute inset-0 bg-sn-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div ref={dialogRef} className="motion-sheet-enter relative w-full sm:max-w-md bg-sn-surface sm:rounded-sn-card rounded-t-sn-card shadow-sn-float
                      max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-sn-surface border-b border-sn-border px-6 py-4 flex items-start justify-between z-10 sm:rounded-t-sn-card rounded-t-sn-card">
          <div>
            <h2 id="admission-enquiry-title" className="font-baloo font-bold text-sn-ink text-lg leading-tight">
              Ask {collegeName} about admission
            </h2>
            <p className="text-xs font-nunito text-sn-ink-muted mt-0.5">
              Send an enquiry through SikshyaNepal. This is not an official application or seat confirmation.
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close admission enquiry"
            className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sn-surface-alt hover:opacity-80 transition-opacity"
          >
            <X className="w-4 h-4 text-sn-ink-soft" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Commercial placement disclosure; verification and review scores remain independent. */}
          {isSponsored && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sn-confirm-bg border border-sn-confirm/40 rounded-sn-control mb-5 w-fit">
              <Star className="w-3.5 h-3.5 text-sn-confirm fill-sn-confirm" />
              <span className="text-xs font-bold font-nunito text-sn-confirm-ink">Sponsored placement</span>
            </div>
          )}

          {success ? (
            /* ── Success state ─────────────────────────────── */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-sn-verified-bg rounded-sn-card flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-sn-verified" />
              </div>
              <h3 className="font-baloo font-bold text-sn-ink text-xl mb-2">
                Enquiry received
              </h3>
              <p className="text-sm font-nunito text-sn-ink-soft leading-relaxed mb-1">
                Your request for <span className="font-bold text-sn-ink">{collegeName}</span> has been recorded with the phone number{' '}
                <span className="font-bold text-sn-primary">{form.phone}</span>.
              </p>
              <p className="mt-2 text-xs leading-5 font-nunito text-sn-ink-muted">Response times vary. For an urgent deadline, use the official phone, email or website shown on the college profile.</p>
              {reference&&<p className="mt-3 rounded-sn-control bg-sn-surface-alt px-3 py-2 text-xs font-nunito text-sn-ink-soft">Enquiry reference: <strong className="text-sn-ink">{reference}</strong></p>}
              <button
                onClick={onClose}
                className="motion-control focus-ring mt-6 flex min-h-11 w-full items-center justify-center rounded-sn-control bg-sn-surface-alt text-sm font-bold font-nunito text-sn-ink hover:bg-sn-surface-alt/80"
              >
                Close
              </button>
            </div>
          ) : (
            /* ── Form ─────────────────────────────────────── */
            <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
              <section aria-label="What happens next" className="border-l-2 border-sn-primary bg-sn-primary-bg px-3 py-3">
                <p className="text-xs font-bold font-nunito uppercase tracking-[0.11em] text-sn-primary-hover">What happens next</p>
                <ol className="mt-2 space-y-1 text-xs leading-5 font-nunito text-sn-ink-soft">
                  <li><span className="font-bold text-sn-ink">1. Send your enquiry.</span> SikshyaNepal records it for {collegeName}&apos;s admissions team.</li>
                  <li><span className="font-bold text-sn-ink">2. Confirm independently.</span> Check the official notice before sending documents or payment.</li>
                  <li><span className="font-bold text-sn-ink">3. Keep control.</span> Use the official college contact details for urgent deadlines.</li>
                </ol>
              </section>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="admission-website">Leave this field empty</label>
                <input id="admission-website" name="website" type="text" value={form.website} onChange={event => set('website', event.target.value)} tabIndex={-1} autoComplete="off" />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="admission-name" className="block text-sm font-bold font-nunito text-sn-ink mb-1.5">
                  Full Name <span className="text-sn-confirm-ink">*</span>
                </label>
                <input
                  id="admission-name"
                  type="text"
                  autoComplete="name"
                  maxLength={100}
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Ram Sharma"
                  className={inputClass('name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'admission-name-error' : undefined}
                />
                {errors.name && <p id="admission-name-error" role="alert" className="text-xs font-nunito text-sn-confirm-ink mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="admission-phone" className="block text-sm font-bold font-nunito text-sn-ink mb-1.5">
                  Phone Number <span className="text-sn-confirm-ink">*</span>
                </label>
                <input
                  id="admission-phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="98XXXXXXXX"
                  className={inputClass('phone')}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'admission-phone-error' : 'admission-phone-help'}
                />
                <p id="admission-phone-help" className="text-xs font-nunito text-sn-ink-muted mt-1">Used only to respond to this admission enquiry</p>
                {errors.phone && <p id="admission-phone-error" role="alert" className="text-xs font-nunito text-sn-confirm-ink mt-0.5">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="admission-email" className="block text-sm font-bold font-nunito text-sn-ink mb-1.5">
                  Email Address <span className="text-sn-ink-muted font-normal">(optional)</span>
                </label>
                <input
                  id="admission-email"
                  type="email"
                  autoComplete="email"
                  maxLength={160}
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="youremail@example.com"
                  className={inputClass('email')}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'admission-email-error' : undefined}
                />
                {errors.email && <p id="admission-email-error" role="alert" className="mt-1 text-xs font-nunito text-sn-confirm-ink">{errors.email}</p>}
              </div>

              {/* Program */}
              <div>
                <label htmlFor="admission-program" className="block text-sm font-bold font-nunito text-sn-ink mb-1.5">
                  Program Interested In <span className="text-sn-confirm-ink">*</span>
                </label>
                <select
                  id="admission-program"
                  value={form.program}
                  onChange={e => set('program', e.target.value)}
                  className={inputClass('program')}
                  aria-invalid={Boolean(errors.program)}
                  aria-describedby={errors.program ? 'admission-program-error' : undefined}
                >
                  <option value="">Select a program…</option>
                  {programs.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
                {errors.program && <p id="admission-program-error" role="alert" className="text-xs font-nunito text-sn-confirm-ink mt-1">{errors.program}</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="admission-message" className="block text-sm font-bold font-nunito text-sn-ink mb-1.5">
                  Your Message <span className="text-sn-ink-muted font-normal">(optional)</span>
                </label>
                <textarea
                  id="admission-message"
                  value={form.message}
                  onChange={e => set('message', e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Any questions or specific requirements?"
                  className={inputClass('message') + ' resize-none'}
                />
                <p className="text-xs font-nunito text-sn-ink-muted mt-0.5 text-right">{form.message.length}/300</p>
              </div>

              {apiError && (
                <div role="alert" className="bg-sn-confirm-bg border border-sn-confirm/40 rounded-sn-control px-4 py-3 text-sm font-nunito text-sn-confirm-ink">
                  {apiError}
                </div>
              )}

              <div>
                <label className="flex items-start gap-3 rounded-sn-control border border-sn-border-strong bg-sn-surface-alt p-3 text-xs leading-5 font-nunito text-sn-ink-soft">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={event => { setConsent(event.target.checked); setErrors(current => ({ ...current, consent: '' })) }}
                    className="mt-1 h-4 w-4 shrink-0 accent-sn-primary"
                    aria-invalid={Boolean(errors.consent)}
                    aria-describedby={errors.consent ? 'admission-consent-error' : undefined}
                  />
                  <span>I agree that SikshyaNepal may store these details and share them with {collegeName} only so the institution can respond to this enquiry. I have read the <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-bold text-sn-primary underline">Privacy Policy</Link>.</span>
                </label>
                {errors.consent && <p id="admission-consent-error" role="alert" className="mt-1 text-xs font-nunito text-sn-confirm-ink">{errors.consent}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="motion-control focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-sn-control bg-sn-primary py-3 text-sm font-bold font-nunito text-white shadow-sn-button hover:bg-sn-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send admission enquiry</>
                }
              </button>

              <p className="text-center text-xs font-nunito text-sn-ink-muted">
                Do not include citizenship numbers, marksheets, passwords or payment details.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
