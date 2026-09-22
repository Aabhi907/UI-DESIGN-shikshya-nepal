import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isEntranceExamStatus, parseEntranceExamInput } from '@/lib/entrance-exam-admin'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await createAdminSupabaseClient().from('entrance_exams').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('entrance_exam.delete', 'entrance_exam', params.id)
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const statusOnly = body && typeof body === 'object' && Object.keys(body).length === 1 && 'status' in body
  const update = statusOnly
    ? isEntranceExamStatus((body as { status?: unknown }).status)
      ? { status: (body as { status: string }).status, updated_at: new Date().toISOString() }
      : null
    : (() => {
        const parsed = parseEntranceExamInput(body)
        return 'error' in parsed ? parsed : { ...parsed.value, updated_at: new Date().toISOString(), last_verified_at: new Date().toISOString() }
      })()

  if (!update) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  if ('error' in update) return NextResponse.json({ error: update.error }, { status: 400 })
  const { data, error } = await createAdminSupabaseClient().from('entrance_exams').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit(statusOnly ? 'entrance_exam.status' : 'entrance_exam.update', 'entrance_exam', params.id, {
    title: data.title,
    status: data.status,
  })
  return NextResponse.json(data)
}
