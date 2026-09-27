import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { checkPublicFormRateLimit } from '@/lib/public-form-security'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!email || !password || email.length > 254 || password.length > 200) return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 })
  try {
    // The existing limiter uses a rolling hour (40/hour, averaging 10/15min).
    const rate = await checkPublicFormRateLimit(createAdminSupabaseClient(), request, 'account_login', 40)
    if (rate === 'limited') return NextResponse.json({ error: 'Too many attempts. Try again in an hour.', retry_after: 3600 }, { status: 429, headers: { 'Retry-After': '3600' } })
    if (rate !== 'allowed') return NextResponse.json({ error: 'Sign in is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password })
    if (error || !data.user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Sign in is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }
}
