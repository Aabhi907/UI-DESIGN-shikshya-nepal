'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  FileText,
  Clock,
  Building2,
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
            1. HEADER (Handwritten font with subtle kinetic blur)
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
          <h2 className="font-baloo text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-sn-ink leading-[1.12] tracking-[-0.025em]">
            Student tools built for your journey
          </h2>
        </motion.div>

        {/* ════════════════════════════════════════════════════════
            2. DOCK ROW (4 Apple-Grade System Icons)
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
                      APPLE-STYLE HOVER PREVIEW (Clean Archival Sheet)
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
                        <AppleToolPreview item={item} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ───────────────────────────────────────────────
                      APPLE-GRADE PHYSICAL APP ICON (Centered, Airy)
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
                    className="relative group flex h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 items-center justify-center rounded-[22px] sm:rounded-[26px] md:rounded-[28px] focus:outline-none transition-shadow duration-300 overflow-hidden"
                    style={{
                      boxShadow: isHovered
                        ? '0 24px 45px -10px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.08)'
                        : '0 10px 24px -6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.04)',
                    }}
                  >
                    <AppleAppIcon id={item.id} />
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
                        <p className="mt-1.5 text-xs sm:text-sm font-nunito text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
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
// APPLE-GRADE SYSTEM APP ICONS (Spacious, Centered, No Line Collisions)
// ─────────────────────────────────────────────────────────────
function AppleAppIcon({ id }: { id: ToolItem['id'] }) {
  // 1. GPA CALCULATOR: Compact Apple Calculator in Space Gray
  if (id === 'gpa') {
    return (
      <div
        className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] flex items-center justify-center border border-black/10 dark:border-white/10 select-none p-3 sm:p-4"
        style={{
          background: 'linear-gradient(180deg, #2A2B30 0%, #1A1B1F 100%)',
        }}
      >
        {/* Subtle top bevel light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />

        {/* Centered Mini Calculator Unit (Never touches edges) */}
        <div className="w-[72%] max-w-[62px] flex flex-col items-center gap-1.5">
          {/* Recessed Screen */}
          <div className="w-full h-6 rounded-md bg-[#111215] border border-white/[0.08] px-2 flex items-center justify-between shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            <span className="font-mono text-[8px] text-[#86868B] font-semibold">NEB</span>
            <span className="font-mono text-[11px] font-bold text-white tracking-wider">
              3.84
            </span>
          </div>

          {/* Keypad Grid (Neat, centered, plenty of margin) */}
          <div className="grid grid-cols-3 gap-1 w-full">
            {['7', '8', '9'].map((k) => (
              <div
                key={k}
                className="h-3 rounded-xs bg-[#33353B] flex items-center justify-center text-[8px] font-nunito font-semibold text-slate-200"
              >
                {k}
              </div>
            ))}
            <div className="col-span-2 h-3 rounded-xs bg-[#007AFF] flex items-center justify-center text-[9px] font-nunito font-bold text-white">
              GPA
            </div>
            <div className="h-3 rounded-xs bg-[#FF9500] flex items-center justify-center text-[9px] font-nunito font-bold text-white">
              =
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 2. VERIFIED CAMPUSES: Apple Midnight Academic Portico Crest
  if (id === 'colleges') {
    return (
      <div
        className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] flex items-center justify-center border border-black/10 dark:border-white/10 select-none p-3 sm:p-4 text-white"
        style={{
          background: 'linear-gradient(180deg, #1E293B 0%, #0F172A 100%)',
        }}
      >
        {/* Subtle top bevel light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />

        {/* Centered Portico Crest (Airy, compact, completely safe from border) */}
        <div className="flex flex-col items-center justify-center gap-1.5 w-full">
          {/* Classical Portico Artwork in Platinum Silver */}
          <div className="flex flex-col items-center">
            {/* Pediment Roof */}
            <div className="w-8 sm:w-10 h-2 border-b border-white/40 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[6px] border-b-slate-200" />
            </div>
            {/* Columns */}
            <div className="flex justify-between w-7 sm:w-9 pt-0.5 pb-0.5">
              <div className="w-1 h-4 sm:h-5 bg-slate-300 rounded-xs" />
              <div className="w-1 h-4 sm:h-5 bg-slate-300 rounded-xs" />
              <div className="w-1 h-4 sm:h-5 bg-slate-300 rounded-xs" />
              <div className="w-1 h-4 sm:h-5 bg-slate-300 rounded-xs" />
            </div>
            {/* Base Plinth */}
            <div className="w-9 sm:w-11 h-0.5 bg-slate-300 rounded-xs" />
          </div>

          {/* Centered Pill Stamp */}
          <span className="px-2 py-0.5 rounded-full bg-white/10 font-mono text-[8px] font-semibold text-slate-300 tracking-wider">
            TU · 1,200+
          </span>
        </div>
      </div>
    )
  }

  // 3. SCHOLARSHIP ALERTS: Floating Apple Calendar Page (Inset & Centered)
  if (id === 'deadlines') {
    return (
      <div
        className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] flex items-center justify-center border border-black/10 dark:border-white/15 select-none p-3 sm:p-4"
        style={{
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
        }}
      >
        {/* Centered Floating Calendar Tile (Safe zone, doesn't touch outer border) */}
        <div className="w-[74%] max-w-[62px] rounded-lg overflow-hidden border border-black/10 shadow-xs flex flex-col bg-white">
          {/* Apple Red Top Banner */}
          <div className="w-full bg-[#FF3B30] py-0.5 px-1.5 text-center text-white">
            <span className="font-mono text-[7px] font-extrabold tracking-widest uppercase block leading-tight">
              KARTIK
            </span>
          </div>

          {/* Date Body */}
          <div className="py-1 text-center bg-white">
            <span className="font-baloo text-xl sm:text-2xl font-extrabold text-[#1D1D1F] tracking-tight leading-none block">
              15
            </span>
            <span className="text-[7px] font-mono font-bold text-slate-500 tracking-tight block mt-0.5">
              DEADLINE
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 4. ADMISSION PLANNER: Floating Apple Notes Page (Inset & Centered)
  return (
    <div
      className="relative w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] flex items-center justify-center border border-black/10 dark:border-white/10 select-none p-3 sm:p-4"
      style={{
        background: 'linear-gradient(180deg, #26242B 0%, #1A181F 100%)',
      }}
    >
      {/* Centered Floating Legal Pad Tile (Safe zone, doesn't touch outer border) */}
      <div className="w-[74%] max-w-[62px] rounded-lg overflow-hidden bg-[#FAF9F5] border border-black/10 shadow-xs flex flex-col">
        {/* Apple Notes Gold Top Header */}
        <div className="w-full bg-[#F59E0B] py-0.5 px-1.5 flex items-center justify-between text-white">
          <span className="font-mono text-[7px] font-extrabold tracking-wider uppercase">
            PLANNER
          </span>
          <span className="font-mono text-[7px] font-bold text-amber-950/80">3/3</span>
        </div>

        {/* Checklist Rows with Apple Checkmarks */}
        <div className="p-1.5 space-y-1">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1D1D1F] flex items-center justify-center shrink-0">
              <Check className="w-1.5 h-1.5 text-white stroke-[3]" />
            </div>
            <span className="font-nunito text-[7px] font-bold text-slate-800 truncate">
              Marksheet
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1D1D1F] flex items-center justify-center shrink-0">
              <Check className="w-1.5 h-1.5 text-white stroke-[3]" />
            </div>
            <span className="font-nunito text-[7px] font-bold text-slate-800 truncate">
              Character
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full border border-slate-400 shrink-0" />
            <span className="font-nunito text-[7px] font-medium text-slate-600 truncate">
              Admit Slip
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// APPLE-STYLE HOVER PREVIEW CARDS (Spacious, Airy, Slop-Free)
// ─────────────────────────────────────────────────────────────
function AppleToolPreview({ item }: { item: ToolItem }) {
  // 1. GPA CALCULATOR: Apple Numbers / Clean Verification Sheet
  if (item.id === 'gpa') {
    return (
      <div className="relative w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#1C1D22] p-5 text-[#1D1D1F] dark:text-white border border-black/[0.08] dark:border-white/[0.1] shadow-[0_24px_45px_-12px_rgba(0,0,0,0.16)] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <span className="font-baloo text-sm font-bold text-[#1D1D1F] dark:text-white">
            NEB Grade Simulation
          </span>
          <span className="font-mono text-[10px] text-[#86868B]">Class 12 · 2082</span>
        </div>

        {/* Table Rows (Crisp typography, airy spacing, zero neon) */}
        <div className="my-3 space-y-2 text-xs font-nunito">
          <div className="flex justify-between items-center py-0.5 text-slate-700 dark:text-slate-300">
            <span>Compulsory English (3.0 cr)</span>
            <span className="font-mono font-semibold text-[#1D1D1F] dark:text-white">A (3.6)</span>
          </div>
          <div className="flex justify-between items-center py-0.5 text-slate-700 dark:text-slate-300">
            <span>Physics / Accounting (3.0 cr)</span>
            <span className="font-mono font-semibold text-[#1D1D1F] dark:text-white">A+ (4.0)</span>
          </div>
          <div className="flex justify-between items-center py-0.5 text-slate-700 dark:text-slate-300">
            <span>Mathematics (3.0 cr)</span>
            <span className="font-mono font-semibold text-[#1D1D1F] dark:text-white">A (3.6)</span>
          </div>
        </div>

        {/* Total Summary */}
        <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
          <span className="text-[11px] font-nunito text-[#86868B]">Weighted GPA</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-[#1D1D1F] dark:text-white">3.73</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-black/[0.04] dark:bg-white/[0.08] text-slate-800 dark:text-slate-200">
              Distinction
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 2. VERIFIED CAMPUSES: Apple Keynote Institutional Extract
  if (item.id === 'colleges') {
    return (
      <div className="relative w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#1C1D22] p-5 text-[#1D1D1F] dark:text-white border border-black/[0.08] dark:border-white/[0.1] shadow-[0_24px_45px_-12px_rgba(0,0,0,0.16)] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#86868B]" />
            <span className="font-baloo text-sm font-bold text-[#1D1D1F] dark:text-white">
              University Affiliation Extract
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#86868B]">TU-GAZETTE</span>
        </div>

        <div className="my-3 space-y-1.5 text-xs font-nunito">
          <div className="flex justify-between items-start">
            <span className="font-bold text-[#1D1D1F] dark:text-white">Pulchowk Campus, IOE</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300">
              Constituent
            </span>
          </div>
          <p className="text-[11px] text-[#86868B]">Tribhuvan University · Lalitpur</p>
          <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
            <p>• Seats: 432 Regular / 216 Full-Fee</p>
            <p>• Affiliation Status: Approved 2082 Intake</p>
          </div>
        </div>

        <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-nunito text-[#86868B]">
          <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified against gazette
          </span>
          <span className="font-mono text-[10px]">No paid ranks</span>
        </div>
      </div>
    )
  }

  // 3. SCHOLARSHIP ALERTS: Apple Calendar Deadline Notification
  if (item.id === 'deadlines') {
    return (
      <div className="relative w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#1C1D22] p-5 text-[#1D1D1F] dark:text-white border border-black/[0.08] dark:border-white/[0.1] shadow-[0_24px_45px_-12px_rgba(0,0,0,0.16)] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#86868B]" />
            <span className="font-baloo text-sm font-bold text-[#1D1D1F] dark:text-white">
              Official Ministry Notice
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            4 Days Left
          </span>
        </div>

        <div className="my-3 space-y-1.5 text-xs font-nunito">
          <p className="font-bold text-[#1D1D1F] dark:text-white leading-snug">
            MoEST Higher Technical Education Grant
          </p>
          <p className="text-[11px] text-[#86868B]">
            Ministry of Education, Science &amp; Technology
          </p>
          <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5">
            <p>• Closes: 15 Kartik 2082 (17:00 NST)</p>
            <p>• Quota: 240 Full Tuition &amp; Exam Waivers</p>
          </div>
        </div>

        <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-nunito text-[#86868B]">
          <span>moest.gov.np</span>
          <span className="font-mono text-[10px] font-medium text-slate-700 dark:text-slate-300">
            Direct Apply Link
          </span>
        </div>
      </div>
    )
  }

  // 4. ADMISSION PLANNER: Apple Reminders Checklist Sheet
  return (
    <div className="relative w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#1C1D22] p-5 text-[#1D1D1F] dark:text-white border border-black/[0.08] dark:border-white/[0.1] shadow-[0_24px_45px_-12px_rgba(0,0,0,0.16)] flex flex-col justify-between">
      <div className="flex items-center justify-between pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#86868B]" />
          <span className="font-baloo text-sm font-bold text-[#1D1D1F] dark:text-white">
            Admission Dossier
          </span>
        </div>
        <span className="font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
          2/3 Ready
        </span>
      </div>

      <div className="my-3 space-y-2 text-xs font-nunito">
        <div className="flex items-center justify-between py-0.5 text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#1D1D1F] text-white">
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </span>
            SEE &amp; NEB Official Marksheet
          </span>
          <span className="font-mono text-[10px] text-[#86868B]">Verified</span>
        </div>
        <div className="flex items-center justify-between py-0.5 text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#1D1D1F] text-white">
              <Check className="w-2.5 h-2.5 stroke-[2.5]" />
            </span>
            Character &amp; Transfer Certificate
          </span>
          <span className="font-mono text-[10px] text-[#86868B]">Verified</span>
        </div>
        <div className="flex items-center justify-between py-0.5 text-slate-500">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/20" />
            Entrance Exam Admit Slip
          </span>
          <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400">Pending</span>
        </div>
      </div>

      <div className="pt-2.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between text-[11px] font-nunito text-[#86868B]">
        <span>Stored privately in browser</span>
        <span className="font-mono text-[10px] font-medium text-slate-700 dark:text-slate-300">
          Download PDF
        </span>
      </div>
    </div>
  )
}
