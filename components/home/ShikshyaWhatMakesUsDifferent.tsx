'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Clock,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Info,
  BadgePercent,
  CheckCircle2,
  Users,
  Building2,
} from 'lucide-react'

interface FloatingPillar {
  id: string
  label: string
  detail: string
  topPercent: number // 15% to 75%
  leftPercent: number // 8% to 92%
  bgLight: string
  textLight: string
  borderLight: string
  bgDark: string
  textDark: string
  borderDark: string
  duration: number
  delay: number
  icon: typeof ShieldCheck
}

const PILLARS: FloatingPillar[] = [
  {
    id: 'zero-paid-rankings',
    label: 'Zero Paid Rankings',
    detail: 'Colleges cannot pay for higher positions, sponsored badges, or promoted placement.',
    topPercent: 24,
    leftPercent: 16,
    bgLight: 'bg-[#ECFDF5]',
    textLight: 'text-[#047857]',
    borderLight: 'border-[#A7F3D0]',
    bgDark: 'dark:bg-[#0D3323]',
    textDark: 'dark:text-[#6EE7B7]',
    borderDark: 'dark:border-[#135439]',
    duration: 3.8,
    delay: 0,
    icon: ShieldCheck,
  },
  {
    id: 'dated-sourced',
    label: 'Dated & Sourced Fees',
    detail: 'Every tuition and semester fee displays the exact date it was verified against official circulars.',
    topPercent: 68,
    leftPercent: 14,
    bgLight: 'bg-[#FEF3C7]',
    textLight: 'text-[#B45309]',
    borderLight: 'border-[#FDE68A]',
    bgDark: 'dark:bg-[#38280D]',
    textDark: 'dark:text-[#FCD34D]',
    borderDark: 'dark:border-[#5A3F14]',
    duration: 4.4,
    delay: 0.6,
    icon: Clock,
  },
  {
    id: 'no-consultancy',
    label: 'No Consultancy Markups',
    detail: 'Independent student guide with zero broker kickbacks or admission agency commissions.',
    topPercent: 18,
    leftPercent: 42,
    bgLight: 'bg-[#FFEAEB]',
    textLight: 'text-[#BE185D]',
    borderLight: 'border-[#FBCFE8]',
    bgDark: 'dark:bg-[#3D1420]',
    textDark: 'dark:text-[#F472B6]',
    borderDark: 'dark:border-[#5E1E32]',
    duration: 4.1,
    delay: 0.3,
    icon: BadgePercent,
  },
  {
    id: 'free-forever',
    label: '100% Free for Students',
    detail: 'Rs. 0 paywalls. Free access to college comparisons, cut-offs, and GPA calculators.',
    topPercent: 58,
    leftPercent: 38,
    bgLight: 'bg-[#F3E8FF]',
    textLight: 'text-[#7E22CE]',
    borderLight: 'border-[#E9D5FF]',
    bgDark: 'dark:bg-[#2C1347]',
    textDark: 'dark:text-[#D8B4FE]',
    borderDark: 'dark:border-[#4B1E78]',
    duration: 4.6,
    delay: 0.9,
    icon: GraduationCap,
  },
  {
    id: 'official-gazettes',
    label: 'Official Gazette Links',
    detail: 'Direct verification links to TU, KU, Pokhara, NEB & CTEVT portals without ad traps.',
    topPercent: 74,
    leftPercent: 62,
    bgLight: 'bg-[#E0F2FE]',
    textLight: 'text-[#0369A1]',
    borderLight: 'border-[#BAE6FD]',
    bgDark: 'dark:bg-[#0C2B3F]',
    textDark: 'dark:text-[#7DD3FC]',
    borderDark: 'dark:border-[#144766]',
    duration: 3.9,
    delay: 0.2,
    icon: ExternalLink,
  },
  {
    id: 'student-reviews',
    label: 'Verified Student Reviews',
    detail: 'Moderated feedback backed by roll number checks to block fake campus PR praise.',
    topPercent: 22,
    leftPercent: 70,
    bgLight: 'bg-[#F0FDFA]',
    textLight: 'text-[#0F766E]',
    borderLight: 'border-[#99F6E4]',
    bgDark: 'dark:bg-[#0B332F]',
    textDark: 'dark:text-[#5EEAD4]',
    borderDark: 'dark:border-[#13544D]',
    duration: 4.3,
    delay: 0.7,
    icon: Users,
  },
  {
    id: 'merit-transparency',
    label: 'Merit & Quota Clarity',
    detail: 'Published entrance cut-offs with clear open merit versus reservation seat breakdowns.',
    topPercent: 44,
    leftPercent: 88,
    bgLight: 'bg-[#FEF9C3]',
    textLight: 'text-[#A16207]',
    borderLight: 'border-[#FEF08A]',
    bgDark: 'dark:bg-[#38330D]',
    textDark: 'dark:text-[#FDE047]',
    borderDark: 'dark:border-[#5A5014]',
    duration: 4.0,
    delay: 0.4,
    icon: CheckCircle2,
  },
  {
    id: 'all-provinces',
    label: 'Open for All 7 Provinces',
    detail: 'Accessible nationwide on fast mobile touchscreens with zero registration locks.',
    topPercent: 80,
    leftPercent: 86,
    bgLight: 'bg-[#EEF2FF]',
    textLight: 'text-[#4338CA]',
    borderLight: 'border-[#C7D2FE]',
    bgDark: 'dark:bg-[#1E1B4B]',
    textDark: 'dark:text-[#A5B4FC]',
    borderDark: 'dark:border-[#312E81]',
    duration: 4.5,
    delay: 1.0,
    icon: Building2,
  },
]

export default function ShikshyaWhatMakesUsDifferent() {
  const [activePillar, setActivePillar] = useState<FloatingPillar | null>(null)

  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* ── Soft Atmospheric Ambient Glow ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <div
          className="w-[850px] h-[520px] rounded-full blur-[140px] opacity-25 dark:opacity-15"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.16) 0%, rgba(245, 165, 36, 0.12) 45%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* ── Section Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="mx-auto w-12 h-12 rounded-full p-0.5 ring-4 ring-[#F5A524]/20 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm mb-4">
            <div className="w-full h-full rounded-full bg-[#0B2B33] dark:bg-[#F5A524] flex items-center justify-center text-white dark:text-[#061519]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <h2 className="font-baloo text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.12] text-balance mb-3">
            What makes us different from others
          </h2>

          <p className="text-sm sm:text-base font-nunito text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
            Every detail is calibrated for the student, not the marketing department. We built Shikshya Nepal to be 100% independent, transparent, and free.
          </p>
        </div>

        {/* ── CENTER-ALIGNED FLOATING PILL CONSTELLATION ── */}
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-4 sm:gap-5 lg:gap-6 py-4 select-none">
          {[
            // Row 1 (3 items, top)
            [PILLARS[0], PILLARS[2], PILLARS[5]],
            // Row 2 (2 items, middle - centered in between gaps)
            [PILLARS[1], PILLARS[6]],
            // Row 3 (3 items, bottom)
            [PILLARS[3], PILLARS[4], PILLARS[7]],
          ].map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-5 lg:gap-7"
            >
              {row.map((p) => {
                const Icon = p.icon
                const isHovered = activePillar?.id === p.id
                const isBottomRow = rowIndex === 2

                return (
                  <motion.div
                    key={p.id}
                    animate={{
                      y: [0, -7, 0],
                      x: [0, 2, 0],
                    }}
                    transition={{
                      duration: p.duration,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: p.delay,
                    }}
                    className={`relative cursor-pointer transition-all duration-150 ${isHovered ? 'z-50' : 'z-20'}`}
                    onMouseEnter={() => setActivePillar(p)}
                    onMouseLeave={() => setActivePillar(null)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border shadow-2xs transition-all duration-200 ${p.bgLight} ${p.textLight} ${p.borderLight} ${p.bgDark} ${p.textDark} ${p.borderDark} ${
                        isHovered ? 'ring-2 ring-primary/40 dark:ring-[#F5A524]/50 shadow-md' : ''
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-85" />
                      <span className="text-xs sm:text-[13px] lg:text-[13.5px] font-bold font-nunito whitespace-nowrap">
                        {p.label}
                      </span>
                    </motion.div>

                    {/* Micro Detail Popover on Hover (Smart Directional) */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: isBottomRow ? 6 : -6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: isBottomRow ? 4 : -4, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                          className={`absolute left-1/2 -translate-x-1/2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.12] p-3 shadow-xl z-50 pointer-events-none text-left backdrop-blur-md ${
                            isBottomRow ? 'bottom-full mb-3' : 'top-full mt-3'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Info className="w-3.5 h-3.5 text-primary dark:text-[#F5A524] shrink-0 mt-0.5" />
                            <p className="text-[11.5px] font-nunito text-slate-700 dark:text-slate-200 leading-snug">
                              {p.detail}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>

        {/* ── Active Pillar Spotlight Dock (Centered) ── */}
        <div className="flex justify-center mt-7 sm:mt-9">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-black/[0.08] dark:border-white/[0.1] shadow-2xs backdrop-blur-md text-xs font-nunito text-slate-700 dark:text-slate-300 max-w-xl text-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {activePillar ? (
              <span className="truncate">
                <strong className="text-slate-900 dark:text-white font-bold">{activePillar.label}:</strong>{' '}
                {activePillar.detail}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                Hover over any floating point to explore what makes Shikshya Nepal different.
              </span>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
