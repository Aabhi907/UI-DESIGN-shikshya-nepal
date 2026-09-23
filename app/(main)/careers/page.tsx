import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BriefcaseBusiness, SearchCheck } from 'lucide-react'
import { careers } from '@/lib/careers'
import Button from '@/components/design-system/Button'
import Card from '@/components/design-system/Card'

export const metadata: Metadata = { title: 'Career Explorer', description: 'Explore practical education and career routes in Nepal, with official sources to check before deciding.' }

export default function CareersPage() {
  const categories = Array.from(new Set(careers.map((career) => career.category)))
  return (
    <main className="min-h-screen bg-sn-ground">
      <section className="bg-sn-ink text-white">
        <div className="mx-auto max-w-sn px-5 py-14 sm:px-8 lg:px-12">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-white/70"><span className="h-px w-7 bg-sn-primary" />Study &amp; career explorer</p>
          <h1 className="mt-4 max-w-3xl font-baloo text-4xl font-extrabold leading-tight sm:text-5xl">Explore study routes before you commit.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 font-nunito text-white/80">Start with guided questions or browse practical Nepal career guides with sources to check.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button.Link href="/tools/program-finder" variant="secondary" className="!bg-white !text-sn-primary !border-white">Help me choose a study area</Button.Link>
            <a href="#career-guides" className="inline-flex min-h-11 items-center rounded-sn-control border border-white/30 px-5 text-sm font-bold font-nunito text-white">Browse career guides</a>
          </div>
        </div>
      </section>
      <div id="career-guides" className="mx-auto max-w-sn scroll-mt-24 px-5 py-10 sm:px-8 lg:px-12">
        {categories.map((category) => (
          <section id={category.toLowerCase().replaceAll(' ', '-')} key={category} className="mb-12">
            <div className="mb-4 flex items-center gap-2">
              <BriefcaseBusiness className="h-5 w-5 text-sn-primary" />
              <h2 className="font-baloo text-2xl font-bold text-sn-ink">{category}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {careers.filter((career) => career.category === category).map((career) => (
                <Link key={career.slug} href={`/careers/${career.slug}`} className="group">
                  <Card interactive className="h-full">
                    <h3 className="font-baloo text-xl font-bold text-sn-ink">{career.title}</h3>
                    <p className="mt-2 text-sm leading-6 font-nunito text-sn-ink-soft">{career.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold font-nunito text-sn-primary">View guide <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transform-none" /></span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <section className="border-t border-sn-border bg-sn-surface">
        <div className="mx-auto flex max-w-sn flex-col gap-4 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <div className="flex gap-3">
            <SearchCheck className="mt-1 h-5 w-5 shrink-0 text-sn-primary" />
            <p className="max-w-2xl text-sm leading-6 font-nunito text-sn-ink-soft"><strong className="text-sn-ink">Check before you invest.</strong> Entry rules, licensing and job opportunities can change. Use the official source on every guide.</p>
          </div>
          <Button.Link href="/my-path" variant="primary" className="shrink-0">Open My Path</Button.Link>
        </div>
      </section>
    </main>
  )
}
