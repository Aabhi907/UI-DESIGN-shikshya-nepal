'use client'

import type { Admission } from '@/types'
import CountdownPill from './CountdownPill'
import AnimatedSearch from './AnimatedSearch'
import TrustStrip from './TrustStrip'
import { BookOpen, CalendarDays, Compass } from 'lucide-react'
import Link from 'next/link'

interface HeroProps {
  heroStats: { label: string; value: number }[]
  admissions?: Admission[]
}

export default function Hero({ heroStats, admissions = [] }: HeroProps) {
  const collegeCount = heroStats.find((s) => s.label === 'Colleges')?.value ?? 0
  const programCount = heroStats.find((s) => s.label === 'Programs')?.value ?? 0

  return (
    <section className="relative isolate flex min-h-[680px] flex-col justify-between overflow-hidden border-b border-sn-border bg-sn-ground px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(191,227,240,.24),transparent_68%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(31,78,95,.28),transparent_68%)]" aria-hidden="true" />

      {/* Editorial question and floating study prompts */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-7 text-center sm:py-10">
        <div className="mb-5 flex justify-center sm:mb-6">
          <CountdownPill admissions={admissions} />
        </div>

        <div className="max-w-5xl">
          <p lang="ne" className="mb-3 font-nepali text-xs font-medium tracking-normal text-sn-ink-muted sm:mb-4 sm:text-sm">
            शिक्षा, स्पष्ट रूपमा।
          </p>
          <h1 className="font-baloo text-[clamp(3rem,8vw,6.5rem)] font-extrabold leading-[.9] tracking-[-.065em] text-sn-ink text-balance">
            Choosing a college<br className="hidden sm:block" /> shouldn’t feel this<br className="hidden sm:block" /> <span className="relative inline-block text-primary dark:text-[#A9D8E5]">confusing.
              <svg className="absolute -bottom-2 left-0 h-3 w-full sm:-bottom-3 sm:h-4" viewBox="0 0 200 14" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9C58 3 142 2 197 8" stroke="#86C4D4" strokeWidth="3" strokeLinecap="round" /></svg>
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-nunito text-sm font-medium leading-6 text-sn-ink-soft text-balance sm:mt-6 sm:text-lg sm:leading-7">
            Compare colleges, fees, and entry requirements — all in one place before you apply.
          </p>
        </div>

        <div className="mt-7 w-full max-w-xl sm:mt-9 xl:max-w-2xl">
          <AnimatedSearch />
        </div>

        <div role="group" aria-label="Explore education choices" className="mt-7 flex w-full max-w-3xl items-stretch justify-center gap-2.5 sm:mt-9 sm:gap-4">
          <Link href="/colleges" className="hero-choice-card-left flex min-h-[112px] w-1/3 max-w-[205px] flex-col items-start justify-start gap-2.5 rounded-[20px] border border-black/[.06] bg-white px-3 py-3 text-left shadow-[0_12px_30px_rgba(11,43,51,.08)] transition-shadow hover:shadow-[0_16px_34px_rgba(11,43,51,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:min-h-[108px] sm:rounded-[24px] sm:px-5 sm:py-3.5">
            <BookOpen className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" strokeWidth={1.8} aria-hidden="true" />
            <span className="block text-[11px] font-bold leading-tight text-sn-ink sm:text-sm">Where can I study?<span className="mt-1 block text-[10px] font-medium leading-snug text-sn-ink-soft sm:text-xs">Browse colleges by location.</span></span>
          </Link>
          <Link href="/tools/program-finder" className="relative z-20 flex min-h-[118px] w-1/3 max-w-[225px] scale-[1.03] -translate-y-2 flex-col items-start justify-start gap-2.5 rounded-[20px] border border-[#b7dde6]/70 bg-[#e9f5f8] px-3 py-3 text-left shadow-[0_20px_42px_rgba(11,43,51,.14)] transition-shadow hover:shadow-[0_24px_46px_rgba(11,43,51,.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-[#173743] sm:min-h-[114px] sm:-translate-y-3 sm:rounded-[24px] sm:px-5 sm:py-3.5">
            <Compass className="h-4 w-4 shrink-0 text-primary dark:text-[#A9D8E5] sm:h-5 sm:w-5" strokeWidth={1.8} aria-hidden="true" />
            <span className="block text-[11px] font-bold leading-tight text-sn-ink dark:text-white sm:text-sm">Which course fits me?<span className="mt-1 block text-[10px] font-medium leading-snug text-sn-ink-soft dark:text-slate-300 sm:text-xs">Answer 3 questions to explore options.</span></span>
          </Link>
          <Link href="/admissions" className="hero-choice-card-right flex min-h-[112px] w-1/3 max-w-[205px] flex-col items-start justify-start gap-2.5 rounded-[20px] border border-[#eadfbd] bg-[#f8f3e6] px-3 py-3 text-left shadow-[0_12px_30px_rgba(11,43,51,.08)] transition-shadow hover:shadow-[0_16px_34px_rgba(11,43,51,.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:border-[#61553b] dark:bg-[#302b20] sm:min-h-[108px] sm:rounded-[24px] sm:px-5 sm:py-3.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#8c6722] dark:text-[#e3c779] sm:h-5 sm:w-5" strokeWidth={1.8} aria-hidden="true" />
            <span className="block text-[11px] font-bold leading-tight text-sn-ink dark:text-white sm:text-sm">When should I apply?<span className="mt-1 block text-[10px] font-medium leading-snug text-sn-ink-soft dark:text-slate-300 sm:text-xs">See dates and notices.</span></span>
          </Link>
        </div>

      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 w-full">
        <TrustStrip collegeCount={collegeCount} programCount={programCount} />
      </div>
    </section>
  )
}
