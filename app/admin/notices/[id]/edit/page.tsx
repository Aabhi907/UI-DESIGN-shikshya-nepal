import { notFound } from 'next/navigation'
import { createAdminSupabaseClient } from '@/lib/supabase'
import NoticeForm from '@/components/admin/NoticeForm'

export default async function EditNoticePage({ params }: { params: { id: string } }) {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase.from('notices').select('*').eq('id', params.id).single()
  if (!data) notFound()
  const { data: universities, error } = await supabase.from('universities').select('id,name').order('name')
  if (error) throw new Error('Could not load universities')
  return <NoticeForm universities={universities || []} initialData={{ ...data, published_date: data.published_date?.split('T')[0] }} noticeId={params.id} isEdit />
}
