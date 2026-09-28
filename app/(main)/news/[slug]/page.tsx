import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import { ArrowLeft, Calendar, User, Download, ExternalLink, ShieldCheck, Building2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import PublishedDate from '@/components/ui/PublishedDate'
import type { News } from '@/types'
import PdfViewer from '@/components/results/PdfViewer'
import Card from '@/components/design-system/Card'
import SectionHeader from '@/components/design-system/SectionHeader'
import EvidenceChip from '@/components/design-system/EvidenceChip'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema, SITE_URL } from '@/lib/seo'

export const revalidate = 0

const BASE_URL = SITE_URL

// Only the columns this page actually renders (including what the JSON-LD block below reads).
const NEWS_COLUMNS = 'id, title, slug, content, image_url, news_pdf_url, content_type, published_date, created_at, updated_at, author_name, source_name, source_url, last_verified_at, content_category, education_levels, college_id, disclosure'

async function getNews(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('news').select(NEWS_COLUMNS).eq('slug', slug).eq('status', 'published').maybeSingle()
  // A query failure is not the same as "no such article" — throw it so the
  // error boundary shows and the page is never cached as a 404.
  if (error) throw error
  return data as News | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let news: News | null
  try {
    news = await getNews(params.slug)
  } catch {
    // Metadata must never crash the request; the page component's own throw
    // is what shows the real error state. Fall back to a generic title,
    // never the "not found" one — this isn't known to be missing.
    return { title: 'News' }
  }
  if (!news) return { title: 'News Not Found' }
  return {
    title:       news.title,
    description: news.content?.slice(0, 160),
    openGraph:   { images: news.image_url ? [news.image_url] : [] },
    alternates: { canonical: `/news/${news.slug}` },
  }
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const news = await getNews(params.slug)
  if (!news) notFound()

  const hasPdf = news.content_type === 'pdf' && !!news.news_pdf_url
  const pageUrl = absoluteUrl(`/news/${news.slug}`)
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'NewsArticle', '@id': `${pageUrl}#article`, headline: news.title, articleSection: news.content_category?.replaceAll('_', ' ') || 'College news', keywords: news.education_levels?.join(', '), description: news.content?.slice(0, 300) || undefined, datePublished: news.published_date || undefined, dateModified: news.updated_at || news.created_at || news.published_date || undefined, mainEntityOfPage: { '@id': `${pageUrl}#webpage` }, image: news.image_url ? [news.image_url] : undefined, author: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: news.author_name || 'SikshyaNepal Editorial' }, publisher: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: 'SikshyaNepal', logo: { '@type': 'ImageObject', url: `${BASE_URL}/og-image.png` } }, citation: news.source_url || undefined },
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: news.title, mainEntity: { '@id': `${pageUrl}#article` }, isPartOf: { '@id': `${BASE_URL}/#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Education news', path: '/news' }, { name: news.title, path: `/news/${news.slug}` }]),
  ] }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 font-nunito sm:px-8 lg:py-16">
      <JsonLd data={jsonLd} />
      <Link
        href="/news"
        className="inline-flex min-h-11 items-center gap-2 text-sm text-sn-ink-soft hover:text-sn-primary-hover mb-6 transition-colors motion-control"
      >
        <ArrowLeft className="w-4 h-4 motion-arrow" /> Back to News
      </Link>

      <Card as="article" className="mb-6 overflow-hidden p-0 lg:p-0">
        {news.image_url && (
          <div className="relative h-64 sm:h-80">
            <Image src={news.image_url} alt={news.title} fill className="object-cover" />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <SectionHeader as="h1" title={news.title} className="mb-4" />
          <div className="flex items-center gap-4 text-sm text-sn-ink-soft mb-6 pb-6 border-b border-sn-border">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <PublishedDate value={news.published_date} long />
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" aria-hidden="true" />
              {news.author_name || 'SikshyaNepal'}
            </span>
            {hasPdf && (
              <a
                href={news.news_pdf_url!}
                download
                className="ml-auto inline-flex min-h-11 items-center gap-1.5 px-3 py-1.5 bg-sn-primary-hover text-white text-xs font-medium rounded-sn-control hover:bg-sn-primary-hover transition-colors motion-control"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
            )}
          </div>
          {news.content && (
            <div className="prose prose-gray max-w-none">
              <p className="text-sn-ink-soft leading-relaxed whitespace-pre-line text-base">
                {news.content}
              </p>
            </div>
          )}
          {news.college_id && <p className="mt-6 flex items-center gap-2 text-sm text-sn-ink-soft"><Building2 className="h-4 w-4 text-sn-primary-hover" />This update is linked to a college profile in the SikshyaNepal directory.</p>}
          {news.disclosure && <p className="mt-4 border-l-2 border-sn-border-strong pl-3 text-xs leading-5 text-sn-ink-soft">{news.disclosure}</p>}
          {(news.source_url || news.last_verified_at) && <section className="mt-7 border-t border-sn-border pt-5 text-sm" aria-label="Source information"><p className="flex items-center gap-2 font-semibold text-sn-ink"><ShieldCheck className="h-4 w-4 text-sn-primary-hover" aria-hidden="true" />{news.source_url ? 'Source summary' : 'Publication information'}</p>{news.source_url && <p className="mt-2 max-w-2xl text-sn-ink-soft">Summary based on the linked official announcement. Check the source for final details.</p>}{news.last_verified_at && <p className="mt-2 text-sn-ink-soft">Checked <time dateTime={news.last_verified_at}>{formatDate(news.last_verified_at)}</time></p>}{news.source_url && <a href={news.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-sn-primary-hover hover:underline motion-control">{news.source_name || 'Open official source'} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}</section>}
          {news.source_url && <div className="mt-4">
            {news.last_verified_at
              ? <EvidenceChip state="verified" className="!text-sn-ink-soft" source={news.source_name || 'Linked source'} checkedDate={news.last_verified_at} />
              : <EvidenceChip state="confirm" label="Confirm details with linked source" />}
          </div>}
        </div>
      </Card>

      {/* ── Embedded PDF (official circular attached to news) ─────────── */}
      {hasPdf && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-sn-ink mb-3">Attached Document</h2>
          <PdfViewer pdfUrl={news.news_pdf_url!} title={news.title} />
        </div>
      )}
    </main>
  )
}
