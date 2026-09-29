'use client'

type Testimonial = { quote: string; author: string; role: string }

const testimonials: Testimonial[] = [
  { quote: 'Found the real fee structure for KU BTech before paying any consultancy consultation fee. Clear and trustworthy.', author: 'Suman Thapa', role: 'Engineering aspirant · Kathmandu' },
  { quote: 'No confusing ads or popup scams. Just the exact roll number lookup and syllabus breakdown for IOE entrance.', author: 'Pooja Shrestha', role: 'IOE student · Lalitpur' },
  { quote: 'Checked the CTEVT diploma college affiliation list in two minutes. It helped our family compare options.', author: 'Bikash Adhikari', role: '+2 graduate · Pokhara' },
  { quote: 'The GPA calculator handles the NEB theory and practical grade boundaries correctly.', author: 'Rohan Gautam', role: 'Class 12 student · Butwal' },
  { quote: 'I recommend this to students instead of glossy admission brochures. The dated notices are especially useful.', author: 'Sarita Khadka', role: 'Academic counselor · Dharan' },
  { quote: 'Easy to compare TU and PU Bachelor programs without opening a long list of university websites.', author: 'Anish Manandhar', role: 'BIM graduate · Lalitpur' },
]

const columns = [[testimonials[0], testimonials[3]], [testimonials[1], testimonials[4]], [testimonials[2], testimonials[5]]]

export default function TestimonialsColumns() {
  return (
    <div className="testimonials-columns relative mx-auto h-[31rem] max-w-5xl overflow-hidden sm:h-[34rem]" aria-label="Student and counselor testimonials">
      <div className="grid h-full grid-cols-1 gap-5 sm:grid-cols-3">
        {columns.map((items, index) => <TestimonialColumn key={index} items={items} direction={index === 1 ? 'down' : 'up'} duration={index === 1 ? '43s' : index === 0 ? '49s' : '54s'} className={index > 0 ? 'hidden sm:block' : ''} />)}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[#FAFBF4] dark:from-[#0f1012] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-[#FAFBF4] dark:from-[#0f1012] to-transparent" />
      <style jsx global>{`
        .testimonials-columns:hover .testimonial-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .testimonial-track { animation: none !important; transform: none !important; } }
      `}</style>
    </div>
  )
}

function TestimonialColumn({ items, direction, duration, className = '' }: { items: Testimonial[]; direction: 'up' | 'down'; duration: string; className?: string }) {
  const repeated = [...items, ...items, ...items]
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="testimonial-track space-y-5" style={{ animation: `testimonial-${direction} ${duration} linear infinite` }}>
        {repeated.map((item, index) => (
          <article
            key={`${item.author}-${index}`}
            className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#151518] p-5 shadow-sm dark:shadow-[0_8px_22px_rgba(0,0,0,0.5)] transition-colors duration-200"
          >
            <p className="font-nunito text-sm leading-6 text-slate-800 dark:text-sn-ink">“{item.quote}”</p>
            <footer className="mt-4 border-t border-black/[0.06] dark:border-white/[0.08] pt-3">
              <p className="font-nunito text-sm font-extrabold text-slate-900 dark:text-sn-ink">{item.author}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-sn-ink-muted">{item.role}</p>
            </footer>
          </article>
        ))}
      </div>
      <style jsx global>{`
        @keyframes testimonial-up { from { transform: translateY(0); } to { transform: translateY(calc(-66.666% - 1.66rem)); } }
        @keyframes testimonial-down { from { transform: translateY(calc(-66.666% - 1.66rem)); } to { transform: translateY(0); } }
      `}</style>
    </div>
  )
}
