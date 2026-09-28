'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LocateFixed, MapPin, ShieldCheck } from 'lucide-react'
import { cleanCollegeText } from '@/lib/college-display'
import Mascot from '@/components/design-system/Mascot'
import Button from '@/components/design-system/Button'

type College = { id: string; name: string; slug: string; location: string; district: string | null; province: string | null; affiliation: string | null; verification_status: string; education_levels: string[]; distance_km: number }

export default function NearbyCollegesPage() {
  const [items, setItems] = useState<College[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function find() {
    if (!navigator.geolocation) return setError('Location is not supported by this browser.')
    setLoading(true); setError('')
    navigator.geolocation.getCurrentPosition(async position => {
      try {
        const response = await fetch(`/api/colleges/nearby?lat=${position.coords.latitude}&lng=${position.coords.longitude}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setItems(data)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not find nearby colleges.')
      } finally {
        setLoading(false)
      }
    }, () => {
      setLoading(false)
      setError('Location permission was not granted. You can still browse colleges by district.')
    }, { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 })
  }

  return (
    <main className="min-h-screen bg-sn-ground">
      <section className="border-b border-sn-border bg-sn-surface">
        <div className="mx-auto max-w-sn px-5 py-12 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-sn-primary-hover">College discovery</p>
          <h1 className="mt-3 font-baloo text-3xl font-extrabold text-sn-ink sm:text-4xl">Colleges near you</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-sn-ink-soft">Use your device location to find colleges with mapped coordinates, ordered by straight-line distance. Your location is used only for this search and is not saved.</p>
          <Button onClick={find} disabled={loading} className="mt-6 motion-control">
            <LocateFixed className="h-4 w-4" />
            {loading ? 'Finding colleges…' : 'Use my location'}
          </Button>
        </div>
      </section>
      <div className="mx-auto max-w-sn px-5 py-8 sm:px-8">
        {error && (
          <div className="rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg p-4 text-sm text-sn-confirm-ink">
            {error} <Link href="/colleges" className="font-bold underline motion-control">Browse all colleges</Link>
          </div>
        )}
        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(college => (
              <Link key={college.id} href={`/colleges/${college.slug}`} className="motion-interactive-card rounded-sn-card border border-sn-border bg-sn-surface p-5 shadow-sn-card">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-baloo text-lg font-bold text-sn-ink">{college.name}</h2>
                  <span className="whitespace-nowrap rounded-sn-pill bg-sn-primary-bg px-2 py-1 text-xs font-bold text-sn-primary-hover">{college.distance_km < 1 ? `${Math.round(college.distance_km * 1000)} m` : `${college.distance_km.toFixed(1)} km`}</span>
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-sn-ink-soft"><MapPin className="h-4 w-4" aria-hidden="true" />{cleanCollegeText(college.location) || college.district || 'Location pending'}</p>
                {college.affiliation && <p className="mt-2 text-xs text-sn-ink-muted">{cleanCollegeText(college.affiliation)}</p>}
                <p className="mt-4 flex items-center gap-1.5 text-xs text-sn-ink-muted"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />Confirm transport route and official details before applying.</p>
              </Link>
            ))}
          </div>
        )}
        {!items.length && !loading && !error && (
          <div className="rounded-sn-card border border-dashed border-sn-border bg-sn-surface p-12 text-center">
            <Mascot pose="point" size={72} className="mx-auto mb-4" />
            <h2 className="font-baloo text-xl font-bold text-sn-ink">Find colleges around you</h2>
            <p className="mt-2 text-sm text-sn-ink-soft">Allow location access to sort colleges with available map coordinates by distance.</p>
          </div>
        )}
      </div>
    </main>
  )
}
