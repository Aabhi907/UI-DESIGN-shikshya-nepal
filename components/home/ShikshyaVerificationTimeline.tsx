'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  FileCheck,
  Coins,
  CheckCircle2,
  Users,
  GraduationCap,
  Sparkles,
  Info,
} from 'lucide-react'

interface Milestone {
  id: string
  label: string
  detail: string
  stage: number // 1 to 5
  topPercent: number // vertical offset in timeline canvas (15% to 75%)
  leftPercent: number // horizontal position (8% to 92%)
  bgLight: string
  textLight: string
  borderLight: string
  bgDark: string
  textDark: string
  borderDark: string
  floatDuration: number
  floatDelay: number
  icon: typeof ShieldCheck
}

const MILESTONES: Milestone[] = [
  {
    id: 'gazettes',
    label: 'Official Board Gazettes',
    detail: 'Direct notices extracted from TU, KU, Pokhara, NEB and CTEVT registrars.',
    stage: 1,
    topPercent: 58,
    leftPercent: 12,
    bgLight: 'bg-[#FFEAEB]',
    textLight: 'text-[#BE185D]',
    borderLight: 'border-[#FBCFE8]',
    bgDark: 'dark:bg-[#3D1420]',
    textDark: 'dark:text-[#F472B6]',
    borderDark: 'dark:border-[#5E1E32]',
    floatDuration: 3.6,
    floatDelay: 0,
    icon: FileCheck,
  },
  {
    id: 'charter-audit',
    label: 'Charter Cross-Check',
    detail: 'Comparing published programs against official university affiliation charters.',
    stage: 1,
    topPercent: 22,
    leftPercent: 22,
    bgLight: 'bg-[#FEF3C7]',
    textLight: 'text-[#B45309]',
    borderLight: 'border-[#FDE68A]',
    bgDark: 'dark:bg-[#38280D]',
    textDark: 'dark:text-[#FCD34D]',
    borderDark: 'dark:border-[#5A3F14]',
    floatDuration: 4.2,
    floatDelay: 0.5,
    icon: CheckCircle2,
  },
  {
    id: 'fee-audit',
    label: 'Fee Auditing',
    detail: 'Recorded semester & admission fees verified without consultancy inflation.',
    stage: 2,
    topPercent: 68,
    leftPercent: 32,
    bgLight: 'bg-[#FEF9C3]',
    textLight: 'text-[#A16207]',
    borderLight: 'border-[#FEF08A]',
    bgDark: 'dark:bg-[#38330D]',
    textDark: 'dark:text-[#FDE047]',
    borderDark: 'dark:border-[#5A5014]',
    floatDuration: 3.9,
    floatDelay: 0.2,
    icon: Coins,
  },
  {
    id: 'quotas',
    label: 'Quota & Seat Verification',
    detail: 'Official quotas verified between open merit seats and reservation brackets.',
    stage: 3,
    topPercent: 30,
    leftPercent: 48,
    bgLight: 'bg-[#ECFDF5]',
    textLight: 'text-[#047857]',
    borderLight: 'border-[#A7F3D0]',
    bgDark: 'dark:bg-[#0D3323]',
    textDark: 'dark:text-[#6EE7B7]',
    borderDark: 'dark:border-[#135439]',
    floatDuration: 4.5,
    floatDelay: 0.8,
    icon: ShieldCheck,
  },
  {
    id: 'zero-paid-rankings',
    label: 'Zero Paid Rankings',
    detail: 'Strict neutrality: no college can pay for higher placement or sponsored badges.',
    stage: 4,
    topPercent: 62,
    leftPercent: 66,
    bgLight: 'bg-[#E0F2FE]',
    textLight: 'text-[#0369A1]',
    borderLight: 'border-[#BAE6FD]',
    bgDark: 'dark:bg-[#0C2B3F]',
    textDark: 'dark:text-[#7DD3FC]',
    borderDark: 'dark:border-[#144766]',
    floatDuration: 3.8,
    floatDelay: 0.3,
    icon: ShieldCheck,
  },
  {
    id: 'student-reviews',
    label: 'Student Moderation',
    detail: 'Reviews verified with roll number checks to block fake campus PR reviews.',
    stage: 4,
    topPercent: 24,
    leftPercent: 74,
    bgLight: 'bg-[#F0FDFA]',
    textLight: 'text-[#0F766E]',
    borderLight: 'border-[#99F6E4]',
    bgDark: 'dark:bg-[#0B332F]',
    textDark: 'dark:text-[#5EEAD4]',
    borderDark: 'dark:border-[#13544D]',
    floatDuration: 4.1,
    floatDelay: 0.7,
    icon: Users,
  },
  {
    id: 'free-access',
    label: '100% Free Public Access',
    detail: 'Zero paywalls, zero locked calculators, open to all students across Nepal.',
    stage: 5,
    topPercent: 32,
    leftPercent: 88,
    bgLight: 'bg-[#F3E8FF]',
    textLight: 'text-[#7E22CE]',
    borderLight: 'border-[#E9D5FF]',
    bgDark: 'dark:bg-[#2C1347]',
    textDark: 'dark:text-[#D8B4FE]',
    borderDark: 'dark:border-[#4B1E78]',
    floatDuration: 4.4,
    floatDelay: 0.4,
    icon: GraduationCap,
  },
]

const TIMELINE_STAGES = [
  { step: '01 Stage', name: 'Notice Collection' },
  { step: '02 Stage', name: 'Charter Audit' },
  { step: '03 Stage', name: 'Quota Breakdown' },
  { step: '04 Stage', name: 'Peer Review' },
  { step: '05 Stage', name: 'Public Release' },
]

export default function ShikshyaVerificationTimeline() {
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null)

  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* ── Soft Background Ambient Glow ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <div
          className="w-[850px] h-[500px] rounded-full blur-[140px] opacity-25 dark:opacity-15"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.16) 0%, rgba(245, 165, 36, 0.12) 45%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* ── Top Header with Avatar / Badge Seal ── */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          {/* Emblem Icon Pill matching reference */}
          <div className="mx-auto w-12 h-12 rounded-full p-0.5 ring-4 ring-[#F5A524]/20 bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm mb-4">
            <div className="w-full h-full rounded-full bg-[#0B2B33] dark:bg-[#F5A524] flex items-center justify-center text-white dark:text-[#061519]">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <h2 className="font-baloo text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.12] text-balance mb-3">
            The scope of our verification
          </h2>

          <p className="text-sm sm:text-base font-nunito text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mx-auto">
            Every fee figure, admission quota, and university affiliation passes through our independent verification pipeline before reaching students across Nepal.
          </p>
        </div>

        {/* ── DESKTOP & TABLET: Interactive Floating Timeline Canvas (Matching Reference) ── */}
        <div className="hidden md:block relative w-full h-[360px] lg:h-[400px] rounded-3xl bg-white/40 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] p-6 shadow-2xs backdrop-blur-xs select-none">
          
          {/* 5 Vertical Dashed Timeline Guides */}
          <div className="absolute inset-0 grid grid-cols-5 pointer-events-none px-6">
            {TIMELINE_STAGES.map((stage, idx) => (
              <div
                key={idx}
                className="relative h-full flex flex-col justify-end items-center pb-4 border-r last:border-r-0 border-dashed border-slate-300/70 dark:border-slate-700/60"
              >
                <div className="text-center">
                  <span className="block text-[10.5px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {stage.step}
                  </span>
                  <span className="block text-xs font-nunito font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {stage.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Colorful Milestone Pills */}
          {MILESTONES.map((m) => {
            const Icon = m.icon
            const isHovered = activeMilestone?.id === m.id

            return (
              <motion.div
                key={m.id}
                animate={{
                  y: [0, -6, 0],
                }}
                transition={{
                  duration: m.floatDuration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: m.floatDelay,
                }}
                style={{
                  top: `${m.topPercent}%`,
                  left: `${m.leftPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-20 cursor-pointer"
                onMouseEnter={() => setActiveMilestone(m)}
                onMouseLeave={() => setActiveMilestone(null)}
              >
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border shadow-2xs transition-shadow duration-200 ${m.bgLight} ${m.textLight} ${m.borderLight} ${m.bgDark} ${m.textDark} ${m.borderDark}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="text-xs lg:text-[13px] font-bold font-nunito whitespace-nowrap">
                    {m.label}
                  </span>
                </motion.div>

                {/* Micro Detail Popover on Hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-black/[0.08] dark:border-white/[0.12] p-2.5 shadow-lg z-30 pointer-events-none text-left"
                    >
                      <div className="flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-primary dark:text-[#F5A524] shrink-0 mt-0.5" />
                        <p className="text-[11px] font-nunito text-slate-600 dark:text-slate-300 leading-snug">
                          {m.detail}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* ── MOBILE: Interactive Flow for Smaller Screens ── */}
        <div className="md:hidden space-y-4">
          <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-black/[0.06] dark:border-white/[0.08] text-center">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              Verification Flow
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MILESTONES.map((m) => {
              const Icon = m.icon
              return (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl border ${m.bgLight} ${m.borderLight} ${m.bgDark} ${m.borderDark} text-left`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-full bg-black/5 dark:bg-white/10">
                      <Icon className={`w-3.5 h-3.5 ${m.textLight} ${m.textDark}`} />
                    </div>
                    <span className={`text-xs font-bold font-nunito ${m.textLight} ${m.textDark}`}>
                      {m.label}
                    </span>
                  </div>
                  <p className="text-[11px] font-nunito text-slate-600 dark:text-slate-300 leading-relaxed">
                    {m.detail}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </section>
  )
}
