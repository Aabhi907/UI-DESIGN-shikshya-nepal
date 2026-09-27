import { createAdminSupabaseClient } from '@/lib/supabase'
import { sendResultNotification, type ResultNotification } from '@/lib/email'
import { createHash } from 'crypto'

export type AlertOutcome = 'sent' | 'skipped' | 'failed'

// Consumer-protection gate (see the PR description for the full check):
// `/api/subscribe` never sets `subscribers.token` on insert, and the table's
// own CREATE TABLE statement is not in any migration, so a database-level
// default cannot be confirmed by reading the repo — and this work is not
// permitted to query production to check. Until someone with dashboard
// access confirms `token` has a working default (for example:
// `SELECT column_default FROM information_schema.columns
//  WHERE table_name = 'subscribers' AND column_name = 'token'`),
// sending stays off. A subscriber must never be sent an unsubscribe link
// that cannot actually unsubscribe them.
const RESULT_ALERTS_ENABLED = false

function resultEventKey(resultId: string): string {
  // Keyed on the result's own id, which is stable across a retried or
  // re-approved publish of the same record — unlike the old batch-oriented
  // key (a hash of title+slug pairs), this stays the same no matter how many
  // times the same result's publish is retried.
  return createHash('sha256').update(`result:${resultId}`).digest('hex')
}

async function completeDeliveryRun(
  db: ReturnType<typeof createAdminSupabaseClient>,
  id: string,
  values: { status: 'sent' | 'partial' | 'failed'; recipient_count?: number; sent_count?: number; error_count?: number },
) {
  const { error } = await db
    .from('notification_delivery_runs')
    .update({ ...values, completed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) console.error('[result-alerts] delivery run could not be closed out', { id })
}

// Sends a result alert for exactly one result, once it has actually been
// published. Never throws — a failure here must never fail the publish that
// triggered it. Idempotent: calling this more than once for the same result
// id sends at most one email batch (a second call sees the unique event key
// already recorded and returns 'skipped').
export async function sendResultAlertForApproval(
  db: ReturnType<typeof createAdminSupabaseClient>,
  resultId: string,
): Promise<AlertOutcome> {
  if (!RESULT_ALERTS_ENABLED) return 'skipped'

  try {
    const { data: result, error: fetchError } = await db
      .from('results')
      .select('title, slug, university:universities(short_name)')
      .eq('id', resultId)
      .maybeSingle()
    if (fetchError || !result) {
      console.error('[result-alerts] could not load the published result', { resultId })
      return 'failed'
    }

    const key = resultEventKey(resultId)
    const { data: run, error: runError } = await db
      .from('notification_delivery_runs')
      .insert({ event_key: key, category: 'results', item_count: 1 })
      .select('id')
      .single()
    if (runError?.code === '23505') return 'skipped'
    if (runError || !run) {
      console.error('[result-alerts] delivery run could not be recorded', { resultId })
      return 'failed'
    }

    const notification: ResultNotification = {
      title: result.title,
      slug: result.slug,
      university: (result as { university?: { short_name?: string | null } | null }).university,
    }
    try {
      const { sent, errors, recipients } = await sendResultNotification([notification])
      const deliveryStatus = errors ? (sent ? 'partial' : 'failed') : 'sent'
      await completeDeliveryRun(db, run.id, { status: deliveryStatus, recipient_count: recipients, sent_count: sent, error_count: errors })
      if (recipients === 0) return 'skipped'
      return deliveryStatus === 'failed' ? 'failed' : 'sent'
    } catch {
      await completeDeliveryRun(db, run.id, { status: 'failed', error_count: 1 })
      console.error('[result-alerts] delivery failed', { resultId })
      return 'failed'
    }
  } catch {
    console.error('[result-alerts] unexpected error', { resultId })
    return 'failed'
  }
}
