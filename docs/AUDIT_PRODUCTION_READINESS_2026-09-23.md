# Production-readiness audit

Date: 23 September 2026
Scope: read-only static trace of the current `main` checkout (`b414c1f`). No production database, third-party delivery, or browser end-to-end tests were run. Conditional scenarios below describe what the cited code does when the stated error or input occurs; they are not claims that a production incident has already happened.

Severity vocabulary: `breaks-a-student-flow`, `data-integrity`, `silent-failure`, `minor`.

## 1. Apply Now / lead capture

Traced the profile button and modal through `POST /api/apply`, Supabase `leads`, admin email, and `/admin/leads`. The API validates required fields, Nepali phone format, optional email, consent, active college, duplicate phone within 15 minutes, daily phone volume, and the insert error before reporting success. The lead counter requested in an earlier brief is not present in the current college profile; this audit does not assume it is still a requirement.

1. **Shared-device lockout** — `components/colleges/ApplyNowButton.tsx:19-20,29-36,63-74` (`LS_KEY` and applied state). After student A sends an enquiry for a college on a shared phone, student B using the same browser for that college within 30 days sees only “Enquiry sent”; the form is not reachable, although B's different phone number would pass the server's duplicate check. **Severity: `breaks-a-student-flow`.**
2. **Admin email rejection is not inspected** — `app/api/apply/route.ts:93-141` (`POST`). The route awaits `resend.emails.send()` but checks only a thrown exception with `.catch()`. If the SDK resolves with an `{ error }` response (for example, a rejected sender/recipient), the lead is stored and the student receives success, while the admin notification is neither logged nor retried. **Severity: `silent-failure`.**
3. **Failed admin fetch looks like zero enquiries** — `app/admin/leads/page.tsx:48-64` (`fetchLeads`) and `app/api/admin/leads/route.ts:10-11,38-46`. On an expired admin session or a database 500, the API returns `{ error }`; the page does not check `res.ok`, sets `leads` to `[]` and `total` to `0`, then renders the empty queue. **Severity: `silent-failure`.**
4. **Export and conversion rate omit older leads** — `app/admin/leads/page.tsx:50,121-132,180-189` and `app/api/admin/leads/route.ts:15-18,29-46`. With more than 200 leads, the page fetches only the first 200, exports only those rows, and divides the enrolled count from that slice by the all-time database total. The exported CSV and enrollment rate are incomplete without a partial-data warning. **Severity: `data-integrity`.**

## 2. Colleges

Traced `/colleges` filters/pagination, the active-college profile and review/program joins, compare API, and client-side cost calculator. Directory query failures have a dedicated error state; missing programme and fee rows are displayed as missing data rather than invented prices. Comparison rejects query errors before assembling details.

1. **Fee ceiling silently ignored without period** — `app/(main)/colleges/page.tsx:289-303` (`getColleges`) and `components/colleges/CollegeFilters.tsx:149-152`. Submitting “Under NPR 2.5 lakh” while leaving “Fee period” at its default generates `maxFee=250000`, but the query applies no fee ceiling unless `feePeriod` is also set. The selected filter appears active while unaffordable colleges remain in results. **Severity: `breaks-a-student-flow`.**
2. **Freshness misses the full first overdue day** — `lib/evidence-freshness.ts:12-17` (`evidenceFreshness`), used by `app/admin/evidence/page.tsx:15-16`. For a one-day `admission_deadline` policy, a check performed 47 hours ago has `ageDays = 1`, so `stale` is false until 48 hours have elapsed. Future-dated checks also clamp to age zero and appear fresh. **Severity: `data-integrity`.**
3. **Profile join failure removes approved reviews from view** — `app/(main)/colleges/[slug]/page.tsx:78-89,109-124` (`getCollege`). If the `reviews` select fails while the college select succeeds, the page silently substitutes `[]` and shows no approved reviews; there is no review-specific failure notice. The same fallback applies to programmes and evidence. **Severity: `silent-failure`.**

Checked pagination ordering uses a stable `id` tie-breaker and a bounded multi-batch fetch (`app/(main)/colleges/page.tsx:211-251,327-331`). The 5,000-college ceiling is a capacity decision rather than a current bug without evidence that the directory has reached it. The cost calculator clamps numeric input and labels its city/living assumptions (`app/(main)/tools/college-cost-calculator/page.tsx:8-25,31-36`); no confirmed calculation defect was found.

## 3. Admissions

Traced public list/detail, `admissionState`/deadline parsing, private planner page, and authenticated planner API. Signed-out planner access displays a sign-in prompt and printable checklist; planner API writes bind to the authenticated user ID.

1. **List outage presented as no admissions** — `app/(main)/admissions/page.tsx:20-35,70-79` (`getAdmissions`). Any Supabase select error is logged but replaced by `[]`; students see “No matching admissions” rather than a loading failure. **Severity: `breaks-a-student-flow`.**
2. **Upcoming items counted as open** — `app/(main)/admissions/page.tsx:38-41` and `lib/admissions.ts:22-26`. An admission with `application_open_at` next month and an unexpired deadline is counted in “Open” because the list uses `deadlineState(deadline)` instead of `admissionState(item)`; a student can infer applications are open even though the detail page labels the item upcoming. **Severity: `data-integrity`.**
3. **Invalid deadline can crash calendar download** — `app/api/admissions/[id]/calendar/route.ts:5-7,12-17`. A published admission with a non-null but malformed deadline passes the null guard, then `toISOString()` throws in `allDayStamp`/`nextDayStamp`. The student receives a server failure instead of an explanatory unavailable-date response. **Severity: `breaks-a-student-flow`.**
4. **Deadline edit can lose its audit history** — `app/api/admin/admissions/[id]/route.ts:15-23`. The admission is updated first; the following `admission_deadline_history.insert()` result is ignored. If that insert fails, the API still returns success and the public deadline changes without its advertised change-history entry. **Severity: `data-integrity`.**

The planner's `GET`, `POST`, and `DELETE` distinguish signed-out, missing setup, and database failures (`app/api/admission-planner/route.ts:11-73`), and its UI rolls back failed optimistic mutations (`app/(main)/admissions/planner/page.tsx:21-30`). No additional confirmed planner persistence defect was found.

## 4. Scholarships / opportunities

Traced both public list queries, deadline/status filters, source links, and empty/error UI. Scholarships has an explicit “No matching scholarships” state when no rows exist; both pages show a separate database-error state. No current row count was inferred from code.

1. **Scholarship deadline date can close early** — `app/(main)/scholarships/page.tsx:18-25,40-44`. When a `deadline` is a date-only string, the list's SQL `gte` filter compares it to the current timestamp before the card's day-level “Closes today” logic runs. On the deadline day after midnight, an otherwise open scholarship is omitted from the default “Open or date pending” list. **Severity: `breaks-a-student-flow`.**
2. **Same date-only mismatch for opportunities** — `app/(main)/opportunities/page.tsx:17-24`. A date-only deadline equal to today is filtered with `deadline.gte.<current ISO timestamp>`, so it can disappear before the UI's day-level logic would label it “Closes today.” **Severity: `breaks-a-student-flow`.**

Both pages validate outbound URLs to HTTP(S) before rendering application buttons (`scholarships/page.tsx:16,65`; `opportunities/page.tsx:15,29`). The scholarships schema-fallback path announces limited matching rather than silently presenting matches (`scholarships/page.tsx:46-64`).

## 5. Results / notices / news

Traced listing queries through detail pages, embedded PDF viewer, image/direct-source fallbacks, and news topic pages. Detail pages are dynamic. The viewer provides direct Download/Open links, but those links cannot repair an unavailable official asset.

1. **Data outage becomes an empty publication list** — `app/(main)/results/page.tsx:26-36`, `app/(main)/notices/page.tsx:25-35`, `app/(main)/news/page.tsx:26-32`, and `app/(main)/news/topic/[topic]/page.tsx:25-43`. Each query discards `error` and turns null data into `[]`; a Supabase outage or schema error displays no results/notices/news as if nothing was published. **Severity: `breaks-a-student-flow`.**
2. **University filters miss rows beyond the newest 100** — `app/(main)/results/page.tsx:31-50` and `app/(main)/notices/page.tsx:30-41`. The query limits to 100 globally, then applies university/program filters in JavaScript. If TU fills the newest 100 rows, an older KU result or notice exists but `/results?university=KU` or `/notices?university=KU` shows none. **Severity: `breaks-a-student-flow`.**
3. **Broken PDF can be marked loaded** — `components/results/PdfViewer.tsx:16-35,83-131`. The fallback to Google Docs depends on the iframe `onError` event; an HTTP 404 or browser-generated error page can still fire `onLoad`, which clears loading/error state and leaves an unusable preview. This matters for expired university PDF URLs. **Severity: `breaks-a-student-flow`.**

Undated notices do not receive a fabricated publication date in the detail view (`app/(main)/notices/[slug]/page.tsx:86-91`). They are ordered by `published_date` in the listing, but the audit cannot establish the live distribution of null dates without production data; do not infer it from prior notes.

## 6. My Path

Traced signed-out page, authenticated `GET`/`POST`, stage-specific task persistence, saved-college links, and the saved-list deletion endpoint. The page has an explicit login state, a zero-saved-places state, partial-data warnings, and an error/retry state; the saved-list delete button disables only while that college is being removed and removes it from UI after server success.

1. **Stage-matched deadlines can be hidden by pre-filter limit** — `app/api/my-path/route.ts:26-30,43-69`. Each source selects at most 40 earliest records before filtering by education stage. If the first 40 admissions are for other stages, a valid later +2 deadline is absent from “Upcoming admissions” and “Nearest deadline.” **Severity: `breaks-a-student-flow`.**
2. **Rolling opportunities never enter recommendations** — `app/api/my-path/route.ts:27-29,52-56`. Scholarships and opportunities are queried with `.gte('deadline', today)`, excluding null deadlines that the public listings explicitly present as pending/rolling. A relevant undated opportunity is therefore absent from My Path even when published. **Severity: `minor`.**

Saved-college API filters by the signed-in user and active college status (`app/api/saved-colleges/route.ts:24-36`; `app/api/saved-colleges/[id]/route.ts:18-35`). A same-device double-click can launch two deletes before React's `removing` state commits, but the endpoint is idempotent and no confirmed data corruption follows; no finding is asserted for that edge.

## 7. Search

Traced `/search` input, smart-filter link, `GET /api/search`, and its Supabase selects. Empty/one-character queries are rejected with a visible message; SQL-significant punctuation and wildcard characters are normalised before `.or()` filters; each failed section is named in `unavailable` rather than silently omitted.

1. **Smart fee budget is not applied** — `app/(main)/search/page.tsx:41-54` (`smartCollegeSearch`) and `app/(main)/colleges/page.tsx:289-303`. Searching “BCA under 2 lakh” offers a smart college link with `program=bca&maxFee=200000` but no `feePeriod`; the directory ignores the budget and can list colleges above it. **Severity: `breaks-a-student-flow`.**
2. **Program-linked colleges with null status are excluded** — `app/api/search/route.ts:37,59-71`. Direct college-name search accepts `status IS NULL`, but the second search path that finds colleges through matching programs requires `college.status = active`. An otherwise public legacy college with null status is missing from a program search. **Severity: `minor`.**

Long input is truncated server-side to 80 characters (`app/api/search/route.ts:9-16`); no confirmed query-parser injection was found in this path.

## 8. Accounts

Traced email registration/login, Google OAuth callback, claim submission, representative dashboard, and saved colleges. Duplicate email signup maps to 409 (`app/api/auth/register/route.ts:20-29`); wrong credentials return 401 (`app/api/auth/login/route.ts:4-12`). Claim POST accepts only `entity_type: college`, and institution lookup no longer exposes a school-claim type (`app/api/claims/route.ts:6-10`).

1. **Email registration confirms unowned addresses** — `app/api/auth/register/route.ts:20-25`. The server calls `auth.admin.createUser` with `email_confirm: true` before proving the requester controls the address. Someone can register another person's email, obtain an active account under it, and block the owner from registering that address. **Severity: `data-integrity`.**
2. **Sign-in return destination is discarded** — `app/(main)/account/login/page.tsx:19-22,31-36,39-55,73`, `components/auth/GoogleSignInButton.tsx:21-32`, and `app/auth/callback/route.ts:12-17`. `/account/login?next=%2Fadmissions%2Fplanner` always goes to `/` after email sign-in; the Google button on the login page is also hard-coded to `next="/"`, and the callback ignores `next` even when supplied. A student signing in from a planner or saved-colleges prompt must navigate back manually. **Severity: `breaks-a-student-flow`.**
3. **Created account can be mistaken for a signed-in session** — `app/api/auth/register/route.ts:32-36` and `app/(main)/account/login/page.tsx:47-55`. If account creation succeeds but password sign-in fails, registration returns HTTP 201 with `{ error }`; the form checks only `response.ok` and redirects home although no session was established. **Severity: `breaks-a-student-flow`.**
4. **Claim page has no network-error path** — `app/(main)/account/claim/page.tsx:5` (`submit` and search effects). If `/api/claims` or `/api/institutions` fails to fetch, the promise rejection is not caught. Claim submission leaves the user without an error message and can be retried blindly; search can appear empty rather than unavailable. **Severity: `silent-failure`.**

Whether Supabase Auth's own failed-password throttling is enabled in production is a deployment setting not visible here; the repository's login route has no application-level rate limiter (`app/api/auth/login/route.ts:4-12`). This is **needs a decision / production configuration check**, not a claimed exploitable bug from code alone.

## 9. Community

Traced public post/comment reads, identity gate, new-post/reply writes, votes, reports, admin moderation, and schema defaults. `community_posts` and `community_comments` default to `pending` (`supabase/migrations/20261003_anonymous_student_community.sql:4-22`); public pages select only `published` (`app/(main)/community/page.tsx:14-29`; `[id]/page.tsx:19-36`). New content is therefore gated before moderation. Public selects expose aliases, not `author_id`; admin-only routes fetch private identities behind `isStaff`.

1. **Report moderation can leave a hidden target with an open report** — `app/api/admin/community/route.ts:60-72` (`PATCH`). For `hide-target`, the target post/comment is set to `hidden` first, then the report is set to `resolved`. If the second update fails, the API reports failure but the content is already hidden, and the report remains in the open queue; a retry may repeat the action. **Severity: `data-integrity`.**

Posting/replying require an authenticated Google account, an active public alias, safety checks, and rate checks (`app/api/community/posts/route.ts:18-60`; `posts/[id]/comments/route.ts:7-31`). Reporting confirms the target is published, prevents duplicate open reports, and writes to the admin-visible `community_reports` queue (`app/api/community/reports/route.ts:18-35`; `app/api/admin/community/route.ts:16-42`). No confirmed public identity leak was found in these paths.

## 10. Admin tools (spot-check)

Spot-checked evidence ledger, fixed-source bulk publish, ingestion approval, corrections, and institution claims. Most mutations use a server-side admin client after a staff check; corrections only change review status, not public content (`app/api/admin/corrections/[id]/route.ts:7-13`).

1. **Ingestion approval can publish twice on retry** — `app/api/admin/ingestion/[id]/route.ts:19-21,54-58,85-92`. For a new queue item, the route inserts a public result/notice/news row before marking the queue item approved. If the queue update fails, the API returns 500 while the content remains public and the queue item remains pending. A retry inserts another public row because `published_record_id` was never saved. **Severity: `data-integrity`.**
2. **Claim can grant membership while still pending** — `app/api/admin/claims/[id]/route.ts:7-9`. Approval upserts `institution_memberships` first, then updates `institution_claims.status`. If the status update fails, the API returns an error yet the user already has representative access; the claim still appears pending. **Severity: `data-integrity`.**
3. **Evidence recheck can mark an old source current** — `app/api/admin/evidence/[id]/route.ts:9-16` and `lib/evidence-freshness.ts:12-17`. The `recheck` action advances `checked_at` to now without requiring a new source URL or validation result. One click makes a stale deadline/fee claim appear current in the ledger even if no source was actually inspected. **Severity: `data-integrity`.** This may be an intended editor attestation; if so, the workflow needs an explicit recorded attestation/evidence standard. **Needs a decision.**

The fixed-source bulk publish endpoint is narrowly scoped by source, extraction method, pending status, and non-superseded state (`app/api/admin/evidence/bulk-publish/route.ts:5-27`); no unbounded arbitrary-record publish path was found there.

## Fix these first

1. **Accounts — verify ownership before activating email registrations** (`app/api/auth/register/route.ts:20-25`). This prevents address impersonation and account preemption at the identity boundary.
2. **Admin tools — make ingestion publish and queue approval atomic or idempotent** (`app/api/admin/ingestion/[id]/route.ts:54-92`). This prevents duplicate public records when a partially successful approval is retried.
3. **Apply Now — do not let one browser's localStorage block another student; make admin lead failures visible** (`components/colleges/ApplyNowButton.tsx:19-74`; `app/admin/leads/page.tsx:48-64`). This protects the primary enquiry/revenue flow on shared devices and during admin-session expiry.
4. **Scholarships/opportunities — align date-only deadline filtering with the “Closes today” display** (`app/(main)/scholarships/page.tsx:18-25,40-44`; `app/(main)/opportunities/page.tsx:17-24`). This prevents live closing-day opportunities from disappearing.
5. **Results/notices/news — surface database failures and filter before limiting** (`app/(main)/results/page.tsx:26-50`; `app/(main)/notices/page.tsx:25-41`; `app/(main)/news/page.tsx:26-32`). This prevents false-empty updates and missed university-specific results.
