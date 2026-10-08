'use client'

import { useEffect, useState, useRef } from 'react'
import { ShieldCheck } from 'lucide-react'

interface TrustStripProps {
  collegeCount?: number
  programCount?: number
}

function useCountUp(target: number, durationMs = 1200, isVisible = false): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    if (target <= 0) {
      setCount(0)
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target)
      return
    }

    let start = 0
    const stepTime = 16
    const steps = Math.max(Math.floor(durationMs / stepTime), 1)
    const increment = target / steps

    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [target, durationMs, isVisible])

  return count
}

export default function TrustStrip({ collegeCount = 0, programCount = 0 }: TrustStripProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasAppeared, setHasAppeared] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAppeared(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const colleges = useCountUp(collegeCount, 1200, hasAppeared)
  const programs = useCountUp(programCount, 1200, hasAppeared)

  return (
    <div
      ref={containerRef}
      className="relative z-10 w-full pt-4 pb-1 sm:pt-5 border-t border-black/[0.06] dark:border-white/[0.08]"
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center text-xs font-nunito text-slate-500 dark:text-slate-400">
        {/* University Monograms in muted grayscale */}
        <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <span className="inline-flex h-5 w-7 items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
            TU
          </span>
          <span className="inline-flex h-5 w-7 items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
            KU
          </span>
          <span className="inline-flex h-5 w-7 items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
            PU
          </span>
          <span className="inline-flex h-5 w-7 items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
            NEB
          </span>
        </div>

        <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">•</span>

        {/* Quiet Trust Data Line */}
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {collegeCount > 0 && <span>
            <strong className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {colleges.toLocaleString()}+
            </strong>{' '}
            colleges
          </span>}
          {collegeCount > 0 && programCount > 0 && <span className="text-slate-300 dark:text-slate-700">·</span>}
          {programCount > 0 && <span>
            <strong className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {programs.toLocaleString()}+
            </strong>{' '}
            programs
          </span>}
          {(collegeCount > 0 || programCount > 0) && <span className="text-slate-300 dark:text-slate-700">·</span>}
          <span>
            <strong className="font-bold text-slate-800 dark:text-slate-200">7</strong> provinces
          </span>
          <span className="hidden md:inline-block text-slate-300 dark:text-slate-700">·</span>
          <span className="hidden md:inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-primary dark:text-slate-300" />
            Source details where available
          </span>
        </div>
      </div>
    </div>
  )
}
