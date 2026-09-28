'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  CalendarCheck2,
  Calculator,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react'

export default function VoxtBentoGrid() {
  const [activeGrade, setActiveGrade] = useState<'A+' | 'A' | 'B+'>('A+')
  const [activeBoard, setActiveBoard] = useState<'TU' | 'NEB' | 'KU'>('TU')

  const gradeInfo = {
    'A+': { gpa: '3.6 - 4.0', label: 'Distinction / Outstanding', pct: '90 - 100%' },
    'A': { gpa: '3.2 - 3.6', label: 'Excellent', pct: '80 - 89%' },
    'B+': { gpa: '2.8 - 3.2', label: 'Very Good', pct: '70 - 79%' },
  }[activeGrade]

  return (
    <div className="relative rounded-[28px] border border-sn-border-strong bg-white/80 backdrop-blur-xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.95),0_12px_40px_rgba(15,23,42,0.05)] overflow-hidden">
      {/* ── Voxt Center Crosshair Rivet Pin ───────────────── */}
      <div
        className="voxt-pin top-1/2 left-1/2 hidden lg:block"
        aria-hidden="true"
      />

      {/* ── 4 Quadrant Grid with Voxt Hairline Dividers ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* ── Quadrant 1: Top-Left (Board Results) ───────── */}
        <div className="group relative border-b border-sn-border-strong lg:border-r p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-colors hover:bg-sn-surface-alt/40">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-mono text-xs font-bold text-sn-ink-muted uppercase tracking-wider">
                01 / Board Verification
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200/70">
                <FileText className="h-3.5 w-3.5 text-amber-600" />
                Official Archives
              </span>
            </div>

            <h3 className="font-baloo text-2xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors leading-tight">
              Direct examination results and marksheet records.
            </h3>
            <p className="mt-2 text-sm font-nunito text-sn-ink-soft leading-relaxed">
              Official records from TU Balkhu, NEB Sanothimi, and CTEVT. Roll number searches, division breakdowns, and verified publication dates.
            </p>

            {/* Interactive Board Preview */}
            <div className="mt-6 rounded-2xl border border-black/[0.08] bg-sn-ground/60 p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-sn-ink">Select Examination Board:</span>
                <div className="flex gap-1">
                  {(['TU', 'NEB', 'KU'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setActiveBoard(b)}
                      className={`rounded-md px-2 py-0.5 font-bold text-[11px] font-mono transition-all ${
                        activeBoard === b
                          ? 'bg-sn-ink text-white'
                          : 'bg-white text-sn-ink-soft hover:bg-black/[0.05]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs font-mono">
                    {activeBoard}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-sn-ink font-nunito">
                      {activeBoard === 'TU' && '4-Year BBA / BBM 8th Semester Exam Results'}
                      {activeBoard === 'NEB' && 'Grade 12 Science / Management Annual Result'}
                      {activeBoard === 'KU' && 'School of Engineering Merit Ranking List'}
                    </p>
                    <p className="text-[11px] text-sn-ink-muted">Sourced directly · Roll &amp; Symbol No verified</p>
                  </div>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <span className="text-xs font-nunito text-sn-ink-muted">Over 450+ archived board results</span>
            <Link
              href="/results"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary group-hover:text-sn-primary-hover"
            >
              <span>Search results</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ── Quadrant 2: Top-Right (Admissions & Intakes) ── */}
        <div className="group relative border-b border-sn-border-strong p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-colors hover:bg-sn-surface-alt/40">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-mono text-xs font-bold text-sn-ink-muted uppercase tracking-wider">
                02 / Active Intakes
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/70">
                <CalendarCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                Live Deadlines
              </span>
            </div>

            <h3 className="font-baloo text-2xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors leading-tight">
              Never miss an entrance form or quota window.
            </h3>
            <p className="mt-2 text-sm font-nunito text-sn-ink-soft leading-relaxed">
              Track open application deadlines across engineering, medicine, management, and technology. Verified dates with direct official links.
            </p>

            {/* Interactive Deadline Widget */}
            <div className="mt-6 rounded-2xl border border-black/[0.08] bg-sn-ground/60 p-4 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-sn-ink font-nunito">Kathmandu University · BTech Admissions</p>
                    <p className="text-[11px] text-sn-ink-muted">Closes in 4 days · Entrance syllabus attached</p>
                  </div>
                </div>
                <span className="rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                  Closing Soon
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-black/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-sn-ink font-nunito">Tribhuvan University (IOE) · Entrance 2082</p>
                    <p className="text-[11px] text-sn-ink-muted">Form verification open · Constituent &amp; Affiliated</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Open
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <span className="text-xs font-nunito text-sn-ink-muted">Filtered by real application status</span>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary group-hover:text-sn-primary-hover"
            >
              <span>Explore admissions</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ── Quadrant 3: Bottom-Left (Campus Atlas) ──────── */}
        <div className="group relative border-b border-sn-border-strong lg:border-b-0 lg:border-r p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-colors hover:bg-sn-surface-alt/40">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-mono text-xs font-bold text-sn-ink-muted uppercase tracking-wider">
                03 / Affiliation Atlas
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800 border border-blue-200/70">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                Charter Verified
              </span>
            </div>

            <h3 className="font-baloo text-2xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors leading-tight">
              Every college mapped with genuine affiliation.
            </h3>
            <p className="mt-2 text-sm font-nunito text-sn-ink-soft leading-relaxed">
              Clear distinction between constituent government campuses and private affiliated colleges. Sourced fees, faculties, and official locations.
            </p>

            {/* University Metrics Ribbon */}
            <div className="mt-6 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-black/[0.08] bg-sn-ground/60 p-3 text-center">
                <p className="font-baloo text-lg font-bold text-sn-ink">TU</p>
                <p className="text-[11px] font-nunito text-sn-ink-muted">Tribhuvan Univ</p>
                <span className="mt-1 inline-block rounded-full bg-sn-tint-peach/80 px-2 py-0.5 text-[10px] font-bold text-sn-ink">
                  1,100+ Campuses
                </span>
              </div>

              <div className="rounded-xl border border-black/[0.08] bg-sn-ground/60 p-3 text-center">
                <p className="font-baloo text-lg font-bold text-sn-ink">KU</p>
                <p className="text-[11px] font-nunito text-sn-ink-muted">Kathmandu Univ</p>
                <span className="mt-1 inline-block rounded-full bg-sn-tint-mint/80 px-2 py-0.5 text-[10px] font-bold text-sn-ink">
                  Autonomous
                </span>
              </div>

              <div className="rounded-xl border border-black/[0.08] bg-sn-ground/60 p-3 text-center">
                <p className="font-baloo text-lg font-bold text-sn-ink">PU / PurU</p>
                <p className="text-[11px] font-nunito text-sn-ink-muted">Pokhara &amp; Purb</p>
                <span className="mt-1 inline-block rounded-full bg-sn-tint-butter/80 px-2 py-0.5 text-[10px] font-bold text-sn-ink">
                  Regional Hubs
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <span className="text-xs font-nunito text-sn-ink-muted">Dated sources, zero paid rankings</span>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary group-hover:text-sn-primary-hover"
            >
              <span>Browse directory</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* ── Quadrant 4: Bottom-Right (Student Toolkit) ──── */}
        <div className="group relative p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-colors hover:bg-sn-surface-alt/40">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="font-mono text-xs font-bold text-sn-ink-muted uppercase tracking-wider">
                04 / Student Toolkit
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-800 border border-purple-200/70">
                <Calculator className="h-3.5 w-3.5 text-purple-600" />
                NEB &amp; SEE Standard
              </span>
            </div>

            <h3 className="font-baloo text-2xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors leading-tight">
              GPA calculations tailored to Nepal&apos;s curriculum.
            </h3>
            <p className="mt-2 text-sm font-nunito text-sn-ink-soft leading-relaxed">
              Calculate cumulative GPA, convert letter grades to percentage bands, and check program eligibility requirements before applying.
            </p>

            {/* Interactive GPA Grade Converter Widget */}
            <div className="mt-6 rounded-2xl border border-black/[0.08] bg-sn-ground/60 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-sn-ink">Select Grade Scale:</span>
                <div className="flex gap-1.5">
                  {(['A+', 'A', 'B+'] as const).map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setActiveGrade(grade)}
                      className={`rounded-lg px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                        activeGrade === grade
                          ? 'bg-purple-800 text-white shadow-xs'
                          : 'bg-white text-sn-ink-soft hover:bg-black/[0.05]'
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-black/[0.06]">
                <div>
                  <p className="text-xs font-bold text-sn-ink font-nunito">{gradeInfo.label}</p>
                  <p className="text-[11px] text-sn-ink-muted">Equivalent to {gradeInfo.pct}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded-md">
                    {gradeInfo.gpa} GPA
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.06] flex items-center justify-between">
            <span className="text-xs font-nunito text-sn-ink-muted">SEE, +2 and Semester CGPA tools</span>
            <Link
              href="/tools/gpa-calculator"
              className="inline-flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary group-hover:text-sn-primary-hover"
            >
              <span>Launch calculator</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
