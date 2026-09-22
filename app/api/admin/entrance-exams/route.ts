import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { parseEntranceExamInput } from '@/lib/entrance-exam-admin'

export async function GET() {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await createAdminSupabaseClient().from('entrance_exams').select('*').order('created_at', { ascending: false })
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = parseEntranceExamInput(await request.json())
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const row = { ...parsed.value, slug: `${slugify(parsed.value.title)}-${Date.now()}`, last_verified_at: new Date().toISOString() }
  const { data, error } = await createAdminSupabaseClient().from('entrance_exams').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('entrance_exam.create', 'entrance_exam', data.id, { title: data.title, status: data.status })
  return NextResponse.json(data, { status: 201 })
}
