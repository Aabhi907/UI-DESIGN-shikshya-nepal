import { NextResponse } from 'next/server'
import { isStaff } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!['open', 'resolved'].includes(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  const { data, error } = await createAdminSupabaseClient()
    .from('safety_privacy_reports')
    .update({ status: body.status, resolved_at: body.status === 'resolved' ? new Date().toISOString() : null })
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
