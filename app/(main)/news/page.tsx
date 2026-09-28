import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import SearchField from '@/components/design-system/SearchField'
import Card from '@/components/design-system/Card'
import Pill from '@/components/design-system/Pill'
import SectionHeader from '@/components/design-system/SectionHeader'
import type { News } from '@/types'
import { AlertTriangle, Calendar, Newspaper, ArrowRight, RefreshCcw } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'
import Button from '@/components/design-system/Button'
import PublishedDate from '@/components/ui/PublishedDate'
import { COLLEGE_NEWS_TOPICS } from '@/lib/college-news'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Nepal College News & Student Guides',
  description: 'College news, source summaries and student guides for +2 and Bachelor admissions, entrance results, scholarships, achievements and campus life in Nepal.',
  alternates: { canonical: '/news', types: { 'application/rss+xml': '/news/feed.xml' } },
}

const CARD_COLORS = ['bg-sn-tint-peach', 'bg-sn-tint-mint', 'bg-sn-tint-lilac']

async function getNews(searchParams: { q?: string; topic?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('news').select('*').eq('status', 'published').order('published_date', { ascending: false, nullsFirst: false })
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)
  if (searchParams.topic) query = query.eq('content_category', searchParams.topic)
  const { data, error } = await query.limit(30)
  if (error) {
    console.error('[news:list]', { code: error.code, message: error.message })
    return { newsList: [] as News[], error: true }
  }
  return { newsList: (data || []) as News[], error: false }
}

function PlaceholderCover({ idx }: { idx: number }) {
  return (
    <div className={`flex h-full w-full items-end p-5 ${CARD_COLORS[idx % CARD_COLORS.length]}`}>
      <Newspaper className="h-7 w-7 text-sn-primary-hover" aria-hidden="true" />
    </div>
  )
}

export default async function NewsPage({ searchParams }: { searchParams: { q?: string; topic?: string } }) {
  const { newsList, error } = await getNews(searchParams)
  const featured = newsList[0]
  const rest     = newsList.slice(1)

  const currentUrl = (() => {
    const p = new URLSearchParams()
    if (searchParams.q)     p.set('q', searchParams.q)
    if (searchParams.topic) p.set('topic', searchParams.topic)
    const s = p.toString()
    return `/news${s ? `?${s}` : ''}`
  })()

  return (
    <div className="bg-sn-ground min-h-screen">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-sn-surface border-b border-sn-border">
        <div className="max-w-sn mx-auto px-5 sm:px-8 lg:px-12 pt-10 pb-8">
          <SectionHeader as="h1" title="College news, admissions and student guides" description="College updates, source summaries and practical guides for +2 and Bachelor students." className="mb-6" />
          <SearchField className="[&_button[type=submit]]:!bg-sn-primary-hover" placeholder="Search news..." redirectTo="/news" initialValue={searchParams.q} />
          <nav aria-label="College news topics" className="mt-5 flex gap-2 overflow-x-auto pb-1 text-sm">
            <Link href="/news" className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-sn-pill border px-4 py-2 font-medium transition-colors motion-control ${!searchParams.topic ? 'border-sn-primary bg-sn-primary-hover text-white' : 'border-sn-border bg-sn-surface text-sn-ink-soft hover:border-sn-primary'}`}>All</Link>
            {Object.entries(COLLEGE_NEWS_TOPICS).map(([slug, topic]) => <Link key={slug} href={`/news/topic/${slug}`} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sn-pill border border-sn-border bg-sn-surface px-4 py-2 font-medium text-sn-ink-soft hover:border-sn-primary transition-colors motion-control">{topic.label}</Link>)}
          </nav>
        </div>
      </div>

      <div className="max-w-sn mx-auto px-5 sm:px-8 lg:px-12 py-10">

        {error ? (
          <Card className="py-16 text-center lg:py-16">
            <div className="w-14 h-14 bg-sn-confirm-bg rounded-sn-card flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-sn-confirm-ink" />
            </div>
            <h3 className="text-base font-semibold text-sn-ink mb-2">News could not be loaded</h3>
            <p className="text-sm text-sn-ink-soft mb-6 max-w-xs mx-auto">
              This is a temporary problem, not an empty list. Please try again.
            </p>
            <Button.Link href={currentUrl} className="motion-control">
              <RefreshCcw className="w-4 h-4" />
              Try again
            </Button.Link>
          </Card>
        ) : newsList.length === 0 ? (
          <Card className="py-16 text-center lg:py-16">
            <div className="w-14 h-14 bg-sn-surface-alt rounded-sn-card flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-7 h-7 text-sn-ink-soft" />
            </div>
            <h3 className="text-base font-semibold text-sn-ink mb-1">No news found</h3>
            <p className="text-sm text-sn-ink-soft">Check back later for the latest updates</p>
          </Card>
        ) : (
          <>
            {/* ── Featured article — magazine 2-col ─────────── */}
            {featured && !searchParams.q && (
              <Link href={`/news/${featured.slug}`} className="group block mb-8">
                <Card interactive className="grid grid-cols-1 overflow-hidden p-0 lg:grid-cols-2 lg:p-0">
                  <div className="relative h-60 lg:h-auto lg:min-h-[300px] overflow-hidden">
                    {featured.image_url ? (
                      <Image
                        src={featured.image_url}
                        alt={featured.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <PlaceholderCover idx={0} />
                    )}
                    <div className="absolute top-4 left-4">
                      <Pill tone="primary" className="!text-sn-ink-soft">Featured</Pill>
                    </div>
                  </div>
                  <div className="p-7 lg:p-9 flex flex-col justify-center">
                    <div className="mb-4 flex items-center gap-1.5 text-xs tabular-nums text-sn-ink-soft">
                      <Calendar className="w-3.5 h-3.5" />
                      <PublishedDate value={featured.published_date} />
                    </div>
                    <h2
                      className="font-baloo font-bold text-sn-ink text-2xl lg:text-3xl leading-tight mb-4
                                 group-hover:text-sn-primary-hover transition-colors"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {featured.title}
                    </h2>
                    {featured.content && (
                      <p className="text-sm text-sn-ink-soft leading-relaxed line-clamp-3 mb-5">
                        {featured.content}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-sn-primary-hover">
                      Read full story <ArrowRight className="w-4 h-4 motion-arrow" />
                    </span>
                  </div>
                </Card>
              </Link>
            )}

            {/* ── Rest — 3-col grid ─────────────────────────── */}
            {(searchParams.q ? newsList : rest).length > 0 && (() => {
              const articles = searchParams.q ? newsList : rest
              const before   = articles.slice(0, 3)
              const after    = articles.slice(3)

              function NewsCard({ news, idx }: { news: typeof articles[0]; idx: number }) {
                return (
                  <Link key={news.id} href={`/news/${news.slug}`} className="group block">
                    <Card interactive className="overflow-hidden p-0 lg:p-0">
                      <div className="relative h-44 overflow-hidden">
                        {news.image_url ? (
                          <Image src={news.image_url} alt={news.title} fill
                            className="object-cover" />
                        ) : (
                          <PlaceholderCover idx={idx + 1} />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-center gap-1.5 text-xs tabular-nums text-sn-ink-soft">
                          <Calendar className="w-3 h-3" />
                          <PublishedDate value={news.published_date} />
                        </div>
                        <h2 className="font-semibold text-sn-ink text-sm leading-snug line-clamp-2 mb-1
                                       group-hover:text-sn-primary-hover transition-colors">
                          {news.title}
                        </h2>
                        {news.content && (
                          <p className="text-xs text-sn-ink-soft line-clamp-2 leading-relaxed">{news.content}</p>
                        )}
                      </div>
                    </Card>
                  </Link>
                )
              }

              return (
                <>
                  {!searchParams.q && (
                    <h2 className="mb-6 text-xl font-semibold text-sn-ink">More stories</h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {before.map((news, idx) => <NewsCard key={news.id} news={news} idx={idx} />)}
                  </div>
                  {after.length > 0 && (
                    <AdUnit
                      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS ?? ''}
                      format="horizontal"
                      className="my-6 rounded-sn-card border border-sn-border bg-sn-surface min-h-[90px]"
                    />
                  )}
                  {after.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {after.map((news, idx) => <NewsCard key={news.id} news={news} idx={idx + 3} />)}
                    </div>
                  )}
                </>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
