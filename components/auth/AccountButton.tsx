'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Bookmark, ChevronDown, LogOut, MapPinned, UserRound } from 'lucide-react'

export default function AccountButton({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const [email, setEmail] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = await response.json().catch(() => ({}))
        if (active) setEmail(typeof data.email === 'string' ? data.email : null)
      } finally {
        if (active) setReady(true)
      }
    }
    void loadSession()
    window.addEventListener('auth-session-changed', loadSession)
    return () => { active = false; window.removeEventListener('auth-session-changed', loadSession) }
  }, [])

  useEffect(() => {
    if (!open || mobile) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('click', handleClickOutside); document.removeEventListener('keydown', handleKey) }
  }, [open, mobile])

  async function signOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (!response.ok) throw new Error('Sign out failed.')
      setEmail(null)
      window.dispatchEvent(new Event('auth-session-changed'))
      onNavigate?.()
      window.location.assign('/')
    } catch {
      setSigningOut(false)
    }
  }

  if (!ready) return <span aria-hidden="true" className={`inline-flex min-h-11 shrink-0 animate-pulse items-center justify-center rounded-full bg-sn-surface-alt ${mobile ? 'w-full' : 'w-28'}`}/>
  if (!email) return (
    <Link
      href="/account/login"
      onClick={onNavigate}
      className={`motion-control focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-sn-primary/25 bg-white/80 py-1.5 pl-2 pr-4 text-sm font-extrabold font-nunito text-sn-primary shadow-[0_2px_10px_rgba(20,44,53,0.08)] backdrop-blur-sm transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-sn-primary/45 hover:bg-sn-primary-bg hover:shadow-[0_7px_18px_rgba(20,44,53,0.14)] active:translate-y-0 ${mobile ? 'w-full' : ''}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sn-primary text-white shadow-sm">
        <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <span>Sign in</span>
    </Link>
  )

  if (mobile) return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="truncate text-xs text-gray-500">Signed in as {email}</p>
      <div className="mt-3 space-y-2">
        <Link href="/my-path" onClick={onNavigate} className="flex min-h-11 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-primary">My Path</Link>
        <Link href="/account/saved" onClick={onNavigate} className="flex min-h-11 items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-primary">Saved institutions</Link>
        <button type="button" onClick={signOut} disabled={signingOut} className="flex min-h-11 w-full items-center justify-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-gray-700 disabled:opacity-60">{signingOut ? 'Logging out…' : 'Log out'}</button>
      </div>
    </div>
  )

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="sn-account-menu"
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 transition hover:border-primary/40"
      >
        <UserRound className="h-4 w-4" aria-hidden="true" />Account<ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div id="sn-account-menu" role="menu" className="absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
          <p className="truncate border-b border-gray-100 px-4 pb-2 pt-1 text-xs text-gray-500">Signed in as {email}</p>
          <Link href="/my-path" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary"><MapPinned className="h-4 w-4" aria-hidden="true" />My Path</Link>
          <Link href="/account/saved" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary"><Bookmark className="h-4 w-4" aria-hidden="true" />Saved institutions</Link>
          <button type="button" role="menuitem" onClick={signOut} disabled={signingOut} className="flex w-full items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"><LogOut className="h-4 w-4" aria-hidden="true" />{signingOut ? 'Logging out…' : 'Log out'}</button>
        </div>
      )}
    </div>
  )
}
