import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams; const q = params.get('q')?.trim() || ''
  if (q.length < 2) return NextResponse.json([])
  const { data, error } = await createServerSupabaseClient().from('colleges').select('id,name,slug,location').ilike('name', `%${q.slice(0, 80)}%`).order('name').limit(15)
  return error ? NextResponse.json({ error: 'Institution search is temporarily unavailable.' }, { status: 500 }) : NextResponse.json(data)
}
