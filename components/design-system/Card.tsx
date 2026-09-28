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
        'apple-card p-5 lg:p-6',
        tone === 'alt' ? '!bg-sn-surface-alt' : '!bg-sn-surface',
        interactive && 'motion-interactive-card',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
