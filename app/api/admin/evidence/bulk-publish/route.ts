import { NextResponse } from 'next/server'
import { getAuthContext, isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { revalidateAllCollegePages } from '@/lib/revalidate-college'

const IMPORT_SOURCE = 'Nepal Education Institutions full research dataset (review required)'

/** Publish the fixed, source-linked 80-college import as a single admin action. */
export async function POST() {
  if (!(await isStaff(['editor', 'owner']))) {
    return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  }

  const auth = await getAuthContext()
  const now = new Date().toISOString()
  const { data, error } = await createAdminSupabaseClient()
    .from('college_evidence')
    .update({
      verification_status: 'source_verified',
      reviewed_at: now,
      reviewed_by: auth?.user.id || null,
      updated_at: now,
    })
    .eq('source_name', IMPORT_SOURCE)
    .eq('extraction_method', 'structured_import')
    .eq('verification_status', 'pending')
    .is('superseded_at', null)
    .select('id')

  if (error) {
    return NextResponse.json({ error: 'The imported college evidence could not be published.' }, { status: 500 })
  }

  const count = data?.length || 0
  if (count) revalidateAllCollegePages()
  await writeAudit('evidence.bulk_publish_import', 'college_evidence', undefined, {
    count,
    source_name: IMPORT_SOURCE,
  })

  return NextResponse.json({ count })
}
