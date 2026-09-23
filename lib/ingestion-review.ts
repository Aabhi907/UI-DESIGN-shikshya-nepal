import { createAdminSupabaseClient } from '@/lib/supabase'
import { editorialQualityError, recordReviewIssues } from '@/lib/editorial-quality'

const fields: Record<string, string[]> = {
  news: ['title', 'slug', 'content', 'image_url', 'author_name', 'tags', 'published_date', 'source_name', 'source_url', 'content_category', 'education_levels', 'college_id', 'disclosure'],
  notice: ['title', 'slug', 'content', 'university_id', 'notice_url', 'published_date'],
  result: ['title', 'slug', 'program', 'semester', 'year', 'university_id', 'result_url', 'published_date'],
}
const tables = { news: 'news', notice: 'notices', result: 'results' } as const

type ReviewResult = {
  status: number
  json: Record<string, unknown>
  publishedId?: string | null
  evidenceId?: string | null
  evidenceWarning?: string | null
}

export type IngestionQueueItem = {
  id: string
  title: string
  target_type: string
  payload: Record<string, unknown>
  published_record_id: string | null
  content_category: string | null
  college_id: string | null
  scraper_name: string
  source_url: string
  confidence_score: number
}

export type IngestionReviewBody = {
  status: string
  payload?: Record<string, unknown>
  reviewer_notes?: string
  evidence_proposal?: { enabled?: boolean; field_key?: string; claim_summary?: string }
}

// Extracted from the ingestion PATCH route so it can be exercised directly, against
// a real database, with the final queue-status write forced to fail — see
// scripts/test-ingestion-approval-atomicity.mjs. Behaviour is otherwise identical
// to what the route used to do inline.
export async function applyIngestionReview(db: ReturnType<typeof createAdminSupabaseClient>, item: IngestionQueueItem, body: IngestionReviewBody, reviewedBy: string): Promise<ReviewResult> {
  let publishedId: string | null = null
  let evidenceId: string | null = null
  let evidenceWarning: string | null = null
  if (body.status === 'approved') {
    const allowed = fields[item.target_type]
    const table = tables[item.target_type as keyof typeof tables]
    if (!allowed || !table) return { status: 400, json: { error: 'Unsupported content type' } }
    const edited = { ...item.payload, ...(body.payload || {}) }
    const record = Object.fromEntries(allowed.filter((key) => edited[key] !== undefined).map((key) => [key, edited[key]]))
    if (item.target_type === 'news') {
      record.status = 'published'
      record.automation_mode = 'editor_approved'
      record.last_verified_at = new Date().toISOString()
      record.source_name = record.source_name || item.scraper_name
      record.source_url = record.source_url || item.source_url
      record.content_category = record.content_category || item.content_category || 'college_news'
      record.college_id = record.college_id || item.college_id || null
      if (String(record.content || '').trim().length < 200) return { status: 400, json: { error: 'Write an original summary of at least 200 characters before publishing.' } }
      const qualityError = editorialQualityError(String(record.title || item.title || ''), String(record.content || ''))
      if (qualityError) return { status: 400, json: { error: qualityError } }
    }
    if (item.target_type === 'notice' || item.target_type === 'result') {
      const sourceUrl = String(item.target_type === 'notice' ? record.notice_url || item.source_url || '' : record.result_url || item.source_url || '')
      const issues = recordReviewIssues({
        title: String(record.title || item.title || ''),
        content: String(record.content || ''),
        sourceUrl,
        publishedDate: String(record.published_date || ''),
      })
      if (issues.length) return { status: 400, json: { error: `Review before publishing: ${issues.join('; ')}.` } }
    }
    const { data, error } = item.published_record_id
      ? await db.from(table).update(record).eq('id', item.published_record_id).select('id').single()
      : await db.from(table).insert(record).select('id').single()
    if (error) return { status: 500, json: { error: `Publish failed: ${error.message}` } }
    publishedId = data.id

    // Persist the link back to the queue item immediately, before the evidence
    // ledger insert below or the status-flip update further down can fail. Once
    // this succeeds, a retry sees item.published_record_id already set and takes
    // the update branch above instead of inserting a second public record — so
    // "public record exists, queue item still pending" can't be reached past
    // this point, even if a later step in this same request fails.
    if (!item.published_record_id) {
      const { error: linkError } = await db.from('content_ingestion_items').update({ published_record_id: publishedId }).eq('id', item.id)
      if (linkError) return { status: 500, json: { error: `Publish succeeded but could not be recorded: ${linkError.message}. Retry approval — it will not create a duplicate.` } }
    }

    const category = String(item.content_category || '').toLowerCase()
    const inferredField = category.includes('admission') ? 'admission_deadline' : category.includes('scholarship') ? 'scholarship' : category.includes('result') ? 'result' : category.includes('program') || category.includes('programme') ? 'programs' : category.includes('fee') ? 'fee' : null
    const proposal = body.evidence_proposal?.enabled
      ? body.evidence_proposal
      : inferredField ? { enabled: true, field_key: inferredField, claim_summary: String(record.title || item.title) } : null
    if (proposal?.enabled && item.college_id && ['affiliation','programs','fee','admission_deadline','scholarship','result','facilities','contact'].includes(proposal.field_key || '')) {
      const claim = String(proposal.claim_summary || '').trim()
      if (claim.length >= 3) {
        const { data: evidence, error: evidenceError } = await db.from('college_evidence').insert({
          college_id: item.college_id,
          field_key: proposal.field_key,
          claim_summary: claim.slice(0, 500),
          source_name: String(record.source_name || item.scraper_name).slice(0, 200),
          source_url: String(record.source_url || item.source_url),
          source_published_at: record.published_date || null,
          checked_at: new Date().toISOString(),
          confidence_score: Math.max(0, Math.min(100, Number(item.confidence_score) || 0)),
          verification_status: 'pending',
          extraction_method: 'automated_extraction',
        }).select('id').single()
        evidenceId = evidence?.id || null
        if (evidenceError) evidenceWarning = evidenceError.code === '42P01' ? 'Evidence Ledger migration is not installed.' : evidenceError.code === '23505' ? 'An active evidence proposal already uses this source and field.' : evidenceError.message
      }
    }
  }
  const { data, error } = await db.from('content_ingestion_items').update({
    status: body.status, reviewer_notes: String(body.reviewer_notes || '').slice(0, 2000) || null,
    verification_status: body.status === 'approved' ? 'editor_verified' : body.status === 'rejected' ? 'rejected' : 'pending',
    reviewed_at: ['approved', 'rejected'].includes(body.status) ? new Date().toISOString() : null,
    reviewed_by: reviewedBy, published_record_id: publishedId,
  }).eq('id', item.id).select().single()
  if (error) return { status: 500, json: { error: error.message } }
  return { status: 200, json: { ...data, evidence_id: evidenceId, evidence_warning: evidenceWarning }, publishedId, evidenceId, evidenceWarning }
}
