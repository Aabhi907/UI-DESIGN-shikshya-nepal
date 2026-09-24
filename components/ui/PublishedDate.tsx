import { formatPublishedDate, hasPublishedDate } from '@/lib/utils'

type Props = {
  value: string | null | undefined
  long?: boolean
  prefix?: string
  className?: string
}

export default function PublishedDate({ value, long = false, prefix = '', className }: Props) {
  if (!hasPublishedDate(value)) return <span className={className}>{formatPublishedDate(value)}</span>
  return <time dateTime={value} className={className}>{prefix}{formatPublishedDate(value, long ? 'long' : 'short')}</time>
}
