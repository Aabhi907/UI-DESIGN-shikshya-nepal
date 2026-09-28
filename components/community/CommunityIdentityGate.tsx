'use client'

import { FormEvent, ReactNode, useState } from 'react'
import Link from 'next/link'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { useCommunityIdentity } from './useCommunityIdentity'

export default function CommunityIdentityGate({ children }: { children: (alias: string) => ReactNode }) {
  const { identity, refresh } = useCommunityIdentity()
  const [alias, setAlias] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      const response = await fetch('/api/community/me', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ alias }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) setError(result.error || 'Could not save your public name. Please try again.')
      else await refresh()
    } catch {
      setError('We could not reach SikshyaNepal. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }
  if (identity.loading) return <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-500">Checking your community access…</div>
  if (identity.error) return <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"><h2 className="font-display text-xl font-bold text-amber-950">Community access is unavailable</h2><p className="mt-2 text-sm leading-6 text-amber-900">{identity.error}</p><button type="button" onClick={() => void refresh()} className="mt-4 min-h-11 rounded-lg bg-amber-950 px-4 py-2 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 focus-visible:ring-offset-2">Try again</button></div>
  if (!identity.authenticated) return <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"><h2 className="font-display text-xl font-bold text-ink">Join the student discussion</h2><p className="mt-2 text-sm leading-6 text-gray-600">Sign in with Google for accountability. Other students only see the public name you choose: never your Google name or email.</p><div className="mt-5"><GoogleSignInButton next="/community" /></div><p className="mt-4 text-xs leading-5 text-gray-500">By continuing, you accept the <Link href="/community/guidelines" className="font-bold text-primary hover:underline">community rules</Link>, <Link href="/terms" className="font-bold text-primary hover:underline">terms</Link> and <Link href="/privacy" className="font-bold text-primary hover:underline">privacy policy</Link>.</p></div>
  if (identity.status !== 'active') return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">This community account is restricted. Use our <Link href="/safety?concern_type=other" className="font-bold underline">report form</Link> to appeal.</div>
  if (!identity.alias) {
    return <form onSubmit={save} className="rounded-2xl border border-blue-200 bg-white p-5 sm:p-6"><h2 className="font-display text-xl font-bold text-ink">Choose your public name</h2><p className="mt-2 text-sm leading-6 text-gray-600">This is the only identity students will see. Do not use your real name, school roll number, or impersonate another person.</p><label className="mt-5 block text-sm font-semibold text-gray-700">Public name<input value={alias} onChange={event=>setAlias(event.target.value)} minLength={3} maxLength={24} pattern="[A-Za-z0-9_]+" placeholder="e.g. CuriousLearner27" className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:border-blue-500" required/></label><p className="mt-2 text-xs text-gray-500">3-24 letters, numbers or underscores. It cannot be changed without a support request.</p>{error&&<p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={saving} aria-busy={saving} className="mt-4 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving?'Saving…':'Use this public name'}</button></form>
  }
  return <>{children(identity.alias)}</>
}
