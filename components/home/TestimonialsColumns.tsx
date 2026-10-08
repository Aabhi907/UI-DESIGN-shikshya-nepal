'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type Testimonial = { quote: string; author: string; role: string }

const testimonials: Testimonial[] = [
  { quote: 'Found the real fee structure for KU BTech before paying any consultancy consultation fee. Clear and trustworthy.', author: 'Suman Thapa', role: 'Engineering aspirant · Kathmandu' },
  { quote: 'No confusing ads or popup scams. Just the exact roll number lookup and syllabus breakdown for IOE entrance.', author: 'Pooja Shrestha', role: 'IOE student · Lalitpur' },
  { quote: 'I recommend this to students instead of glossy admission brochures. The dated notices are especially useful.', author: 'Sarita Khadka', role: 'Academic counselor · Dharan' },
]

export default function TestimonialsColumns() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 max-w-5xl mx-auto" aria-label="Student and counselor testimonials">
        {testimonials.map((item) => {
          const initials = item.author.split(' ').map(n => n[0]).join('').slice(0, 2)
          return (
            <article
              key={item.author}
              className="rounded-2xl border border-sn-border bg-white dark:bg-sn-surface p-5 sm:p-6"
            >
              <p className="font-nunito text-sm leading-relaxed text-sn-ink-soft line-clamp-3">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-4 flex items-center gap-3 pt-3.5 border-t border-sn-border">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sn-primary/10 text-[11px] font-bold text-sn-primary font-mono">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-nunito text-xs font-bold text-sn-ink truncate">
                    {item.author}
                  </p>
                  <p className="text-[11px] text-sn-ink-muted truncate">
                    {item.role}
                  </p>
                </div>
              </footer>
            </article>
          )
        })}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/colleges"
          className="inline-flex items-center gap-1.5 text-sm font-bold font-nunito text-sn-primary hover:text-sn-primary-hover transition-colors"
        >
          Read more reviews
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
