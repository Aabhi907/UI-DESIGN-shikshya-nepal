import { cn } from '@/lib/utils'

const controlClass =
  'w-full rounded-sn-control border border-sn-border-strong bg-sn-surface px-3.5 py-2.5 text-sm font-nunito text-sn-ink placeholder:text-sn-ink-muted focus:outline-none focus:ring-2 focus:ring-sn-primary/40 focus:border-sn-primary'

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold font-nunito text-sn-ink">
      {children}
    </label>
  )
}

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, className)} {...rest} />
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, className)} {...rest} />
}

export function Select({ className, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(controlClass, 'appearance-none bg-no-repeat', className)} {...rest} />
}

export function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs leading-5 text-sn-ink-muted">{children}</p>
}

export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-1.5 text-xs leading-5 text-sn-confirm-ink">
      {children}
    </p>
  )
}
