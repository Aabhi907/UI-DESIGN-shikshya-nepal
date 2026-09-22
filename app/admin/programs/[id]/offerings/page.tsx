import { notFound } from 'next/navigation'
import ProgramOfferingsManager from '@/components/admin/ProgramOfferingsManager'
import { createAdminSupabaseClient } from '@/lib/supabase'
import type { Program, University, UniversityProgramOffering } from '@/types'

export default async function ProgramOfferingsPage({ params }: { params: { id: string } }) {
  const db = createAdminSupabaseClient()
  const [{ data: program }, { data: universities }, { data: offerings }] = await Promise.all([
    db.from('programs').select('*').eq('id', params.id).single(),
    db.from('universities').select('*').order('name'),
    db.from('university_program_offerings').select('*, university:universities(id,name,slug,short_name,website,created_at)').eq('program_id', params.id).order('updated_at', { ascending: false }),
  ])
  if (!program) notFound()
  return <div className="p-5 sm:p-8"><ProgramOfferingsManager program={program as Program} universities={(universities || []) as University[]} initialOfferings={(offerings || []) as (UniversityProgramOffering & { university?: University | null })[]}/></div>
}
