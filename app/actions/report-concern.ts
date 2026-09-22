'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { Resend } from 'resend'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { checkPublicFormRateLimit } from '@/lib/public-form-security'

// A real HTML <form action={...}> POST, so this works with JavaScript disabled.
// Every outcome ends in redirect() back to the source page with a query flag
// the page reads to show a confirmation or error banner — no client state needed.

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const REPORT_EMAIL = process.env.SAFETY_REPORT_EMAIL?.trim() || process.env.ADMIN_EMAIL?.trim() || null
const CONCERN_TYPES = new Set(['safety', 'privacy', 'other'])

function clean(value: FormDataEntryValue | null, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!)
}

export async function reportConcern(sourcePage: 'safety' | 'privacy', formData: FormData) {
  const back = (flag: string) => redirect(`/${sourcePage}?${flag}`)

  // Quietly accept automated submissions that fill the hidden field, without storing them.
  if (clean(formData.get('website'), 200)) return back('reported=1')

  const concernType = clean(formData.get('concern_type'), 20)
  const message = clean(formData.get('message'), 4000)
  const contact = clean(formData.get('contact'), 200)

  if (!CONCERN_TYPES.has(concernType) || message.length < 10) return back('report_error=invalid')

  const supabase = createAdminSupabaseClient()

  // fingerprint() only reads these two headers; build a minimal Request so the
  // shared rate limiter works the same here as it does from an API route.
  const requestHeaders = headers()
  const fingerprintRequest = new Request('http://internal.local/safety-report', {
    headers: {
      'x-forwarded-for': requestHeaders.get('x-forwarded-for') ?? '',
      'user-agent': requestHeaders.get('user-agent') ?? '',
    },
  })
  const rate = await checkPublicFormRateLimit(supabase, fingerprintRequest, 'safety_report', 5)
  if (rate === 'unavailable') return back('report_error=unavailable')
  if (rate === 'limited') return back('report_error=too_many')

  // Persist first — an email failure below must never lose the report.
  const { data: report, error } = await supabase
    .from('safety_privacy_reports')
    .insert({
      concern_type: concernType,
      source_page: sourcePage,
      message,
      contact: contact || null,
      status: 'open',
    })
    .select('id')
    .single()

  if (error || !report) {
    console.error('[report-concern] insert failed:', error)
    return back('report_error=unavailable')
  }

  if (resend && REPORT_EMAIL) {
    try {
      const sent = await resend.emails.send({
        from: 'SikshyaNepal <onboarding@resend.dev>',
        to: REPORT_EMAIL,
        subject: `New ${concernType} report (${sourcePage} page)`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#1847c4;margin:0 0 4px;">New ${escapeHtml(concernType)} report</h2>
            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Submitted from the ${escapeHtml(sourcePage)} page on SikshyaNepal.</p>
            <p style="white-space:pre-line;font-size:14px;line-height:1.6;">${escapeHtml(message)}</p>
            <p style="margin-top:20px;font-size:13px;color:#6b7280;">Contact given: ${contact ? escapeHtml(contact) : 'none provided'}</p>
            <p style="margin-top:20px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/safety-reports" style="color:#1847c4;">Open in admin</a></p>
          </div>
        `,
      })
      if (!sent.error) {
        await supabase.from('safety_privacy_reports').update({ email_sent: true }).eq('id', report.id)
      } else {
        console.warn('[report-concern] email send failed:', sent.error)
      }
    } catch (emailError) {
      // The report is already saved — a delivery failure here is logged, not fatal.
      console.warn('[report-concern] email send error:', emailError)
    }
  }

  return back('reported=1')
}
