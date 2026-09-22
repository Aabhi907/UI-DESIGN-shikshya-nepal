import { cn } from '@/lib/utils'

type Tone = 'surface' | 'alt'

export default function Card({
  tone = 'surface',
  interactive = false,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: {
  tone?: Tone
  interactive?: boolean
  as?: 'div' | 'section' | 'article'
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={cn(
        'rounded-sn-card border border-sn-border p-5 shadow-sn-card lg:p-6',
        tone === 'alt' ? 'bg-sn-surface-alt' : 'bg-sn-surface',
        interactive && 'transition-shadow duration-150 hover:shadow-sn-float',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
