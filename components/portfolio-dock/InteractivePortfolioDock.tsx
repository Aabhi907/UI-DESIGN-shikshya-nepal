'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  Layers,
  Smile,
  Sparkles,
  CheckCircle2,
  UploadCloud,
  FileCode,
  ArrowUpRight,
  Calculator,
  GraduationCap,
  Bell,
  CalendarCheck,
} from 'lucide-react'
import Link from 'next/link'

export type DockItem = {
  id: string
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
  iconType: 'portal' | 'droppable' | 'appstacks' | 'roman' | 'custom'
  iconBgColor?: string
  previewType: 'portal' | 'droppable' | 'appstacks' | 'roman'
}

export const DEFAULT_PORTFOLIO_ITEMS: DockItem[] = [
  {
    id: 'portal',
    title: 'Portal',
    subtitle: 'A new way for creative freelancers to sell their services with finesse.',
    ctaText: 'View Portal',
    ctaHref: '#portal',
    iconType: 'portal',
    previewType: 'portal',
  },
  {
    id: 'droppable',
    title: 'Droppable',
    subtitle: 'Instant file dropping and client delivery without friction or messy links.',
    ctaText: 'View Droppable',
    ctaHref: '#droppable',
    iconType: 'droppable',
    previewType: 'droppable',
  },
  {
    id: 'appstacks',
    title: 'App Stacks',
    subtitle: 'Curated toolchains and workflow stacks built for fast-moving product builders.',
    ctaText: 'Explore Stacks',
    ctaHref: '#appstacks',
    iconType: 'appstacks',
    previewType: 'appstacks',
  },
  {
    id: 'roman',
    title: 'Collab with Roman',
    subtitle: 'Open for select product design partnerships, design systems, and advisory.',
    ctaText: 'Get in Touch',
    ctaHref: '#collab',
    iconType: 'roman',
    previewType: 'roman',
  },
]

export const SHIKSHYA_NEPAL_ITEMS: DockItem[] = [
  {
    id: 'gpa',
    title: 'GPA Calculator',
    subtitle: 'Real-time SEE & NEB weighted GPA simulation with credit hours.',
    ctaText: 'Calculate GPA',
    ctaHref: '/tools/gpa-calculator',
    iconType: 'custom',
    iconBgColor: '#2563EB',
    previewType: 'portal',
  },
  {
    id: 'colleges',
    title: 'Verified Campuses',
    subtitle: '1,200+ TU, KU, PU, and CTEVT institutions with gazette proof.',
    ctaText: 'Search Campuses',
    ctaHref: '/colleges',
    iconType: 'custom',
    iconBgColor: '#059669',
    previewType: 'droppable',
  },
  {
    id: 'deadlines',
    title: 'Scholarship Alerts',
    subtitle: 'Never miss government quotas, provincial grants, or entrance dates.',
    ctaText: 'View Deadlines',
    ctaHref: '/deadlines',
    iconType: 'custom',
    iconBgColor: '#D97706',
    previewType: 'appstacks',
  },
  {
    id: 'planner',
    title: 'Admission Planner',
    subtitle: 'Document prep checklist and step-by-step verified application tracker.',
    ctaText: 'Open Planner',
    ctaHref: '/admissions/planner',
    iconType: 'custom',
    iconBgColor: '#7C3AED',
    previewType: 'roman',
  },
]

interface InteractivePortfolioDockProps {
  items?: DockItem[]
  headerTitle?: string
  footerBio?: string
  modeToggle?: boolean
}

export default function InteractivePortfolioDock({
  items = DEFAULT_PORTFOLIO_ITEMS,
  headerTitle = 'Welcome to my corner on the internet :)',
  footerBio = 'Product designer & engineer crafting interfaces with depth, kinetic motion, and tactile physics. Based in Kathmandu, working worldwide.',
  modeToggle = true,
}: InteractivePortfolioDockProps) {
  const [activeItems, setActiveItems] = useState<DockItem[]>(items)
  const [isShikshyaMode, setIsShikshyaMode] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const toggleMode = (shikshya: boolean) => {
    setIsShikshyaMode(shikshya)
    setActiveItems(shikshya ? SHIKSHYA_NEPAL_ITEMS : DEFAULT_PORTFOLIO_ITEMS)
    setHoveredIndex(null)
  }

  return (
    <div className="relative min-h-[720px] w-full overflow-hidden bg-[#fbfbfb] dark:bg-[#0c0d10] py-16 sm:py-24 px-4 sm:px-6 flex flex-col justify-between items-center transition-colors">
      {/* Optional Mode Switcher Pill at Top Right */}
      {modeToggle && (
        <div className="absolute top-6 right-6 z-20 flex items-center gap-1 p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] text-xs font-nunito">
          <button
            onClick={() => toggleMode(false)}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              !isShikshyaMode
                ? 'bg-white dark:bg-[#1a1b20] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Portfolio Spec
          </button>
          <button
            onClick={() => toggleMode(true)}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              isShikshyaMode
                ? 'bg-white dark:bg-[#1a1b20] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Shikshya Nepal Tools
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          1. HEADER (Casual / Hand-drawn Font)
      ════════════════════════════════════════════════════════ */}
      <motion.div
        animate={{
          filter: hoveredIndex !== null ? 'blur(10px)' : 'blur(0px)',
          opacity: hoveredIndex !== null ? 0.35 : 1,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full text-center pt-4 select-none"
      >
        <h1 className="font-handwriting text-3xl sm:text-4xl lg:text-5xl text-slate-800 dark:text-slate-100 tracking-wide font-bold">
          {headerTitle}
        </h1>
      </motion.div>

      {/* ════════════════════════════════════════════════════════
          2. DOCK ROW (4 Interactive Square Icons)
      ════════════════════════════════════════════════════════ */}
      <div className="relative my-auto w-full max-w-4xl py-24 sm:py-28">
        <div
          onMouseLeave={() => setHoveredIndex(null)}
          className="relative mx-auto flex items-center justify-center gap-6 sm:gap-10 md:gap-14"
        >
          {activeItems.map((item, index) => {
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
                      <PreviewContent item={item} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ───────────────────────────────────────────────
                    THE SQUARE ICON CONTAINER
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
                      ? '0 20px 45px -10px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.8)'
                      : undefined,
                  }}
                >
                  <IconRenderer item={item} isHovered={isHovered} />
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
          3. FOOTER (Centered Brief Bio Text)
      ════════════════════════════════════════════════════════ */}
      <motion.div
        animate={{
          filter: hoveredIndex !== null ? 'blur(10px)' : 'blur(0px)',
          opacity: hoveredIndex !== null ? 0.35 : 1,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xl text-center pb-4 select-none px-4"
      >
        <p className="font-nunito text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {footerBio}
        </p>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ICON RENDERER HELPER
// ─────────────────────────────────────────────────────────────
function IconRenderer({ item }: { item: DockItem; isHovered: boolean }) {
  if (item.iconType === 'portal') {
    return (
      <div
        className="w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[30px] flex items-center justify-center p-3 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
        }}
      >
        <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border border-white/25 shadow-inner">
          <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-300 border-2 border-blue-600" />
        </div>
      </div>
    )
  }

  if (item.iconType === 'droppable') {
    return (
      <div
        className="w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[30px] flex items-center justify-center p-3 text-slate-900 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)',
        }}
      >
        <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/30 border border-white/40 shadow-inner">
          <Smile className="w-7 h-7 sm:w-9 sm:h-9 text-slate-900" />
        </div>
      </div>
    )
  }

  if (item.iconType === 'appstacks') {
    return (
      <div
        className="w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[30px] flex items-center justify-center p-3 text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        }}
      >
        {/* Isometric 3D block icon */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 rotate-45 transform translate-y-1" />
            <div className="w-8 h-8 rounded-lg bg-white/30 border border-white/40 rotate-45 transform -translate-y-1 shadow-md" />
          </div>
          <Sparkles className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 text-amber-200" />
        </div>
      </div>
    )
  }

  if (item.iconType === 'roman') {
    return (
      <div
        className="w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[30px] flex items-center justify-center p-1.5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
        }}
      >
        <div className="w-full h-full rounded-[18px] sm:rounded-[22px] md:rounded-[24px] bg-[#1a1b20] flex flex-col items-center justify-center text-white relative overflow-hidden border border-white/15">
          {/* Avatar / Portrait Silhouette */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold text-slate-900 shadow-sm"
               style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F43F5E 100%)' }}>
            R
          </div>
          <span className="mt-1 text-[9px] sm:text-[10px] font-mono tracking-tighter text-amber-200 uppercase font-semibold">
            Roman
          </span>
        </div>
      </div>
    )
  }

  // Custom fallback for Shikshya Nepal
  return (
    <div
      className="w-full h-full rounded-[22px] sm:rounded-[26px] md:rounded-[30px] flex items-center justify-center p-3 text-white overflow-hidden shadow-sm"
      style={{
        backgroundColor: item.iconBgColor || '#2563EB',
      }}
    >
      {item.id === 'gpa' && <Calculator className="w-7 h-7 sm:w-9 sm:h-9" />}
      {item.id === 'colleges' && <GraduationCap className="w-7 h-7 sm:w-9 sm:h-9" />}
      {item.id === 'deadlines' && <Bell className="w-7 h-7 sm:w-9 sm:h-9" />}
      {item.id === 'planner' && <CalendarCheck className="w-7 h-7 sm:w-9 sm:h-9" />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 3D PREVIEW CONTENT HELPER
// ─────────────────────────────────────────────────────────────
function PreviewContent({ item }: { item: DockItem }) {
  if (item.previewType === 'portal') {
    return (
      <div className="relative w-64 sm:w-72 h-44 rounded-2xl p-4 bg-white dark:bg-[#151518] border border-black/[0.1] dark:border-white/[0.15] shadow-[0_24px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between">
        {/* Angled background card layer */}
        <div
          className="absolute -top-3 -left-3 right-3 bottom-3 -z-10 rounded-2xl bg-blue-500/20 dark:bg-blue-600/30 border border-blue-400/30 transform -rotate-3 transition-transform"
          style={{ backdropFilter: 'blur(8px)' }}
        />

        {/* Header / Pill */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            LIVE PORTAL
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Mockup Body Content */}
        <div className="space-y-2 my-auto">
          <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-2.5 w-1/2 rounded bg-slate-100 dark:bg-white/5" />
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              Active Client
            </span>
            <span className="text-[10px] font-nunito text-slate-400">$4,800 Retainer</span>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08] text-[10px] font-nunito text-slate-500">
          <span>portal.v2.preview</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">99.8% Uptime</span>
        </div>
      </div>
    )
  }

  if (item.previewType === 'droppable') {
    return (
      <div className="relative w-64 sm:w-72 h-44 rounded-2xl p-4 bg-[#121316] text-white border border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between">
        {/* Layered dark back card */}
        <div className="absolute -top-2.5 -right-2.5 left-2.5 bottom-2.5 -z-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 transform rotate-2" />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px]">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>DROP ZONE READY</span>
          </div>
          <span className="text-[10px] font-mono text-white/50">24MB / s</span>
        </div>

        {/* Upload Card Mockup */}
        <div className="my-auto p-3 rounded-xl bg-white/[0.06] border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-nunito font-semibold">
            <span className="flex items-center gap-1.5 truncate">
              <FileCode className="w-3 h-3 text-emerald-400 shrink-0" />
              brand-assets-final.zip
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full w-full" />
          </div>
        </div>

        <div className="text-[10px] font-nunito text-white/60 flex items-center justify-between">
          <span>Client link active</span>
          <span className="text-emerald-300 font-bold">1-Click Download</span>
        </div>
      </div>
    )
  }

  if (item.previewType === 'appstacks') {
    return (
      <div className="relative w-64 sm:w-72 h-44 rounded-2xl p-4 bg-white dark:bg-[#151518] border border-black/[0.1] dark:border-white/[0.15] shadow-[0_24px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.6)] flex flex-col justify-between">
        {/* Isometric top accent */}
        <div className="absolute -top-3 left-3 right-3 -bottom-3 -z-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 transform -rotate-2" />

        <div className="flex items-center justify-between text-[10px] font-mono text-purple-600 dark:text-purple-400">
          <span>STACK REGISTRY</span>
          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 font-bold">42 Tools</span>
        </div>

        {/* Mini 3D browser grid */}
        <div className="my-auto grid grid-cols-3 gap-2">
          {['Next.js 14', 'Tailwind', 'Framer', 'Supabase', 'Raycast', 'Linear'].map((tool, idx) => (
            <div
              key={idx}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-center text-[10px] font-nunito font-semibold text-slate-700 dark:text-slate-200 truncate"
            >
              {tool}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] font-nunito text-slate-400 pt-1 border-t border-black/[0.06] dark:border-white/[0.08]">
          <span>Verified workflow</span>
          <span className="text-purple-600 dark:text-purple-400 font-bold">Inspect Config →</span>
        </div>
      </div>
    )
  }

  // Collab with Roman Preview
  return (
    <div className="relative w-64 sm:w-72 h-44 rounded-2xl p-4 bg-[#121316] text-white border border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between">
      {/* Sticker badges floating around */}
      <div className="absolute -top-3 -right-3 z-10 px-2.5 py-1 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold shadow-md transform rotate-6">
        ⚡ High Impact
      </div>
      <div className="absolute -bottom-2 -left-2 z-10 px-2 py-0.5 rounded-md bg-white text-slate-900 text-[9px] font-mono font-bold shadow transform -rotate-6">
        [Detach]
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-base shadow"
             style={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F43F5E 100%)' }}>
          R
        </div>
        <div>
          <h4 className="font-baloo text-sm font-bold leading-tight">Roman S.</h4>
          <p className="text-[10px] font-nunito text-white/60">Product Designer &amp; Partner</p>
        </div>
      </div>

      <div className="my-auto p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-[11px] font-nunito leading-snug text-white/80">
        &ldquo;Available for Q2/Q3 design advisory, sprint reviews &amp; brand systems.&rdquo;
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-amber-300">
        <span>KATHMANDU · UTC+5:45</span>
        <span className="underline">Book 30m Intro</span>
      </div>
    </div>
  )
}
