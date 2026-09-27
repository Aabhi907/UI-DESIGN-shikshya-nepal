import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'
import { safeNextPath } from '@/lib/safe-next'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (!code) return NextResponse.redirect(new URL('/account/login?error=google_callback_failed', url.origin))
  try {
    const { error } = await createAuthClient().auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(safeNextPath(url.searchParams.get('next')), url.origin))
  } catch {
    // Failed exchanges use the same friendly sign-in error as provider failures.
  }
  return NextResponse.redirect(new URL('/account/login?error=google_sign_in_failed', url.origin))
}
