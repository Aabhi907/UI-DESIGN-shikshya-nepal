## Student outcome

A database hiccup on a result, notice or news page used to look exactly like the page not existing — a student could reasonably give up on a real result. It now shows the real "temporarily unavailable, try again" state instead. Separately, a student who subscribed for result alerts has never actually received one (the wiring to send them was broken); once someone confirms one remaining data point (below), approving a result will email subscribers once and only once. A scraper going quietly broken with nobody finding out, and one automated path that could put a page live with no human check, are both closed off.

## Narrow scope

**Included:**
- `results/[slug]`, `notices/[slug]`, `news/[slug]`: distinguish a query error (throw → real error screen) from a genuine empty result (`notFound()`); same distinction in `generateMetadata`, which never itself throws; `news/[slug]` now selects explicit columns instead of `select('*')`.
- New `lib/result-alerts.ts`: the subscriber-alert sending logic, moved out of the old scraper-facing endpoint, keyed on a result's own id, called once from the one place a result is published.
- `scrapers/run_all.py`: exits 1 on a scraper crash or a scraper that fetched nothing while reporting errors; the dead `notify_subscribers`/`new_records` code is removed.
- `.github/workflows/scrapers.yml`: the step is allowed to fail normally (no `continue-on-error`, no broken exit-code capture); unused `ONESIGNAL_*` secrets dropped.
- `scrapers/college_newsroom.py` + `scrapers/base_scraper.py`: newsroom auto-publish now requires both the source config **and** an explicit `SCRAPER_AUTO_PUBLISH=1` environment variable that nothing sets.
- Deleted `app/api/notify-subscribers/route.ts` (see "publish paths" below for why).
- New tests: `scripts/test-w2-updates.mjs`, `scrapers/tests/test_no_auto_publish.py`.

**Deliberately not included:** no visual/UI changes; `lib/ingestion-review.ts` and `lib/email.ts` were read but not changed — the alert call fits cleanly after `applyIngestionReview` returns, and `lib/email.ts`'s sending code is reused as-is, not modified; `lib/auth.ts`, `middleware.ts`, `lib/supabase.ts`, `components/admin/NoticeForm.tsx`, navigation/footers, community files, `app/admin/reviews/**` and all migrations are untouched, per this brief's boundaries.

## Data, permissions and sources

No schema change, no migration, no new dependency, no change to who can read or write what. `notification_delivery_runs` now receives one row per published result (`item_count: 1`) instead of one row per scraper batch — same table, same columns, same admin display page (`app/admin/subscribers/page.tsx`, unread here).

## Publish paths found

Grepped for every write to the `results` table and every caller of `/api/notify-subscribers`:

- **The only path that publishes a result:** `app/api/admin/ingestion/[id]/route.ts` → `lib/ingestion-review.ts`'s `applyIngestionReview()`, on `PATCH .../ingestion/:id` with `status: 'approved'`. There is no separate `/admin/results` or `/api/admin/results` — results only ever go live through the editor queue. This is the one place `sendResultAlertForApproval` is called.
- **The only caller of `/api/notify-subscribers`:** `scrapers/run_all.py`'s `notify_subscribers()`, now removed. `middleware.ts` (out of scope for this brief) still names the route once, in its CSRF-origin-check exemption list — a harmless stale reference now that the route is gone, left as-is since `middleware.ts` isn't in this brief's file list. No other route, page, or script calls it. **`NOTIFICATION_SECRET` can now be removed from both Vercel and GitHub Actions secrets** — nothing reads it anymore (the workflow's own env line for it was left in place, since removing it wasn't asked for and it's inert either way).

## Consumer-protection gate

Read `lib/email.ts` and the subscriber query end to end.

1. **Only confirmed, not-unsubscribed subscribers selected — pass.** `sendResultNotification` queries `.eq('is_active', true)`; `/api/unsubscribe` correctly flips this to `false`. Note: this is a single-opt-in system — `/api/subscribe` sets `is_active: true` immediately on form submission, with no separate email-confirmation step anywhere in the codebase. "Confirmed" here means "submitted the opt-in form and never unsubscribed," which is what the query enforces; there's no double opt-in to fall back on if a stricter definition was intended.
2. **Each email carries a working unsubscribe link — cannot confirm; treated as failing.** `/api/subscribe`'s insert (`{ email, is_active: true }`) never sets a `token` value, and `sendResultNotification` embeds `sub.token ?? ''` in every unsubscribe link. The `subscribers` table's own `CREATE TABLE` is not in any migration (it predates the migrations folder), so whether `token` has a database-level default that fills it in cannot be confirmed by reading the repo — and this work is not permitted to query production to check. **One check would resolve this:** `SELECT column_default FROM information_schema.columns WHERE table_name = 'subscribers' AND column_name = 'token';` run in the Supabase SQL editor. If that returns a real default (e.g. `gen_random_uuid()`), every subscriber has a working token and this item is clear. If it returns null, every existing subscriber's unsubscribe link is broken and needs a one-time backfill before sending turns on.
3. **No personal data beyond the recipient's own address — pass.** The email body only contains public result data (title, slug, university short name) plus the recipient's own email and token in their own unsubscribe link; nothing about any other subscriber.

**Because of #2, sending stays off.** `lib/result-alerts.ts` exports `sendResultAlertForApproval`, fully built and tested, gated behind `const RESULT_ALERTS_ENABLED = false`. Flip it to `true` once the query above confirms `token` is populated (backfilling any null tokens first, if needed) — nothing else needs to change.

## Failure behaviour

- A query error on a detail page throws (error boundary), never a 404; a metadata error falls back to a generic title, never a crash, never "not found" for a real error.
- The publish itself never fails because of email: a failing send is caught, logged with the result id only (never subscriber data), recorded as a failed delivery run, and reported to the admin as `alert: 'failed'` — the approval itself still returns success.
- A crashed scraper, or one that fetched nothing while reporting errors, now fails the GitHub Actions job (triggering GitHub's own failure email) instead of the run always reporting success.

## Evidence of success

`npm run test:w2-updates` (35 assertions) and `python3 -m unittest discover -s scrapers/tests` (30 tests, 9 new) — both pass. Also passing, unchanged: `npm run test:public-list-errors`, `test:w1-params-and-dates`, `test:private-columns`, `test:rate-limit-actions`, `check:queries`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.

**Tautology proof** — each fix below was reverted individually, the relevant test failed with the message shown, then the fix was restored and the full suite re-verified green:

1. results/[slug] throw-on-error → *"a query error must throw the real error, not call notFound()"*
2. results/[slug] generateMetadata fallback → uncaught rejection surfacing the raw `{ message: 'database unavailable', code: '57P03' }` instead of a generic title (process exits 1)
3. notices/[slug] throw-on-error + metadata fallback (reverted together) → same throw-not-notFound failure
4. news/[slug] throw-on-error + metadata fallback (reverted together) → same throw-not-notFound failure
5. news/[slug] explicit column list → *"must not select('\*') — use the explicit column list the page renders"*
6. result-alerts.ts event-key dedup (`23505` handling) → re-approval returns `'failed'` instead of `'skipped'` (fails the "called exactly once" check)
7. result-alerts.ts inner try/catch around the send → *"must record a failed delivery run"* (the outer catch alone still returns `'failed'` but never closes out the delivery run)
8. result-alerts.ts `RESULT_ALERTS_ENABLED` gate → *"disabled: expected 'skipped', got 'sent'"*
9. ingestion route's `target_type === 'result'` gate → *"notice: approving a notice must send no result alert"*
10. run_all.py exit-code logic → both new Python exit-code tests fail (`FAILED (failures=2)`)
11. college_newsroom.py `auto_publish_low_risk` → *"auto_publish_low_risk: True found in: ['college_newsroom.py']"*
12. base_scraper.py `SCRAPER_AUTO_PUBLISH` gate → *"test_does_not_publish_without_the_env_var"* fails (it publishes anyway)

Not independently revert-tested: the workflow YAML's `continue-on-error` removal and the scraper-side deletions (`notify_subscribers`, the old route) — these are structural removals with no natural "revert and watch a test fail" shape; verified instead by reading the resulting file and by the full suite (including a build) staying green with them gone.

## Founder smoke-test list

- Open a real result, notice and news page.
- Open a non-existent slug on each — should show the 404, not an error screen.
- Next time a result is approved from the queue: check one new row lands in `notification_delivery_runs`, and — once `RESULT_ALERTS_ENABLED` is turned on per the gate above — that each of the current subscribers gets exactly one email.
- On the next scheduled scraper run: confirm the Actions run goes green, or red if a source is genuinely down.

## Validation

- [x] Ran the full required check suite (listed under Evidence of success) — all pass.
- [x] Tested meaningful loading/empty/error states — covered by the new tests; no visual change was made, so no desktop/mobile pass was done.
- [x] No migration needed — no schema change.
- [x] No secrets, personal data, unlicensed assets, placeholders or unsupported claims were introduced.
- [x] Consumer-protection gate run in full — see above; sending stays off pending one founder-side check.

## Files changed

- `app/(main)/results/[slug]/page.tsx`
- `app/(main)/notices/[slug]/page.tsx`
- `app/(main)/news/[slug]/page.tsx`
- `app/api/admin/ingestion/[id]/route.ts`
- `app/api/notify-subscribers/route.ts` (deleted)
- `lib/result-alerts.ts` (new)
- `scrapers/run_all.py`
- `scrapers/college_newsroom.py`
- `scrapers/base_scraper.py`
- `scrapers/tests/test_no_auto_publish.py` (new)
- `.github/workflows/scrapers.yml`
- `scripts/test-w2-updates.mjs` (new)
- `package.json` (one new script line)
