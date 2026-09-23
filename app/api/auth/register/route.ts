import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { checkPublicFormRateLimit } from '@/lib/public-form-security'
import { SITE_URL } from '@/lib/seo'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const fullName = typeof body.full_name === 'string' ? body.full_name.trim().replace(/\s+/g, ' ') : ''
  if (!email || email.length > 254 || password.length < 10 || password.length > 200 || fullName.length < 2 || fullName.length > 80) return NextResponse.json({ error: 'Enter a valid name, email and password of at least 10 characters.' }, { status: 400 })

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Account creation is temporarily unavailable.' }, { status: 503 })
  const db = createAdminSupabaseClient()
  const rate = await checkPublicFormRateLimit(db, request, 'account_registration', 5)
  if (rate === 'limited') return NextResponse.json({ error: 'Too many account attempts. Please try again in an hour.' }, { status: 429, headers: { 'Retry-After': '3600' } })
  if (rate !== 'allowed') return NextResponse.json({ error: 'Account creation is temporarily unavailable. Please try again shortly.' }, { status: 503 })

  const auth = createAuthClient()
  const { data, error } = await auth.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: SITE_URL + '/account/login',
    },
  })
  if (error) {
    if (/already|exists|registered/i.test(error.message)) return NextResponse.json({ error: 'An account already exists for this email. Sign in instead.' }, { status: 409 })
    console.error('[auth:register]', error)
    return NextResponse.json({ error: 'Account creation could not be completed. Please try again.' }, { status: 400 })
  }

  if (data.session) {
    const { error: signOutError } = await auth.auth.signOut()
    if (signOutError) console.error('[auth:register:signout]', signOutError)
    console.error('[auth:register] Supabase Confirm Email is disabled; registration cannot safely continue.')
    return NextResponse.json({ error: 'Account registration is temporarily unavailable.' }, { status: 503 })
  }

  return NextResponse.json({ success: true, confirmation_required: true }, { status: 202 })
}
