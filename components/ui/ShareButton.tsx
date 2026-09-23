'use client'

import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  async function share() { const url = window.location.href; try { if (navigator.share) await navigator.share({ title, url }); else { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800) } } catch {} }
  return <button type="button" onClick={share} className="inline-flex min-h-11 items-center gap-2 rounded-sn-control border border-sn-border-strong bg-sn-surface px-3.5 py-2.5 text-sm font-bold font-nunito text-sn-ink-soft shadow-sn-card hover:border-sn-primary hover:text-sn-primary"><span>{copied ? <Check className="h-4 w-4 text-sn-verified" /> : <Share2 className="h-4 w-4" />}</span>{copied ? 'Link copied' : 'Share'}</button>
}
