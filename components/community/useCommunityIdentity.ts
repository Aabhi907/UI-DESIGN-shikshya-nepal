'use client'

import { useCallback, useEffect, useState } from 'react'

export type CommunityIdentity = {
  loading: boolean
  authenticated: boolean
  alias: string | null
  status: string
  error: string | null
}

export function useCommunityIdentity() {
  const [identity, setIdentity] = useState<CommunityIdentity>({ loading: true, authenticated: false, alias: null, status: 'active', error: null })
  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/community/me', { cache: 'no-store' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        setIdentity({ loading: false, authenticated: false, alias: null, status: 'active', error: result.error || 'Community access could not be checked. Please try again.' })
        return
      }
      setIdentity({ loading: false, authenticated: Boolean(result.authenticated), alias: result.alias || null, status: result.status || 'active', error: null })
    } catch {
      setIdentity({ loading: false, authenticated: false, alias: null, status: 'active', error: 'Community access could not be checked. Check your connection and try again.' })
    }
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  return { identity, refresh }
}
