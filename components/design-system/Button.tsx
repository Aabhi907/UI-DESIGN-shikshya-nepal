import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost'
type Common = {
  variant?: Variant
  className?: string
  children: React.ReactNode
}

const base = 'motion-control inline-flex min-h-11 items-center justify-center gap-2 rounded-sn-control px-5 py-2.5 text-sm font-bold font-nunito focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sn-primary disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-sn-primary text-white shadow-sn-button hover:bg-sn-primary-hover',
  secondary: 'border border-sn-border-strong bg-sn-surface text-sn-ink hover:border-sn-primary hover:text-sn-primary',
  ghost: 'text-sn-ink-soft hover:bg-sn-surface-alt hover:text-sn-ink',
}

// A plain <button>. For navigation, use <Button.Link href="...">.
export default function Button({ variant = 'primary', className, children, ...rest }: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  )
}

function ButtonLink({ variant = 'primary', className, children, href, ...rest }: Common & { href: string } & Omit<React.ComponentProps<typeof Link>, 'href' | 'className'>) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  )
}

Button.Link = ButtonLink
