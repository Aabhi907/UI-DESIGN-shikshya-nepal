import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Bell, Calendar, ExternalLink, ArrowLeft, Globe, Download, ZoomIn } from 'lucide-react'
import PublishedDate from '@/components/ui/PublishedDate'
import type { Notice } from '@/types'
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

async function getNotice(slug: string) {
  const supabase = createServerSupabaseClient()
  const decoded  = decodeURIComponent(slug)
  const { data, error } = await supabase
    .from('notices')
    .select('*, university:universities(id, name, short_name, slug, website, created_at)')
    .eq('slug', decoded)
    .maybeSingle()
  // A query failure is not the same as "no such notice" — throw it so the
  // error boundary shows and the page is never cached as a 404.
  if (error) throw error
  return data as Notice | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let notice: Notice | null
  try {
    notice = await getNotice(params.slug)
  } catch {
    // Metadata must never crash the request; the page component's own throw
    // is what shows the real error state. Fall back to a generic title,
    // never the "not found" one — this isn't known to be missing.
    return { title: 'Notice' }
  }
  if (!notice) return { title: 'Notice Not Found' }
  return {
    title:       notice.title,
    description: notice.content?.slice(0, 160) || `Notice from ${notice.university?.name}`,
    alternates:  { canonical: `${BASE_URL}/notices/${notice.slug}` },
  }
}

export default async function NoticeDetailPage({ params }: { params: { slug: string } }) {
  const notice = await getNotice(params.slug)
  if (!notice) notFound()

  const contentType = notice.content_type
  const hasPdf      = contentType === 'pdf'  && !!notice.notice_pdf_url
  const hasImage    = contentType === 'image' && !!notice.notice_pdf_url
  const uniSlug     = notice.university?.short_name

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 font-nunito sm:px-8 lg:py-16">
      <Link
        href="/notices"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-sn-ink-soft hover:text-sn-primary-hover mb-6 transition-colors motion-control"
      >
        <ArrowLeft className="w-4 h-4 motion-arrow" /> Back to Notices
      </Link>

      {/* ── Header card ───────────────────────────────────────────────── */}
      <Card className="mb-6 overflow-hidden p-0 lg:p-0">
        <div className="border-b border-sn-border bg-sn-surface-alt p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <IconTile icon={Bell} tint="peach" size={48} />
            <div className="min-w-0">
              <p className="mb-1 text-sm text-sn-ink-soft">{notice.university?.name}</p>
              <h1 className="mb-2 font-baloo text-2xl font-extrabold leading-tight text-sn-ink sm:text-3xl">{notice.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex items-center gap-2 text-sm text-sn-ink-soft mb-6">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <PublishedDate value={notice.published_date} prefix="Published " long />
          </div>
          <div className="mb-6">{notice.notice_url ? <EvidenceChip state="confirm" label="Confirm notice details on official source" /> : <EvidenceChip state="limited" className="!text-sn-ink-soft" label="Official source not recorded" />}</div>

          {notice.content && (
            <div className="prose prose-gray max-w-none mb-6">
              <p className="text-sn-ink-soft leading-relaxed whitespace-pre-line">{notice.content}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {hasPdf && (
                <a
                  href={notice.notice_pdf_url!}
                  download
                  className="inline-flex min-h-11 items-center gap-2 px-6 py-3 bg-sn-primary-hover text-white font-medium rounded-sn-card hover:bg-sn-primary-hover transition-colors motion-control"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              )}
              {hasImage && (
                <a
                  href={notice.notice_pdf_url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 px-6 py-3 bg-sn-primary-hover text-white font-medium rounded-sn-card hover:bg-sn-primary-hover transition-colors motion-control"
                >
                  <ZoomIn className="w-5 h-5" />
                  View Full Size
                </a>
              )}
              {notice.notice_url && (
                <a
                  href={notice.notice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-11 items-center gap-2 px-6 py-3 font-medium rounded-sn-card transition-colors motion-control ${
                    hasPdf || hasImage
                      ? 'bg-sn-surface border border-sn-border-strong text-sn-ink-soft hover:bg-sn-surface-alt'
                      : 'bg-sn-primary-hover text-white hover:bg-sn-primary-hover'
                  }`}
                >
                  <ExternalLink className="w-5 h-5" />
                  {hasPdf || hasImage ? 'View on Official Website' : 'View Original Notice'}
                </a>
              )}
              {uniSlug && UNIVERSITY_HOMEPAGES[uniSlug] && (
                <a
                  href={UNIVERSITY_HOMEPAGES[uniSlug]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 px-6 py-3 bg-sn-surface border border-sn-border-strong text-sn-ink-soft font-medium rounded-sn-card hover:bg-sn-surface-alt transition-colors motion-control"
                >
                  <Globe className="w-5 h-5" />
                  {uniSlug} Official Site
                </a>
              )}
            </div>
            {(notice.notice_url || hasPdf || hasImage) && (
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
          <h2 className="text-base font-semibold text-sn-ink mb-3">Notice PDF</h2>
          <PdfViewer pdfUrl={notice.notice_pdf_url!} title={notice.title} />
        </div>
      )}

      {/* ── Inline image viewer ───────────────────────────────────────── */}
      {hasImage && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-sn-ink mb-3">Notice Image</h2>
          <div className="rounded-sn-card border border-sn-border overflow-hidden bg-sn-surface-alt">
            <div className="relative w-full" style={{ minHeight: '400px' }}>
              <NextImage
                src={notice.notice_pdf_url!}
                alt={notice.title}
                fill
                className="object-contain"
                sizes="(max-width: 896px) 100vw, 896px"
                unoptimized
              />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 bg-sn-surface-alt border-t border-sn-border">
              <a
                href={notice.notice_pdf_url!}
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sn-surface border border-sn-border text-xs font-medium text-sn-ink-soft rounded-sn-control hover:bg-sn-surface-alt transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
              <a
                href={notice.notice_pdf_url!}
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
