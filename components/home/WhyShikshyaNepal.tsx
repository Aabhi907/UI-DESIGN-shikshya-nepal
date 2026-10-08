'use client'

import Link from 'next/link'
import {
  ShieldCheck,
  Clock,
  GraduationCap,
  ExternalLink,
  Calculator,
  CalendarDays,
  ArrowRight,
} from 'lucide-react'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Zero paid rankings',
    desc: 'Colleges cannot pay for higher placement or sponsored badges.',
    tint: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  {
    icon: Clock,
    title: 'Dated & sourced fees',
    desc: 'Every tuition figure shows when it was verified against official circulars.',
    tint: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  },
  {
    icon: GraduationCap,
    title: '100% free for students',
    desc: 'No paywalls, no registration locks. Free college comparisons and GPA tools.',
    tint: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  },
  {
    icon: ExternalLink,
    title: 'Official gazette links',
    desc: 'Direct verification links to TU, KU, PU, NEB & CTEVT portals.',
    tint: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
  },
]

const TOOLS = [
  {
    icon: Calculator,
    title: 'GPA Calculator',
    desc: 'Simulate NEB weighted grade points in your browser.',
    href: '/tools/gpa-calculator',
  },
  {
    icon: CalendarDays,
    title: 'Deadline tracker',
    desc: 'Official scholarship and entrance deadlines in one place.',
    href: '/admissions',
  },
]

export default function WhyShikshyaNepal() {
  return (
    <section className="border-b border-sn-border bg-sn-ground py-16 lg:py-24">
      <div className="mx-auto max-w-sn px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-sn-ink-muted font-nunito mb-2">
            Why ShikshyaNepal
          </p>
          <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-ink tracking-tight">
            Built different, for Nepali students
          </h2>
          <p className="mt-2 text-sm sm:text-base font-nunito text-sn-ink-soft max-w-xl mx-auto">
            Direct access to verified fees, official circulars, and unbiased college facts — no consultancy markups, no fake reviews.
          </p>
        </div>

        {/* Trust features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-sn-border bg-white dark:bg-sn-surface p-5"
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.tint} mb-3`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-baloo text-base font-bold text-sn-ink mb-1">{f.title}</h3>
                <p className="text-sm font-nunito text-sn-ink-soft leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>

        {/* Student tools row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {TOOLS.map((t) => {
            const Icon = t.icon
            return (
              <Link
                key={t.title}
                href={t.href}
                className="group flex items-start gap-4 rounded-2xl border border-sn-border bg-white dark:bg-sn-surface p-5 transition-all hover:border-sn-primary/30 hover:shadow-md"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sn-primary/10 text-sn-primary dark:text-[#A9D8E5]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-baloo text-base font-bold text-sn-ink mb-0.5 flex items-center gap-1.5">
                    {t.title}
                    <ArrowRight className="h-3.5 w-3.5 text-sn-ink-muted group-hover:text-sn-primary transition-colors" />
                  </h3>
                  <p className="text-sm font-nunito text-sn-ink-soft">{t.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
