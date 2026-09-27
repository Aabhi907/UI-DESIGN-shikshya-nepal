import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'
import { safeNextPath } from '@/lib/safe-next'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const callback = new URL('/auth/callback', url.origin)
  callback.searchParams.set('next', safeNextPath(url.searchParams.get('next')))
  try {
    const { data, error } = await createAuthClient().auth.signInWithOAuth({
      provider: 'google', options: { redirectTo: callback.toString() },
    })
    if (!error && data.url) return NextResponse.redirect(data.url)
  } catch {
    // Keep provider and transport failures on the existing friendly error path.
  }
  return NextResponse.redirect(new URL('/account/login?error=google_sign_in_failed', url.origin))
}
