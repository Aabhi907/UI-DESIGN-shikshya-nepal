import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tint = 'mint' | 'peach' | 'butter' | 'lilac'

const tints: Record<Tint, string> = {
  mint: 'bg-sn-tint-mint',
  peach: 'bg-sn-tint-peach',
  butter: 'bg-sn-tint-butter',
  lilac: 'bg-sn-tint-lilac',
}

export default function IconTile({
  icon: Icon,
  tint = 'peach',
  size = 44,
  className,
}: {
  icon: LucideIcon
  tint?: Tint
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-sn-control text-sn-ink', tints[tint], className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon className="h-[45%] w-[45%]" strokeWidth={2} />
    </span>
  )
}
