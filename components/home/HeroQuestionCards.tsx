'use client'

import Link from 'next/link'
import {
  Compass,
  Building2,
  CalendarClock,
  Calculator,
  ArrowRight,
} from 'lucide-react'
import type { Admission } from '@/types'

interface HeroQuestionCardsProps {
  admissions?: Admission[]
}

export default function HeroQuestionCards({ admissions = [] }: HeroQuestionCardsProps) {
  // Find nearest active deadline for Card 3
  const activeDeadline = admissions.find(
    (a) => a.application_deadline && new Date(a.application_deadline).getTime() > Date.now()
  )
  const deadlineText = activeDeadline
    ? `${activeDeadline.title.slice(0, 20)}…`
    : 'IOE Entrance closes in 12d'

  const CARDS = [
    {
      id: 'what-to-study',
      question: 'What to study?',
      tag: '450+ Programs',
      tagColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      icon: Compass,
      iconColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      description: 'Explore degrees, curriculum blueprints & realistic career outcomes in Nepal.',
      href: '/programs',
      actionLabel: 'Browse degrees',
      chips: [
        { label: 'BSc CSIT', href: '/colleges?q=CSIT' },
        { label: 'BE Civil', href: '/colleges?q=Civil' },
        { label: 'MBBS', href: '/colleges?q=MBBS' },
        { label: 'BBA', href: '/colleges?q=BBA' },
      ],
    },
    {
      id: 'where-to-study',
      question: 'Where to study?',
      tag: '1,200+ Colleges',
      tagColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      icon: Building2,
      iconColor: 'bg-amber-500/10 text-amber-600 dark:text-[#F5A524]',
      description: 'Verified TU, KU, PokU & Purbanchal campuses with dated fee records.',
      href: '/colleges',
      actionLabel: 'Find campuses',
      chips: [
        { label: 'Kathmandu', href: '/colleges?location=Kathmandu' },
        { label: 'Lalitpur', href: '/colleges?location=Lalitpur' },
        { label: 'Pokhara', href: '/colleges?location=Pokhara' },
        { label: 'Compare', href: '/compare' },
      ],
    },
    {
      id: 'when-to-apply',
      question: 'When to apply?',
      tag: 'Live Radar',
      tagColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
      icon: CalendarClock,
      iconColor: 'bg-rose-500/10 text-rose-600 dark:text-[#D7263D]',
      description: 'Track real-time entrance exam dates, seat quotas & active 2082 intakes.',
      href: '/admissions?deadline=open',
      actionLabel: 'Check deadlines',
      liveNotice: deadlineText,
      chips: [
        { label: 'IOE Entrance', href: '/admissions' },
        { label: 'CEE Medical', href: '/admissions' },
        { label: 'KUSOM CAT', href: '/admissions' },
        { label: 'Deadlines', href: '/deadlines' },
      ],
    },
    {
      id: 'cost-calculator',
      question: 'Cost & eligibility?',
      tag: 'Official Tools',
      tagColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
      icon: Calculator,
      iconColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      description: 'NEB Grade 12 GPA calculator, cost estimators & verified scholarship quotas.',
      href: '/tools/gpa-calculator',
      actionLabel: 'Calculate GPA',
      chips: [
        { label: 'GPA Calculator', href: '/tools/gpa-calculator' },
        { label: 'Cost Estimator', href: '/tools/college-cost-calculator' },
        { label: 'Scholarships', href: '/scholarships' },
      ],
    },
  ]

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 text-left">
        {CARDS.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className="group relative flex flex-col justify-between rounded-[22px] border border-black/[0.08] dark:border-white/[0.1] bg-white/80 dark:bg-[#0C2229]/80 backdrop-blur-xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(11,43,51,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-black/[0.16] dark:hover:border-white/[0.2] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(11,43,51,0.08)] dark:hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)] transition-all duration-300"
            >
              <div>
                {/* Header row: Icon + Tag */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${card.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-nunito border ${card.tagColor}`}>
                    {card.tag}
                  </span>
                </div>

                {/* Big Question Heading */}
                <Link href={card.href} className="block group-hover:text-primary dark:group-hover:text-[#F5A524] transition-colors">
                  <h2 className="font-baloo text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                    {card.question}
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary dark:text-[#F5A524]" />
                  </h2>
                </Link>

                {/* Description */}
                <p className="mt-1.5 font-nunito text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {card.description}
                </p>

                {/* Optional Live Notice */}
                {card.liveNotice && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-rose-500/[0.06] dark:bg-rose-500/[0.1] px-2 py-1 text-[11px] font-mono font-semibold text-rose-700 dark:text-rose-300 border border-rose-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="truncate">{card.liveNotice}</span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Chips */}
              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex flex-wrap gap-1.5">
                  {card.chips.map((chip) => (
                    <Link
                      key={chip.label}
                      href={chip.href}
                      className="rounded-md px-2 py-0.5 text-[11px] font-nunito font-semibold text-slate-600 dark:text-slate-400 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      {chip.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
