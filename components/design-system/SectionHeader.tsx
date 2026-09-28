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
        {eyebrow && <p className="mb-2 text-xs font-bold font-nunito text-sn-primary-hover">{eyebrow}</p>}
        {/* Spacing rhythm: eyebrow→heading 8px, heading→intro 12px (see design-system/sikshyanepal/MASTER.md) */}
        <Heading className={cn('font-baloo font-extrabold text-sn-ink', Heading === 'h1' ? 'text-4xl leading-[1.08] sm:text-5xl' : 'text-2xl leading-tight sm:text-3xl')}>
          {title}
        </Heading>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  )
}
