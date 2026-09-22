import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { parseAdmissionInput } from '@/lib/admission-admin'

const isAuthed = isStaff

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await createAdminSupabaseClient().from('admissions').select('*').order('created_at', { ascending: false }).limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = parseAdmissionInput(await request.json())
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const row = { ...parsed.value, published_at: parsed.value.status === 'published' ? new Date().toISOString() : null, last_verified_at: parsed.value.verification_status === 'unverified' ? null : new Date().toISOString() }
  const { data, error } = await createAdminSupabaseClient().from('admissions').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('admission.create', 'admission', data.id, { title: data.title, status: data.status })
  return NextResponse.json(data, { status: 201 })
}
