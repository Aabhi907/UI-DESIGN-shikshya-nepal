'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  GraduationCap,
  Bell,
  CalendarCheck,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import Link from 'next/link'

export type ToolItem = {
  id: string
  title: string
  subtitle: string
  badge: string
  ctaText: string
  ctaHref: string
  accentColor: string
  icon: typeof Calculator
  previewType: 'gpa' | 'colleges' | 'deadlines' | 'planner'
}

export const STUDENT_TOOLS: ToolItem[] = [
  {
    id: 'gpa',
    title: 'GPA Calculator',
    subtitle: 'Real-time SEE & NEB weighted GPA simulation with course credits. 100% private in your browser.',
    badge: 'SEE & NEB GRADING',
    ctaText: 'Calculate GPA',
    ctaHref: '/tools/gpa-calculator',
    accentColor: '#2563EB',
    icon: Calculator,
    previewType: 'gpa',
  },
  {
    id: 'colleges',
    title: 'Verified Campuses',
    subtitle: '1,200+ TU, KU, Pokhara, Purbanchal, and CTEVT institutions with official gazette proof.',
    badge: '1,200+ CAMPUSES',
    ctaText: 'Search Campuses',
    ctaHref: '/colleges',
    accentColor: '#059669',
    icon: GraduationCap,
    previewType: 'colleges',
  },
  {
    id: 'deadlines',
    title: 'Scholarship Alerts',
    subtitle: 'Never miss government merit quotas, provincial fee waivers, or college entrance dates.',
    badge: 'DEADLINE RADAR',
    ctaText: 'View Deadlines',
    ctaHref: '/deadlines',
    accentColor: '#D97706',
    icon: Bell,
    previewType: 'deadlines',
  },
  {
    id: 'planner',
    title: 'Admission Planner',
    subtitle: 'Track required certificates, character documents, and verified application checklists cleanly.',
    badge: 'DOC CHECKLIST',
    ctaText: 'Open Planner',
    ctaHref: '/admissions/planner',
    accentColor: '#7C3AED',
    icon: CalendarCheck,
    previewType: 'planner',
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
            Interactive Student Toolkit
          </span>
          <h2 className="font-handwriting text-3xl sm:text-4xl lg:text-5xl text-sn-ink tracking-wide font-bold">
            Student tools built for your journey :)
          </h2>
        </motion.div>

        {/* ════════════════════════════════════════════════════════
            2. DOCK ROW (4 Interactive Square Icons)
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
              const Icon = item.icon

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`relative flex flex-col items-center transition-all ${
                    isHovered ? 'z-50' : 'z-10'
                  }`}
                >
                  {/* ───────────────────────────────────────────────
                      FLOATING PREVIEW CARD (Layered 3D Mockup)
                  ─────────────────────────────────────────────── */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.85 }}
                        animate={{ opacity: 1, y: -65, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="absolute bottom-full mb-4 pointer-events-none select-none flex flex-col items-center"
                        style={{ perspective: 1000 }}
                      >
                        <ToolPreview item={item} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ───────────────────────────────────────────────
                      THE SQUARE DOCK ICON
                  ─────────────────────────────────────────────── */}
                  <motion.button
                    type="button"
                    aria-label={item.title}
                    animate={{
                      y: isHovered ? -8 : 0,
                      scale: isHovered ? 1.08 : isBlurred ? 0.95 : 1,
                      filter: isBlurred ? 'blur(10px)' : 'blur(0px)',
                      opacity: isBlurred ? 0.35 : 1,
                    }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="relative group flex h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 items-center justify-center rounded-[22px] sm:rounded-[26px] md:rounded-[30px] shadow-[0_12px_28px_rgba(0,0,0,0.08)] dark:shadow-[0_14px_32px_rgba(0,0,0,0.4)] border border-black/[0.08] dark:border-white/[0.12] focus:outline-none transition-shadow duration-300"
                    style={{
                      boxShadow: isHovered
                        ? '0 20px 45px -10px rgba(0,0,0,0.25), 0 0 0 2px rgba(255,255,255,0.8)'
                        : undefined,
                    }}
                  >
                    <div
                      className="w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[30px] flex items-center justify-center p-3 text-white overflow-hidden"
                      style={{
                        background:
                          item.id === 'gpa'
                            ? 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
                            : item.id === 'colleges'
                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            : item.id === 'deadlines'
                            ? 'linear-gradient(135deg, #D97706 0%, #B45309 100%)'
                            : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                      }}
                    >
                      <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border border-white/25 shadow-inner">
                        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
                      </div>
                    </div>
                  </motion.button>

                  {/* ───────────────────────────────────────────────
                      EXPANDED TEXT & ACTION DETAILS (Below Icon)
                  ─────────────────────────────────────────────── */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.25, delay: 0.05 }}
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
                          className="mt-3.5 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs sm:text-sm font-bold font-nunito bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:scale-105 active:scale-95 transition-all"
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
// CUSTOM TOOL PREVIEW MOCKUPS
// ─────────────────────────────────────────────────────────────
function ToolPreview({ item }: { item: ToolItem }) {
  if (item.id === 'gpa') {
    return (
      <div className="relative w-64 sm:w-72 h-44 rounded-2xl p-4 bg-white dark:bg-[#151518] border border-black/[0.1] dark:border-white/[0.15] shadow-[0_24px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between">
        {/* Layered angled backdrop card */}
        <div className="absolute -top-2.5 -left-2.5 right-2.5 bottom-2.5 -z-10 rounded-2xl bg-blue-500/20 dark:bg-blue-600/30 border border-blue-400/30 transform -rotate-3" />

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            {item.badge}
          </span>
          <span className="text-[10px] font-mono text-slate-400">Class 10/12</span>
        </div>

        {/* Live Calculation Mockup */}
        <div className="my-auto space-y-1.5 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex justify-between items-center text-[10px] font-nunito font-semibold text-slate-700 dark:text-slate-300">
            <span>Compulsory English</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              A+ (4.0)
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-nunito font-semibold text-slate-700 dark:text-slate-300">
            <span>Science &amp; Tech</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">
              A (3.6)
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-nunito font-extrabold pt-1 border-t border-black/[0.06] dark:border-white/[0.08] text-slate-900 dark:text-white">
            <span>Cumulative GPA</span>
            <span className="text-blue-600 dark:text-blue-400 font-mono text-xs">3.80 · Distinction</span>
          </div>
        </div>

        <div className="text-[10px] font-nunito text-slate-500 flex items-center justify-between">
          <span>Official NEB grading scale</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">Instant result</span>
        </div>
      </div>
    )
  }

  if (item.id === 'colleges') {
    return (
      <div className="relative w-64 sm:w-72 h-44 rounded-2xl p-4 bg-[#121316] text-white border border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between">
        {/* Layered dark green backdrop card */}
        <div className="absolute -top-2.5 -right-2.5 left-2.5 bottom-2.5 -z-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 transform rotate-2" />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{item.badge}</span>
          </div>
          <span className="text-[10px] font-mono text-white/50">All 7 Provinces</span>
        </div>

        {/* College card mockup */}
        <div className="my-auto p-2.5 rounded-xl bg-white/[0.06] border border-white/10 space-y-1">
          <div className="flex items-center justify-between">
            <h5 className="font-baloo text-xs font-bold text-white truncate">Pulchowk Campus, IOE</h5>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Constituent
            </span>
          </div>
          <p className="text-[10px] font-nunito text-white/70">Tribhuvan University · Lalitpur</p>
          <div className="pt-1 flex items-center gap-2 text-[9px] text-emerald-400 font-mono">
            <span>✓ Gazette Proof</span>
            <span>✓ 2082 Fees Checked</span>
          </div>
        </div>

        <div className="text-[10px] font-nunito text-white/60 flex items-center justify-between">
          <span>Zero paid sponsorships</span>
          <span className="text-emerald-300 font-bold">1-Click Filter →</span>
        </div>
      </div>
    )
  }

  if (item.id === 'deadlines') {
    return (
      <div className="relative w-64 sm:w-72 h-44 rounded-2xl p-4 bg-white dark:bg-[#151518] border border-black/[0.1] dark:border-white/[0.15] shadow-[0_24px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between">
        {/* Layered amber backdrop card */}
        <div className="absolute -top-2.5 -left-2.5 right-2.5 bottom-2.5 -z-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 transform -rotate-2" />

        <div className="flex items-center justify-between text-[10px] font-mono text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-1 font-bold">
            <Clock className="w-3 h-3" />
            {item.badge}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 font-bold">Live Alert</span>
        </div>

        {/* Deadline alert card */}
        <div className="my-auto p-2.5 rounded-xl bg-amber-50/60 dark:bg-white/[0.04] border border-amber-200/50 dark:border-white/[0.08] space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold font-nunito text-slate-900 dark:text-white">
            <span className="truncate">MoEST National Merit Scheme</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[9px] font-bold">
              4 Days Left
            </span>
          </div>
          <p className="text-[10px] font-nunito text-slate-600 dark:text-slate-300">
            Full tuition waiver for Bachelor of Engineering &amp; Medicine
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] font-nunito text-slate-400 pt-1 border-t border-black/[0.06] dark:border-white/[0.08]">
          <span>Verified source link</span>
          <span className="text-amber-700 dark:text-amber-400 font-bold">Set Reminder →</span>
        </div>
      </div>
    )
  }

  // Admission Planner Preview
  return (
    <div className="relative w-64 sm:w-72 h-44 rounded-2xl p-4 bg-[#121316] text-white border border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* Floating sticker badge */}
      <div className="absolute -top-3 -right-2 z-10 px-2.5 py-0.8 rounded-full bg-purple-400 text-slate-950 text-[10px] font-bold shadow transform rotate-3 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        <span>Checklist Ready</span>
      </div>

      <div className="flex items-center gap-2 text-purple-300 font-mono text-[10px]">
        <FileCheck className="w-3.5 h-3.5" />
        <span>{item.badge}</span>
      </div>

      {/* Checklist items */}
      <div className="my-auto space-y-1.5 p-2 rounded-xl bg-white/[0.06] border border-white/10 text-[10px] font-nunito">
        <div className="flex items-center justify-between text-white/90">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            Character Certificate &amp; Migration
          </span>
          <span className="text-[9px] font-mono text-emerald-400">Ready</span>
        </div>
        <div className="flex items-center justify-between text-white/90">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-purple-400" />
            SEE / NEB Official Marksheet
          </span>
          <span className="text-[9px] font-mono text-emerald-400">Ready</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-purple-300">
        <span>No signup required</span>
        <span className="underline">Download PDF</span>
      </div>
    </div>
  )
}
