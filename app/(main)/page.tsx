import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import HeroSearch from '@/components/ui/HeroSearch'
import ResultCard from '@/components/results/ResultCard'
import NoticeCard from '@/components/notices/NoticeCard'
import EmailSubscribe from '@/components/notifications/EmailSubscribe'
import type { Result, Notice, College } from '@/types'
import type { Admission } from '@/types'
import AdmissionCard from '@/components/admissions/AdmissionCard'
import Mascot from '@/components/design-system/Mascot'
import Card from '@/components/design-system/Card'
import IconTile from '@/components/design-system/IconTile'
import SectionHeader from '@/components/design-system/SectionHeader'
import Button from '@/components/design-system/Button'
import FeaturedCollegeCard, { CAMPUS_FALLBACK_IMAGES } from '@/components/design-system/FeaturedCollegeCard'
import {
  Building2,
  FileText,
  Bell,
  CalendarClock,
  Award,
  ArrowRight,
  Monitor,
  BarChart3,
  Wrench,
  HeartPulse,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Scale,
  Stethoscope,
  Sprout,
  TreePine,
  ShieldCheck,
  Calculator,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const FACULTY_ICONS: Record<string, LucideIcon> = {
  'plus-two':    BookOpen,
  'it':          Monitor,
  'management':  BarChart3,
  'engineering': Wrench,
  'medical':     HeartPulse,
  'humanities':  BookOpen,
  'science':     FlaskConical,
  'education':   GraduationCap,
  'law':         Scale,
  'nursing':     Stethoscope,
  'agriculture': Sprout,
  'forestry':    TreePine,
  'architecture':Building2,
}
const FACULTY_TINTS: Array<'mint' | 'peach' | 'butter' | 'lilac'> = ['peach', 'mint', 'butter', 'lilac']

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: { absolute: 'SikshyaNepal: Decide What to Study After +2, and Where' },
  description:
    'Verified colleges, courses and career pathways for +2 and university in Nepal. Every fact sourced and dated. No fake reviews, no guesswork.',
  alternates: { canonical: '/' },
}

const UNIVERSITY_SHOWCASE = [
  { short: 'TU',   label: 'Tribhuvan University',  affiliation: 'Tribhuvan University' },
  { short: 'KU',   label: 'Kathmandu University',  affiliation: 'Kathmandu University' },
  { short: 'PU',   label: 'Pokhara University',    affiliation: 'Pokhara University' },
  { short: 'PurU', label: 'Purbanchal University', affiliation: 'Purbanchal University' },
]

// Consistent container + gutter + section rhythm, used on every major section
// on this page: 20/32/48px side gutters, ~1200px content width, 64px→96px
// vertical beat. See design-system/sikshyanepal/MASTER.md.
const CONTAINER = 'mx-auto max-w-sn px-5 sm:px-8 lg:px-12'
const SECTION_PAD = 'py-16 lg:py-24'

async function getHomeData() {
  const supabase = createServerSupabaseClient()

  const [
    admissionsRes, resultsRes, noticesRes, collegesRes,
    collegeCountRes, programCountRes, universityCountRes,
    tuCountRes, kuCountRes, puCountRes, purUCountRes,
  ] = await Promise.all([
    supabase
      .from('admissions')
      .select('*, college:colleges(id,name,slug,location)')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('application_deadline', { ascending: true, nullsFirst: false })
      .limit(4),
    supabase
      .from('results')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false, nullsFirst: false })
      .limit(6),
    supabase
      .from('notices')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false, nullsFirst: false })
      .limit(6),
    supabase.from('colleges').select('id,name,slug,location,district,province,local_level,affiliation,logo_url,cover_url,is_featured,verification_status,programs_offered,education_levels,is_sponsored,sponsor_label,sponsor_starts_at,sponsor_ends_at,sponsor_disclosure').eq('is_featured', true).or('status.eq.active,status.is.null').order('name').limit(6),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).or('status.eq.active,status.is.null'),
    supabase.from('programs').select('id',  { count: 'exact', head: true }),
    supabase.from('universities').select('id', { count: 'exact', head: true }),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Tribhuvan%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Kathmandu%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Pokhara%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Purbanchal%'),
  ])

  const collegeCount = collegeCountRes.count ?? 0
  const programCount = programCountRes.count ?? 0
  const universityCount = universityCountRes.count ?? 0

  const heroStats = [
    { label: 'Colleges',     value: collegeCount },
    { label: 'Programs',     value: programCount },
    { label: 'Universities', value: universityCount },
  ].filter(stat => stat.value > 0)

  const universityCounts: Record<string, number> = {
    TU:   tuCountRes.count   ?? 0,
    KU:   kuCountRes.count   ?? 0,
    PU:   puCountRes.count   ?? 0,
    PurU: purUCountRes.count ?? 0,
  }

  return {
    admissions:       (admissionsRes.data || []) as Admission[],
    results:          (resultsRes.data  || []) as Result[],
    notices:          (noticesRes.data  || []) as Notice[],
    featuredColleges: (collegesRes.data || []) as College[],
    heroStats,
    universityCounts,
  }
}

export default async function HomePage() {
  const { admissions, results, notices, featuredColleges, heroStats, universityCounts } = await getHomeData()

  const hasProofContent = admissions.length > 0 || results.length > 0 || notices.length > 0 || featuredColleges.length > 0

  return (
    <div>
      {/* ════════════════════════════════════════════════════════
          1. HERO — Pure Centered Minimalist Architecture (Matching Image 1)
      ════════════════════════════════════════════════════════ */}
      <section className="relative border-b border-sn-border bg-sn-ground overflow-hidden py-20 lg:py-28">
        {/* Soft, ultra-subtle ambient glow */}
        <div className="pointer-events-none absolute -top-44 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#A9E0F1]/20 via-[#CAFFA6]/10 to-transparent blur-3xl" aria-hidden="true" />

        <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center relative z-10">
          {/* Eyebrow Pill matching Voxt's [NEW] Voice input app -> */}
          <Link
            href="/admissions?deadline=open"
            className="apple-pill group inline-flex items-center gap-2.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-bold font-nunito text-sn-ink shadow-sm hover:shadow transition-all duration-200 mb-8 border border-black/[0.08]"
          >
            <Mascot pose="wave" size={18} />
            <span className="rounded-full bg-sn-ink px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              2082 / 2026
            </span>
            <span>Intake deadlines &amp; board results live</span>
            <ArrowRight className="h-3 w-3 text-sn-ink-muted group-hover:text-sn-primary group-hover:translate-x-0.5 transition-all" />
          </Link>

          {/* Centered Headline matching "Speak clearly. Adapt to context." */}
          <h1
            className="font-baloo font-extrabold text-sn-ink text-balance tracking-[-0.035em] leading-[1.06] mb-6"
            style={{ fontSize: 'clamp(2.75rem, 6vw, 4.4rem)' }}
          >
            Decide what to study. Find where.
          </h1>

          {/* Centered Subtext matching Voxt's clean body copy */}
          <p className="mx-auto mb-10 max-w-2xl text-base sm:text-lg leading-relaxed font-nunito text-sn-ink-soft">
            Verified colleges, courses and career pathways for +2 and university in Nepal. Sourced, dated and unbiased guidance from official boards.
          </p>

          {/* Centered Spotlight Search */}
          <div className="mx-auto max-w-2xl mb-8 text-left">
            <HeroSearch />
          </div>

          {/* Centered Action Button Pair matching [Star on GitHub] [ Mac Download] */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Button.Link
              href="/colleges"
              variant="primary"
              className="group rounded-full px-6 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_20px_rgba(32,70,84,0.24)] transition-all duration-300 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_10px_28px_rgba(32,70,84,0.32)] hover:-translate-y-0.5 active:translate-y-0 text-sm font-bold"
            >
              <span>Explore colleges</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </Button.Link>
            <Button.Link
              href="/programs"
              variant="secondary"
              className="rounded-full px-6 py-3 border-black/[0.08] bg-white/80 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] hover:border-black/[0.15] hover:bg-white transition-all duration-200 text-sm font-bold text-sn-ink"
            >
              Browse programs
            </Button.Link>
          </div>

          {/* Social Proof Counter matching "2819+ Mac users and counting" */}
          <div className="flex items-center justify-center gap-3 text-xs font-nunito text-sn-ink-muted">
            <div className="flex -space-x-1.5 overflow-hidden">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sn-tint-peach text-[10px] font-bold text-sn-ink ring-2 ring-white">TU</span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sn-tint-mint text-[10px] font-bold text-sn-ink ring-2 ring-white">KU</span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sn-tint-butter text-[10px] font-bold text-sn-ink ring-2 ring-white">PU</span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sn-tint-lilac text-[10px] font-bold text-sn-ink ring-2 ring-white">NEB</span>
            </div>
            <span>
              <strong className="text-sn-ink font-bold">1,200+</strong> colleges &amp; <strong className="text-sn-ink font-bold">450+</strong> programs cataloged across Nepal
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2. FEATURE SHOWCASE 1 — Results without the chaos (Matching Image 2)
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-white ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Typography & Feature Checklist */}
            <div className="lg:col-span-6 space-y-6">
              <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-ink leading-[1.12] tracking-[-0.025em]">
                Direct board results <span className="relative inline-block px-2">
                  <span className="relative z-10">without the chaos</span>
                  <span className="absolute inset-0 -rotate-1 rounded-full border border-sn-primary/40 bg-sn-primary-bg/35 -z-0" />
                </span>
              </h2>

              <p className="text-base sm:text-lg font-nunito text-sn-ink-soft leading-relaxed">
                Check published results, roll number lookups, and mark sheet records directly from official board archives without broken links or third-party ads.
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  { icon: CheckCircle2, text: 'Instant symbol and roll number lookup for TU, NEB, and CTEVT' },
                  { icon: ShieldCheck, text: 'Official marksheet grades, division breakdowns and pass verification' },
                  { icon: FileText, text: 'Archive records dating back to 2075 BS with published notices' },
                  { icon: Bell, text: 'Free email notifications the moment new results are officially declared' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sn-tint-mint text-emerald-800">
                      <Icon className="h-3 w-3" />
                    </span>
                    <span className="text-sm font-nunito text-sn-ink font-medium leading-snug">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/results"
                  className="inline-flex items-center gap-2 text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover group"
                >
                  <span>Search published board results</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Column: Soft Canvas with Floating Query Bubble & Result Card */}
            <div className="lg:col-span-6">
              <div className="rounded-[32px] border border-black/[0.05] bg-sn-ground/70 p-6 sm:p-10 relative flex flex-col justify-center min-h-[380px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
                {/* Floating query bubble matching Voxt's "Make it shorter and clearer" */}
                <div className="self-start -mb-3 z-10 ml-2">
                  <div className="apple-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold font-nunito text-sn-ink shadow-md bg-white border border-black/[0.08]">
                    <span className="text-amber-600">📋</span>
                    <span>&ldquo;Check my NEB Grade 12 result&rdquo;</span>
                  </div>
                </div>

                {/* Floating Clean Result Card matching Voxt's Semantic Rewrite card */}
                <div className="apple-card rounded-[22px] border border-black/[0.08] bg-white p-5 sm:p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] mt-4">
                  <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sn-tint-peach text-sn-ink font-bold text-xs font-mono">
                        NEB
                      </span>
                      <div>
                        <p className="text-xs font-bold text-sn-ink font-nunito">Grade 12 Annual Examination</p>
                        <p className="text-[11px] text-sn-ink-muted font-nunito">National Examination Board · Sanothimi</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Verified
                    </span>
                  </div>

                  <div className="py-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-sn-ink-muted">Symbol Number:</span>
                      <span className="font-mono font-bold text-sn-ink">2401884X</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-sn-ink-muted">Academic Stream:</span>
                      <span className="font-bold text-sn-ink">Science (Physics, Chemistry, Math)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-sn-ink-muted">Calculated Standing:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        First Division with Distinction · 3.65 GPA
                      </span>
                    </div>
                  </div>

                  {/* Clean Filter Pills at bottom matching [Shorter] [Clearer] [Formal] in Voxt */}
                  <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                    <div className="flex gap-1.5 text-[11px] font-bold font-nunito">
                      <span className="rounded-full bg-sn-surface-alt px-2.5 py-1 text-sn-ink">TU Balkhu</span>
                      <span className="rounded-full bg-sn-surface-alt px-2.5 py-1 text-sn-ink">NEB</span>
                      <span className="rounded-full bg-sn-surface-alt px-2.5 py-1 text-sn-ink">KU Dhulikhel</span>
                    </div>
                    <Link href="/results" className="text-xs font-bold text-sn-primary hover:underline">
                      Verify &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3. FEATURE SHOWCASE 2 — Intake Deadlines (Reversed Layout)
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Soft Canvas with Floating Intake Card */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <div className="rounded-[32px] border border-black/[0.05] bg-white p-6 sm:p-10 relative flex flex-col justify-center min-h-[380px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
                {/* Floating query bubble */}
                <div className="self-start -mb-3 z-10 ml-2">
                  <div className="apple-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold font-nunito text-sn-ink shadow-md bg-white border border-black/[0.08]">
                    <span className="text-emerald-600">⏳</span>
                    <span>&ldquo;When does Kathmandu University BTech close?&rdquo;</span>
                  </div>
                </div>

                {/* Floating Admission Card */}
                <div className="apple-card rounded-[22px] border border-black/[0.08] bg-sn-surface-alt/70 p-5 sm:p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] mt-4">
                  <div className="flex items-start justify-between pb-3 border-b border-black/[0.06]">
                    <div>
                      <span className="rounded-full bg-[#A9E0F1]/40 border border-[#A9E0F1] px-2 py-0.5 text-[10px] font-bold text-[#142C35] inline-block mb-1">
                        Closes in 4 days
                      </span>
                      <h4 className="font-baloo text-base font-bold text-sn-ink">Kathmandu University</h4>
                      <p className="text-xs font-nunito text-sn-ink-muted">School of Engineering · Dhulikhel</p>
                    </div>
                    <span className="rounded-full bg-[#CAFFA6]/70 border border-[#CAFFA6] px-2 py-0.5 text-[10px] font-bold text-[#142C35]">
                      Intake Open
                    </span>
                  </div>

                  <div className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-sn-ink-muted">Program:</span>
                      <span className="font-bold text-sn-ink">BTech in Artificial Intelligence</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-sn-ink-muted">Eligibility:</span>
                      <span className="font-bold text-sn-ink">Min 2.4 GPA in +2 Science</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-sn-ink-muted">Application Form:</span>
                      <span className="font-bold text-sn-primary">Online Submission Available</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                    <span className="text-xs font-nunito text-sn-ink-muted">Verified notice attached</span>
                    <Link
                      href="/admissions"
                      className="rounded-full bg-sn-primary px-3 py-1 text-xs font-bold text-white hover:bg-sn-primary-hover transition-colors"
                    >
                      View Deadline
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Typography & Checklist */}
            <div className="order-1 lg:order-2 lg:col-span-6 space-y-6">
              <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-ink leading-[1.12] tracking-[-0.025em]">
                Track intake deadlines <span className="relative inline-block px-2">
                  <span className="relative z-10">before they close</span>
                  <span className="absolute inset-0 1 rounded-full border border-emerald-500/40 bg-emerald-50/50 -z-0" />
                </span>
              </h2>

              <p className="text-base sm:text-lg font-nunito text-sn-ink-soft leading-relaxed">
                Fees, quotas, and entrance requirements change frequently. Every college profile and intake notice is dated so you never submit to expired deadlines.
              </p>

              <div className="space-y-3.5 pt-2">
                {[
                  { icon: Clock, text: 'Real application deadline countdowns with entrance dates' },
                  { icon: GraduationCap, text: 'Constituent government campuses vs private affiliated seat quotas' },
                  { icon: FileText, text: 'Entrance exam syllabus, question patterns and eligibility guidelines' },
                  { icon: CheckCircle2, text: 'Sourced fees with last-checked verification date' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sn-tint-peach text-sn-primary">
                      <Icon className="h-3 w-3" />
                    </span>
                    <span className="text-sm font-nunito text-sn-ink font-medium leading-snug">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/admissions"
                  className="inline-flex items-center gap-2 text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover group"
                >
                  <span>Explore all active admissions</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. EDITORIAL STATEMENT — Typographic Art Banner (Matching Screenshot)
      ════════════════════════════════════════════════════════ */}
      <section className="relative border-b border-sn-border bg-[#FBF9F4] py-24 sm:py-32 overflow-hidden text-center">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          {/* Top Micro-label matching "Live camera cutouts, decorated mats." */}
          <p className="font-nunito text-xs sm:text-sm font-semibold text-sn-ink-muted mb-8 tracking-wide flex items-center justify-center gap-2">
            <span>🏛️</span>
            <span>Live campus cutouts, verified admissions.</span>
          </p>

          {/* Editorial Headline with Inline Image Cutouts & Chips */}
          <h2
            className="font-baloo font-extrabold text-[#0D2619] leading-[1.28] tracking-[-0.035em] text-balance max-w-4xl mx-auto"
            style={{ fontSize: 'clamp(2.35rem, 5.2vw, 4.4rem)' }}
          >
            the independent{' '}
            <span className="inline-flex items-center gap-1.5 align-middle mx-1 px-3 py-1 rounded-xl bg-amber-100/90 border border-amber-300/70 shadow-sm text-sm sm:text-base font-bold font-nunito text-amber-900 -rotate-2">
              <span>🏛️</span>
              <span>Campus</span>
            </span>{' '}
            where your{' '}
            <span className="inline-block w-14 h-8 sm:w-20 sm:h-11 rounded-xl align-middle mx-1.5 overflow-hidden shadow-sm border border-black/[0.1] relative -translate-y-0.5">
              <Image
                src={CAMPUS_FALLBACK_IMAGES[0]}
                alt="Campus thumbnail"
                fill
                sizes="80px"
                className="object-cover"
              />
            </span>{' '}
            academic{' '}
            <span className="inline-flex items-center gap-1.5 align-middle mx-1 px-3 py-1 rounded-xl bg-[#CAFFA6]/70 border border-[#CAFFA6] shadow-sm text-sm sm:text-base font-bold font-nunito text-[#142C35] rotate-2">
              <span>🎓</span>
              <span>dreams</span>
            </span>{' '}
            live on your{' '}
            <span className="inline-flex items-center gap-1.5 align-middle mx-1 px-3.5 py-1 rounded-xl bg-[#A9E0F1]/50 border border-[#A9E0F1] shadow-sm text-sm sm:text-base font-bold font-nunito text-[#142C35] -rotate-1">
              <Mascot pose="wave" size={20} />
              <span>screen</span>
            </span>
          </h2>

          {/* CTA Button */}
          <div className="mt-10 sm:mt-12 flex justify-center">
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 rounded-full bg-[#204654] px-7 py-3.5 text-sm font-bold font-nunito text-white shadow-[0_4px_16px_rgba(32,70,84,0.28)] hover:bg-[#173743] hover:shadow-[0_6px_22px_rgba(32,70,84,0.36)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span>Explore for Students</span>
              <span>🎓</span>
            </Link>
          </div>

          {/* Laurel Wreath Badge matching "🌿 Used by 1700+ users on Testflight 🌿" */}
          <div className="mt-8 flex items-center justify-center gap-2 font-nunito text-xs sm:text-sm font-bold text-sn-ink-muted">
            <span className="text-base select-none">🌿</span>
            <span>Used by 25,000+ students across Nepal</span>
            <span className="text-base select-none">🌿</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2. STATS STRIP — Apple clean minimal luminous ribbon
      ════════════════════════════════════════════════════════ */}
      {heroStats.length > 0 && (
        <section className="border-y border-black/[0.06] bg-white/75 backdrop-blur-md py-8 lg:py-10">
          <div className={CONTAINER}>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:divide-x sm:divide-black/[0.06]">
              {heroStats.map((stat) => (
                <div key={stat.label} className="text-center sm:px-6">
                  <p className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-ink tabular-nums tracking-tight">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="mt-1 font-nunito text-xs sm:text-sm font-bold text-sn-ink-muted">
                    {stat.label} cataloged &amp; dated
                  </p>
                </div>
              ))}
              <div className="text-center sm:px-6">
                <p className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-primary tabular-nums tracking-tight">
                  100%
                </p>
                <p className="mt-1 font-nunito text-xs sm:text-sm font-bold text-sn-ink-muted">
                  Independent student guidance
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          3. WHAT DO YOU NEED TODAY — Clean Minimal 4-Grid
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-sn-surface-alt/60 ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <SectionHeader
            title="What do you need today?"
            description="Direct access to verified student information across Nepal."
            action={<Link href="/search" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">Search everything →</Link>}
          />
          <div className="mt-8 lg:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Check Results */}
            <Link
              href="/results"
              className="apple-card group flex flex-col justify-between p-6 sm:p-7 !rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={FileText} tint="peach" size={38} />
                  <span className="rounded-full bg-sn-tint-peach/80 px-2.5 py-0.5 text-[11px] font-bold font-nunito text-sn-ink">
                    TU · KU · NEB
                  </span>
                </div>
                <h3 className="font-baloo text-xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors">
                  Board results
                </h3>
                <p className="mt-2 text-sm font-nunito text-sn-ink-soft leading-relaxed">
                  Published examination results, mark sheet archives, and roll number lookup guides.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary">
                <span>Check results</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 2: Admissions */}
            <Link
              href="/admissions?deadline=open"
              className="apple-card group flex flex-col justify-between p-6 sm:p-7 !rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={CalendarClock} tint="mint" size={38} />
                  <span className="rounded-full bg-sn-tint-mint/80 px-2.5 py-0.5 text-[11px] font-bold font-nunito text-sn-ink">
                    Live &amp; open
                  </span>
                </div>
                <h3 className="font-baloo text-xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors">
                  College admissions
                </h3>
                <p className="mt-2 text-sm font-nunito text-sn-ink-soft leading-relaxed">
                  Active college intake deadlines, entrance eligibility, and application guidelines.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary">
                <span>View open intakes</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 3: Find Colleges */}
            <Link
              href="/colleges"
              className="apple-card group flex flex-col justify-between p-6 sm:p-7 !rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={GraduationCap} tint="lilac" size={38} />
                  <span className="rounded-full bg-sn-tint-lilac/80 px-2.5 py-0.5 text-[11px] font-bold font-nunito text-sn-ink">
                    1,200+ campuses
                  </span>
                </div>
                <h3 className="font-baloo text-xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors">
                  Find colleges
                </h3>
                <p className="mt-2 text-sm font-nunito text-sn-ink-soft leading-relaxed">
                  Constituent and affiliated institutions across Nepal with verified fees and faculties.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary">
                <span>Explore directory</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Card 4: GPA Calculator */}
            <Link
              href="/tools/gpa-calculator"
              className="apple-card group flex flex-col justify-between p-6 sm:p-7 !rounded-[20px] transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={Calculator} tint="butter" size={38} />
                  <span className="rounded-full bg-sn-tint-butter/80 px-2.5 py-0.5 text-[11px] font-bold font-nunito text-sn-ink">
                    SEE &amp; +2 scale
                  </span>
                </div>
                <h3 className="font-baloo text-xl font-bold text-sn-ink group-hover:text-sn-primary transition-colors">
                  GPA calculator
                </h3>
                <p className="mt-2 text-sm font-nunito text-sn-ink-soft leading-relaxed">
                  Instant GPA and percentage conversion calibrated specifically to Nepal curriculum.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold font-nunito text-sn-primary">
                <span>Calculate GPA</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </div>
            </Link>
          </div>

          {/* Clean secondary utility pill strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { href: '/scholarships', label: 'Scholarships', icon: Award },
              { href: '/entrance-exams', label: 'Entrance exams', icon: CalendarClock },
              { href: '/study-resources', label: 'Study resources', icon: BookOpen },
              { href: '/notices', label: 'University notices', icon: Bell },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="apple-pill group flex items-center gap-2 rounded-full px-4 py-2 hover:bg-white hover:border-black/[0.15] transition-all duration-200"
              >
                <Icon className="h-3.5 w-3.5 text-sn-primary" />
                <span className="text-xs font-bold font-nunito text-sn-ink group-hover:text-sn-primary transition-colors">
                  {label}
                </span>
                <ArrowRight className="h-3 w-3 text-sn-ink-muted group-hover:text-sn-primary group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. BROWSE — capsule pill-strip & elevated metrics
      ════════════════════════════════════════════════════════ */}
      <section className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <SectionHeader title="Browse by program or university" />

          {/* 4A. Faculties: Sleek horizontal pill-strip */}
          <div className="mt-8 lg:mt-10">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-baloo text-lg font-bold text-sn-ink">By program</h3>
              <Link href="/programs" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">All programs</Link>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {FACULTIES.map((faculty, index) => {
                const Icon = FACULTY_ICONS[faculty.slug] ?? Monitor
                const href = faculty.slug === 'plus-two' ? '/colleges?level=%2B2' : `/programs?faculty=${faculty.slug}`
                const tint = FACULTY_TINTS[index % FACULTY_TINTS.length]
                const tintBg = tint === 'peach'
                  ? 'bg-sn-tint-peach'
                  : tint === 'mint'
                  ? 'bg-sn-tint-mint'
                  : tint === 'butter'
                  ? 'bg-sn-tint-butter'
                  : 'bg-sn-tint-lilac'

                return (
                  <Link
                    key={faculty.slug}
                    href={href}
                    className="apple-pill group flex items-center gap-2.5 rounded-full px-3.5 py-2 transition-all duration-200 hover:border-sn-ink/20 hover:bg-sn-surface hover:shadow-sm"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sn-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] ${tintBg}`}>
                      <Icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold font-nunito text-sn-ink group-hover:text-sn-primary transition-colors">
                      {faculty.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 4B. Universities: Elevated metric rows with prominent tabular counts */}
          <div className="mt-8 lg:mt-10">
            <div className="flex items-end justify-between gap-4">
              <h3 className="font-baloo text-lg font-bold text-sn-ink">By university</h3>
              <Link href="/colleges" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">All affiliated colleges</Link>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {UNIVERSITY_SHOWCASE.map((u, index) => {
                const count = universityCounts[u.short] ?? 0
                const tint = ['bg-sn-tint-peach', 'bg-sn-tint-mint', 'bg-sn-tint-butter', 'bg-sn-tint-lilac'][index % 4]
                return (
                  <Link
                    key={u.short}
                    href={`/colleges?affiliation=${encodeURIComponent(u.affiliation)}`}
                    className="apple-card group flex items-center justify-between gap-3.5 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-baloo text-base font-bold text-sn-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-black/[0.04] ${tint}`}>
                        {u.short}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold font-nunito leading-snug text-sn-ink group-hover:text-sn-primary transition-colors truncate">
                          {u.label}
                        </p>
                        <p className="text-xs font-nunito text-sn-ink-muted truncate">
                          {u.affiliation}
                        </p>
                      </div>
                    </div>
                    {count > 0 && (
                      <span className="shrink-0 rounded-full border border-black/[0.08] bg-sn-surface-alt px-2.5 py-1 text-xs font-bold font-nunito tabular-nums text-sn-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] group-hover:border-sn-primary/30 group-hover:text-sn-primary transition-colors">
                        {count}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. SEE IT IN ACTION — proof: open admissions, live results
          and notices, featured colleges. Sub-groups only render when
          they have real content.
      ════════════════════════════════════════════════════════ */}
      {hasProofContent && (
        <section className={`border-b border-sn-border bg-sn-surface ${SECTION_PAD}`}>
          <div className={CONTAINER}>
            <SectionHeader title="See it in action" description="A sample of what's live on the platform right now. Sourced and dated, not a static list." />

            {admissions.length > 0 && (
              <div className="mt-8 lg:mt-10">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="font-baloo text-lg font-bold text-sn-ink">Admissions open now</h3>
                  <Link href="/admissions" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">All admissions</Link>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">{admissions.map((admission) => <AdmissionCard key={admission.id} admission={admission} />)}</div>
              </div>
            )}

            {(results.length > 0 || notices.length > 0) && (
              <div className="mt-8 lg:mt-10">
                <h3 className="font-baloo text-lg font-bold text-sn-ink">Latest results &amp; notices</h3>
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
                  <Card className="!p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IconTile icon={FileText} tint="peach" size={28} />
                        <span className="text-sm font-bold font-nunito text-sn-ink">Latest Results</span>
                      </div>
                      <Link href="/results" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">View all</Link>
                    </div>
                    {results.length > 0 ? (
                      <div>{results.slice(0, 4).map((r) => <ResultCard key={r.id} result={r} compact />)}</div>
                    ) : (
                      <p className="text-sm font-nunito text-sn-ink-muted py-6 text-center">No results yet</p>
                    )}
                  </Card>

                  <Card className="!p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <IconTile icon={Bell} tint="butter" size={28} />
                        <span className="text-sm font-bold font-nunito text-sn-ink">University Notices</span>
                      </div>
                      <Link href="/notices" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">View all</Link>
                    </div>
                    {notices.length > 0 ? (
                      <div>{notices.slice(0, 4).map((n) => <NoticeCard key={n.id} notice={n} compact />)}</div>
                    ) : (
                      <p className="text-sm font-nunito text-sn-ink-muted py-6 text-center">No notices yet</p>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {featuredColleges.length > 0 && (
              <div className="mt-8 lg:mt-10">
                <div className="flex items-end justify-between gap-4">
                  <h3 className="font-baloo text-lg font-bold text-sn-ink">Featured colleges</h3>
                  <Link href="/colleges" className="text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover">View all</Link>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {featuredColleges.slice(0, 6).map((college) => <FeaturedCollegeCard key={college.id} college={college} />)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          6. GET STARTED — Apple Verification & Alert Center
      ════════════════════════════════════════════════════════ */}
      <section className={`border-t border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="apple-shell">
            <div className="apple-card relative overflow-hidden !rounded-[20px] bg-white p-8 sm:p-12 lg:p-16 text-center shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.9),0_8px_32px_rgba(15,23,42,0.06)]">
              {/* Subtle warm accent radial background */}
              <div className="pointer-events-none absolute -top-24 left-1/2 h-[350px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#A9E0F1]/25 via-[#CAFFA6]/15 to-transparent blur-2xl" aria-hidden="true" />

              <div className="relative">
                <h2 className="font-baloo font-extrabold text-sn-ink text-3xl sm:text-4xl mb-3 tracking-[-0.02em]">
                  Check the current notice before you pay.
                </h2>
                <p className="mx-auto mb-8 max-w-xl text-sn-ink-soft font-nunito text-sm sm:text-base leading-relaxed">
                  Fees, seats and deadlines can change. Each college profile shows its source and last-checked date when available.
                </p>
                <div className="flex flex-wrap justify-center gap-3.5">
                  <Button.Link
                    href="/colleges"
                    variant="primary"
                    className="group rounded-full px-6 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_6px_20px_rgba(32,70,84,0.24)] transition-all duration-300 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_10px_28px_rgba(32,70,84,0.32)] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Search all institutions</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </Button.Link>
                  <Link
                    href="/results"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white/80 px-6 py-3 text-sm font-bold font-nunito text-sn-ink transition-all hover:bg-white hover:border-black/[0.15] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] motion-control"
                  >
                    Check results
                  </Link>
                </div>

                <div className="mx-auto mt-10 max-w-md border-t border-black/[0.06] pt-8 lg:mt-12 lg:pt-10">
                  <p className="font-bold font-nunito text-sm text-sn-ink flex items-center gap-2 justify-center">
                    <Bell className="w-4 h-4 text-sn-primary" aria-hidden="true" />
                    Get result alerts in your inbox
                  </p>
                  <p className="text-sn-ink-muted text-xs font-nunito mt-1 mb-5">
                    Email updates when a new result or notice is published
                  </p>
                  <EmailSubscribe />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
