'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle2, Loader2, Newspaper, Users } from 'lucide-react'
import Link from 'next/link'

type State = 'idle' | 'loading' | 'success' | 'error'

export default function UpdatesAndAlerts() {
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
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        setState('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  return (
    <section className="relative overflow-hidden bg-sn-ground py-20 sm:py-28 lg:py-32">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Bold Headline with Inline Badge matching Reference */}
        <h2 className="font-baloo text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-sn-ink leading-[1.15] sm:leading-[1.12]">
          Nepal campus{' '}
          <span className="inline-flex items-center justify-center align-middle mx-1.5 sm:mx-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-black/[0.1] dark:border-white/[0.15] bg-white dark:bg-white/[0.08] shadow-sm -translate-y-0.5 sm:-translate-y-1">
            <Newspaper className="w-5 h-5 sm:w-7 sm:h-7 text-sn-ink" aria-hidden="true" />
          </span>{' '}
          updates &amp; alerts
          <br className="hidden sm:inline" />
          {' '}with one email when notices drop
        </h2>

        {/* 3D Floating Envelope Illustration */}
        <div className="relative mx-auto mt-12 sm:mt-16 w-full max-w-[340px] sm:max-w-[400px] aspect-[1.48/1] select-none">
          {/* Ambient Diffuse Shadow Below Envelope */}
          <motion.div
            animate={{
              scale: [1, 0.95, 1],
              opacity: [0.18, 0.12, 0.18],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute -bottom-7 sm:-bottom-9 left-1/2 -translate-x-1/2 w-[85%] h-10 sm:h-12 rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 70%)',
            }}
            aria-hidden="true"
          />

          {/* 3D Envelope Body with Floating Micro-Motion */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              rotateZ: [-2, -0.8, -2],
            }}
            whileHover={{
              y: -12,
              rotateZ: -0.5,
              transition: { duration: 0.3 },
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-full h-full rounded-[24px] sm:rounded-[32px] overflow-hidden border border-black/[0.08] dark:border-white/[0.14] transition-shadow duration-300"
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F6F8 100%)',
              boxShadow: '0 24px 50px -12px rgba(0, 0, 0, 0.12), 0 8px 20px -6px rgba(0, 0, 0, 0.06)',
            }}
          >
            {/* Realistic Paper Envelope SVG Folds */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 400 270"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Flap drop shadow on bottom pocket */}
                <filter id="envelopeFlapShadow" x="-10%" y="0%" width="120%" height="150%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.09" floodColor="#000000" />
                </filter>
                <linearGradient id="flapGradient" x1="200" y1="0" x2="200" y2="155" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#ECEEF3" />
                </linearGradient>
                <linearGradient id="leftFoldGradient" x1="0" y1="135" x2="200" y2="135" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E5E8EE" />
                  <stop offset="100%" stopColor="#F5F6F9" />
                </linearGradient>
                <linearGradient id="rightFoldGradient" x1="400" y1="135" x2="200" y2="135" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#E5E8EE" />
                  <stop offset="100%" stopColor="#F5F6F9" />
                </linearGradient>
                <linearGradient id="bottomPocketGradient" x1="200" y1="270" x2="200" y2="125" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F3F5F8" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>

              {/* Envelope base rect */}
              <rect width="400" height="270" rx="28" fill="#F4F6F9" />

              {/* Left side triangle fold */}
              <path d="M 0 0 L 200 138 L 0 270 Z" fill="url(#leftFoldGradient)" opacity="0.65" />

              {/* Right side triangle fold */}
              <path d="M 400 0 L 200 138 L 400 270 Z" fill="url(#rightFoldGradient)" opacity="0.65" />

              {/* Bottom pocket fold */}
              <path d="M 0 270 L 200 128 L 400 270 Z" fill="url(#bottomPocketGradient)" />

              {/* Soft bottom crease line */}
              <path d="M 0 270 L 200 128 L 400 270" stroke="rgba(0, 0, 0, 0.05)" strokeWidth="1.2" />

              {/* Top flap fold pointing down over the pocket */}
              <path
                d="M 0 0 L 200 152 L 400 0 Z"
                fill="url(#flapGradient)"
                filter="url(#envelopeFlapShadow)"
                stroke="rgba(0, 0, 0, 0.04)"
                strokeWidth="1"
              />
            </svg>

            {/* Inscribed micro-text on bottom of envelope matching reference */}
            <div className="absolute bottom-6 sm:bottom-7 left-0 right-0 text-center pointer-events-none z-10 px-4">
              <p className="text-[11px] sm:text-xs font-nunito font-semibold tracking-wide text-slate-500/90">
                From Students → For Students
              </p>
            </div>
          </motion.div>
        </div>

        {/* Capsule Input Bar matching Reference */}
        <div className="relative mx-auto mt-7 sm:mt-9 max-w-md w-full">
          {state === 'success' ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-white dark:bg-[#151518] border border-emerald-500/30 dark:border-[#CAFFA6]/30 shadow-lg text-emerald-800 dark:text-[#CAFFA6]"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm font-bold font-nunito">
                You&apos;re subscribed! We&apos;ll notify you when notices drop.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="group relative flex items-center rounded-full bg-white dark:bg-[#151518] p-1.5 sm:p-2 border border-black/[0.1] dark:border-white/[0.15] shadow-[0_10px_28px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.4)] transition-all focus-within:border-black/30 dark:focus-within:border-white/40 focus-within:shadow-[0_12px_36px_rgba(0,0,0,0.1)]"
            >
              <input
                type="email"
                aria-label="Your best email address"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (state === 'error') setState('idle')
                }}
                placeholder="Your Best Email"
                className="w-full flex-1 bg-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-nunito text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#121316] hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#121316] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold font-nunito transition-all active:scale-95 disabled:opacity-60 shadow-sm"
              >
                {state === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Joining…</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" aria-hidden="true" />
                    <span>Join Now</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Error Message */}
          {state === 'error' && (
            <p className="mt-2.5 text-xs font-nunito font-semibold text-rose-600 dark:text-rose-400 text-center">
              {errorMsg}
            </p>
          )}

          {/* Social Proof Counter matching Reference: "👥 Join 2,500 Designers" */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-nunito font-medium text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true" />
            <span>Join 14,000+ Nepali Students</span>
          </div>

          {/* Privacy Note */}
          <p className="mt-3 text-[11px] font-nunito text-slate-400 dark:text-slate-500 text-center">
            No spam. Unsubscribe anytime. View our{' '}
            <Link href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
