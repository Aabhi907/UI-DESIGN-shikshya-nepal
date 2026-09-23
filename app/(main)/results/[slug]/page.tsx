import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FileText, Calendar, ExternalLink, ArrowLeft, Globe, Download, ZoomIn } from 'lucide-react'
import NextImage from 'next/image'
import { formatDate } from '@/lib/utils'
import type { Result } from '@/types'
import PdfViewer from '@/components/results/PdfViewer'

import Card from '@/components/design-system/Card'
import Pill from '@/components/design-system/Pill'
import IconTile from '@/components/design-system/IconTile'
import EvidenceChip from '@/components/design-system/EvidenceChip'
export const revalidate = 0

const BASE_URL = 'https://sikshyanepal.vercel.app'

const UNIVERSITY_HOMEPAGES: Record<string, string> = {
  TU:    'https://tribhuvan-university.edu.np',
  KU:    'https://ku.edu.np',
  NEB:   'https://neb.gov.np',
  CTEVT: 'https://ctevt.org.np',
  PU:    'https://pu.edu.np',
}

async function getResult(slug: string) {
  const supabase = createServerSupabaseClient()
  const decoded  = decodeURIComponent(slug)
  const { data } = await supabase
    .from('results')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .eq('slug', decoded)
    .single()
  return data as Result | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getResult(params.slug)
  if (!result) return { title: 'Result Not Found' }
  return {
    title:       result.title,
    description: `Check ${result.title} result published by ${result.university?.name}. Program: ${result.program || 'All'}. Semester: ${result.semester || 'All'}.`,
    openGraph: {
      title:       `${result.title} | SikshyaNepal`,
      description: `${result.university?.name} result - ${result.program || ''} ${result.semester || ''}`,
      url:         `${BASE_URL}/results/${result.slug}`,
    },
    alternates: { canonical: `${BASE_URL}/results/${result.slug}` },
  }
}

export default async function ResultDetailPage({ params }: { params: { slug: string } }) {
  const result = await getResult(params.slug)
  if (!result) notFound()

  const contentType = result.content_type
  const hasPdf      = contentType === 'pdf' && !!result.result_pdf_url
  const hasImage    = contentType === 'image' && !!result.result_pdf_url
  const uniSlug     = result.university?.short_name

  const jsonLd = {
    '@context':    'https://schema.org',
    '@type':       'Article',
    headline:      result.title,
    datePublished: result.published_date,
    publisher: {
      '@type': 'Organization',
      name:    result.university?.name,
      url:     result.university?.website,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id':   `${BASE_URL}/results/${result.slug}`,
    },
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 font-nunito sm:px-8 lg:py-16">
      <Script
        id="result-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/results"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-sn-ink-soft hover:text-sn-primary-hover mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Results
      </Link>

      {/* ── Header card ───────────────────────────────────────────────── */}
      <Card className="mb-6 overflow-hidden p-0 lg:p-0">
        <div className="border-b border-sn-border bg-sn-surface-alt p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <IconTile icon={FileText} tint="peach" size={48} />
            <div className="min-w-0">
              <h1 className="mb-2 font-baloo text-2xl font-extrabold leading-tight text-sn-ink sm:text-3xl">{result.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                {uniSlug && <Pill tone="primary" className="!text-sn-ink-soft">{uniSlug}</Pill>}
                {result.program && (
                  <Pill tone="neutral">{result.program}</Pill>
                )}
                {result.semester && (
                  <Pill tone="neutral">{result.semester}</Pill>
                )}
                {result.year && (
                  <Pill tone="neutral">{result.year}</Pill>
                )}
                {hasPdf && (
                  <Pill tone="neutral">PDF available</Pill>
                )}
                {hasImage && (
                  <Pill tone="neutral">Image available</Pill>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-sn-surface-alt rounded-sn-card">
              <p className="text-xs text-sn-ink-soft mb-1">University</p>
              <p className="font-semibold text-sn-ink text-sm">{uniSlug}</p>
            </div>
            {result.program && (
              <div className="text-center p-4 bg-sn-surface-alt rounded-sn-card">
                <p className="text-xs text-sn-ink-soft mb-1">Program</p>
                <p className="font-semibold text-sn-ink text-sm">{result.program}</p>
              </div>
            )}
            {result.semester && (
              <div className="text-center p-4 bg-sn-surface-alt rounded-sn-card">
                <p className="text-xs text-sn-ink-soft mb-1">Semester</p>
                <p className="font-semibold text-sn-ink text-sm">{result.semester}</p>
              </div>
            )}
            {result.year && (
              <div className="text-center p-4 bg-sn-surface-alt rounded-sn-card">
                <p className="text-xs text-sn-ink-soft mb-1">Year</p>
                <p className="font-semibold text-sn-ink text-sm">{result.year}</p>
              </div>
            )}
          </div>

          {result.published_date && <div className="flex items-center gap-2 text-sm text-sn-ink-soft mb-6">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <time dateTime={result.published_date}>Published {formatDate(result.published_date)}</time>
          </div>}
          <div className="mb-6">{result.result_url ? <EvidenceChip state="confirm" label="Confirm result details on official source" /> : <EvidenceChip state="limited" className="!text-sn-ink-soft" label="Official source not recorded" />}</div>

          {/* Action buttons */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {hasPdf && (
                <a
                  href={result.result_pdf_url!}
                  download
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sn-primary-hover text-white font-medium rounded-sn-card hover:bg-sn-primary-hover transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              )}
              {hasImage && (
                <a
                  href={result.result_pdf_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sn-primary-hover text-white font-medium rounded-sn-card hover:bg-sn-primary-hover transition-colors"
                >
                  <ZoomIn className="w-5 h-5" />
                  View Full Size
                </a>
              )}
              {result.result_url && (
                <a
                  href={result.result_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-sn-card transition-colors ${
                    hasPdf
                      ? 'bg-sn-surface border border-sn-border-strong text-sn-ink-soft hover:bg-sn-surface-alt'
                      : 'bg-sn-primary-hover text-white hover:bg-sn-primary-hover'
                  }`}
                >
                  <ExternalLink className="w-5 h-5" />
                  {hasPdf ? 'View on Official Website' : 'Check Result on Official Website'}
                </a>
              )}
              {uniSlug && UNIVERSITY_HOMEPAGES[uniSlug] && (
                <a
                  href={UNIVERSITY_HOMEPAGES[uniSlug]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sn-surface border border-sn-border-strong text-sn-ink-soft font-medium rounded-sn-card hover:bg-sn-surface-alt transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  {uniSlug} Official Site
                </a>
              )}
            </div>
            {!result.result_url && !hasPdf && (
              <div className="p-4 bg-sn-confirm-bg border border-sn-confirm/30 rounded-sn-card text-sm text-sn-confirm-ink">
                Result link will be available soon. Please check the official university website.
              </div>
            )}
            {(result.result_url || hasPdf) && (
              <p className="text-xs text-sn-ink-soft">
                External links may occasionally be unavailable. Use the official site link if needed.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* ── Embedded PDF viewer ───────────────────────────────────────── */}
      {hasPdf && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-sn-ink mb-3">Result PDF</h2>
          <PdfViewer pdfUrl={result.result_pdf_url!} title={result.title} />
        </div>
      )}

      {/* ── Inline image viewer ───────────────────────────────────────── */}
      {hasImage && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-sn-ink mb-3">Result Image</h2>
          <div className="rounded-sn-card border border-sn-border overflow-hidden bg-sn-surface-alt">
            <div className="relative w-full" style={{ minHeight: '400px' }}>
              <NextImage
                src={result.result_pdf_url!}
                alt={result.title}
                fill
                className="object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
                unoptimized   // university PDFs/images may be on external domains
              />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 bg-sn-surface-alt border-t border-sn-border">
              <a
                href={result.result_pdf_url!}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sn-surface border border-sn-border text-xs font-medium text-sn-ink-soft rounded-sn-control hover:bg-sn-surface-alt transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              <a
                href={result.result_pdf_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sn-surface border border-sn-border text-xs font-medium text-sn-ink-soft rounded-sn-control hover:bg-sn-surface-alt transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                Full size
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
