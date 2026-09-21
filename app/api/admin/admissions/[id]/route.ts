import { NextResponse } from 'next/server'
import { getAuthContext, isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { parseAdmissionInput } from '@/lib/admission-admin'

const isAuthed = isStaff

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createAdminSupabaseClient()
  const { data: existing, error: existingError } = await db.from('admissions').select('application_deadline,source_url').eq('id', params.id).single()
  if (existingError || !existing) return NextResponse.json({ error: 'Admission not found.' }, { status: 404 })
  const parsed = parseAdmissionInput(await request.json())
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const update = { ...parsed.value, updated_at: new Date().toISOString(), published_at: parsed.value.status === 'published' ? new Date().toISOString() : null, last_verified_at: parsed.value.verification_status === 'unverified' ? null : new Date().toISOString() }
  const { data, error } = await db.from('admissions').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if ((existing.application_deadline || null) !== (data.application_deadline || null)) {
    const auth = await getAuthContext()
    await db.from('admission_deadline_history').insert({ admission_id: params.id, previous_deadline: existing.application_deadline, new_deadline: data.application_deadline, source_url: data.source_url || existing.source_url, changed_by: auth?.user.id || null })
  }
  await writeAudit('admission.update', 'admission', params.id, { title: data.title, status: data.status })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await createAdminSupabaseClient().from('admissions').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('admission.delete', 'admission', params.id)
  return NextResponse.json({ success: true })
}
