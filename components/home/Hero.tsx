'use client'

import type { Admission } from '@/types'
import RidgelineBackground from './RidgelineBackground'
import CommandCockpit from './CommandCockpit'
import TrustStrip from './TrustStrip'

interface HeroProps {
  heroStats: { label: string; value: number }[]
  admissions?: Admission[]
}

export default function Hero({ heroStats, admissions = [] }: HeroProps) {
  const collegeCount = heroStats.find((s) => s.label === 'Colleges')?.value || 1200
  const programCount = heroStats.find((s) => s.label === 'Programs')?.value || 450

  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden pt-12 sm:pt-16 pb-12 sm:pb-16 min-h-[580px] sm:min-h-[640px] flex flex-col justify-between">
      {/* 3-Layer Himalayan Ridgeline + Soft Aurora Glow */}
      <RidgelineBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center">
        {/* ── 1. Masthead: Devanagari Accent + Headline + Subline ─ */}
        <div className="mb-7 sm:mb-9">
          <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-400 dark:text-slate-400 mb-2 font-noto-devanagari select-none">
            शिक्षा, स्पष्ट रूपमा।
          </p>

          <h1
            className="font-baloo font-extrabold text-slate-900 dark:text-white tracking-[-0.03em] leading-[1.05] text-balance mb-3"
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

          <p className="font-nunito text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-balance">
            Verified, dated, unbiased. No paid rankings.
          </p>
        </div>

        {/* ── 2. The Integrated Command Cockpit Hardware Island ── */}
        <div className="w-full mb-6">
          <CommandCockpit admissions={admissions} />
        </div>
      </div>

      {/* ── 3. Single Quiet Trust Strip (Counting up when in view) ─ */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 w-full">
        <TrustStrip collegeCount={collegeCount} programCount={programCount} />
      </div>
    </section>
  )
}
