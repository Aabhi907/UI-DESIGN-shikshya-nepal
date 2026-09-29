'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Admission } from '@/types'

interface CountdownPillProps {
  admissions?: Admission[]
  variant?: 'pill' | 'embedded'
}

interface DeadlineItem {
  id: string
  name: string
  targetDate: Date
  source: string
}

const DEFAULT_DEADLINES: DeadlineItem[] = [
  {
    id: 'ioe-entrance',
    name: 'IOE Entrance',
    // 12 days and 4 hours from now
    targetDate: new Date(Date.now() + (12 * 24 + 4) * 60 * 60 * 1000),
    source: 'Institute of Engineering',
  },
  {
    id: 'ku-som',
    name: 'KU Fall Intake',
    // 18 days and 11 hours from now
    targetDate: new Date(Date.now() + (18 * 24 + 11) * 60 * 60 * 1000),
    source: 'Kathmandu University',
  },
  {
    id: 'cee-medical',
    name: 'CEE Seat Allotment',
    // 25 days and 8 hours from now
    targetDate: new Date(Date.now() + (25 * 24 + 8) * 60 * 60 * 1000),
    source: 'Medical Education Commission',
  },
]

function formatTimeRemaining(target: Date): string {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return 'closing today'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}h`
  }
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${mins.toString().padStart(2, '0')}m`
}

export default function CountdownPill({ admissions = [], variant = 'pill' }: CountdownPillProps) {
  // Extract real future deadlines if available
  const activeDeadlines: DeadlineItem[] = admissions
    .filter((a) => a.application_deadline && new Date(a.application_deadline).getTime() > Date.now())
    .slice(0, 3)
    .map((a) => ({
      id: a.id,
      name: a.title.length > 24 ? a.title.slice(0, 24) + '…' : a.title,
      targetDate: new Date(a.application_deadline!),
      source: a.institution_name || 'Official Board',
    }))

  const deadlines = activeDeadlines.length >= 2 ? activeDeadlines : DEFAULT_DEADLINES

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [, setTick] = useState(0)

  // Rotate every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % deadlines.length)
        setIsFlipping(false)
      }, 220)
    }, 4000)
    return () => clearInterval(timer)
  }, [deadlines.length])

  // Re-render time remaining every minute
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  const current = deadlines[currentIndex]
  const timeStr = formatTimeRemaining(current.targetDate)

  const isEmbedded = variant === 'embedded'

  return (
    <Link
      href="/admissions?deadline=open"
      className={`group inline-flex items-center gap-2 text-xs font-nunito font-semibold transition-all duration-300 ${
        isEmbedded
          ? 'py-0.5 text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-[#F5A524]'
          : 'rounded-full border border-black/[0.08] dark:border-white/[0.12] bg-white/80 dark:bg-[#0C2229]/80 backdrop-blur-md px-3.5 py-1.5 text-slate-800 dark:text-slate-200 shadow-sm hover:shadow-md hover:border-black/[0.16] dark:hover:border-white/[0.22] hover:-translate-y-0.5'
      }`}
      aria-label={`Live deadline: ${current.name} closes in ${timeStr}`}
    >
      <span className="flex items-center gap-1.5 font-bold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      </span>

      <span
        className={`inline-flex items-center gap-1.5 transition-all duration-200 ${
          isFlipping ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'
        }`}
      >
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-500/20 dark:border-emerald-400/20">
          Live Radar
        </span>
        <strong className="font-bold text-slate-900 dark:text-white">{current.name}</strong>
        <span className="text-slate-400 dark:text-slate-500">closes in</span>
        <span className="font-mono font-bold text-primary dark:text-[#F5A524]">{timeStr}</span>
      </span>

      <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-[#F5A524] group-hover:translate-x-0.5 transition-all" />
    </Link>
  )
}
