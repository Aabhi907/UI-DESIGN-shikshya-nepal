import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AlertTriangle, Calendar, ExternalLink } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema, SITE_URL } from '@/lib/seo'
import { COLLEGE_NEWS_TOPICS, isCollegeNewsTopic } from '@/lib/college-news'
import type { News } from '@/types'
import Card from '@/components/design-system/Card'
import PublishedDate from '@/components/ui/PublishedDate'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return Object.keys(COLLEGE_NEWS_TOPICS).map(topic => ({ topic }))
}

export async function generateMetadata({ params }: { params: { topic: string } }): Promise<Metadata> {
  if (!isCollegeNewsTopic(params.topic)) return {}
  const topic = COLLEGE_NEWS_TOPICS[params.topic]
  return { title: topic.title, description: topic.description, alternates: { canonical: `/news/topic/${params.topic}` }, openGraph: { title: topic.title, description: topic.description, url: `/news/topic/${params.topic}`, type: 'website' } }
}

export default async function CollegeNewsTopicPage({ params }: { params: { topic: string } }) {
  if (!isCollegeNewsTopic(params.topic)) notFound()
  const topic = COLLEGE_NEWS_TOPICS[params.topic]
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('news').select('*').eq('status', 'published').eq('content_category', topic.category).order('published_date', { ascending: false, nullsFirst: false }).limit(40)
  if (error) console.error('[news:topic]', { code: error.code, message: error.message, topic: params.topic })
  const articles = (error ? [] : (data || [])) as News[]
  const pageUrl = absoluteUrl(`/news/topic/${params.topic}`)
  const structured = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'CollectionPage', '@id': `${pageUrl}#page`, url: pageUrl, name: topic.title, description: topic.description, isPartOf: { '@id': `${SITE_URL}/#website` }, mainEntity: { '@id': `${pageUrl}#articles` } },
    { '@type': 'ItemList', '@id': `${pageUrl}#articles`, numberOfItems: articles.length, itemListElement: articles.map((article, index) => ({ '@type': 'ListItem', position: index + 1, url: absoluteUrl(`/news/${article.slug}`), name: article.title })) },
    { '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: `How does SikshyaNepal verify ${topic.label.toLowerCase()}?`, acceptedAnswer: { '@type': 'Answer', text: topic.answer } }] },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'College news', path: '/news' }, { name: topic.label, path: `/news/topic/${params.topic}` }]),
  ] }

  return <main className="min-h-screen bg-sn-ground">
    <JsonLd data={structured} />
    <header className="border-b border-sn-border bg-sn-surface"><div className="mx-auto max-w-sn px-5 py-14 sm:px-8 lg:px-12 lg:py-24"><nav className="mb-5 text-sm text-sn-ink-soft"><Link href="/news" className="inline-flex min-h-11 items-center hover:text-sn-primary-hover">College news</Link> <span aria-hidden="true">/</span> {topic.label}</nav><h1 className="max-w-4xl font-baloo text-3xl font-bold tracking-tight text-sn-ink sm:text-4xl">{topic.title}</h1><p className="mt-4 max-w-3xl leading-7 text-sn-ink-soft">{topic.description}</p><div className="mt-6 rounded-sn-card border border-sn-primary/20 bg-sn-primary-bg p-4 text-sm leading-6 text-sn-ink"><strong>How to use this page:</strong> {topic.answer}</div></div></header>
    <div className="mx-auto max-w-sn px-5 py-14 sm:px-8 lg:px-12 lg:py-24"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-sn-ink">Latest updates</h2><span className="text-sm text-sn-ink-soft">{articles.length} article{articles.length === 1 ? '' : 's'}</span></div>
      {error ? <div role="alert" className="flex items-start gap-3 rounded-sn-card border border-sn-confirm/30 bg-sn-confirm-bg p-6 text-sm text-sn-confirm-ink"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">Updates could not be loaded</p><p className="mt-1">This is a temporary problem, not an empty topic. Please refresh or try again shortly.</p></div></div> : articles.length ? <div className="grid gap-5 md:grid-cols-2">{articles.map(article => <Card as="article" key={article.id} className="rounded-sn-card border border-sn-border bg-sn-surface p-5 shadow-sn-card"><p className="flex items-center gap-1.5 text-xs text-sn-ink-soft"><Calendar className="h-3.5 w-3.5" /><PublishedDate value={article.published_date} /></p><h2 className="mt-3 text-lg font-semibold leading-snug text-sn-ink"><Link href={`/news/${article.slug}`} className="hover:text-sn-primary-hover">{article.title}</Link></h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-sn-ink-soft">{article.content}</p><Link href={`/news/${article.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-sn-primary-hover">Read article <ExternalLink className="h-3.5 w-3.5" /></Link></Card>)}</div> : <div className="rounded-sn-card border border-sn-border bg-sn-surface p-10 text-center"><h2 className="font-semibold text-sn-ink">No updates yet</h2><p className="mt-2 text-sm text-sn-ink-soft">Check back for new articles on this topic.</p></div>}
    </div>
  </main>
}
