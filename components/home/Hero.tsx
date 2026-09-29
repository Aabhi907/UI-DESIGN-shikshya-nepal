'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Admission } from '@/types'
import CountdownPill from './CountdownPill'
import AnimatedSearch from './AnimatedSearch'
import RidgelineBackground from './RidgelineBackground'
import TrustStrip from './TrustStrip'

interface HeroProps {
  heroStats: { label: string; value: number }[]
  admissions?: Admission[]
}

const TRENDING_CHIPS = [
  { label: 'Admissions open', href: '/admissions?deadline=open' },
  { label: 'Results', href: '/results' },
  { label: 'BCA Colleges', href: '/colleges?q=BCA' },
  { label: 'Scholarships', href: '/scholarships' },
]

export default function Hero({ heroStats, admissions = [] }: HeroProps) {
  const collegeCount = heroStats.find((s) => s.label === 'Colleges')?.value || 1200
  const programCount = heroStats.find((s) => s.label === 'Programs')?.value || 450

  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden pt-12 sm:pt-16 pb-12 sm:pb-16 min-h-[580px] sm:min-h-[640px] flex flex-col justify-between">
      {/* 3-Layer Himalayan Ridgeline + Soft Aurora Glow */}
      <RidgelineBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center">
        {/* 1. Live Countdown Pill (Rotates through nearest deadlines) */}
        <div className="mb-6 flex justify-center">
          <CountdownPill admissions={admissions} />
        </div>

        {/* 2. Devanagari Muted Accent + Authority Headline */}
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-400 dark:text-slate-400 mb-2.5 font-noto-devanagari select-none">
          शिक्षा, स्पष्ट रूपमा।
        </p>

        <h1
          className="font-baloo font-extrabold text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.05] text-balance mb-4"
          style={{ fontSize: 'clamp(2.75rem, 6.5vw, 5.25rem)' }}
        >
          Decide what to study.{' '}
          <span className="relative inline-block whitespace-nowrap">
            <span className="hero-text-shimmer">Find where.</span>
            {/* Hand-drawn SVG underline that draws itself once */}
            <svg
              className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-3 pointer-events-none"
              viewBox="0 0 200 12"
              fill="none"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M2 9C58 3 142 2 198 8"
                stroke="#F5A524"
                strokeWidth="3.5"
                strokeLinecap="round"
                className="hero-underline-path"
              />
            </svg>
          </span>
        </h1>

        {/* 3. Subline (max 12 words) */}
        <p className="font-nunito text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-8 text-balance">
          Verified, dated, unbiased. No paid rankings.
        </p>

        {/* 4. Big Search Bar (Raised glass card with animated placeholder & ⌘K) */}
        <div className="w-full mb-6">
          <AnimatedSearch />
        </div>

        {/* 5. Max 4 Trending Chips on ONE row (Horizontally scrollable on mobile) */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-full overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max px-2">
              <span className="text-xs font-nunito font-semibold text-slate-500 dark:text-slate-400">
                Trending:
              </span>
              {TRENDING_CHIPS.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  className="rounded-full px-3.5 py-1.5 text-xs font-nunito font-semibold text-slate-700 dark:text-slate-300 border border-black/[0.08] dark:border-white/[0.1] bg-white/70 dark:bg-white/[0.04] backdrop-blur-md hover:border-primary/50 dark:hover:border-[#F5A524]/60 hover:text-primary dark:hover:text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quiet secondary text link */}
          <Link
            href="/programs"
            className="group inline-flex items-center gap-1 text-xs font-nunito font-semibold text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-[#F5A524] transition-colors"
          >
            <span>Browse all programs</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 6. Single Quiet Trust Strip (Counting up when in view) */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 w-full">
        <TrustStrip collegeCount={collegeCount} programCount={programCount} />
      </div>
    </section>
  )
}
