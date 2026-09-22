'use client'

import { Bookmark } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function SaveCollegeButton({ collegeId }: { collegeId: string }) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [requiresSignIn, setRequiresSignIn] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/saved-colleges/${collegeId}`, { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) {
          setRequiresSignIn(true)
          return { saved: false }
        }
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || 'Your shortlist status could not be checked.')
        return data
      })
      .then(data => setSaved(Boolean(data.saved)))
      .catch(fetchError => {
        if (fetchError instanceof Error && fetchError.name !== 'AbortError') setError(fetchError.message)
      })
      .finally(() => setChecking(false))
    return () => controller.abort()
  }, [collegeId])

  async function toggle() {
    if (loading) return
    const previous = saved
    const next = !saved
    setSaved(next)
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/saved-colleges/${collegeId}`, { method: next ? 'POST' : 'DELETE' })
      if (response.status === 401) {
        setSaved(previous)
        setRequiresSignIn(true)
        router.push(`/account/login?next=${encodeURIComponent(pathname)}`)
        return
      }
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not update shortlist.')
      setSaved(Boolean(data.saved))
    } catch (updateError) {
      setSaved(previous)
      setError(updateError instanceof Error ? updateError.message : 'Could not update shortlist.')
    } finally {
      setLoading(false)
    }
  }

  return <div><button type="button" onClick={toggle} disabled={loading || checking} aria-busy={loading || checking} aria-pressed={saved} aria-describedby={error ? `save-college-error-${collegeId}` : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-sn-control border px-4 py-2.5 text-sm font-bold font-nunito transition-colors disabled:cursor-wait disabled:opacity-75 ${saved ? 'border-sn-primary bg-sn-primary-bg text-sn-primary-hover' : 'border-sn-border-strong bg-sn-surface text-sn-ink-soft hover:border-sn-primary hover:bg-sn-primary-bg'}`}><Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />{checking ? 'Checking…' : loading ? (saved ? 'Saving…' : 'Removing…') : saved ? 'Saved' : requiresSignIn ? 'Sign in to save' : 'Save college'}</button>{error && <p id={`save-college-error-${collegeId}`} role="alert" className="mt-1 max-w-xs text-xs font-nunito text-sn-confirm-ink">{error}</p>}</div>
}
