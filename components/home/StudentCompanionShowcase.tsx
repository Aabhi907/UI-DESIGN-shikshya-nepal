'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react'

interface StreamInfo {
  id: string
  name: string
  icon: string
  degree: string
  university: string
  facultyTag: string
  collegesCount: string
  feeRange: string
  entranceNote: string
  statusBadge: string
  href: string
}

const STREAMS: StreamInfo[] = [
  {
    id: 'csit',
    name: 'BSc CSIT',
    icon: '💻',
    degree: 'BSc Computer Science & IT',
    university: 'Tribhuvan University (TU IOST)',
    facultyTag: 'Technology & Software',
    collegesCount: '60+ Affiliated Campuses',
    feeRange: 'NPR 3.5L – 8.5L',
    entranceNote: 'IOST Entrance • 2082 Intake Active',
    statusBadge: 'High Demand',
    href: '/colleges?q=CSIT',
  },
  {
    id: 'civil',
    name: 'BE Civil',
    icon: '⚙️',
    degree: 'Bachelor in Civil Engineering',
    university: 'IOE, Tribhuvan University / KU',
    facultyTag: 'Engineering & Structures',
    collegesCount: '16 Accredited Colleges',
    feeRange: 'NPR 4.5L – 14.2L',
    entranceNote: 'IOE Entrance Exam in 12 Days',
    statusBadge: 'Deadline Soon',
    href: '/colleges?q=Civil',
  },
  {
    id: 'mbbs',
    name: 'MBBS',
    icon: '🩺',
    degree: 'Bachelor of Medicine & Surgery',
    university: 'IOM / BPKIHS / KU SMS',
    facultyTag: 'Medical & Clinical',
    collegesCount: '21 Medical Colleges',
    feeRange: 'NPR 44.8L (Govt Capped Rate)',
    entranceNote: 'MEC CEE Centralized Intake',
    statusBadge: 'Centralized Merit',
    href: '/colleges?q=MBBS',
  },
  {
    id: 'bba',
    name: 'BBA',
    icon: '📊',
    degree: 'Bachelor of Business Administration',
    university: 'TU FOM / KUSOM / Pokhara Univ',
    facultyTag: 'Business & Management',
    collegesCount: '80+ Verified Campuses',
    feeRange: 'NPR 3.2L – 8.0L',
    entranceNote: 'CMAT / KUUMAT Aptitude Test',
    statusBadge: 'Fall Intake',
    href: '/colleges?q=BBA',
  },
  {
    id: 'ballb',
    name: 'BALLB',
    icon: '⚖️',
    degree: '5-Year Integrated Bachelor of Law',
    university: 'Nepal Law Campus (TU) / KU',
    facultyTag: 'Judicial & Corporate Law',
    collegesCount: '8 Law Campuses',
    feeRange: 'NPR 2.8L – 6.5L',
    entranceNote: 'TU Law Entrance & Merit List',
    statusBadge: 'Merit Quota',
    href: '/colleges?q=Law',
  },
]

export default function StudentCompanionShowcase() {
  const [activeStreamId, setActiveStreamId] = useState<string>('csit')
  const activeStream = STREAMS.find((s) => s.id === activeStreamId) || STREAMS[0]

  return (
    <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden py-16 sm:py-24">
      {/* ── Soft Atmospheric Aurora Glow ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <div
          className="w-[800px] h-[550px] rounded-full blur-[130px] opacity-40 dark:opacity-20 transition-all duration-700"
          style={{
            background:
              'radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(245, 165, 36, 0.16) 45%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* ── 1. Header & Eyebrow (Reference Match) ── */}
        <div className="max-w-2xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] shadow-xs text-xs font-nunito font-bold text-slate-700 dark:text-slate-300 mb-5 backdrop-blur-md">
            <span className="text-primary dark:text-[#F5A524]">✦</span>
            <span>2082 Academic Intake • Student Companion</span>
          </div>

          {/* Main Headline */}
          <h2 className="font-baloo text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-[-0.02em] leading-[1.1] text-balance mb-4">
            <span className="text-primary dark:text-[#F5A524]">All of Nepal&apos;s Higher Education</span>{' '}
            <br className="hidden sm:inline" />
            in the Palm of Your Hand.
          </h2>

          {/* Subline */}
          <p className="font-nunito text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium max-w-xl mx-auto text-balance leading-relaxed mb-8">
            Real-time entrance exam countdowns, verified TU &amp; KU fee records, syllabus blueprints, and NEB GPA calculator—built for students across Nepal with zero paid rankings.
          </p>

          {/* Dual Action CTA Buttons (Reference Match) */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B2B33] hover:bg-[#16414D] text-white dark:bg-[#F5A524] dark:text-[#061519] dark:hover:bg-[#ffb43a] text-sm font-bold font-nunito shadow-[0_8px_20px_-4px_rgba(11,43,51,0.3)] dark:shadow-[0_8px_20px_-4px_rgba(245,165,36,0.3)] transition-all duration-200 active:scale-[0.98]"
            >
              <span>Explore All Colleges</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 hover:bg-white dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-800 dark:text-white border border-black/[0.08] dark:border-white/[0.12] text-sm font-bold font-nunito shadow-xs backdrop-blur-md transition-all duration-200"
            >
              <span>Check Entrance Dates</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* ── 2. Visual Showcase: Phone + Flanking Floating Cards ── */}
        <div className="relative mx-auto max-w-4xl flex items-center justify-center pt-4 pb-2">
          
          {/* ── LEFT FLOATING CARD (Desktop: Flanking Left) ── */}
          <div className="hidden lg:block absolute -left-6 xl:-left-12 top-28 z-20 pointer-events-auto">
            <div className="w-[280px] rounded-3xl bg-white/85 dark:bg-[#0C2229]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-4 shadow-[0_16px_36px_rgba(11,43,51,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:-translate-y-1">
              <div className="grid grid-cols-2 divide-x divide-black/[0.06] dark:divide-white/[0.08] text-left">
                {/* Cell 1: IOE Countdown */}
                <div className="pr-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-400">
                      IOE Radar
                    </span>
                    <span className="text-base" role="img" aria-label="clock">⏳</span>
                  </div>
                  <p className="font-baloo text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                    12d 03h
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Intake Active
                  </p>
                </div>

                {/* Cell 2: GPA Tool */}
                <div className="pl-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-400">
                      NEB +2
                    </span>
                    <span className="text-base" role="img" aria-label="calculator">🧮</span>
                  </div>
                  <p className="font-baloo text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                    GPA Tool
                  </p>
                  <p className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 mt-1">
                    Instant &amp; Free
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT FLOATING CARD (Desktop: Flanking Right) ── */}
          <div className="hidden lg:block absolute -right-6 xl:-right-12 top-28 z-20 pointer-events-auto">
            <Link
              href="/colleges"
              className="group block w-[290px] rounded-3xl bg-white/85 dark:bg-[#0C2229]/90 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] p-4 shadow-[0_16px_36px_rgba(11,43,51,0.08)] dark:shadow-[0_20px_45px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:-translate-y-1 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-[#F5A524] flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Gazette Audit 2082
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      1,200+ dated fee records
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-200 flex-shrink-0 group-hover:bg-[#0B2B33] group-hover:text-white dark:group-hover:bg-[#F5A524] dark:group-hover:text-black transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-black/[0.05] dark:border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>ZERO PAID PROMOTIONS</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● 100% VERIFIED</span>
              </div>
            </Link>
          </div>

          {/* ── CENTER: HIGH-END SMARTPHONE MOCKUP ── */}
          <div className="relative w-full max-w-[320px] sm:max-w-[340px] transition-transform duration-500 hover:scale-[1.01]">
            {/* Phone Outer Shell */}
            <div className="relative rounded-[48px] bg-slate-900 p-3 shadow-[0_25px_60px_-15px_rgba(11,43,51,0.35)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] border-[4px] border-slate-700/80">
              
              {/* Phone Screen Display */}
              <div className="relative rounded-[38px] bg-slate-950 overflow-hidden text-left border border-white/[0.08] aspect-[9/18.5] flex flex-col justify-between p-4 text-white">
                
                {/* 1. Status Bar & Dynamic Island */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pt-0.5 px-2 select-none">
                  <span>9:41</span>
                  {/* Dynamic Island Capsule */}
                  <div className="w-20 h-4 rounded-full bg-black border border-white/[0.1] mx-auto flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-slate-800" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span>5G</span>
                    <span className="text-xs">▮</span>
                  </div>
                </div>

                {/* 2. In-App Navigation Bar */}
                <div className="pt-2 px-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                        SHIKSHYA RADAR
                      </p>
                      <h3 className="font-baloo text-base font-bold text-white leading-tight">
                        Degree Navigator
                      </h3>
                    </div>
                    <span className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center text-xs">
                      🇳🇵
                    </span>
                  </div>

                  {/* Stream/Faculty Chips (Reference Match - interactive pills) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {STREAMS.map((stream) => {
                      const isActive = stream.id === activeStreamId
                      return (
                        <button
                          key={stream.id}
                          type="button"
                          onClick={() => setActiveStreamId(stream.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-nunito font-bold transition-all duration-200 select-none flex-shrink-0 ${
                            isActive
                              ? 'bg-white text-slate-950 shadow-sm font-extrabold scale-105'
                              : 'bg-white/[0.08] text-slate-300 hover:bg-white/[0.14]'
                          }`}
                        >
                          <span>{stream.icon}</span>
                          <span>{stream.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Active Degree Card (Inside Phone) */}
                <div className="my-auto px-1">
                  <div className="rounded-2xl bg-white/[0.07] border border-white/[0.12] p-3.5 backdrop-blur-md shadow-inner transition-all duration-300">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {activeStream.statusBadge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-nunito">
                        {activeStream.facultyTag}
                      </span>
                    </div>

                    <h4 className="font-baloo text-lg font-bold text-white leading-snug">
                      {activeStream.degree}
                    </h4>
                    <p className="text-[11px] text-slate-300 font-nunito mb-3">
                      {activeStream.university}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-white/[0.08] text-xs font-nunito">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-[11px] text-slate-400">Affiliated Campuses:</span>
                        <span className="font-bold text-white">{activeStream.collegesCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-[11px] text-slate-400">Verified Fee:</span>
                        <span className="font-bold text-amber-400">{activeStream.feeRange}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-[11px] text-slate-400">Intake Radar:</span>
                        <span className="font-semibold text-emerald-400 truncate max-w-[130px] text-right">
                          {activeStream.entranceNote}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Glowing Action Button at Bottom of Phone */}
                <div className="px-1 pb-1">
                  <Link
                    href={activeStream.href}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-slate-950 font-bold text-xs font-nunito shadow-[0_8px_20px_-4px_rgba(56,189,248,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #38BDF8 0%, #34D399 100%)',
                    }}
                  >
                    <span>View {activeStream.name} Campuses &amp; Fees</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* iOS Home Bar Indicator */}
                  <div className="w-28 h-1 rounded-full bg-white/30 mx-auto mt-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE: Flanking Cards shown below phone on small screens ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 lg:hidden max-w-md mx-auto text-left">
          {/* Mobile Card 1 */}
          <div className="rounded-2xl bg-white/80 dark:bg-[#0C2229]/80 border border-black/[0.08] dark:border-white/[0.1] p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                IOE Entrance Radar
              </span>
              <span>⏳</span>
            </div>
            <p className="font-baloo text-lg font-bold text-slate-900 dark:text-white">
              12d 03h Left
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              ● 2082 Intake Form Active
            </p>
          </div>

          {/* Mobile Card 2 */}
          <Link
            href="/colleges"
            className="rounded-2xl bg-white/80 dark:bg-[#0C2229]/80 border border-black/[0.08] dark:border-white/[0.1] p-3.5 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-slate-400">
                Registry Audit
              </p>
              <p className="font-baloo text-lg font-bold text-slate-900 dark:text-white">
                1,200+ Campuses
              </p>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                ● Zero Paid Placement
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
