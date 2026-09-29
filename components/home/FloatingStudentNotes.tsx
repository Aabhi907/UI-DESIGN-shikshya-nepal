'use client'

import Link from 'next/link'

/**
 * PushPinIcon: Stylized plastic pushpin matching the reference photo.
 */
function PushPinIcon({
  className = 'w-6 h-6',
  headColor = '#EF4444',
  highlightColor = '#FCA5A5',
}: {
  className?: string
  headColor?: string
  highlightColor?: string
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="18" rx="2.5" ry="1.2" fill="rgba(0,0,0,0.22)" />
      <path d="M10 13L7 18" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M17 4.5L19 6.5C19.6 7.1 19.6 8 19 8.6L17.5 10.1L18.5 13.5L15 12.5L12.5 15L11.5 11.5L8 10.5L9.5 9C10.1 8.4 10.1 7.5 9.5 6.9L7.5 4.9C6.9 4.3 6.9 3.4 7.5 2.8L9 1.3C9.6 0.7 10.5 0.7 11.1 1.3L17 4.5Z"
        fill={headColor}
      />
      <circle cx="14.5" cy="6.5" r="1.8" fill={highlightColor} />
    </svg>
  )
}

export interface StickyNoteProps {
  id: string
  href: string
  tag: string
  question: string
  footerText: string
  cardBg: string
  borderClass: string
  shadowClass: string
  tagBg: string
  tagText: string
  separatorClass: string
  floatClass: string
  pinHeadColor: string
  pinHighlightColor: string
}

export const STUDENT_NOTES: StickyNoteProps[] = [
  // ── CARD 1: Yellow (Matches Photo 2 directly) ──
  {
    id: 'where-to-study',
    href: '/colleges',
    tag: 'WHERE TO STUDY?',
    question: 'where should I study after +2? 🎒',
    footerText: '1,200+ campuses verified',
    cardBg: 'bg-[#FEF08A]',
    borderClass: 'border-amber-300/80',
    shadowClass: 'shadow-[0_12px_28px_-6px_rgba(180,83,9,0.22)]',
    tagBg: 'bg-amber-200/80',
    tagText: 'text-amber-950',
    separatorClass: 'border-amber-300/80',
    floatClass: 'hero-float-note-1',
    pinHeadColor: '#EF4444',
    pinHighlightColor: '#FCA5A5',
  },
  // ── CARD 2: Fresh Mint Green ──
  {
    id: 'what-to-study',
    href: '/programs',
    tag: 'WHAT TO STUDY?',
    question: 'what to study? CSIT or BCA? 🤔',
    footerText: '450+ degree blueprints',
    cardBg: 'bg-[#DCFCE7]',
    borderClass: 'border-emerald-300/80',
    shadowClass: 'shadow-[0_12px_28px_-6px_rgba(5,150,105,0.22)]',
    tagBg: 'bg-emerald-200/80',
    tagText: 'text-emerald-950',
    separatorClass: 'border-emerald-300/80',
    floatClass: 'hero-float-note-2',
    pinHeadColor: '#059669',
    pinHighlightColor: '#6EE7B7',
  },
  // ── CARD 3: Coral Peach / Rose ──
  {
    id: 'entrance-radar',
    href: '/admissions',
    tag: 'ENTRANCE RADAR',
    question: 'when does IOE entrance close? ⏳',
    footerText: 'Active 2082 intake radar',
    cardBg: 'bg-[#FFE4E6]',
    borderClass: 'border-rose-300/80',
    shadowClass: 'shadow-[0_12px_28px_-6px_rgba(225,29,72,0.22)]',
    tagBg: 'bg-rose-200/80',
    tagText: 'text-rose-950',
    separatorClass: 'border-rose-300/80',
    floatClass: 'hero-float-note-3',
    pinHeadColor: '#E11D48',
    pinHighlightColor: '#FDA4AF',
  },
  // ── CARD 4: Soft Sky Blue ──
  {
    id: 'scholarships',
    href: '/scholarships',
    tag: 'SCHOLARSHIPS',
    question: 'can I get a full scholarship? 💸',
    footerText: 'Fee estimator & quotas',
    cardBg: 'bg-[#E0F2FE]',
    borderClass: 'border-sky-300/80',
    shadowClass: 'shadow-[0_12px_28px_-6px_rgba(14,165,233,0.22)]',
    tagBg: 'bg-sky-200/80',
    tagText: 'text-sky-950',
    separatorClass: 'border-sky-300/80',
    floatClass: 'hero-float-note-4',
    pinHeadColor: '#2563EB',
    pinHighlightColor: '#93C5FD',
  },
]

/**
 * Single Sticky Note Card matching Photo 2
 */
export function StickyNoteCard({
  note,
  className = '',
}: {
  note: StickyNoteProps
  className?: string
}) {
  return (
    <Link
      href={note.href}
      className={`group relative block w-full max-w-[250px] xl:max-w-[260px] text-left transition-transform duration-300 hover:scale-105 hover:z-30 ${note.floatClass} focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-2xl ${className}`}
      style={{ willChange: 'transform' }}
    >
      <div
        className={`relative rounded-2xl ${note.cardBg} text-slate-900 p-4 sm:p-5 border ${note.borderClass} ${note.shadowClass} transition-shadow duration-300 group-hover:shadow-[0_20px_35px_-8px_rgba(0,0,0,0.22)]`}
      >
        {/* Header: Pushpin (top-left) + Tag Pill (top-right) */}
        <div className="flex items-center justify-between mb-2">
          <PushPinIcon
            className="w-6 h-6 -ml-1 -mt-1 drop-shadow-sm transform -rotate-12"
            headColor={note.pinHeadColor}
            highlightColor={note.pinHighlightColor}
          />
          <span
            className={`text-[10px] font-mono font-bold tracking-wider ${note.tagText} uppercase ${note.tagBg} px-2.5 py-0.5 rounded-full select-none`}
          >
            {note.tag}
          </span>
        </div>

        {/* Handwriting Question */}
        <p className="font-handwriting text-2xl sm:text-[25px] leading-[1.18] text-slate-900 tracking-wide my-3 select-none">
          &ldquo;{note.question}&rdquo;
        </p>

        {/* Separator & Footer snippet */}
        <div
          className={`flex items-center justify-between text-[11px] font-semibold text-slate-900/80 pt-2 border-t ${note.separatorClass}`}
        >
          <span>{note.footerText}</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  )
}

/**
 * Left column: Cards 1 & 2 (Yellow & Mint)
 */
export function LeftHeroNotes() {
  return (
    <div className="flex flex-col gap-6 items-end w-full">
      <StickyNoteCard note={STUDENT_NOTES[0]} />
      <StickyNoteCard note={STUDENT_NOTES[1]} />
    </div>
  )
}

/**
 * Right column: Cards 3 & 4 (Peach & Sky)
 */
export function RightHeroNotes() {
  return (
    <div className="flex flex-col gap-6 items-start w-full">
      <StickyNoteCard note={STUDENT_NOTES[2]} />
      <StickyNoteCard note={STUDENT_NOTES[3]} />
    </div>
  )
}

/**
 * Mobile / Tablet grid (< lg screens): All 4 cards displayed neatly below search
 */
export function MobileHeroNotes() {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center pt-2">
      {STUDENT_NOTES.map((note) => (
        <StickyNoteCard key={note.id} note={note} className="max-w-[280px]" />
      ))}
    </div>
  )
}
