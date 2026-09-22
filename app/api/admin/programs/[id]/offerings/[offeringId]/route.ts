import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { parseProgramOfferingInput } from '@/lib/program-offering-admin'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function PUT(request: Request, { params }: { params: { id: string; offeringId: string } }) {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const parsed = parseProgramOfferingInput(await request.json())
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const { data, error } = await createAdminSupabaseClient()
    .from('university_program_offerings')
    .update(parsed.value)
    .eq('id', params.offeringId)
    .eq('program_id', params.id)
    .select('*, university:universities(id,name,slug,short_name,website)')
    .single()
  if (error?.code === '23505') return NextResponse.json({ error: 'This university already has a variant for this programme.' }, { status: 409 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('program_offering.update', 'university_program_offering', data.id, { program_id: params.id, university_id: data.university_id, status: data.status, source_url: data.official_program_url })
  return NextResponse.json(data)
}
