import NoticeForm from '@/components/admin/NoticeForm'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function NewNoticePage() {
  const { data, error } = await createAdminSupabaseClient().from('universities').select('id,name').order('name')
  if (error) throw new Error('Could not load universities')
  return <NoticeForm universities={data || []} />
}
