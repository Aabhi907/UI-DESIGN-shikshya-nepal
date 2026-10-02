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
  Check,
  Scale,
} from 'lucide-react'

export default function StudentCompanionShowcase() {
  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden py-16 sm:py-24">
      {/* ── Soft Atmospheric Background Aurora ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <div
          className="w-[850px] h-[580px] rounded-full blur-[140px] opacity-35 dark:opacity-20 transition-all duration-700"
          style={{
            background:
              'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(245, 165, 36, 0.16) 45%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* ── 1. Header & Eyebrow: Mobile Compare Tool ── */}
        <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] shadow-xs text-xs font-nunito font-bold text-slate-700 dark:text-slate-300 mb-5 backdrop-blur-md">
            <Scale className="w-3.5 h-3.5 text-primary dark:text-[#F5A524]" />
            <span>Mobile-First College Comparison • 100% Unbiased</span>
          </div>

          {/* Main Headline */}
          <h2 className="font-baloo text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.1] text-balance mb-4">
            <span className="text-primary dark:text-[#F5A524]">Compare Campuses Side-by-Side.</span>{' '}
            <br className="hidden sm:inline" />
            Right on Your Phone.
          </h2>

          {/* Subline */}
          <p className="font-nunito text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto text-balance leading-relaxed mb-7">
            Compare published fee structures, verified degree offerings, and university affiliations for up to 3 colleges at once—optimized for fast mobile touchscreens across Nepal.
          </p>

          {/* Dual Action CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B2B33] hover:bg-[#16414D] text-white dark:bg-[#F5A524] dark:text-[#061519] dark:hover:bg-[#ffb43a] text-sm font-bold font-nunito shadow-[0_8px_20px_-4px_rgba(11,43,51,0.3)] dark:shadow-[0_8px_20px_-4px_rgba(245,165,36,0.3)] transition-all duration-200 active:scale-[0.98]"
            >
              <span>Try College Comparison</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-800 dark:text-white border border-black/[0.08] dark:border-white/[0.12] text-sm font-bold font-nunito shadow-xs backdrop-blur-md transition-all duration-200"
            >
              <span>Browse All Campuses</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ── 2. Fixed 3D Showcase with Scroll Pop-Up Animation ── */}
        <div
          style={{ perspective: '1300px' }}
          className="relative mx-auto max-w-4xl flex items-center justify-center pt-4 pb-12 select-none"
        >
          {/* ── LEFT 3D FLOATING CAPSULE CARD (Desktop) ── */}
          <motion.div
            initial={{ opacity: 0, x: -40, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block absolute -left-4 xl:-left-12 top-28 z-30 pointer-events-auto"
            style={{ transform: 'translateZ(45px)' }}
          >
            <div className="w-[285px] rounded-3xl bg-white/90 dark:bg-[#0C2229]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-4 shadow-[0_20px_45px_rgba(11,43,51,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.65)] transition-transform duration-300 hover:scale-105">
              <div className="grid grid-cols-2 divide-x divide-black/[0.06] dark:divide-white/[0.08] text-left">
                {/* Cell 1 */}
                <div className="pr-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Comparison
                    </span>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <p className="font-baloo text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                    Up to 3
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    Side-by-Side
                  </p>
                </div>

                {/* Cell 2 */}
                <div className="pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Fees
                    </span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <p className="font-baloo text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                    Dated &amp; Sourced
                  </p>
                  <p className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-1">
                    Official Quotas
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT 3D FLOATING CAPSULE CARD (Desktop) ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block absolute -right-4 xl:-right-12 top-28 z-30 pointer-events-auto"
            style={{ transform: 'translateZ(55px)' }}
          >
            <Link
              href="/compare"
              className="group block w-[295px] rounded-3xl bg-white/90 dark:bg-[#0C2229]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-4 shadow-[0_20px_45px_rgba(11,43,51,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.65)] transition-transform duration-300 hover:scale-105 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Zero Sponsored Rankings
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Moderated student reviews
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200 flex-shrink-0 group-hover:bg-[#0B2B33] group-hover:text-white dark:group-hover:bg-[#F5A524] dark:group-hover:text-black transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>VERIFIED METRICS ONLY</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● COMPARE 2082</span>
              </div>
            </Link>
          </motion.div>

          {/* ── CENTER: 3D PHONE MOCKUP (Scroll Pop-up Entrance, Non-Interactive with Mouse) ── */}
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.93, rotateX: 18, rotateY: -8 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 8, rotateY: -6 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              type: 'spring',
              stiffness: 90,
              damping: 20,
              duration: 0.9,
            }}
            className="relative w-full max-w-[340px] sm:max-w-[365px]"
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 3D Realistic Ground Cast Shadow */}
            <div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[88%] h-14 rounded-full blur-2xl opacity-60 dark:opacity-85 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(11, 43, 51, 0.45) 0%, transparent 75%)',
                transform: 'translateZ(-50px) rotateX(90deg)',
              }}
            />

            {/* Hardware Side Buttons */}
            <div className="absolute -left-[5px] top-20 w-[4px] h-7 rounded-l-md bg-slate-600 border-l border-slate-400/50 shadow-sm" />
            <div className="absolute -left-[5px] top-32 w-[4px] h-12 rounded-l-md bg-slate-600 border-l border-slate-400/50 shadow-sm" />
            <div className="absolute -left-[5px] top-48 w-[4px] h-12 rounded-l-md bg-slate-600 border-l border-slate-400/50 shadow-sm" />
            <div className="absolute -right-[5px] top-36 w-[4px] h-16 rounded-r-md bg-slate-600 border-r border-slate-400/50 shadow-sm" />

            {/* Titanium Chassis Outer Rim */}
            <div
              className="relative rounded-[50px] p-[10px] bg-slate-900 border border-slate-700/80"
              style={{
                boxShadow:
                  '0 35px 80px -15px rgba(11, 43, 51, 0.45), 0 20px 40px -10px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255, 255, 255, 0.35), inset 0 -2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Inner Bezel Ring */}
              <div className="rounded-[40px] p-[2px] bg-black border border-slate-800">
                
                {/* ── PHONE DISPLAY: EXACT MATCH TO USER'S COMPARE COLLEGES SCREENSHOT ── */}
                <div className="relative rounded-[38px] bg-[#EEF2EB] dark:bg-[#08181D] overflow-hidden text-left aspect-[9/18.8] flex flex-col justify-between text-slate-900 dark:text-white border border-black/[0.08] dark:border-white/[0.08]">
                  
                  {/* Subtle Diagonal Glass Sheen */}
                  <div
                    className="pointer-events-none absolute inset-0 z-30 opacity-20 select-none"
                    style={{
                      background:
                        'linear-gradient(130deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.04) 40%, transparent 60%)',
                    }}
                  />

                  {/* 1. Mobile Status Bar & Dynamic Island */}
                  <div className="relative z-20 flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-300 pt-2 px-4 select-none">
                    <span>9:41</span>
                    {/* Dynamic Island Capsule */}
                    <div className="w-22 h-4 rounded-full bg-black border border-white/[0.12] mx-auto flex items-center justify-center gap-1.5 px-1.5 shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span>5G</span>
                      <span className="text-xs">▮</span>
                    </div>
                  </div>

                  {/* 2. Top Floating Navigation Capsule (Screenshot Match) */}
                  <div className="relative z-10 px-3 pt-2">
                    <div className="rounded-full bg-white dark:bg-slate-900/90 border border-black/[0.08] dark:border-white/[0.1] px-3.5 py-1.5 flex items-center justify-between shadow-xs">
                      <span className="font-baloo font-bold text-xs text-slate-900 dark:text-white">
                        ShikshyaXNepal
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <span className="w-5 h-5 rounded-full border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center">
                          <Search className="w-2.5 h-2.5" />
                        </span>
                        <span className="w-5 h-5 rounded-full border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center">
                          <Moon className="w-2.5 h-2.5" />
                        </span>
                        <span className="w-5 h-5 rounded-full border border-black/[0.08] dark:border-white/[0.1] flex items-center justify-center">
                          <Menu className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Compare Colleges Content Screen (Exact Screenshot Match) */}
                  <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar px-3 py-2 space-y-2.5 text-left">
                    {/* Heading Section */}
                    <div>
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-0.5">
                        <ArrowLeftRight className="w-4 h-4" />
                        <h3 className="font-baloo text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                          Compare colleges
                        </h3>
                      </div>
                      <p className="text-[9px] font-nunito font-semibold text-slate-600 dark:text-slate-300 leading-tight">
                        Compare up to 3 colleges using published fees, programs, scholarships and moderated student reviews.
                      </p>
                      <p className="text-[7.5px] font-nunito text-slate-500 dark:text-slate-400 mt-1 leading-normal line-clamp-2">
                        Each published fee shows its programme, payment period and recorded academic year where available...
                      </p>
                    </div>

                    {/* Card 1: Kathmandu Model College (KMC Bagbazar) */}
                    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-sky-300 dark:border-sky-700/60 p-2.5 shadow-2xs relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs font-mono">
                            K
                          </div>
                          <div>
                            <p className="font-baloo text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                              Kathmandu Model College (KMC Bagbazar)
                            </p>
                            <p className="text-[8.5px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              Bagbazar, Kathmandu
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-none">✕</span>
                      </div>
                      <p className="text-[8.5px] font-semibold text-blue-600 dark:text-blue-400 mt-1.5">
                        View Profile →
                      </p>
                    </div>

                    {/* Card 2: Nepal Commerce Campus (NCC Minbhawan) */}
                    <div className="rounded-xl bg-white dark:bg-slate-900/90 border border-sky-300 dark:border-sky-700/60 p-2.5 shadow-2xs relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs font-mono">
                            N
                          </div>
                          <div>
                            <p className="font-baloo text-[11px] font-bold text-slate-900 dark:text-white leading-tight">
                              Nepal Commerce Campus (NCC Minbhawan)
                            </p>
                            <p className="text-[8.5px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              Minbhawan, Kathmandu
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-none">✕</span>
                      </div>
                      <p className="text-[8.5px] font-semibold text-blue-600 dark:text-blue-400 mt-1.5">
                        View Profile →
                      </p>
                    </div>

                    {/* Card 3: Add College 3 (Dashed Slot) */}
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-3 flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center">
                        <Plus className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="text-[9px] font-semibold font-nunito">Add College 3</span>
                    </div>

                    {/* Bottom Options Row */}
                    <div className="pt-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <span className="w-3 h-3 rounded border border-slate-400 flex items-center justify-center text-[8px]" />
                        <span>Only show differences</span>
                      </div>

                      <div className="flex items-center justify-between text-[8px] text-slate-500 dark:text-slate-400">
                        <span>Swipe sideways to see every college.</span>
                        <div className="rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2 py-1 flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
                          <Share2 className="w-2.5 h-2.5" />
                          <span>Share comparison</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. iOS Home Indicator */}
                  <div className="relative z-10 pb-1.5 pt-0.5 flex justify-center">
                    <div className="w-24 h-1 rounded-full bg-slate-400/50 dark:bg-slate-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── MOBILE FALLBACK: Summary Cards below on small screens ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 lg:hidden max-w-md mx-auto text-left">
          <div className="rounded-2xl bg-white/80 dark:bg-[#0C2229]/80 border border-black/[0.08] dark:border-white/[0.1] p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                Comparison Tool
              </span>
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="font-baloo text-lg font-bold text-slate-900 dark:text-white">
              Compare 3 Colleges
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              ● Side-by-side fee &amp; degree analysis
            </p>
          </div>

          <Link
            href="/compare"
            className="rounded-2xl bg-white/80 dark:bg-[#0C2229]/80 border border-black/[0.08] dark:border-white/[0.1] p-3.5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-slate-400">
                100% Free
              </p>
              <p className="font-baloo text-lg font-bold text-slate-900 dark:text-white">
                Launch Compare
              </p>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                ● Works on any mobile browser
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

      </div>
    </section>
  )
}
