'use client'

import Link from 'next/link'
import type { Admission } from '@/types'

interface FloatingStudentNotesProps {
  admissions?: Admission[]
}

/**
 * PushPinIcon: Stylized red pin matching physical bulletin / sticky-note references.
 */
function PushPinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="18" rx="2.5" ry="1.2" fill="rgba(0,0,0,0.2)" />
      <path d="M10 13L7 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M17 4.5L19 6.5C19.6 7.1 19.6 8 19 8.6L17.5 10.1L18.5 13.5L15 12.5L12.5 15L11.5 11.5L8 10.5L9.5 9C10.1 8.4 10.1 7.5 9.5 6.9L7.5 4.9C6.9 4.3 6.9 3.4 7.5 2.8L9 1.3C9.6 0.7 10.5 0.7 11.1 1.3L17 4.5Z"
        fill="#EF4444"
      />
      <circle cx="14.5" cy="6.5" r="1.8" fill="#FCA5A5" />
    </svg>
  )
}

/**
 * PaperclipIcon: Subtle silver paperclip for the scholarship note.
 */
function PaperclipIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l7.88-7.88" />
    </svg>
  )
}

export default function FloatingStudentNotes({ admissions = [] }: FloatingStudentNotesProps) {
  // Compute active deadline text
  const activeDeadline = admissions.find(
    (a) => a.application_deadline && new Date(a.application_deadline).getTime() > Date.now()
  )
  const deadlineTitle = activeDeadline
    ? activeDeadline.title.slice(0, 22)
    : 'IOE Entrance Exam'

  return (
    <div className="w-full relative">
      {/* ── Desktop & Mobile Flow: Staggered Floating Cards Showcase ── */}
      <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 lg:gap-8 pt-2 pb-4">
        
        {/* ── CARD 1: Yellow Sticky Note with Pushpin (Reference 1 Match) ── */}
        <Link
          href="/colleges"
          className="group relative block w-full max-w-[270px] sm:max-w-[260px] text-left transition-transform duration-300 hover:scale-105 hover:z-30 hero-float-note-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl"
          style={{ willChange: 'transform' }}
        >
          <div className="relative rounded-2xl bg-[#FEF08A] text-slate-900 p-4 sm:p-5 border border-amber-300/80 shadow-[0_12px_28px_-6px_rgba(180,83,9,0.18)] transition-shadow group-hover:shadow-[0_20px_35px_-8px_rgba(180,83,9,0.28)]">
            {/* Header: Pushpin + Tag */}
            <div className="flex items-center justify-between mb-2">
              <PushPinIcon className="w-6 h-6 -ml-1 -mt-1 drop-shadow-sm transform -rotate-12" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-amber-900/70 uppercase bg-amber-200/60 px-2 py-0.5 rounded-full">
                WHERE TO STUDY?
              </span>
            </div>

            {/* Handwriting Question */}
            <p className="font-handwriting text-2xl sm:text-[26px] leading-[1.15] text-slate-900 tracking-wide mb-3 select-none">
              &ldquo;where should I study after +2? 🎒&rdquo;
            </p>

            {/* Footer action snippet */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-950/80 pt-1 border-t border-amber-300/60">
              <span>1,200+ campuses verified</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>

        {/* ── CARD 2: Mini macOS Chat Window (Reference 2 Match) ── */}
        <Link
          href="/programs"
          className="group relative block w-full max-w-[285px] sm:max-w-[275px] text-left transition-transform duration-300 hover:scale-105 hover:z-30 hero-float-note-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl"
          style={{ willChange: 'transform' }}
        >
          <div className="relative rounded-2xl overflow-hidden bg-[#F8F7F4] dark:bg-slate-900 border border-slate-300/80 dark:border-slate-700/80 shadow-[0_12px_28px_-6px_rgba(15,23,42,0.12)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.5)] transition-shadow group-hover:shadow-[0_20px_35px_-8px_rgba(15,23,42,0.22)]">
            {/* macOS Window Titlebar */}
            <div className="bg-slate-200/90 dark:bg-slate-800/90 px-3.5 py-2 flex items-center justify-between border-b border-slate-300/70 dark:border-slate-700/70">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F] inline-block" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                counseling.mov
              </span>
              <span className="w-6" />
            </div>

            {/* Chat Content Body */}
            <div className="p-3.5 space-y-2">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="bg-[#DCFCE7] dark:bg-emerald-950/70 border border-emerald-300/60 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 rounded-2xl rounded-tr-sm px-3 py-1.5 text-xs font-medium max-w-[90%] shadow-sm">
                  what to study? CSIT or BCA? 🤔
                </div>
              </div>

              {/* Verified platform reply */}
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm px-3 py-1.5 text-xs max-w-[92%] shadow-sm">
                  TU syllabus + seats compared ✓
                </div>
              </div>
            </div>

            {/* Handwriting annotation at bottom */}
            <div className="px-3.5 pb-3 pt-0.5 flex items-center justify-between">
              <span className="font-handwriting text-lg text-slate-700 dark:text-slate-300 select-none">
                &ldquo;compare 450+ degree blueprints ✍️&rdquo;
              </span>
              <span className="text-[11px] font-semibold text-slate-500 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </div>
        </Link>

        {/* ── CARD 3: Entrance Radar Mini Calendar Card (Image 1 Style) ── */}
        <Link
          href="/admissions"
          className="group relative block w-full max-w-[270px] sm:max-w-[260px] text-left transition-transform duration-300 hover:scale-105 hover:z-30 hero-float-note-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-2xl"
          style={{ willChange: 'transform' }}
        >
          <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 shadow-[0_12px_28px_-6px_rgba(225,29,72,0.12)] dark:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.5)] transition-shadow group-hover:shadow-[0_20px_35px_-8px_rgba(225,29,72,0.22)]">
            {/* Header: Calendar days */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Live Radar
              </span>
              <span className="text-[10px] font-mono text-slate-400">M T W T F S</span>
            </div>

            {/* Calendar Event Bar */}
            <div className="bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 rounded-r-lg px-2.5 py-1.5 mb-2.5">
              <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 truncate">
                {deadlineTitle}
              </p>
              <p className="text-[10px] text-rose-700 dark:text-rose-300">
                Active 2082 Intake Radar
              </p>
            </div>

            {/* Overlapping mini sticky note */}
            <div className="bg-[#FEF3C7] dark:bg-amber-950/60 border border-amber-300/70 dark:border-amber-700/60 rounded-xl p-2.5 shadow-sm transform -rotate-1">
              <p className="font-handwriting text-xl sm:text-[22px] leading-tight text-amber-950 dark:text-amber-200 select-none">
                &ldquo;when to apply? check closing dates! ⏳&rdquo;
              </p>
            </div>

            {/* Footer action snippet */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 pt-2.5">
              <span>Track entrance exams</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>

        {/* ── CARD 4: Scholarship & Fee Note (With Paperclip) ── */}
        <Link
          href="/scholarships"
          className="group relative block w-full max-w-[265px] sm:max-w-[255px] text-left transition-transform duration-300 hover:scale-105 hover:z-30 hero-float-note-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-2xl"
          style={{ willChange: 'transform' }}
        >
          <div className="relative rounded-2xl bg-[#E0F2FE] dark:bg-sky-950/80 text-slate-900 dark:text-sky-100 p-4 sm:p-5 border border-sky-300/80 dark:border-sky-700/70 shadow-[0_12px_28px_-6px_rgba(14,165,233,0.15)] transition-shadow group-hover:shadow-[0_20px_35px_-8px_rgba(14,165,233,0.25)]">
            {/* Header: Paperclip + Tag */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-sky-900/80 dark:text-sky-300 uppercase bg-sky-200/70 dark:bg-sky-900/60 px-2 py-0.5 rounded-full">
                SCHOLARSHIPS
              </span>
              <PaperclipIcon className="w-5 h-5 text-sky-600 dark:text-sky-400 transform rotate-45 -mr-1" />
            </div>

            {/* Handwriting Question */}
            <p className="font-handwriting text-2xl sm:text-[25px] leading-[1.15] text-slate-900 dark:text-sky-100 tracking-wide mb-3 select-none">
              &ldquo;can I get a full scholarship in Nepal? 💸&rdquo;
            </p>

            {/* Footer action snippet */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-sky-900/80 dark:text-sky-300 pt-1 border-t border-sky-300/60 dark:border-sky-700/60">
              <span>Verified quotas &amp; calculator</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Bottom Micro-Pill (Reference 2 style synced capsule) ── */}
      <div className="mt-3 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-medium text-slate-600 dark:text-slate-300 backdrop-blur-sm select-none">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>
            Verified higher-education registry for Nepal • Zero sponsored listings
          </span>
        </div>
      </div>
    </div>
  )
}
