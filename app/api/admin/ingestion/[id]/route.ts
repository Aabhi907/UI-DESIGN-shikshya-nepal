import { getAuthContext, writeAudit } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { applyIngestionReview } from '@/lib/ingestion-review'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth || !['reviewer', 'editor', 'owner'].includes(auth.profile.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!['reviewing', 'approved', 'rejected'].includes(body.status)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const { data: item, error: readError } = await db.from('content_ingestion_items').select('*').eq('id', params.id).single()
  if (readError || !item) return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
  if (['approved', 'rejected'].includes(item.status)) return NextResponse.json({ error: 'This item was already reviewed' }, { status: 409 })

  const result = await applyIngestionReview(db, item, body, auth.user.email || auth.user.id)
  if (result.status === 200) {
    await writeAudit(`ingestion.${body.status}`, 'content_ingestion', params.id, {
      title: item.title, target_type: item.target_type,
      published_record_id: result.publishedId ?? null, evidence_id: result.evidenceId ?? null, evidence_warning: result.evidenceWarning ?? null,
    })
  }
  return NextResponse.json(result.json, { status: result.status })
}
