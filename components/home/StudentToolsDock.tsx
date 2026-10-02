'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  FileText,
  Clock,
  Building,
} from 'lucide-react'
import Link from 'next/link'

export type ToolItem = {
  id: 'gpa' | 'colleges' | 'deadlines' | 'planner'
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
}

export const STUDENT_TOOLS: ToolItem[] = [
  {
    id: 'gpa',
    title: 'GPA Calculator',
    subtitle: 'Simulate SEE and NEB weighted grade points with credit hours. Runs 100% in your browser.',
    ctaText: 'Calculate GPA',
    ctaHref: '/tools/gpa-calculator',
  },
  {
    id: 'colleges',
    title: 'Verified Campuses',
    subtitle: 'Browse 1,200+ TU, KU, Pokhara, Purbanchal, and CTEVT institutions with verified source gazettes.',
    ctaText: 'Search Campuses',
    ctaHref: '/colleges',
  },
  {
    id: 'deadlines',
    title: 'Scholarship Alerts',
    subtitle: 'Track official MoEST merit quotas, provincial fee waivers, and verified entrance deadlines.',
    ctaText: 'View Deadlines',
    ctaHref: '/deadlines',
  },
  {
    id: 'planner',
    title: 'Admission Planner',
    subtitle: 'Organize required certificates, transcripts, and verified college application checklists.',
    ctaText: 'Open Planner',
    ctaHref: '/admissions/planner',
  },
]

export default function StudentToolsDock() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="relative overflow-hidden bg-sn-ground py-20 sm:py-28 lg:py-32 border-b border-sn-border">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center select-none">
        {/* ════════════════════════════════════════════════════════
            1. HEADER (Handwritten font with kinetic blur)
        ════════════════════════════════════════════════════════ */}
        <motion.div
          animate={{
            filter: hoveredIndex !== null ? 'blur(10px)' : 'blur(0px)',
            opacity: hoveredIndex !== null ? 0.35 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full text-center"
        >
          <span className="font-mono text-xs uppercase tracking-widest font-semibold text-sn-primary-hover mb-2 inline-block">
            Student Toolkit
          </span>
          <h2 className="font-handwriting text-3xl sm:text-4xl lg:text-5xl text-sn-ink tracking-wide font-bold">
            Student tools built for your journey :)
          </h2>
        </motion.div>

        {/* ════════════════════════════════════════════════════════
            2. DOCK ROW (4 Bespoke Tactile Tool Icons)
        ════════════════════════════════════════════════════════ */}
        <div className="relative my-auto w-full py-20 sm:py-24">
          <div
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative mx-auto flex items-center justify-center gap-5 sm:gap-9 md:gap-14"
          >
            {STUDENT_TOOLS.map((item, index) => {
              const isHovered = hoveredIndex === index
              const isAnyHovered = hoveredIndex !== null
              const isBlurred = isAnyHovered && !isHovered

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative flex flex-col items-center transition-all ${
                    isHovered ? 'z-50' : 'z-10'
                  }`}
                >
                  {/* ───────────────────────────────────────────────
                      AI-SLOP-FREE HOVER PREVIEW (Physical Card)
                  ─────────────────────────────────────────────── */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 25, scale: 0.9 }}
                        animate={{ opacity: 1, y: -60, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.92, transition: { duration: 0.18 } }}
                        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                        className="absolute bottom-full mb-4 pointer-events-none select-none flex flex-col items-center"
                      >
                        <ToolPreviewCard item={item} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ───────────────────────────────────────────────
                      TACTILE PHYSICAL TOOL ICON
                  ─────────────────────────────────────────────── */}
                  <motion.button
                    type="button"
                    aria-label={item.title}
                    animate={{
                      y: isHovered ? -8 : 0,
                      scale: isHovered ? 1.06 : isBlurred ? 0.95 : 1,
                      filter: isBlurred ? 'blur(10px)' : 'blur(0px)',
                      opacity: isBlurred ? 0.35 : 1,
                    }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="relative group flex h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 items-center justify-center rounded-[22px] sm:rounded-[26px] md:rounded-[28px] focus:outline-none transition-shadow duration-300"
                    style={{
                      boxShadow: isHovered
                        ? '0 24px 45px -10px rgba(0,0,0,0.22), 0 0 0 1.5px rgba(0,0,0,0.1)'
                        : '0 12px 28px -6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <BespokeToolIcon id={item.id} isHovered={isHovered} />
                  </motion.button>

                  {/* ───────────────────────────────────────────────
                      EXPANDED TEXT & ACTION DETAILS (Below Icon)
                  ─────────────────────────────────────────────── */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.22, delay: 0.04 }}
                        className="absolute top-full mt-4 w-64 sm:w-72 text-center pointer-events-auto flex flex-col items-center"
                      >
                        <h3 className="font-baloo text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm font-nunito text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {item.subtitle}
                        </p>
                        <Link
                          href={item.ctaHref}
                          className="mt-3.5 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-bold font-nunito bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          <span>{item.ctaText}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            3. FOOTER (Centered brief note with kinetic blur)
        ════════════════════════════════════════════════════════ */}
        <motion.div
          animate={{
            filter: hoveredIndex !== null ? 'blur(10px)' : 'blur(0px)',
            opacity: hoveredIndex !== null ? 0.35 : 1,
          }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-xl text-center select-none px-4"
        >
          <p className="font-nunito text-sm sm:text-base text-sn-ink-soft leading-relaxed">
            Built for Nepali students, parents, and counselors. No consultancies, no sponsored rankings, 100% public education directory.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// BESPOKE TACTILE TOOL ICONS (No Generic Squircles, No Neon)
// ─────────────────────────────────────────────────────────────
function BespokeToolIcon({ id }: { id: ToolItem['id']; isHovered: boolean }) {
  // 1. GPA CALCULATOR: Tactile mechanical pocket calculator tile
  if (id === 'gpa') {
    return (
      <div className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] bg-[#16181D] border border-white/10 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Subtle top rim light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />

        {/* Recessed LCD Screen */}
        <div className="w-full h-7 sm:h-8 rounded-lg bg-[#0D1015] border border-white/5 px-2 flex items-center justify-between shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
          <span className="font-mono text-[9px] font-bold text-slate-500 tracking-wider">NEB-12</span>
          <span className="font-mono text-xs sm:text-sm font-bold text-[#CAFFA6] tracking-widest drop-shadow-[0_0_1px_rgba(202,255,166,0.4)]">
            3.84
          </span>
        </div>

        {/* Tactile Keypad Matrix */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {['7', '8', '9', '4', '5', '6'].map((key) => (
            <div
              key={key}
              className="h-3.5 sm:h-4 rounded bg-[#242832] border-t border-white/15 border-b border-black/40 flex items-center justify-center text-[9px] font-mono text-slate-300 font-semibold shadow-xs"
            >
              {key}
            </div>
          ))}
          <div className="col-span-2 h-3.5 sm:h-4 rounded bg-[#2563EB] border-t border-blue-400 border-b border-blue-900 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-xs">
            GPA
          </div>
          <div className="h-3.5 sm:h-4 rounded bg-[#D97706] border-t border-amber-400 border-b border-amber-900 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-xs">
            =
          </div>
        </div>
      </div>
    )
  }

  // 2. VERIFIED CAMPUSES: Embossed University Archive & Colonnade Portico
  if (id === 'colleges') {
    return (
      <div className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] bg-[#0E1F18] border border-emerald-900/50 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Subtle top rim light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-emerald-400/20" />

        {/* Header Ribbon Stamp */}
        <div className="flex items-center justify-between">
          <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 font-mono text-[8px] font-bold text-emerald-300 tracking-wider">
            TU · KU · PU
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Classical Colonnade Portico Crest */}
        <div className="my-auto flex flex-col items-center justify-center py-1">
          {/* Triangular Pediment */}
          <div className="w-10 sm:w-12 h-3 border-b-2 border-emerald-300/80 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[9px] border-b-emerald-400/60" />
          </div>
          {/* 4 Classical Pillars */}
          <div className="flex justify-between w-9 sm:w-11 pt-0.5 pb-0.5">
            <div className="w-1 h-5 sm:h-6 bg-emerald-200/70 rounded-xs" />
            <div className="w-1 h-5 sm:h-6 bg-emerald-200/70 rounded-xs" />
            <div className="w-1 h-5 sm:h-6 bg-emerald-200/70 rounded-xs" />
            <div className="w-1 h-5 sm:h-6 bg-emerald-200/70 rounded-xs" />
          </div>
          {/* Base Plinth */}
          <div className="w-12 sm:w-14 h-1 bg-emerald-300/80 rounded-xs" />
        </div>

        {/* Bottom Seal Label */}
        <div className="text-center">
          <span className="font-mono text-[9px] font-bold text-emerald-300 tracking-widest uppercase">
            1,200+ Verified
          </span>
        </div>
      </div>
    )
  }

  // 3. SCHOLARSHIP ALERTS: Tactile Brass Bell & Calendar Countdown Stamp
  if (id === 'deadlines') {
    return (
      <div className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] bg-[#221611] border border-amber-900/50 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Subtle top rim light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-amber-400/20" />

        {/* Top Notification Bead */}
        <div className="flex items-center justify-between">
          <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-800/60 font-mono text-[8px] font-bold text-amber-300 tracking-wider">
            NOTICE RADAR
          </span>
          <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
        </div>

        {/* Tactile Brass Bell / Desk Chime Illustration */}
        <div className="my-auto flex items-center justify-center py-1">
          <div className="relative flex flex-col items-center">
            {/* Top Loop */}
            <div className="w-3.5 h-3 rounded-full border-2 border-amber-300/80 -mb-1" />
            {/* Bell Dome */}
            <div className="w-8 sm:w-10 h-7 sm:h-8 rounded-t-full bg-amber-500 border-t border-amber-200 flex items-end justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.4)]">
              {/* Bell Flange */}
              <div className="w-10 sm:w-12 h-2 rounded-full bg-amber-600 border-t border-amber-300/60" />
            </div>
            {/* Clapper */}
            <div className="w-2.5 h-2.5 rounded-full bg-amber-200 -mt-1 shadow-sm" />
          </div>
        </div>

        {/* Bottom Countdown Badge */}
        <div className="text-center">
          <span className="font-mono text-[9px] font-bold text-amber-300 tracking-wider">
            2082 INTAKES
          </span>
        </div>
      </div>
    )
  }

  // 4. ADMISSION PLANNER: Physical Student Pocket Clipboard & Ruled Checklist
  return (
    <div className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] bg-[#1E1B24] border border-purple-900/40 p-2.5 sm:p-3 flex flex-col justify-between overflow-hidden shadow-inner">
      {/* Top Silver Metal Clip */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-2.5 rounded-t-xs bg-slate-300 border-t border-white border-b border-slate-500 flex items-center justify-center shadow-xs">
        <div className="w-4 h-1 rounded-full bg-slate-400" />
      </div>

      {/* Paper Surface with Ruled Lines & Checkmarks */}
      <div className="mt-2 w-full h-full rounded-lg bg-[#FAF9F5] p-2 flex flex-col justify-between shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200">
          <span className="font-mono text-[8px] font-bold text-slate-700 tracking-tight">DOSSIER</span>
          <span className="font-mono text-[8px] font-bold text-purple-700">3/3 OK</span>
        </div>

        <div className="space-y-1 my-auto">
          <div className="flex items-center gap-1.5 text-[8px] font-nunito font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 text-white flex items-center justify-center text-[7px] font-bold">
              ✓
            </span>
            <span className="truncate">Transcript</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-nunito font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 text-white flex items-center justify-center text-[7px] font-bold">
              ✓
            </span>
            <span className="truncate">Character Cert</span>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-nunito font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-600 text-white flex items-center justify-center text-[7px] font-bold">
              ✓
            </span>
            <span className="truncate">Admit Card</span>
          </div>
        </div>

        <div className="h-0.5 w-full bg-slate-200 rounded-full" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AI-SLOP-FREE PREVIEW CARDS (Authentic Physical Documents)
// ─────────────────────────────────────────────────────────────
function ToolPreviewCard({ item }: { item: ToolItem }) {
  // 1. GPA CALCULATOR: Authentic NEB Class 12 Grade Sheet Table
  if (item.id === 'gpa') {
    return (
      <div className="relative w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#15161A] p-4 text-slate-900 dark:text-white border border-black/[0.1] dark:border-white/[0.12] shadow-[0_24px_45px_-12px_rgba(0,0,0,0.18)] flex flex-col justify-between">
        {/* Document Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white" />
            <span className="font-baloo text-xs font-bold text-slate-900 dark:text-white">
              NEB Grade Simulation
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">
            Class 12 · 2082 BS
          </span>
        </div>

        {/* Clean Structured Table (No neon, no fake gradients) */}
        <div className="my-2.5 space-y-1.5 text-xs font-nunito">
          <div className="flex justify-between items-center py-1 border-b border-black/[0.04] dark:border-white/[0.04] text-slate-700 dark:text-slate-300">
            <span>Compulsory English (3.0 cr)</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">A (3.6)</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-black/[0.04] dark:border-white/[0.04] text-slate-700 dark:text-slate-300">
            <span>Physics / Accounting (3.0 cr)</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">A+ (4.0)</span>
          </div>
          <div className="flex justify-between items-center py-1 text-slate-700 dark:text-slate-300">
            <span>Mathematics (3.0 cr)</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">A (3.6)</span>
          </div>
        </div>

        {/* Official Summary Footer */}
        <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
          <span className="text-[11px] font-nunito font-semibold text-slate-500">
            Weighted GPA
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
              3.73
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200">
              Distinction
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 2. VERIFIED CAMPUSES: Official Gazette Affiliation Extract
  if (item.id === 'colleges') {
    return (
      <div className="relative w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#15161A] p-4 text-slate-900 dark:text-white border border-black/[0.1] dark:border-white/[0.12] shadow-[0_24px_45px_-12px_rgba(0,0,0,0.18)] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            <span className="font-baloo text-xs font-bold text-slate-900 dark:text-white">
              University Affiliation Extract
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">
            TU-GAZETTE
          </span>
        </div>

        {/* Body Record */}
        <div className="my-2.5 space-y-1 text-xs font-nunito">
          <div className="flex justify-between items-start">
            <span className="font-bold text-slate-900 dark:text-white">
              Pulchowk Campus, IOE
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
              Constituent
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Tribhuvan University · Lalitpur, Bagmati Province
          </p>
          <div className="pt-1.5 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
            <p>• Seats: 432 Regular / 216 Full-Fee</p>
            <p>• Affiliation Status: Approved 2082/83 Intake</p>
          </div>
        </div>

        {/* Verification Tag */}
        <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-nunito text-slate-500">
          <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified against gazette
          </span>
          <span className="font-mono text-[10px]">No paid rank</span>
        </div>
      </div>
    )
  }

  // 3. SCHOLARSHIP ALERTS: Official MoEST Notice Brief
  if (item.id === 'deadlines') {
    return (
      <div className="relative w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#15161A] p-4 text-slate-900 dark:text-white border border-black/[0.1] dark:border-white/[0.12] shadow-[0_24px_45px_-12px_rgba(0,0,0,0.18)] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
            <span className="font-baloo text-xs font-bold text-slate-900 dark:text-white">
              Official Ministry Notice
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            4 Days Left
          </span>
        </div>

        {/* Body Notice */}
        <div className="my-2.5 space-y-1 text-xs font-nunito">
          <p className="font-bold text-slate-900 dark:text-white leading-snug">
            MoEST Higher Technical Education Grant
          </p>
          <p className="text-[11px] text-slate-500">
            Government of Nepal · Ministry of Education, Science &amp; Tech
          </p>
          <div className="pt-1.5 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
            <p>• Closes: 15 Kartik 2082 (17:00 NST)</p>
            <p>• Quota: 240 Full Tuition &amp; Exam Waivers</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-nunito text-slate-500">
          <span>Source: moest.gov.np</span>
          <span className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
            Direct apply link
          </span>
        </div>
      </div>
    )
  }

  // 4. ADMISSION PLANNER: Physical Application Dossier Checklist
  return (
    <div className="relative w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#15161A] p-4 text-slate-900 dark:text-white border border-black/[0.1] dark:border-white/[0.12] shadow-[0_24px_45px_-12px_rgba(0,0,0,0.18)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.08] dark:border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
          <span className="font-baloo text-xs font-bold text-slate-900 dark:text-white">
            Admission Document Dossier
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
          2/3 Ready
        </span>
      </div>

      {/* Checklist items */}
      <div className="my-2.5 space-y-1.5 text-xs font-nunito">
        <div className="flex items-center justify-between py-0.5 text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Check className="w-2.5 h-2.5" />
            </span>
            SEE / NEB Official Marksheet
          </span>
          <span className="font-mono text-[10px] text-slate-400">Verified</span>
        </div>
        <div className="flex items-center justify-between py-0.5 text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Check className="w-2.5 h-2.5" />
            </span>
            Character &amp; Transfer Certificate
          </span>
          <span className="font-mono text-[10px] text-slate-400">Verified</span>
        </div>
        <div className="flex items-center justify-between py-0.5 text-slate-500">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/20" />
            Entrance Exam Admit Card
          </span>
          <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">Pending</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-nunito text-slate-500">
        <span>Stored privately in browser</span>
        <span className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          Download Checklist
        </span>
      </div>
    </div>
  )
}
