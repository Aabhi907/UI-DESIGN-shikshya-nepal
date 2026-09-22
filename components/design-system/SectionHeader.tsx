import { cn } from '@/lib/utils'

export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  as: Heading = 'h2',
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">{eyebrow}</p>}
        <Heading className={cn('font-baloo font-extrabold text-sn-ink', eyebrow ? 'mt-1.5' : '', Heading === 'h1' ? 'text-4xl leading-[1.08] sm:text-5xl' : 'text-2xl leading-tight sm:text-3xl')}>
          {title}
        </Heading>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  )
}
