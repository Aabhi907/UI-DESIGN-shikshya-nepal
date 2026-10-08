'use client'

import type { Admission } from '@/types'
import CountdownPill from './CountdownPill'
import AnimatedSearch from './AnimatedSearch'
import TrustStrip from './TrustStrip'
import { BookOpen, CalendarDays, Compass, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface HeroProps {
  heroStats: { label: string; value: number }[]
  admissions?: Admission[]
}

export default function Hero({ heroStats, admissions = [] }: HeroProps) {
  const collegeCount = heroStats.find((s) => s.label === 'Colleges')?.value ?? 0
  const programCount = heroStats.find((s) => s.label === 'Programs')?.value ?? 0

  return (
    <section className="relative isolate flex min-h-[calc(100dvh-64px)] flex-col justify-between overflow-hidden border-b border-sn-border bg-sn-ground px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(191,227,240,.24),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(31,78,95,.28),transparent_68%)]" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center text-center">
        <div className="mb-3 flex justify-center sm:mb-4">
          <CountdownPill admissions={admissions} />
        </div>

        <h1 className="max-w-4xl font-baloo text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[.92] tracking-[-.055em] text-sn-ink text-balance">
          Cut through the{' '}
          <span className="relative inline-block text-primary dark:text-[#A9D8E5]">
            confusion.
            <svg className="absolute -bottom-1 left-0 h-2.5 w-full sm:-bottom-2 sm:h-3.5" viewBox="0 0 200 14" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <path d="M3 9C58 3 142 2 197 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
            </svg>
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-md font-nunito text-base font-medium leading-relaxed text-sn-ink-soft sm:mt-4 sm:text-lg">
          Compare colleges, fees, and requirements in one place.
        </p>

        <div className="mt-5 w-full max-w-xl sm:mt-6 xl:max-w-2xl">
          <div className="rounded-2xl border border-sn-border bg-white/80 p-1 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm dark:bg-sn-surface/80">
            <AnimatedSearch />
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-sn-ink-muted sm:text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-sn-primary/60" aria-hidden="true" />
            Independent guidance · No paid rankings
          </p>
        </div>

        <nav aria-label="Explore education choices" className="mt-4 flex w-full max-w-lg items-center justify-center gap-2 sm:mt-6 sm:gap-3">
          <Link href="/colleges" className="flex items-center gap-2 rounded-full border border-sn-border bg-white px-4 py-2.5 text-xs font-bold text-sn-ink shadow-sm transition-all hover:border-sn-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-sn-surface sm:text-sm">
            <BookOpen className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
            Browse colleges
          </Link>
          <Link href="/tools/program-finder" className="flex items-center gap-2 rounded-full border border-[#b7dde6]/70 bg-[#e9f5f8] px-4 py-2.5 text-xs font-bold text-sn-ink shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-[#2a5a6b] dark:bg-[#173743] dark:text-white sm:text-sm">
            <Compass className="h-4 w-4 shrink-0 text-primary dark:text-[#A9D8E5]" strokeWidth={1.8} aria-hidden="true" />
            Find my course
          </Link>
          <Link href="/admissions" className="flex items-center gap-2 rounded-full border border-[#eadfbd] bg-[#f8f3e6] px-4 py-2.5 text-xs font-bold text-sn-ink shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-[#61553b] dark:bg-[#302b20] dark:text-white sm:text-sm">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#8c6722] dark:text-[#e3c779]" strokeWidth={1.8} aria-hidden="true" />
            Deadlines
          </Link>
        </nav>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6">
        <TrustStrip collegeCount={collegeCount} programCount={programCount} />
      </div>
    </section>
  )
}
