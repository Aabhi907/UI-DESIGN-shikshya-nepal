import { NextResponse } from 'next/server'
import { createAuthClient, isAdminEmail } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { checkPublicFormRateLimit } from '@/lib/public-form-security'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!email || !password || email.length > 254 || password.length > 200) return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 })
  const invalid = () => NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  try {
    const db = createAdminSupabaseClient()
    // The existing limiter uses a rolling hour (20/hour, averaging 5/15min).
    const rate = await checkPublicFormRateLimit(db, request, 'admin_login', 20)
    if (rate === 'limited') return NextResponse.json({ error: 'Too many attempts. Try again in an hour.' }, { status: 429, headers: { 'Retry-After': '3600' } })
    if (rate !== 'allowed') return NextResponse.json({ error: 'Sign in is temporarily unavailable. Please try again shortly.' }, { status: 503 })
    if (!isAdminEmail(email)) return invalid()
    const client = createAuthClient()
    const { data, error } = await client.auth.signInWithPassword({ email, password })
    if (error || !data.user) return invalid()
    try {
      const { data: profile, error: profileError } = await db.from('profiles').select('role,status').eq('id', data.user.id).single()
      if (!profileError && profile?.status === 'active' && profile.role === 'owner' && isAdminEmail(data.user.email)) return NextResponse.json({ success: true, role: profile.role })
    } catch {
      // A failed profile check must not leave a newly signed-in session active.
    }
    await client.auth.signOut()
    return invalid()
  } catch {
    return NextResponse.json({ error: 'Sign in is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }
}
