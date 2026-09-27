import Link from 'next/link'
import { safeNextPath } from '@/lib/safe-next'

export default function GoogleSignInButton({ next = '/' }: { next?: string }) {
  return (
    <Link
      href={`/auth/google?next=${encodeURIComponent(safeNextPath(next))}`}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#d9d6cf] bg-white px-4 py-3 text-sm font-bold text-ink transition hover:border-slate-400 hover:bg-slate-50"
    >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
          <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
          <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.3l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.7A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.1 12c0-.7.1-1.3.3-1.9V7.4H3A10 10 0 0 0 3 16.6l3.4-2.7Z" />
          <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9A9.8 9.8 0 0 0 3 7.4l3.4 2.7A6 6 0 0 1 12 5.9Z" />
        </svg>
      Continue with Google
    </Link>
  )
}
