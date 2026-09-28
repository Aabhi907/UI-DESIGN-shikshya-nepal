import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { reportConcern } from '@/app/actions/report-concern'

const ERROR_TEXT: Record<string, string> = {
  invalid: 'Please choose a concern type and write at least 10 characters, then try again.',
  too_many: 'Too many reports were sent from this connection. Please wait a while and try again.',
  unavailable: 'Something went wrong saving your report. Please try again in a few minutes. If someone is in immediate danger, use the emergency contacts above instead of waiting.',
}

const CONCERN_TYPE_VALUES = new Set(['safety', 'privacy', 'other'])

// No client component here on purpose: this posts as a plain HTML form to a
// Server Action, so it keeps working with JavaScript disabled — the case that
// matters most for a student reporting a safety concern from a slow phone.
export default function ReportConcernForm({
  sourcePage,
  defaultConcernType,
  searchParams,
}: {
  sourcePage: 'safety' | 'privacy'
  defaultConcernType: 'safety' | 'privacy' | 'other'
  searchParams: { reported?: string; report_error?: string; concern_type?: string }
}) {
  const reported = searchParams.reported === '1'
  const errorText = searchParams.report_error ? ERROR_TEXT[searchParams.report_error] || ERROR_TEXT.unavailable : null
  const action = reportConcern.bind(null, sourcePage)
  // Other pages link here with ?concern_type=... to preselect a category (see /contact, /copyright, /refunds, /terms).
  const initialConcernType = searchParams.concern_type && CONCERN_TYPE_VALUES.has(searchParams.concern_type)
    ? (searchParams.concern_type as 'safety' | 'privacy' | 'other')
    : defaultConcernType

  return (
    <section aria-labelledby={`report-${sourcePage}-heading`} className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <h2 id={`report-${sourcePage}-heading`} className="text-lg font-bold text-ink">
        Report a {sourcePage} concern
      </h2>
      <p className="mt-1 text-sm leading-6 text-gray-600">
        This goes straight to the SikshyaNepal team. Contact details are optional — only add them if you want a reply.
      </p>

      {reported ? (
        <div role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p>Received. A person will review this. You can close this page.</p>
        </div>
      ) : (
        <form action={action} className="mt-5 space-y-4">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">What is this about?</span>
            <select name="concern_type" required defaultValue={initialConcernType} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm">
              <option value="safety">Safety</option>
              <option value="privacy">Privacy</option>
              <option value="other">Something else</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">What happened? *</span>
            <textarea
              name="message"
              minLength={10}
              maxLength={4000}
              rows={5}
              required
              placeholder="Describe the concern. You don't need to include your name."
              className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-ink">Email or phone (optional)</span>
            <input name="contact" maxLength={200} placeholder="Only if you want a reply" className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm" />
          </label>

          {errorText && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {errorText}
            </p>
          )}

          <button type="submit" className="min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-600 transition-colors motion-control">
            Send report
          </button>
        </form>
      )}
    </section>
  )
}
