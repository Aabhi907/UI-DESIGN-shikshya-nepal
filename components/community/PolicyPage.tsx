import type { ReactNode } from 'react'
import Link from 'next/link'

export default function PolicyPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f8f7f3] px-4 py-12 sm:px-6">
      <article className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-[box-shadow,border-color] duration-200 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-gray-600">{intro}</p>
        <div className="prose prose-slate mt-8 max-w-none text-sm leading-7 [&_a]:motion-control [&_a]:transition-colors [&_a]:duration-150 [&_h2]:mb-2 [&_h2]:mt-7 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_ul]:space-y-1">
          {children}
        </div>
        <p className="mt-10 border-t border-gray-100 pt-5 text-xs text-gray-500">
          Last updated: 9 September 2026 · Questions: see <Link className="motion-control font-bold text-primary hover:underline focus-ring rounded" href="/contact">contact</Link>
        </p>
      </article>
    </main>
  )
}
