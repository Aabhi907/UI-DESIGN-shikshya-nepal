import { NextResponse } from 'next/server'
import { isStaff } from '@/lib/auth'
import { revalidateAllCollegePages, revalidateCollege, revalidateCollegeListings } from '@/lib/revalidate-college'

export async function POST(request: Request) {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const body = await request.json().catch(() => null)
  if (body?.all === true || body?.slug === 'all') {
    const ok = revalidateAllCollegePages()
    return NextResponse.json({ revalidated: ok, scope: 'all' }, { status: ok ? 200 : 500 })
  }
  const slug = typeof body?.slug === 'string' ? body.slug.trim() : ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) {
    return NextResponse.json({ error: 'Provide a college slug or all: true.' }, { status: 400 })
  }
  const profileOk = revalidateCollege(slug)
  const listingsOk = revalidateCollegeListings()
  const ok = profileOk && listingsOk
  return NextResponse.json({ revalidated: ok, slug }, { status: ok ? 200 : 500 })
}
