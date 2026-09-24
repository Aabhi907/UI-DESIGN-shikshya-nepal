import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createAdminSupabaseClient()
  const loadPosts = (includePrivateMediaPath: boolean) => db.from('community_posts')
    .select(includePrivateMediaPath
      ? 'id,title,body,topic,status,created_at,moderation_note,media_url,media_path,media_type,author_id,public_alias'
      : 'id,title,body,topic,status,created_at,moderation_note,media_url,media_type,author_id,public_alias')
    .in('status', ['pending', 'hidden']).order('created_at', { ascending: false }).limit(100)
  const [firstPosts, commentResult, reportResult] = await Promise.all([
    loadPosts(true),
    db.from('community_comments').select('id,post_id,body,status,created_at,moderation_note,author_id,public_alias,post:community_posts(title)').in('status', ['pending', 'hidden']).order('created_at', { ascending: false }).limit(100),
    db.from('community_reports').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(100),
  ])
  let posts = firstPosts.data
  let postError = firstPosts.error
  if (postError?.code === '42703' && postError.message.includes('media_path')) {
    const legacyPosts = await loadPosts(false)
    posts = legacyPosts.data
    postError = legacyPosts.error
  }
  const { data: comments, error: commentError } = commentResult
  const { data: reports, error: reportError } = reportResult
  if (postError || commentError || reportError) return NextResponse.json({ error: postError?.message || commentError?.message || reportError?.message }, { status: 500 })
  const postRows = (posts || []) as unknown as Array<{ id: string; author_id?: string | null; media_path?: string | null; media_url?: string | null }>
  const commentRows = (comments || []) as unknown as Array<{ author_id?: string | null }>
  const authorIds = Array.from(new Set([...postRows, ...commentRows].map(item => item.author_id).filter(Boolean))) as string[]
  const identities = Object.fromEntries(await Promise.all(authorIds.map(async id => {
    const { data } = await db.auth.admin.getUserById(id)
    return [id, { email: data.user?.email || 'Unavailable', provider: data.user?.app_metadata?.provider || 'unknown' }]
  })))
  const safePosts = postRows.map(post => ({
    ...post,
    media_url: post.media_path ? `/api/admin/community/media/${post.id}` : post.media_url,
  }))
  return NextResponse.json({ posts: safePosts, comments: comments || [], reports: reports || [], identities }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(request: Request) {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const type = body.type
  const id = typeof body.id === 'string' ? body.id : ''
  const status = body.status
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid item.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  if (type === 'account') {
    if (!['suspended', 'banned', 'active'].includes(status)) return NextResponse.json({ error: 'Invalid account decision.' }, { status: 400 })
    const { error } = await db.from('community_profiles').update({ status, updated_at: new Date().toISOString() }).eq('user_id', id)
    if (error) { console.error('[admin/community:account]', error); return NextResponse.json({ error: 'The account decision could not be saved.' }, { status: 500 }) }
    await writeAudit(`community.account.${status}`, 'community_profile', id)
    return NextResponse.json({ success: true })
  }
  if (type === 'report') {
    if (!['resolved', 'dismissed', 'hide-target'].includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    let hiddenTarget: { type: string; id: string } | null = null
    if (status === 'hide-target') {
      const { data: report, error: reportReadError } = await db.from('community_reports').select('target_type,target_id,status').eq('id', id).maybeSingle()
      if (reportReadError) return NextResponse.json({ error: 'Could not load the report.' }, { status: 500 })
      if (!report) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
      if (report.status === 'resolved') return NextResponse.json({ success: true })
      if (report.status !== 'open') return NextResponse.json({ error: 'This report was already dismissed.' }, { status: 409 })
      const table = report.target_type === 'post' ? 'community_posts' : 'community_comments'
      const { data: target, error: targetReadError } = await db.from(table).select('status').eq('id', report.target_id).maybeSingle()
      if (targetReadError) return NextResponse.json({ error: 'Could not load the reported content.' }, { status: 500 })
      if (!target) return NextResponse.json({ error: 'The reported content no longer exists.' }, { status: 404 })
      if (target.status !== 'hidden') {
        const { data: hidden, error: hideError } = await db.from(table)
          .update({ status: 'hidden', updated_at: new Date().toISOString() })
          .eq('id', report.target_id).eq('status', target.status).select('id').maybeSingle()
        if (hideError) { console.error('[admin/community:hide-report-target]', hideError); return NextResponse.json({ error: 'The reported content could not be hidden.' }, { status: 500 }) }
        if (!hidden) return NextResponse.json({ error: 'The content changed during moderation. Reload and retry.' }, { status: 409 })
      }
      hiddenTarget = { type: report.target_type, id: report.target_id }
    }
    const resolvedStatus = status === 'hide-target' ? 'resolved' : status
    const decision = db.from('community_reports').update({ status: resolvedStatus, resolved_at: new Date().toISOString() }).eq('id', id)
    const { data: resolved, error } = status === 'hide-target'
      ? await decision.eq('status', 'open').select('id').maybeSingle()
      : await decision.select('id').maybeSingle()
    if (error) { console.error('[admin/community:report]', error); return NextResponse.json({ error: 'The report decision could not be saved.' }, { status: 500 }) }
    if (!resolved) return NextResponse.json({ error: 'The report changed during moderation. Reload and retry.' }, { status: 409 })
    if (hiddenTarget) await writeAudit('community.report.hide_target', hiddenTarget.type, hiddenTarget.id, { report_id: id })
    await writeAudit(`community.report.${resolvedStatus}`, 'community_report', id)
  } else {
    if (!['post', 'comment'].includes(type) || !['published', 'rejected', 'hidden'].includes(status)) return NextResponse.json({ error: 'Invalid decision.' }, { status: 400 })
    const table = type === 'post' ? 'community_posts' : 'community_comments'
    const update = { status, published_at: status === 'published' ? new Date().toISOString() : null, moderation_note: typeof body.note === 'string' ? body.note.slice(0, 500) : null, updated_at: new Date().toISOString() }
    const { error } = await db.from(table).update(update).eq('id', id)
    if (error) { console.error('[admin/community:moderate]', error); return NextResponse.json({ error: 'The moderation decision could not be saved.' }, { status: 500 }) }
    await writeAudit(`community.${type}.${status}`, type, id, { note_provided: Boolean(update.moderation_note) })
  }
  revalidatePath('/community')
  revalidatePath('/community/[id]', 'page')
  return NextResponse.json({ success: true })
}
