'use client'

import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Clock,
  ExternalLink,
  GraduationCap,
  CheckCircle2,
  FileCheck,
  Scale,
  Sparkles,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 18,
      duration: 0.7,
    },
  },
}

const OFFICIAL_PORTALS = [
  { name: 'TU', fullName: 'Tribhuvan University', domain: 'tu.edu.np' },
  { name: 'KU', fullName: 'Kathmandu University', domain: 'ku.edu.np' },
  { name: 'Pokhara', fullName: 'Pokhara University', domain: 'pu.edu.np' },
  { name: 'NEB', fullName: 'National Examination Board', domain: 'neb.gov.np' },
  { name: 'CTEVT', fullName: 'Technical Education Board', domain: 'ctevt.org.np' },
]

export default function ShikshyaStandardBento() {
  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden py-14 sm:py-20 lg:py-24">
      {/* ── Background Ambient Glow ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <div
          className="w-[850px] h-[550px] rounded-full blur-[140px] opacity-25 dark:opacity-15"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(14, 165, 233, 0.18) 0%, rgba(245, 165, 36, 0.12) 40%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] shadow-2xs text-[11px] font-nunito font-bold text-slate-700 dark:text-slate-300 mb-3 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-primary dark:text-[#F5A524]" />
            <span>The Shikshya Standard</span>
          </div>

          <h2 className="font-baloo text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.12] text-balance">
            What makes our guide different
          </h2>

          <p className="mt-3 text-sm sm:text-base font-nunito text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
            Every detail is calibrated for the student, not the marketing department.
          </p>
        </div>

        {/* ── Asymmetric Bento Grid (7/5 Split) ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5"
        >
          {/* ══════════════════════════════════════════════════════
              BENTO 1: HERO PILLAR — Zero Paid Rankings (Span 7)
          ══════════════════════════════════════════════════════ */}
          <motion.article
            variants={cardVariants}
            className="lg:col-span-7 apple-card group rounded-[26px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              {/* Badge & Pill Header */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-nunito">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Strict Neutrality</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-nunito">
                  Standard 01
                </span>
              </div>

              <h3 className="font-baloo text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug mb-2">
                Zero paid rankings. 100% student-first.
              </h3>

              <p className="text-xs sm:text-sm font-nunito text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-6">
                Colleges cannot pay for higher positions, sponsored badges, or skewed reviews. Real university affiliation and merit criteria always come first.
              </p>
            </div>

            {/* Interactive Merit Comparison Preview Widget */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-[#07191E]/90 border border-black/[0.06] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-2xs">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-black/[0.05] dark:border-white/[0.06] text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    Merit-Ranked Public Ledger
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-nunito shrink-0">
                  Sponsored: 0
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-nunito text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Tribhuvan University Constituent Rank #1</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Published CMAT/IOE cut-offs verified</span>
                </div>
              </div>
            </div>
          </motion.article>

          {/* ══════════════════════════════════════════════════════
              BENTO 2: AUDIT TIMESTAMP — Dated & Sourced (Span 5)
          ══════════════════════════════════════════════════════ */}
          <motion.article
            variants={cardVariants}
            className="lg:col-span-5 apple-card group rounded-[26px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-500/10 dark:bg-sky-400/15 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-bold font-nunito">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Notice Audit</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-nunito">
                  Standard 02
                </span>
              </div>

              <h3 className="font-baloo text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug mb-2">
                Dated &amp; sourced down to the day.
              </h3>

              <p className="text-xs sm:text-sm font-nunito text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Every fee figure, seat quota, and deadline displays the exact date it was checked against official university notices.
              </p>
            </div>

            {/* Live Audit Ticker Pill */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-[#07191E]/90 border border-black/[0.06] dark:border-white/[0.08] p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-[11.5px]">
                      Active Registry Sync
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      Matched with TU Registrar Gazettes
                    </p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold text-[10px] font-nunito shrink-0">
                  Baisakh 2082
                </div>
              </div>
            </div>
          </motion.article>

          {/* ══════════════════════════════════════════════════════
              BENTO 3: OFFICIAL BOARD PORTALS — Direct Gazette Links (Span 5)
          ══════════════════════════════════════════════════════ */}
          <motion.article
            variants={cardVariants}
            className="lg:col-span-5 apple-card group rounded-[26px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold font-nunito">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Direct Portals</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-nunito">
                  Standard 03
                </span>
              </div>

              <h3 className="font-baloo text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug mb-2">
                Official gazette links.
              </h3>

              <p className="text-xs sm:text-sm font-nunito text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                Direct verification links to official government and university exam portals—without confusing third-party redirects or ad walls.
              </p>
            </div>

            {/* Interactive Portal Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {OFFICIAL_PORTALS.map((portal) => (
                <div
                  key={portal.name}
                  title={`${portal.fullName} (${portal.domain})`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-slate-200/90 dark:bg-[#07191E]/90 dark:hover:bg-[#0E2830] border border-black/[0.06] dark:border-white/[0.08] text-slate-800 dark:text-slate-200 text-[11px] font-bold font-nunito transition-colors cursor-default"
                >
                  <span>{portal.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">.edu</span>
                </div>
              ))}
            </div>
          </motion.article>

          {/* ══════════════════════════════════════════════════════
              BENTO 4: ALWAYS FREE — Public Mission (Span 7)
          ══════════════════════════════════════════════════════ */}
          <motion.article
            variants={cardVariants}
            className="lg:col-span-7 apple-card group rounded-[26px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 dark:bg-purple-400/15 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold font-nunito">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Public Good</span>
                </div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-nunito">
                  Standard 04
                </span>
              </div>

              <h3 className="font-baloo text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug mb-2">
                100% Free for students. No gated paywalls.
              </h3>

              <p className="text-xs sm:text-sm font-nunito text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-6">
                No subscription tiers, no locked GPA calculators, and no paid college guide downloads. Open, transparent access for every student across all 7 provinces.
              </p>
            </div>

            {/* Public Service Commitment Stamp */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-[#07191E]/90 border border-black/[0.06] dark:border-white/[0.08] p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 dark:bg-purple-400/15 flex items-center justify-center text-purple-600 dark:text-purple-300 shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-baloo text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Equal Access for All 7 Provinces
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-nunito">
                    Zero credit card requirements • No login walls to search
                  </p>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold text-xs font-nunito">
                Rs. 0 Forever
              </div>
            </div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  )
}
