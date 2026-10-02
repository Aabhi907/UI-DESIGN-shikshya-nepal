'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Moon,
  Menu,
  ArrowLeftRight,
  MapPin,
  Plus,
  Share2,
  Scale,
  Lock,
} from 'lucide-react'

export default function StudentCompanionShowcase() {
  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden py-4 sm:py-5 lg:py-6 lg:min-h-[calc(100vh-4rem)] lg:max-h-[840px] flex flex-col justify-center">
      {/* ── Soft Atmospheric Background Aurora ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <div
          className="w-[650px] h-[400px] rounded-full blur-[120px] opacity-35 dark:opacity-20 transition-all duration-700"
          style={{
            background:
              'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(245, 165, 36, 0.16) 45%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col justify-center my-auto">
        
        {/* ── 1. Compact Header: Mobile Compare Tool (Fits on Single Screen) ── */}
        <div className="max-w-2xl mx-auto mb-3 sm:mb-4">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] shadow-2xs text-[10px] sm:text-[11px] font-nunito font-bold text-slate-700 dark:text-slate-300 mb-1.5 sm:mb-2 backdrop-blur-md">
            <Scale className="w-2.5 h-2.5 text-primary dark:text-[#F5A524]" />
            <span>Mobile-First College Comparison • 100% Unbiased</span>
          </div>

          {/* Main Headline */}
          <h2 className="font-baloo text-xl sm:text-2xl lg:text-[2rem] font-extrabold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.12] text-balance mb-1.5">
            <span className="text-primary dark:text-[#F5A524]">Compare Campuses Side-by-Side.</span>{' '}
            <br className="hidden sm:inline" />
            Right on Your Phone.
          </h2>

          {/* Subline */}
          <p className="font-nunito text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium max-w-md mx-auto text-balance leading-normal mb-2.5 sm:mb-3">
            Compare published fee structures, verified degree offerings, and university affiliations for up to 3 colleges at once—optimized for fast mobile touchscreens across Nepal.
          </p>

          {/* Dual Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            <Link
              href="/compare"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0B2B33] hover:bg-[#16414D] text-white dark:bg-[#F5A524] dark:text-[#061519] dark:hover:bg-[#ffb43a] text-xs font-bold font-nunito shadow-[0_6px_16px_-4px_rgba(11,43,51,0.3)] dark:shadow-[0_6px_16px_-4px_rgba(245,165,36,0.3)] transition-all duration-200 active:scale-[0.98]"
            >
              <span>Try College Comparison</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            <Link
              href="/colleges"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/80 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-800 dark:text-white border border-black/[0.08] dark:border-white/[0.12] text-xs font-bold font-nunito shadow-2xs backdrop-blur-md transition-all duration-200"
            >
              <span>Browse All Campuses</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ── 2. Fixed 3D Showcase (Calibrated Height for Single Screen Viewing) ── */}
        <div
          style={{ perspective: '1200px' }}
          className="relative mx-auto w-full max-w-5xl flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 xl:gap-10 pt-1 pb-2 select-none"
        >
          {/* ── LEFT CALLOUT (Fee & Quota Transparency) ── */}
          <motion.div
            initial={{ opacity: 0, x: -24, y: 10 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block flex-shrink-0 w-[215px] xl:w-[230px] z-30 pointer-events-auto"
          >
            <div className="apple-card p-3.5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-[#F5A524] flex-shrink-0">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 font-nunito tracking-tight">
                  Transparent Fees
                </span>
              </div>
              <p className="font-baloo text-sm font-extrabold text-slate-900 dark:text-white leading-tight mb-1">
                Direct College Quotas
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-nunito leading-snug">
                Compare published tuition costs, intake seats, and university affiliations side-by-side.
              </p>
            </div>
          </motion.div>

          {/* ── CENTER: COMPACT 3D PHONE MOCKUP (Full Height Fits on Screen) ── */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95, rotateX: 14, rotateY: -7 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 6, rotateY: -4 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
              duration: 0.8,
            }}
            className="relative flex-shrink-0 w-[240px] sm:w-[250px] z-20"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 3D Realistic Ground Cast Shadow */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-8 rounded-full blur-lg opacity-60 dark:opacity-80 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(11, 43, 51, 0.45) 0%, transparent 75%)',
                transform: 'translateZ(-35px) rotateX(90deg)',
              }}
            />


            {/* Titanium Chassis Outer Rim */}
            <div
              className="relative rounded-[36px] p-[6px] bg-slate-900 border border-slate-700/80"
              style={{
                boxShadow:
                  '0 24px 50px -10px rgba(11, 43, 51, 0.4), 0 12px 28px -6px rgba(0,0,0,0.45), inset 0 1px 2px rgba(255, 255, 255, 0.35), inset 0 -2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Inner Bezel Ring */}
              <div className="rounded-[30px] p-[2px] bg-black border border-slate-800">
                
                {/* ── PHONE DISPLAY: FULLY VISIBLE COMPARE COLLEGES SCREEN ── */}
                <div className="relative rounded-[28px] bg-[#EEF2EB] dark:bg-[#08181D] overflow-hidden text-left aspect-[9/17.2] flex flex-col justify-between text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.08]">
                  
                  {/* Subtle Diagonal Glass Sheen */}
                  <div
                    className="pointer-events-none absolute inset-0 z-30 opacity-20 select-none"
                    style={{
                      background:
                        'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.04) 40%, transparent 60%)',
                    }}
                  />

                  {/* 1. Mobile Status Bar & Dynamic Island */}
                  <div className="relative z-20 flex items-center justify-between text-[9px] font-semibold text-slate-800 dark:text-slate-300 pt-1 px-3 select-none">
                    <span>9:41</span>
                    {/* Dynamic Island Capsule */}
                    <div className="w-16 h-3 rounded-full bg-black border border-white/[0.12] mx-auto flex items-center justify-center gap-1 px-1 shadow-inner">
                      <span className="w-1 h-1 rounded-full bg-slate-900 border border-slate-700" />
                      <span className="w-0.5 h-0.5 rounded-full bg-blue-950/80" />
                    </div>
                    <div className="flex items-center gap-0.5 text-[8.5px]">
                      <span>5G</span>
                      <span className="text-[9px]">▮</span>
                    </div>
                  </div>

                  {/* 2. Top Browser Domain Bar (Domain: shikshyaxnepal.com) */}
                  <div className="relative z-20 px-2 pt-0.5 pb-0.5">
                    <div className="h-4.5 rounded-full bg-white/95 dark:bg-slate-900/95 border border-black/[0.08] dark:border-white/[0.1] px-2 flex items-center justify-between text-[8px] text-slate-500 font-mono shadow-2xs">
                      <span className="flex items-center gap-1 min-w-0">
                        <Lock className="w-1.5 h-1.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate text-[7.5px]">
                          shikshyaxnepal.com
                        </span>
                      </span>
                      <span className="text-[7px] text-slate-400 flex-shrink-0">AA</span>
                    </div>
                  </div>

                  {/* 3. Top Floating Navigation Capsule */}
                  <div className="relative z-10 px-2 pt-0.5">
                    <div className="rounded-full bg-white dark:bg-slate-900/90 border border-black/[0.08] dark:border-white/[0.1] px-2.5 py-0.5 flex items-center justify-between shadow-2xs">
                      <span className="font-baloo font-bold text-[9.5px] text-slate-900 dark:text-white">
                        ShikshyaXNepal
                      </span>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center">
                          <Search className="w-1.5 h-1.5" />
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center">
                          <Moon className="w-1.5 h-1.5" />
                        </span>
                        <span className="w-3.5 h-3.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center">
                          <Menu className="w-1.5 h-1.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Compare Colleges Content Screen (Compact to fit without scrolling) */}
                  <div className="relative z-10 flex-1 px-2 py-1 space-y-1 text-left flex flex-col justify-between">
                    {/* Heading Section */}
                    <div>
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-0.5">
                        <ArrowLeftRight className="w-3 h-3" />
                        <h3 className="font-baloo text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                          Compare colleges
                        </h3>
                      </div>
                      <p className="text-[7px] font-nunito font-semibold text-slate-600 dark:text-slate-300 leading-tight">
                        Compare up to 3 colleges using published fees, programs, scholarships and moderated student reviews.
                      </p>
                      <p className="text-[6.5px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                        Each published fee shows its programme, payment period and recorded academic year where available..
                      </p>
                    </div>

                    {/* Card 1: Kathmandu Model College (KMC Bagbazar) */}
                    <div className="rounded-lg bg-white dark:bg-slate-900/90 border border-sky-300 dark:border-sky-700/60 p-1.5 shadow-2xs relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[8.5px] font-mono">
                            K
                          </div>
                          <div>
                            <p className="font-baloo text-[8.5px] font-bold text-slate-900 dark:text-white leading-tight">
                              Kathmandu Model College (KMC Bagbazar)
                            </p>
                            <p className="text-[6.5px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-1.5 h-1.5 text-slate-400" />
                              Bagbazar, Kathmandu
                            </p>
                          </div>
                        </div>
                        <span className="text-[7.5px] text-slate-400 leading-none">✕</span>
                      </div>
                      <p className="text-[7px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        View Profile →
                      </p>
                    </div>

                    {/* Card 2: Nepal Commerce Campus (NCC Minbhawan) */}
                    <div className="rounded-lg bg-white dark:bg-slate-900/90 border border-sky-300 dark:border-sky-700/60 p-1.5 shadow-2xs relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[8.5px] font-mono">
                            N
                          </div>
                          <div>
                            <p className="font-baloo text-[8.5px] font-bold text-slate-900 dark:text-white leading-tight">
                              Nepal Commerce Campus (NCC Minbhawan)
                            </p>
                            <p className="text-[6.5px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-1.5 h-1.5 text-slate-400" />
                              Minbhawan, Kathmandu
                            </p>
                          </div>
                        </div>
                        <span className="text-[7.5px] text-slate-400 leading-none">✕</span>
                      </div>
                      <p className="text-[7px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        View Profile →
                      </p>
                    </div>

                    {/* Card 3: Add College 3 (Dashed Slot) */}
                    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-1.5 flex flex-col items-center justify-center gap-0.5 text-slate-500 dark:text-slate-400">
                      <div className="w-4 h-4 rounded-full bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center">
                        <Plus className="w-2 h-2 text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="text-[7px] font-semibold font-nunito">Add College 3</span>
                    </div>

                    {/* Bottom Options Row */}
                    <div className="pt-0.5 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex items-center gap-1 text-[7px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">
                        <span className="w-2 h-2 rounded border border-slate-400 flex items-center justify-center text-[6px]" />
                        <span>Only show differences</span>
                      </div>

                      <div className="flex items-center justify-between text-[6.5px] text-slate-500 dark:text-slate-400">
                        <span>Swipe sideways to see every college.</span>
                        <div className="rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-1 py-0.5 flex items-center gap-0.5 font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                          <Share2 className="w-1.5 h-1.5" />
                          <span>Share comparison</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. iOS Home Indicator */}
                  <div className="relative z-10 pb-1 pt-0.5 flex justify-center">
                    <div className="w-16 h-0.5 rounded-full bg-slate-400/50 dark:bg-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT CALLOUT (Unbiased Student Protection) ── */}
          <motion.div
            initial={{ opacity: 0, x: 24, y: 10 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block flex-shrink-0 w-[215px] xl:w-[230px] z-30 pointer-events-auto"
          >
            <Link
              href="/compare"
              className="group block apple-card p-3.5 rounded-2xl text-left transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-400/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 font-nunito tracking-tight truncate">
                    100% Unbiased
                  </span>
                </div>
                <div className="w-5 h-5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] flex items-center justify-center text-slate-400 group-hover:text-primary dark:group-hover:text-[#F5A524] transition-colors flex-shrink-0">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
              <p className="font-baloo text-sm font-extrabold text-slate-900 dark:text-white leading-tight mb-1">
                Zero Sponsored Ranks
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-nunito leading-snug">
                Campuses cannot pay for higher positions. Moderated reviews from verified students.
              </p>
            </Link>
          </motion.div>
        </div>

        {/* ── MOBILE FALLBACK: Summary Cards below on small screens ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 lg:hidden max-w-md mx-auto text-left">
          <div className="apple-card p-3 rounded-xl">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-[#F5A524]">
                <Scale className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white font-nunito">
                Transparent Fees
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-nunito leading-tight">
              Compare published tuition costs and seat quotas for up to 3 colleges.
            </p>
          </div>

          <Link
            href="/compare"
            className="group block apple-card p-3 rounded-xl"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 dark:bg-emerald-400/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-nunito">
                  Zero Sponsored Ranks
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary dark:group-hover:text-[#F5A524] transition-colors" />
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-nunito leading-tight">
              Unbiased comparisons with verified student reviews across Nepal.
            </p>
          </Link>
        </div>

      </div>
    </section>
  )
}
