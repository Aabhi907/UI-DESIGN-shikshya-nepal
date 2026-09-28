'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  GraduationCap,
  FileText,
  CalendarCheck2,
  Calculator,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import type { Result, Notice, College } from '@/types'
import { CAMPUS_FALLBACK_IMAGES } from '@/components/design-system/FeaturedCollegeCard'

interface HeroAppStageProps {
  featuredCollege?: College | null
  latestResult?: Result | null
  latestNotice?: Notice | null
}

type TabType = 'colleges' | 'results' | 'admissions' | 'gpa'

export default function HeroAppStage({
  featuredCollege,
  latestResult,
  latestNotice,
}: HeroAppStageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('colleges')
  const [collegeFacultyFilter, setCollegeFacultyFilter] = useState<'all' | 'eng' | 'med' | 'mgmt' | 'it'>('all')
  const [simulatedRoll, setSimulatedRoll] = useState('2401884')
  const [selectedGrades, setSelectedGrades] = useState<Record<string, number>>({
    'English': 3.6,
    'Mathematics': 4.0,
    'Physics': 3.6,
    'Chemistry': 3.2,
  })

  // Calculate live simulated GPA
  const gradeValues = Object.values(selectedGrades)
  const currentGPA = (gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length).toFixed(2)

  const collegeCover = featuredCollege?.cover_url || CAMPUS_FALLBACK_IMAGES[0]

  return (
    <div className="apple-shell !p-2 sm:!p-3 shadow-[0_20px_60px_-15px_rgba(42,33,26,0.12)]">
      <div className="overflow-hidden rounded-[20px] border border-black/[0.08] bg-white/95 backdrop-blur-xl">
        {/* ── macOS Title Bar ────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#FAF8F5] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-black/[0.1] shadow-inner" />
            <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-black/[0.1] shadow-inner" />
            <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-black/[0.1] shadow-inner" />
            <span className="ml-2 font-mono text-[11px] font-semibold text-sn-ink-muted">
              SikshyaOS v2.4
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Database
            </span>
          </div>
        </div>

        {/* ── macOS Segmented Control Tabs ───────────────── */}
        <div className="border-b border-black/[0.06] bg-sn-ground/50 p-2.5">
          <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-black/[0.04] p-1 text-center">
            <button
              type="button"
              onClick={() => setActiveTab('colleges')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold font-nunito transition-all duration-200 ${
                activeTab === 'colleges'
                  ? 'bg-white text-sn-ink shadow-sm'
                  : 'text-sn-ink-soft hover:text-sn-ink'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-sn-primary" />
              <span className="hidden sm:inline">Campuses</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('results')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold font-nunito transition-all duration-200 ${
                activeTab === 'results'
                  ? 'bg-white text-sn-ink shadow-sm'
                  : 'text-sn-ink-soft hover:text-sn-ink'
              }`}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span className="hidden sm:inline">Results</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admissions')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold font-nunito transition-all duration-200 ${
                activeTab === 'admissions'
                  ? 'bg-white text-sn-ink shadow-sm'
                  : 'text-sn-ink-soft hover:text-sn-ink'
              }`}
            >
              <CalendarCheck2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="hidden sm:inline">Intakes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gpa')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold font-nunito transition-all duration-200 ${
                activeTab === 'gpa'
                  ? 'bg-white text-sn-ink shadow-sm'
                  : 'text-sn-ink-soft hover:text-sn-ink'
              }`}
            >
              <Calculator className="h-3.5 w-3.5 shrink-0 text-purple-600" />
              <span className="hidden sm:inline">GPA Tool</span>
            </button>
          </div>
        </div>

        {/* ── Active Tab Stage Content ───────────────────── */}
        <div className="p-4 sm:p-5 min-h-[310px]">
          {/* TAB 1: COLLEGES */}
          {activeTab === 'colleges' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['all', 'eng', 'med', 'mgmt', 'it'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCollegeFacultyFilter(cat)}
                    className={`rounded-full px-3 py-1 font-bold font-nunito text-xs transition-all ${
                      collegeFacultyFilter === cat
                        ? 'bg-sn-ink text-white'
                        : 'bg-sn-surface-alt text-sn-ink-soft hover:bg-black/[0.06]'
                    }`}
                  >
                    {cat === 'all' && 'All Programs'}
                    {cat === 'eng' && 'Engineering'}
                    {cat === 'med' && 'Medical'}
                    {cat === 'mgmt' && 'Management'}
                    {cat === 'it' && 'Information Tech'}
                  </button>
                ))}
              </div>

              {/* Main Featured Campus Card */}
              <div className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-sn-surface-alt shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="relative h-36 w-full overflow-hidden bg-sn-ink">
                  <Image
                    src={collegeCover}
                    alt="Campus preview"
                    fill
                    sizes="(min-width: 1024px) 450px, 100vw"
                    className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="apple-glass rounded-full px-2.5 py-0.5 text-[10px] font-bold text-sn-ink shadow-sm">
                      Verified Affiliation
                    </span>
                    <span className="rounded-full bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      2026 Sourced
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <p className="font-baloo text-base font-bold leading-tight line-clamp-1">
                      {featuredCollege?.name || 'Pulchowk Campus (IOE)'}
                    </p>
                    <p className="text-xs font-nunito text-white/80 mt-0.5 line-clamp-1">
                      {featuredCollege?.location || 'Lalitpur, Bagmati Province · Tribhuvan University'}
                    </p>
                  </div>
                </div>

                <div className="p-3 flex items-center justify-between gap-3 bg-white">
                  <div className="text-xs font-nunito">
                    <span className="text-sn-ink-muted">Programs: </span>
                    <span className="font-bold text-sn-ink">BE Civil, BE Computer, Architecture</span>
                  </div>
                  <Link
                    href={featuredCollege ? `/colleges/${featuredCollege.slug}` : '/colleges'}
                    className="shrink-0 inline-flex items-center gap-1 rounded-full bg-sn-primary-bg px-3 py-1 text-xs font-bold text-sn-primary hover:bg-sn-primary hover:text-white transition-colors"
                  >
                    <span>View College</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Supporting Secondary Micro-item */}
              <div className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-sn-ground/40 p-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sn-tint-mint font-baloo font-bold text-sn-ink">
                    KU
                  </div>
                  <div>
                    <p className="font-bold font-nunito text-sn-ink">Kathmandu University School of Engineering</p>
                    <p className="text-[11px] text-sn-ink-muted">Dhulikhel · Entrance Merit Ranked</p>
                  </div>
                </div>
                <Link href="/colleges?affiliation=Kathmandu+University" className="text-sn-primary font-bold hover:underline">
                  Compare
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: RESULTS */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-black/[0.06] bg-sn-surface-alt/70 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-nunito text-sn-ink flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                    Board Roll Number Simulator
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    Official Feed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={simulatedRoll}
                    onChange={(e) => setSimulatedRoll(e.target.value)}
                    placeholder="Enter Roll Number (e.g. 2401884)"
                    className="w-full rounded-lg border border-black/[0.1] bg-white px-3 py-1.5 text-xs font-mono text-sn-ink focus:outline-none focus:ring-2 focus:ring-sn-primary"
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded-lg bg-sn-ink px-3 py-1.5 text-xs font-bold text-white hover:bg-sn-primary transition-colors"
                  >
                    Check
                  </button>
                </div>
              </div>

              {/* Simulated Marksheet Result Card */}
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3.5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Passed · First Division
                    </span>
                    <p className="mt-1.5 font-baloo text-sm font-bold text-sn-ink">
                      {latestResult?.title || 'NEB Grade 12 Annual Examination Result'}
                    </p>
                    <p className="text-xs font-nunito text-sn-ink-soft">
                      Roll: {simulatedRoll || '2401884'} · GPA: 3.65 (81.2%)
                    </p>
                  </div>
                  <Link
                    href={latestResult ? `/results/${latestResult.slug}` : '/results'}
                    className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-sn-ink shadow-sm hover:text-sn-primary transition-colors"
                  >
                    Open
                  </Link>
                </div>
              </div>

              {latestNotice && (
                <div className="flex items-center justify-between rounded-xl border border-black/[0.06] bg-sn-ground/50 p-2.5 text-xs">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-sn-primary uppercase tracking-wider block">Latest Notice</span>
                    <p className="font-bold text-sn-ink truncate font-nunito">{latestNotice.title}</p>
                  </div>
                  <Link href={`/notices/${latestNotice.slug}`} className="shrink-0 text-sn-primary font-bold hover:underline">
                    View
                  </Link>
                </div>
              )}

              <div className="text-center">
                <Link
                  href="/results"
                  className="inline-flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary hover:underline"
                >
                  <span>Browse all published board results</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* TAB 3: ADMISSIONS */}
          {activeTab === 'admissions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-sn-ink">Active College Intakes</span>
                <span className="text-sn-ink-muted">Sorted by deadline</span>
              </div>

              <div className="rounded-xl border border-black/[0.08] bg-white p-3 shadow-sm hover:border-sn-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800">
                      <Clock className="h-3 w-3" />
                      Closes in 4 days
                    </span>
                    <h4 className="mt-1 font-baloo text-sm font-bold text-sn-ink">
                      Kathmandu University · BTech Artificial Intelligence
                    </h4>
                    <p className="text-xs font-nunito text-sn-ink-muted">
                      Eligibility: Min 2.4 GPA in +2 Science or equivalent
                    </p>
                  </div>
                  <Link
                    href="/admissions"
                    className="rounded-lg bg-sn-primary px-2.5 py-1 text-xs font-bold text-white hover:bg-sn-primary-hover"
                  >
                    Apply
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-black/[0.08] bg-white p-3 shadow-sm hover:border-sn-primary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <Clock className="h-3 w-3" />
                      Rolling Intake Open
                    </span>
                    <h4 className="mt-1 font-baloo text-sm font-bold text-sn-ink">
                      Tribhuvan University (IOST) · BSc Computer Science &amp; IT
                    </h4>
                    <p className="text-xs font-nunito text-sn-ink-muted">
                      Entrance exam application form online
                    </p>
                  </div>
                  <Link
                    href="/admissions"
                    className="rounded-lg bg-sn-surface-alt px-2.5 py-1 text-xs font-bold text-sn-ink hover:bg-sn-primary hover:text-white transition-colors"
                  >
                    Details
                  </Link>
                </div>
              </div>

              <div className="text-center pt-1">
                <Link href="/admissions" className="text-xs font-bold text-sn-primary hover:underline">
                  View all active admissions →
                </Link>
              </div>
            </div>
          )}

          {/* TAB 4: GPA CALCULATOR */}
          {activeTab === 'gpa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-purple-50/70 border border-purple-200/60 p-3">
                <div>
                  <span className="text-[10px] font-bold font-mono uppercase text-purple-700">Calculated GPA</span>
                  <p className="font-baloo text-3xl font-extrabold text-purple-950 leading-none mt-0.5">
                    {currentGPA} <span className="text-xs font-nunito font-semibold text-purple-700">/ 4.00</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-purple-200/80 px-2.5 py-0.5 text-xs font-bold text-purple-900">
                    {Number(currentGPA) >= 3.6 ? 'A+ Distinction' : Number(currentGPA) >= 3.2 ? 'A Excellent' : 'B+ Good'}
                  </span>
                  <p className="text-[11px] font-nunito text-purple-700 mt-1">SEE &amp; +2 NEB Standard</p>
                </div>
              </div>

              {/* Subject Grade Chips */}
              <div className="space-y-2">
                <p className="text-xs font-bold font-nunito text-sn-ink">Tap to adjust subject grades:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedGrades).map(([subject, grade]) => (
                    <div key={subject} className="flex items-center justify-between rounded-lg border border-black/[0.08] bg-sn-ground/40 p-2">
                      <span className="font-bold text-sn-ink truncate">{subject}</span>
                      <div className="flex items-center gap-1">
                        {[4.0, 3.6, 3.2].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setSelectedGrades((prev) => ({ ...prev, [subject]: g }))}
                            className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold transition-all ${
                              grade === g
                                ? 'bg-purple-700 text-white shadow-xs'
                                : 'bg-white text-sn-ink-soft hover:bg-black/[0.05]'
                            }`}
                          >
                            {g === 4.0 ? 'A+' : g === 3.6 ? 'A' : 'B+'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-1">
                <Link
                  href="/tools/gpa-calculator"
                  className="inline-flex items-center gap-1 text-xs font-bold text-sn-primary hover:underline"
                >
                  <span>Open Full Advanced GPA Calculator</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Apple Floating Glass Dock ──────────────────── */}
        <div className="border-t border-black/[0.06] bg-[#FAF8F5]/80 p-2.5 backdrop-blur-md">
          <div className="mx-auto flex max-w-xs items-center justify-around rounded-2xl border border-black/[0.08] bg-white/90 p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_4px_16px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={() => setActiveTab('colleges')}
              title="Campuses"
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                activeTab === 'colleges'
                  ? 'bg-orange-100 text-sn-primary shadow-xs'
                  : 'text-sn-ink-muted hover:bg-black/[0.04] hover:text-sn-ink'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              {activeTab === 'colleges' && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-sn-primary" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('results')}
              title="Results"
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                activeTab === 'results'
                  ? 'bg-amber-100 text-amber-800 shadow-xs'
                  : 'text-sn-ink-muted hover:bg-black/[0.04] hover:text-sn-ink'
              }`}
            >
              <FileText className="h-4 w-4" />
              {activeTab === 'results' && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admissions')}
              title="Admissions"
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                activeTab === 'admissions'
                  ? 'bg-emerald-100 text-emerald-800 shadow-xs'
                  : 'text-sn-ink-muted hover:bg-black/[0.04] hover:text-sn-ink'
              }`}
            >
              <CalendarCheck2 className="h-4 w-4" />
              {activeTab === 'admissions' && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-emerald-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gpa')}
              title="GPA Calculator"
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                activeTab === 'gpa'
                  ? 'bg-purple-100 text-purple-800 shadow-xs'
                  : 'text-sn-ink-muted hover:bg-black/[0.04] hover:text-sn-ink'
              }`}
            >
              <Calculator className="h-4 w-4" />
              {activeTab === 'gpa' && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-purple-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
