import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tint = 'mint' | 'peach' | 'butter' | 'lilac'

const tints: Record<Tint, string> = {
  mint: 'bg-sn-tint-mint text-primary dark:text-[#CAFFA6]',
  peach: 'bg-sn-tint-peach text-primary dark:text-[#A9E0F1]',
  butter: 'bg-sn-tint-butter text-amber-800 dark:text-[#F7F9E1]',
  lilac: 'bg-sn-tint-lilac text-indigo-800 dark:text-[#D9EEF7]',
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
      className={cn('inline-flex shrink-0 items-center justify-center rounded-sn-control border border-black/[0.12] dark:border-white/[0.08] shadow-sm', tints[tint], className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Icon className="h-[45%] w-[45%]" strokeWidth={2} />
    </span>
  )
}
