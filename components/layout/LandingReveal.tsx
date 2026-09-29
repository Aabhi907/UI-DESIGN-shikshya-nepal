'use client'

import { useEffect, useState } from 'react'

const GREETINGS = ['Find.', 'Compare.', 'Plan.', 'Decide.']
type Phase = 'intro' | 'reveal' | 'done'

export default function LandingReveal({ enabled }: { enabled: boolean }) {
  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!enabled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || sessionStorage.getItem('shikshyax-landing-reveal') === 'done') {
      setPhase('done')
      return
    }
    if (index < GREETINGS.length - 1) {
      const timer = window.setTimeout(() => setIndex(value => value + 1), 560)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(() => setPhase('reveal'), 720)
    return () => window.clearTimeout(timer)
  }, [enabled, index])

  useEffect(() => {
    if (phase !== 'reveal') return
    const timer = window.setTimeout(() => {
      sessionStorage.setItem('shikshyax-landing-reveal', 'done')
      setPhase('done')
    }, 1650)
    return () => window.clearTimeout(timer)
  }, [phase])

  if (!enabled || phase === 'done') return null

  return (
    <div className={`landing-reveal-overlay fixed inset-0 z-[500] overflow-hidden bg-[#142c35] ${phase === 'reveal' ? 'landing-reveal-open pointer-events-none' : ''}`} aria-hidden="true">
      <p key={GREETINGS[index]} className={`landing-reveal-word absolute inset-0 z-10 flex items-center justify-center px-6 text-center font-baloo text-5xl font-extrabold tracking-tight text-white sm:text-7xl ${phase === 'reveal' ? 'landing-reveal-word-out' : ''}`}>{GREETINGS[index]}</p>
      <style jsx>{`
        .landing-reveal-word { animation: landing-word 560ms cubic-bezier(.22,1,.36,1) both; }
        .landing-reveal-overlay { clip-path: ellipse(150% 112% at 50% 0%); transition: clip-path 1650ms cubic-bezier(.76,0,.24,1); will-change: clip-path; }
        .landing-reveal-open { clip-path: ellipse(150% 0% at 50% 0%); }
        .landing-reveal-word-out { animation: landing-word-out 260ms cubic-bezier(.4,0,1,1) forwards; }
        @keyframes landing-word { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes landing-word-out { to { opacity: 0; transform: translateY(-12px); } }
        @media (prefers-reduced-motion: reduce) { .landing-reveal-word { animation: none; } }
      `}</style>
    </div>
  )
}
