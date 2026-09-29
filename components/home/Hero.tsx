'use client'

import type { Admission } from '@/types'
import RidgelineBackground from './RidgelineBackground'
import CountdownPill from './CountdownPill'
import AnimatedSearch from './AnimatedSearch'
import TrustStrip from './TrustStrip'

interface HeroProps {
  heroStats: { label: string; value: number }[]
  admissions?: Admission[]
}

export default function Hero({ heroStats, admissions = [] }: HeroProps) {
  const collegeCount = heroStats.find((s) => s.label === 'Colleges')?.value || 1200
  const programCount = heroStats.find((s) => s.label === 'Programs')?.value || 450

  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden pt-10 sm:pt-14 pb-12 sm:pb-16 min-h-[600px] flex flex-col justify-between">
      {/* 3-Layer Himalayan Ridgeline + Soft Aurora Glow */}
      <RidgelineBackground />

      {/* ── CENTER STAGE: Masthead Text + Raised Glass Search Console ── */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 text-center flex-1 flex flex-col justify-center items-center py-6 sm:py-8">
        {/* 1. Live Countdown Pill */}
        <div className="mb-4 flex justify-center">
          <CountdownPill admissions={admissions} />
        </div>

        {/* 2. Masthead: Devanagari Accent + Headline + Subline */}
        <div className="mb-6 sm:mb-8 max-w-xl mx-auto">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-400 dark:text-slate-400 mb-1.5 font-noto-devanagari select-none">
            शिक्षा, स्पष्ट रूपमा।
          </p>

          <h1
            className="font-baloo font-extrabold text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.05] text-balance mb-2.5"
            style={{ fontSize: 'clamp(2.4rem, 5vw, 4.4rem)' }}
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

          <p className="font-nunito text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 max-w-lg mx-auto text-balance">
            Verified, dated, unbiased. No paid rankings.
          </p>
        </div>

        {/* 3. Big Raised Glass Search Console */}
        <div className="w-full max-w-xl xl:max-w-2xl mx-auto mb-4 sm:mb-5">
          <AnimatedSearch />
        </div>

        {/* 4. Synced Verification Micro-Pill */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/75 dark:bg-slate-900/75 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-xs font-medium text-slate-600 dark:text-slate-400 backdrop-blur-sm select-none">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span>
              Verified higher-education registry for Nepal • Zero sponsored listings
            </span>
          </div>
        </div>
      </div>

      {/* ── Single Quiet Trust Strip (Counting up when in view) ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 w-full">
        <TrustStrip collegeCount={collegeCount} programCount={programCount} />
      </div>
    </section>
  )
}
