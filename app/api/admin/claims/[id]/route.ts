import { NextResponse } from 'next/server'
import { getAuthContext, isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const body = await request.json()
  if (!['reviewing', 'approved', 'rejected'].includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  const db = createAdminSupabaseClient()
  const { data: claim, error: readError } = await db.from('institution_claims').select('*').eq('id', params.id).maybeSingle()
  if (readError) return NextResponse.json({ error: `Could not load claim: ${readError.message}` }, { status: 500 })
  if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  const auth = await getAuthContext()
  const { data: membership, error: membershipReadError } = await db.from('institution_memberships')
    .select('id').eq('user_id', claim.user_id).eq('entity_type', claim.entity_type).eq('entity_id', claim.entity_id).maybeSingle()
  if (membershipReadError) return NextResponse.json({ error: `Could not check representative access: ${membershipReadError.message}` }, { status: 500 })

  if (body.status !== 'approved' && membership) {
    return NextResponse.json({ error: 'Representative access already exists. Retry approval or resolve the membership before changing this claim.' }, { status: 409 })
  }
  if (body.status === 'approved' && claim.status === 'rejected') {
    return NextResponse.json({ error: 'A rejected claim cannot be approved.' }, { status: 409 })
  }
  if (body.status === 'approved' && !membership) {
    const { error } = await db.from('institution_memberships').upsert({
      user_id: claim.user_id, entity_type: claim.entity_type, entity_id: claim.entity_id, granted_by: auth?.user.id,
    }, { onConflict: 'user_id,entity_type,entity_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const now = new Date().toISOString()
  const update = {
    status: body.status,
    reviewer_notes: String(body.reviewer_notes || '').slice(0, 2000) || null,
    reviewed_by: auth?.user.id,
    reviewed_at: ['approved', 'rejected'].includes(body.status) ? now : null,
    updated_at: now,
  }
  let data = claim
  let transitioned = false
  if (claim.status !== body.status || body.status === 'reviewing') {
    const result = await db.from('institution_claims').update(update).eq('id', params.id).eq('status', claim.status).select().maybeSingle()
    if (result.error) return NextResponse.json({ error: `Claim status could not be saved; retry this decision: ${result.error.message}` }, { status: 500 })
    if (!result.data) return NextResponse.json({ error: 'Claim changed during review. Reload and retry.' }, { status: 409 })
    data = result.data
    transitioned = claim.status !== body.status
  }

  if (body.status === 'approved') {
    const { error } = await db.from('profiles').update({ role: 'representative', updated_at: now }).eq('id', claim.user_id).eq('role', 'user')
    if (error) return NextResponse.json({ error: `Claim approved, but profile role could not be updated; retry approval: ${error.message}` }, { status: 500 })
  }
  if (transitioned) await writeAudit(`claim.${body.status}`, 'institution_claim', params.id, {
    institution: claim.institution_name, entity_type: claim.entity_type, entity_id: claim.entity_id,
  })
  return NextResponse.json(data)
}
