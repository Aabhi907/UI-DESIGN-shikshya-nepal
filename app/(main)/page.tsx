import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import Hero from '@/components/home/Hero'
import StudentCompanionShowcase from '@/components/home/StudentCompanionShowcase'
import ShikshyaWhatMakesUsDifferent from '@/components/home/ShikshyaWhatMakesUsDifferent'
import ResultCard from '@/components/results/ResultCard'
import NoticeCard from '@/components/notices/NoticeCard'
import EmailSubscribe from '@/components/notifications/EmailSubscribe'
import type { Result, Notice, College } from '@/types'
import type { Admission } from '@/types'
import AdmissionCard from '@/components/admissions/AdmissionCard'
import Card from '@/components/design-system/Card'
import IconTile from '@/components/design-system/IconTile'
import SectionHeader from '@/components/design-system/SectionHeader'
import Button from '@/components/design-system/Button'
import FeaturedCollegeCard, { CAMPUS_FALLBACK_IMAGES } from '@/components/design-system/FeaturedCollegeCard'
import TestimonialsColumns from '@/components/home/TestimonialsColumns'
import HomeScrollMotion from '@/components/home/HomeScrollMotion'
import SikshyaDemo from '@/components/sikshya-demo/SikshyaDemo'
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
  Paperclip,
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
  title: { absolute: 'ShikshyaXNepal: Decide What to Study After +2, and Where' },
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
      <HomeScrollMotion />
      {/* ════════════════════════════════════════════════════════
          1. HERO — Himalayan Calm, Single Focused Action
      ════════════════════════════════════════════════════════ */}
      <Hero heroStats={heroStats} admissions={admissions} />

      {/* ════════════════════════════════════════════════════════
          2. MOBILE STUDENT COMPANION — Interactive Phone & Flanking Badges
      ════════════════════════════════════════════════════════ */}
      <StudentCompanionShowcase />

      {/* ════════════════════════════════════════════════════════
          3. WHAT MAKES US DIFFERENT FROM OTHERS — Floating Points in Air
      ════════════════════════════════════════════════════════ */}
      <ShikshyaWhatMakesUsDifferent />

      {/* ════════════════════════════════════════════════════════
          4. FEATURE SHOWCASE 1 — Results without the chaos (TinyShots Rhythm)
      ════════════════════════════════════════════════════════ */}
      <section data-home-motion className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
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
              <div className="rounded-[32px] border border-black/[0.08] dark:border-white/[0.08] bg-slate-100/70 dark:bg-[#151518]/60 p-6 sm:p-10 relative flex flex-col justify-center min-h-[380px] shadow-sm dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.04)]">
                {/* Floating query bubble matching Voxt's "Make it shorter and clearer" */}
                <div className="self-start -mb-3 z-10 ml-2">
                  <div className="apple-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold font-nunito text-slate-800 dark:text-sn-ink shadow-md bg-white/80 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12]">
                    <span>&ldquo;Check my NEB Grade 12 result&rdquo;</span>
                  </div>
                </div>

                {/* Floating Clean Result Card matching Voxt's Semantic Rewrite card */}
                <div className="apple-card rounded-[22px] p-5 sm:p-6 mt-4 backdrop-blur-md">
                  <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sn-tint-peach text-primary dark:text-[#A9E0F1] font-bold text-xs font-mono">
                        NEB
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-sn-ink font-nunito">Grade 12 Annual Examination</p>
                        <p className="text-[11px] text-slate-500 dark:text-sn-ink-muted font-nunito">National Examination Board · Sanothimi</p>
                      </div>
                    </div>
                  </div>

                  <div className="py-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-slate-500 dark:text-sn-ink-muted">Symbol Number:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-sn-ink">2401884X</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-slate-500 dark:text-sn-ink-muted">Academic Stream:</span>
                      <span className="font-bold text-slate-900 dark:text-sn-ink">Science (Physics, Chemistry, Math)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-slate-500 dark:text-sn-ink-muted">Calculated Standing:</span>
                      <span className="font-bold text-emerald-800 dark:text-[#CAFFA6] bg-emerald-500/10 dark:bg-[#CAFFA6]/10 border border-emerald-500/20 dark:border-[#CAFFA6]/20 px-2 py-0.5 rounded-lg">
                        First Division with Distinction · 3.65 GPA
                      </span>
                    </div>
                  </div>

                  {/* Clean Filter Pills at bottom matching [Shorter] [Clearer] [Formal] in Voxt */}
                  <div className="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                    <div className="flex gap-1.5 text-[11px] font-bold font-nunito">
                      <span className="rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] px-2.5 py-1 text-slate-800 dark:text-sn-ink">TU Balkhu</span>
                      <span className="rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] px-2.5 py-1 text-slate-800 dark:text-sn-ink">NEB</span>
                      <span className="rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] px-2.5 py-1 text-slate-800 dark:text-sn-ink">KU Dhulikhel</span>
                    </div>
                    <Link href="/results" className="text-xs font-bold text-primary dark:text-[#CAFFA6] hover:underline">
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
      <section data-home-motion className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Soft Canvas with Floating Intake Card */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <div className="rounded-[32px] border border-black/[0.08] dark:border-white/[0.08] bg-slate-100/70 dark:bg-[#151518]/60 p-6 sm:p-10 relative flex flex-col justify-center min-h-[380px] shadow-sm dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.04)]">
                {/* Floating query bubble */}
                <div className="self-start -mb-3 z-10 ml-2">
                  <div className="apple-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold font-nunito text-slate-800 dark:text-sn-ink shadow-md bg-white/80 dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12]">
                    <span>&ldquo;When does Kathmandu University BTech close?&rdquo;</span>
                  </div>
                </div>

                {/* Floating Admission Card */}
                <div className="apple-card rounded-[22px] p-5 sm:p-6 mt-4 backdrop-blur-md">
                  <div className="flex items-start justify-between pb-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div>
                      <span className="rounded-full bg-[#A9E0F1]/20 border border-[#A9E0F1]/40 px-2.5 py-0.5 text-[10px] font-bold text-primary dark:text-[#A9E0F1] inline-block mb-1.5">
                        Closes in 4 days
                      </span>
                      <h4 className="font-baloo text-base font-bold text-slate-900 dark:text-sn-ink">Kathmandu University</h4>
                      <p className="text-xs font-nunito text-slate-500 dark:text-sn-ink-muted">School of Engineering · Dhulikhel</p>
                    </div>
                  </div>

                  <div className="py-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-slate-500 dark:text-sn-ink-muted">Program:</span>
                      <span className="font-bold text-slate-900 dark:text-sn-ink">BTech in Artificial Intelligence</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-slate-500 dark:text-sn-ink-muted">Eligibility:</span>
                      <span className="font-bold text-slate-900 dark:text-sn-ink">Min 2.4 GPA in +2 Science</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-nunito">
                      <span className="text-slate-500 dark:text-sn-ink-muted">Application Form:</span>
                      <span className="font-bold text-emerald-800 dark:text-[#CAFFA6]">Online Submission Available</span>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                    <Link
                      href="/admissions"
                      className="apple-control rounded-full bg-sn-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-sn-primary-hover active:scale-[0.98] transition-all"
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

      {false && <section data-home-motion className="border-b border-sn-border bg-[#204654] text-white py-20 lg:py-28 overflow-hidden relative">
        {/* Subtle atmospheric glow */}
        <div className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-[#E3EEE2]/12 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-[480px] w-[480px] rounded-full bg-[#A9E0F1]/10 blur-3xl" aria-hidden="true" />

        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Heading + Command jumps */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[#E3EEE2] font-nunito">
                PATHWAY INTELLIGENCE
              </p>
              <h2 className="font-baloo text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.08] tracking-[-0.03em]">
                Find the right course. In 3 clicks, not 3 months.
              </h2>
              <p className="text-base sm:text-lg font-nunito text-white/80 leading-relaxed max-w-xl">
                Skip the guesswork. Search eligibility criteria, entrance exam patterns, and tuition breakdown across all major universities in Nepal.
              </p>

              {/* Command Prompt Links matching Image 4 */}
              <div className="pt-2 space-y-2.5 font-mono text-xs sm:text-sm">
                <Link
                  href="/programs?faculty=it"
                  className="group flex items-center gap-2 text-white/90 hover:text-[#E3EEE2] transition-colors"
                >
                  <span className="text-[#E3EEE2]">/explore-it</span>
                  <span className="text-white/60">→</span>
                  <span className="font-nunito text-white/80 group-hover:text-white">BSc CSIT vs BIT vs BCA fee &amp; cutoff</span>
                </Link>
                <Link
                  href="/programs?faculty=engineering"
                  className="group flex items-center gap-2 text-white/90 hover:text-[#E3EEE2] transition-colors"
                >
                  <span className="text-[#E3EEE2]">/ioe-entrance</span>
                  <span className="text-white/60">→</span>
                  <span className="font-nunito text-white/80 group-hover:text-white">Pulchowk &amp; affiliated engineering quotas</span>
                </Link>
                <Link
                  href="/tools/gpa-calculator"
                  className="group flex items-center gap-2 text-white/90 hover:text-[#E3EEE2] transition-colors"
                >
                  <span className="text-[#E3EEE2]">/check-eligibility</span>
                  <span className="text-white/60">→</span>
                  <span className="font-nunito text-white/80 group-hover:text-white">Verify your SEE or +2 GPA for medical/tech</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Prompt Mockup matching Image 4 */}
            <div className="lg:col-span-6">
              <div className="rounded-[28px] bg-[#142C35]/90 border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-nunito text-white/70">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#A9E0F1]" />
                    <span className="font-bold text-white">Live Pathway Simulator</span>
                  </div>
                  <span className="text-white/50 font-mono">Nepal Curriculum 2082</span>
                </div>

                {/* Input Card Container */}
                <div className="mt-5 rounded-2xl bg-[#151518] p-4 sm:p-5 text-sn-ink shadow-lg border border-white/[0.08]">
                  <div className="flex items-center justify-between text-xs font-nunito text-sn-ink-muted mb-2">
                    <span>Target criteria query</span>
                    <span className="text-[10px] bg-[#CAFFA6]/15 font-bold px-2 py-0.5 rounded text-[#CAFFA6]">Instant verify</span>
                  </div>
                  <p className="font-nunito text-sm sm:text-base font-bold text-sn-ink leading-snug">
                    &ldquo;Can I study BSc CSIT with a C+ in Mathematics in +2?&rdquo;
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    {/* Attached file pill matching Image 4's Product-Design-Playbook.pdf */}
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-xs font-nunito font-semibold text-sn-ink-soft border border-white/[0.08]">
                      <FileText className="w-3.5 h-3.5 text-[#CAFFA6]" />
                      <span>TU-CSIT-Ordinance-2082.pdf</span>
                    </div>
                    <Link
                      href="/programs?faculty=it"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#204654] text-white hover:bg-[#295b6e] transition-colors"
                      aria-label="View verified response"
                    >
                      <ArrowRight className="w-4 h-4 text-[#CAFFA6]" />
                    </Link>
                  </div>
                </div>

                {/* Instant verification result box */}
                <div className="mt-4 rounded-xl bg-white/10 border border-white/15 p-4 text-xs font-nunito text-white/90 space-y-1.5">
                  <p className="flex items-center gap-2 font-bold text-[#CAFFA6]">
                    <CheckCircle2 className="w-4 h-4 text-[#CAFFA6]" />
                    <span>Official Tribhuvan University Requirement Met:</span>
                  </p>
                  <p className="text-white/80 leading-relaxed pl-6">
                    Minimum Grade C in Math, Physics &amp; Chemistry with overall 2.0 GPA. Eligible for TU IOST central entrance examination.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Ticker Bar with Voxt edge-fade mask */}
          <div className="mt-16 pt-10 border-t border-white/10 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-xs uppercase font-bold tracking-widest text-white/60">
              <span>Tribhuvan University</span>
              <span>Kathmandu University</span>
              <span>Pokhara University</span>
              <span>Purbanchal</span>
              <span>NEB Sanothimi</span>
              <span>CTEVT</span>
            </div>
          </div>

          {/* Giant Highlight Quote matching Image 4 */}
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <blockquote className="font-baloo text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug text-white">
              &ldquo;I spent weeks asking coaching institutes. Shikshya Nepal gave me the{' '}
              <span className="bg-[#CAFFA6]/20 text-[#CAFFA6] border border-[#CAFFA6]/30 px-2.5 py-0.5 rounded-lg inline-block my-1 font-extrabold">
                exact eligibility and official dates
              </span>{' '}
              in under two minutes.&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-sm font-bold text-[#CAFFA6]">
                AS
              </div>
              <div className="text-left font-nunito text-xs">
                <p className="font-bold text-white">Ayush Shrestha</p>
                <p className="text-white/60">Pulchowk Campus Aspirant · Lalitpur</p>
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* Student perspective retained from the former pathway section. */}
      <section data-home-motion className="border-b border-sn-border bg-sn-ground py-16 sm:py-20">
        <div className={CONTAINER}>
          <figure className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#151518] px-7 py-9 text-center shadow-md dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] sm:px-12 sm:py-12">
            <div className="mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1c1c22] font-serif text-3xl font-bold leading-none text-primary dark:text-[#CAFFA6] shadow-sm dark:shadow-[0_4px_14px_rgba(0,0,0,0.3)]" aria-hidden="true">“</div>
            <blockquote className="font-baloo text-xl font-bold leading-[1.45] text-slate-900 dark:text-sn-ink sm:text-2xl lg:text-3xl">
              I spent weeks asking coaching institutes. ShikshyaXNepal gave me the{' '}
              <span className="font-extrabold text-primary dark:text-[#CAFFA6] underline decoration-primary/40 dark:decoration-[#CAFFA6]/40 decoration-4 underline-offset-4">exact eligibility and official dates</span>{' '}
              in under two minutes.
            </blockquote>
            <figcaption className="mt-6 flex items-center justify-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sn-primary text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]">AS</span>
              <span className="text-left font-nunito text-xs leading-5">
                <span className="block font-bold text-slate-900 dark:text-sn-ink">Ayush Shrestha</span>
                <span className="block text-slate-500 dark:text-sn-ink-muted">Pulchowk Campus Aspirant · Lalitpur</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          7. EDITORIAL STORY — Paperclip & Polaroid (Matching Image 3 & 1)
      ════════════════════════════════════════════════════════ */}
      <section data-home-motion className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: The Editorial Story */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-baloo text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-sn-ink leading-[1.1] tracking-[-0.03em]">
                Top students choose with data, not consultancy promises.
              </h2>
              <div className="space-y-4 font-nunito text-base sm:text-lg text-slate-600 dark:text-sn-ink-soft leading-relaxed">
                <p>
                  Every academic year in Nepal, over 400,000 students graduate from SEE and +2 facing high-pressure decisions. Too often, they are guided by sponsored billboards, consultancy sales agents, or unverified social media claims.
                </p>
                <p>
                  Constituent campus vs private quota fees can differ by over 800,000 NPR for the exact same syllabus. Knowing the entrance date, seat allocation, and scholarship quota in advance changes your career trajectory.
                </p>
                <p className="font-bold text-slate-900 dark:text-sn-ink">
                  Shikshya Nepal exists to give every student in Nepal the clear, dated, official truth — free, always.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button.Link href="/colleges" variant="primary" className="rounded-full px-6 py-3">
                  Explore verified colleges
                </Button.Link>
                <Link
                  href="/news"
                  className="font-bold font-nunito text-sm text-slate-800 dark:text-sn-ink hover:text-primary dark:hover:text-[#CAFFA6] flex items-center gap-1.5 transition-colors"
                >
                  <span>Read our verification policy</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Tactile Polaroid Photo with Metallic Paperclip (Image 3) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rotate-2 hover:rotate-0 transition-transform duration-300">
                {/* Paperclip matching Image 3 */}
                <div className="absolute -top-5 right-10 z-20 drop-shadow-md">
                  <Paperclip className="w-10 h-10 -rotate-12 stroke-[2.2] text-slate-400" />
                </div>

                {/* Polaroid / Photographic Card */}
                <div className="apple-card rounded-2xl bg-white dark:bg-[#151518] p-4 pb-6 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-black/[0.08] dark:border-white/[0.08] max-w-[340px] sm:max-w-[380px]">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900">
                    <Image
                      src={CAMPUS_FALLBACK_IMAGES[1]}
                      alt="Student studying on campus in Nepal"
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 left-2 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
                      Pulchowk Campus, Lalitpur
                    </div>
                  </div>

                  <div className="mt-4 space-y-1">
                    <p className="font-baloo text-base font-bold text-sn-ink">
                      Real campuses, official gazettes.
                    </p>
                    <p className="font-nunito text-xs text-sn-ink-muted">
                      Source-dated to university boards. No paid rankings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3. WHAT DO YOU NEED TODAY — Clean Minimal 4-Grid
      ════════════════════════════════════════════════════════ */}
      <section data-home-motion className={`border-b border-sn-border bg-sn-surface-alt/60 ${SECTION_PAD}`}>
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
              className="apple-card group flex flex-col justify-between p-6 sm:p-7 rounded-[22px] backdrop-blur-md cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={FileText} tint="peach" size={38} />
                  <span className="rounded-full bg-sn-tint-peach/80 px-2.5 py-0.5 text-[11px] font-bold font-nunito text-slate-800 dark:text-sn-ink">
                    TU · KU · NEB
                  </span>
                </div>
                <h3 className="font-baloo text-xl font-bold text-slate-900 dark:text-sn-ink group-hover:text-sn-primary transition-colors">
                  Board results
                </h3>
                <p className="mt-2 text-sm font-nunito text-slate-600 dark:text-sn-ink-soft leading-relaxed">
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
              className="apple-card group flex flex-col justify-between p-6 sm:p-7 rounded-[22px] backdrop-blur-md cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={CalendarClock} tint="mint" size={38} />
                  <span className="rounded-full bg-sn-tint-mint/80 px-2.5 py-0.5 text-[11px] font-bold font-nunito text-slate-800 dark:text-sn-ink">
                    Live &amp; open
                  </span>
                </div>
                <h3 className="font-baloo text-xl font-bold text-slate-900 dark:text-sn-ink group-hover:text-sn-primary transition-colors">
                  College admissions
                </h3>
                <p className="mt-2 text-sm font-nunito text-slate-600 dark:text-sn-ink-soft leading-relaxed">
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
              className="apple-card group flex flex-col justify-between p-6 sm:p-7 rounded-[22px] backdrop-blur-md cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={GraduationCap} tint="lilac" size={38} />
                  <span className="rounded-full bg-sn-tint-lilac/80 px-2.5 py-0.5 text-[11px] font-bold font-nunito text-slate-800 dark:text-sn-ink">
                    1,200+ campuses
                  </span>
                </div>
                <h3 className="font-baloo text-xl font-bold text-slate-900 dark:text-sn-ink group-hover:text-sn-primary transition-colors">
                  Find colleges
                </h3>
                <p className="mt-2 text-sm font-nunito text-slate-600 dark:text-sn-ink-soft leading-relaxed">
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
              className="apple-card group flex flex-col justify-between p-6 sm:p-7 rounded-[22px] backdrop-blur-md cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <IconTile icon={Calculator} tint="butter" size={38} />
                  <span className="rounded-full bg-sn-tint-butter/80 px-2.5 py-0.5 text-[11px] font-bold font-nunito text-slate-800 dark:text-sn-ink">
                    SEE &amp; +2 scale
                  </span>
                </div>
                <h3 className="font-baloo text-xl font-bold text-slate-900 dark:text-sn-ink group-hover:text-sn-primary transition-colors">
                  GPA calculator
                </h3>
                <p className="mt-2 text-sm font-nunito text-slate-600 dark:text-sn-ink-soft leading-relaxed">
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
                className="apple-pill group flex items-center gap-2 rounded-full px-4 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.16] transition-all duration-200"
              >
                <Icon className="h-3.5 w-3.5 text-sn-primary dark:text-[#CAFFA6]" />
                <span className="text-xs font-bold font-nunito text-sn-ink group-hover:text-sn-primary dark:group-hover:text-[#CAFFA6] transition-colors">
                  {label}
                </span>
                <ArrowRight className="h-3 w-3 text-sn-ink-muted group-hover:text-sn-primary dark:group-hover:text-[#CAFFA6] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. BROWSE — capsule pill-strip & elevated metrics
      ════════════════════════════════════════════════════════ */}
      <section data-home-motion className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
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
                    className="apple-pill group flex items-center gap-2.5 rounded-full px-3.5 py-2 transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.06] hover:shadow-sm"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sn-ink shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${tintBg}`}>
                      <Icon className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <span className="text-sm font-bold font-nunito text-sn-ink group-hover:text-sn-primary dark:group-hover:text-[#CAFFA6] transition-colors">
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
                const tint = ['bg-sn-tint-peach text-primary dark:text-[#A9E0F1]', 'bg-sn-tint-mint text-emerald-800 dark:text-[#CAFFA6]', 'bg-sn-tint-butter text-amber-800 dark:text-[#F7F9E1]', 'bg-sn-tint-lilac text-indigo-800 dark:text-[#D9EEF7]'][index % 4]
                return (
                  <Link
                    key={u.short}
                    href={`/colleges?affiliation=${encodeURIComponent(u.affiliation)}`}
                    className="apple-card group flex items-center justify-between gap-3.5 p-4 rounded-[20px] backdrop-blur-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-baloo text-base font-bold shadow-sm border border-black/[0.06] dark:border-white/[0.08] ${tint} transition-transform duration-300 group-hover:scale-[1.05]`}>
                        {u.short}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold font-nunito leading-snug text-slate-900 dark:text-sn-ink group-hover:text-sn-primary dark:group-hover:text-[#CAFFA6] transition-colors truncate">
                          {u.label}
                        </p>
                        <p className="text-xs font-nunito text-slate-500 dark:text-sn-ink-muted truncate">
                          {u.affiliation}
                        </p>
                      </div>
                    </div>
                    {count > 0 && (
                      <span className="shrink-0 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 text-xs font-bold font-nunito tabular-nums text-slate-700 dark:text-sn-ink shadow-sm group-hover:border-sn-primary/30 dark:group-hover:border-[#CAFFA6]/30 group-hover:text-sn-primary dark:group-hover:text-[#CAFFA6] transition-colors">
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
        <section data-home-motion className={`border-b border-sn-border bg-sn-surface ${SECTION_PAD}`}>
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
          WHAT STUDENTS SAY — Clean 5-Star Testimonials (Matching Image 2)
      ════════════════════════════════════════════════════════ */}
      <section data-home-motion className={`border-b border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <p className="text-xs font-bold uppercase tracking-wider text-sn-ink-muted font-nunito mb-2">Student perspectives</p>
            <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-sn-ink tracking-tight">
              What students and counselors say
            </h2>
            <p className="mt-2 text-sm sm:text-base font-nunito text-sn-ink-soft">
              Feedback from students and counselors who use ShikshyaXNepal to plan their next step.
            </p>
          </div>

          <TestimonialsColumns />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. SIKSHYA NEPAL AI WINDOW (4-Layer Interactive Experience Below Testimonials)
      ════════════════════════════════════════════════════════ */}
      <SikshyaDemo />

      {/* ════════════════════════════════════════════════════════
          6. GET STARTED — Apple Verification & Alert Center
      ════════════════════════════════════════════════════════ */}
      <section data-home-motion className={`border-t border-sn-border bg-sn-ground ${SECTION_PAD}`}>
        <div className={CONTAINER}>
          <div className="apple-shell">
            <div className="apple-card relative overflow-hidden !rounded-[20px] bg-white dark:bg-[#151518] p-8 sm:p-12 lg:p-16 text-center shadow-lg dark:shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.5)] border border-black/[0.08] dark:border-white/[0.08]">
              {/* Subtle warm accent radial background */}
              <div className="pointer-events-none absolute -top-24 left-1/2 h-[350px] w-[500px] -translate-x-1/2 rounded-full apple-glow blur-2xl opacity-70" aria-hidden="true" />

              <div className="relative">
                <div className="max-w-2xl mx-auto mb-10 text-center">
                  <span className="apple-pill inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold font-nunito text-slate-800 dark:text-sn-ink bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.12] shadow-sm mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-[#CAFFA6]" />
                    <span>Updated for 2082 / 2026 Academic Session</span>
                  </span>
                  <h2 className="font-baloo font-extrabold text-sn-ink text-3xl sm:text-4xl lg:text-5xl mb-3 tracking-[-0.025em]">
                    Every decision verified before you apply.
                  </h2>
                  <p className="text-sn-ink-soft font-nunito text-sm sm:text-base leading-relaxed">
                    Fees, seats and deadlines can change without warning. Every college profile displays its source gazette and last-checked date.
                  </p>
                </div>

                {/* 2-Column Guide Spec Breakdown matching Image 2 Top */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-left mb-12">
                  {/* Left: 3D Guide Book Card */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-2xl bg-[#0a0b0d] text-white p-7 sm:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.6)] border border-white/10 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
                      {/* Spine highlight */}
                      <div className="absolute top-0 bottom-0 left-0 w-3 bg-white/10" />
                      
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-[#CAFFA6] pb-3 border-b border-white/10">
                          <span>OFFICIAL GUIDE</span>
                          <span>2082 BS</span>
                        </div>
                        <h3 className="font-baloo text-2xl font-extrabold mt-6 leading-tight text-white">
                          The Nepal College &amp; Career Directory
                        </h3>
                        <p className="mt-3 text-xs font-nunito text-white/70 leading-relaxed">
                          Tribhuvan, Kathmandu, Pokhara, Purbanchal, NEB and CTEVT verified affiliations.
                        </p>
                      </div>

                      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-nunito text-white/60">
                        <span>Free Public Edition</span>
                        <span className="text-[#CAFFA6] font-bold">1,200+ Campuses</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Spec List with Icons & Divider Lines matching Image 2 */}
                  <div className="lg:col-span-7 space-y-4">
                    {[
                      {
                        title: '1,200+ Verified Campuses',
                        desc: 'Constituent government campuses and accredited private colleges mapped across all 7 provinces.',
                        icon: Building2,
                      },
                      {
                        title: 'Real Intake Deadlines',
                        desc: 'Live countdowns verified directly against official university examination and admission notices.',
                        icon: Clock,
                      },
                      {
                        title: 'Zero Paid Placements',
                        desc: 'No sponsored rankings, hidden consultancy commissions, or altered recommendations.',
                        icon: ShieldCheck,
                      },
                      {
                        title: 'Free Public Resources',
                        desc: 'Instant NEB GPA conversion, admission planner, and board syllabus downloads 100% free.',
                        icon: GraduationCap,
                      },
                    ].map((item, idx) => {
                      const Icon = item.icon
                      return (
                        <div key={idx} className="flex items-start gap-4 pb-4 border-b border-black/[0.08] dark:border-white/[0.08] last:border-0 last:pb-0">
                          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.06] text-emerald-700 dark:text-[#CAFFA6] border border-black/[0.08] dark:border-white/[0.08]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <h4 className="font-baloo text-base font-bold text-sn-ink leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-xs sm:text-sm font-nunito text-sn-ink-muted leading-relaxed mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap justify-center items-center gap-3.5">
                  <Button.Link
                    href="/colleges"
                    variant="primary"
                    className="group rounded-full px-7 py-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_6px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_10px_28px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0 text-sm font-bold"
                  >
                    <span>Search all institutions</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </Button.Link>
                  <Link
                    href="/results"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/[0.12] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.05] px-6 py-3 text-sm font-bold font-nunito text-slate-800 dark:text-white transition-all hover:bg-black/[0.08] dark:hover:bg-white/[0.1] hover:border-black/[0.2] dark:hover:border-white/[0.2] shadow-sm motion-control"
                  >
                    Check results
                  </Link>
                </div>

                {/* Trust badge matching "Secure Stripe payment / Free for students" */}
                <p className="mt-4 text-xs font-nunito font-semibold text-emerald-700 dark:text-[#CAFFA6] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-[#CAFFA6]" />
                  <span>100% Free Public Guide · No student registration fees</span>
                </p>

                {/* Email Alert Newsletter Form */}
                <div className="mx-auto mt-10 max-w-md border-t border-black/[0.08] dark:border-white/[0.08] pt-8 lg:mt-12 lg:pt-10">
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
