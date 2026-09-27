## Student outcome

Five trust/safety quick wins (Build Brief 36, Wave 2 / Stream 3):

1. Every safety, privacy, appeal, copyright, billing and general-enquiry address on the site pointed at `@sikshyanepal.com`, a domain we don't own — a student's safety message, including the community's only appeal route, went nowhere. All of these now go to the working `safety_privacy_reports` form (pre-selecting a category) or the `data_corrections` flow, and the contact page says plainly that the forms are the way to reach us for now.
2. Community (one moderator, posting already broken, heaviest child-safety load on the site) is now fully closed: the feed/compose UI is replaced with a calm notice, every create endpoint 503s before touching the database, and the nav/footer entry points are removed. Existing members can still manage and delete their own content, and the report/appeal/admin-moderation routes are untouched.
3. A moderator could grant a "verified student" badge without ever seeing evidence. That action is now paused (409 from the API, no button in the admin UI) until real evidence review exists.
4. The Nepali toggle sat in primary nav pointing at a single translated page; every other `/ne` link dropped back to English. It's moved to the footer.
5. `news` and `scholarships` still had `USING (true)` public read policies (a known, deliberately deferred gap from `20261024_lock_down_database_surface.sql`). They're now restricted to published/active rows for `anon` and `authenticated`.

## Narrow scope

Only the five items above. Deliberately **not** included: registering the real domain, reopening Community, building the evidence-review tooling verification will eventually need, or translating additional `/ne` pages. Touched only the files the brief listed, plus three small, necessary supporting files it didn't enumerate (see "Files changed" — all in direct service of the brief's own instructions, nothing extra).

**Correction to a brief assumption:** D8 says to "put [the language switch] in the footer that is actually rendered," implying one footer is live. In fact `components/layout/MainChrome.tsx` renders **both** `components/layout/Footer.tsx` and `components/design-system/Footer.tsx`, switched per-route by `isConvertedRoute()` (home, colleges, programs, scholarships, news, notices, results, etc. get the design-system footer; everything else, including all the policy pages this brief touches, gets the original one). Both are genuinely live, so the language switch — and the Community-link removal, and the dead-address fix — went into both.

## Data, permissions and sources

- New migration `supabase/migrations/20261026_published_only_news_scholarships.sql`: replaces the `news`/`scholarships` public read policies (see below).
- No other table/schema change.
- API behaviour change: `POST /api/community/posts`, `POST /api/community/posts/:id/comments`, `POST /api/community/vote`, `PUT /api/community/me` now return `503` unconditionally (community closed). `PUT /api/admin/reviews/:id` now returns `409` when `verification_status` is set to `verified`.
- Not an education-fact change; no official source URLs apply.

## Failure behaviour

- **Community closed:** every create route checks `COMMUNITY_OPEN` (from the new `lib/community-status.ts`) as its first statement and returns `503` with "Community is closed while we finish safety work." before creating any Supabase client or touching auth. `my-content` (view/delete own content), `app/api/community/reports` (content reports/appeals) and all `app/api/admin/community/**` moderation routes are untouched and keep working.
- **Verification pause:** `PUT /api/admin/reviews/:id` rejects a verify request with `409` before calling `getAuthContext()` or `createAdminSupabaseClient()`. Approve (`is_approved`) and reject (`verification_status: 'rejected'`) are untouched and keep working. There are 0 verified reviews live today, so nothing needed unsetting.
- **Migration:** if a public read of `news`/`scholarships` had been missed, the affected page would simply stop showing unpublished/inactive rows it currently (incorrectly) shows — not a crash. Every current public (anon-key) read was audited below and already filters correctly, so the visible site is unchanged. One admin-only read does not filter (flagged below, not fixed).

## Evidence of success

- `scripts/test-w2-trust.mjs`: **21 assertions, all passing.**
- Tautology-proven: each fix was reverted individually, the test failed, then it was restored (see "Tautology proof" below).
- Full acceptance suite run clean (see "Validation").

## Validation

- [x] Tested the changed flows (contact/safety/privacy report links, Community closed notice, admin reviews screen) by reading the rendered output of the real page/route source in the test harness at both narrow and default widths' worth of markup (no live browser in this sandbox — see note below).
- [x] Keyboard/touch: no new custom interactive controls were added; the moved `LanguageSwitch` keeps its existing link-based (keyboard-reachable) markup and gained `min-h-11` touch targets it lacked in its old nav placement.
- [x] Ran lint, production build and `git diff --check`; see command output below. (No dedicated link-checker/copy-checker script exists in this repo beyond what's listed in Acceptance checks.)
- [x] Added a new migration rather than editing an applied one.
- [x] No secrets, personal data, unlicensed assets, placeholders or unsupported claims introduced.

Note: this sandbox has no browser, so "tested on desktop and narrow mobile" is by inspection of the Tailwind classes (`min-h-11`, responsive `sm:`/`flex-col`/`flex-row` pairs already used elsewhere on the same pages) rather than a live viewport screenshot. Flagging per CLAUDE.md's rule to record as a follow-up rather than guess: **the founder should eyeball `/contact`, `/community`, and the footer language switch on an actual phone-width viewport before merging.**

### Commands run (all clean)

```
npm run check:queries               → Query guard passed.
npm run test:public-list-errors     → 76 assertions passed.
npm run test:w1-params-and-dates    → 52 assertions passed.
npm run test:private-columns        → Static checks passed; 30 public reads found.
npm run test:rate-limit-actions     → Rate-limit checks passed.
npm run test:w2-trust               → 21 assertions passed. (new)
npx tsc --noEmit                    → no output, no errors.
npm run lint                        → No ESLint warnings or errors.
npm run build                       → succeeded, exit 0.
```

## Public reads of `news` and `scholarships` (audit)

Every public-client read (`createServerSupabaseClient`, the anon-key client subject to RLS) of `news` or `scholarships`, and its filter:

| File | Table | Filter |
|---|---|---|
| `app/sitemap.ts` | news | `status = 'published'` ✓ |
| `app/news/feed.xml/route.ts` | news | `status = 'published'` ✓ |
| `app/(main)/news/page.tsx` | news | `status = 'published'` ✓ |
| `app/(main)/news/[slug]/page.tsx` | news | `status = 'published'` ✓ |
| `app/(main)/news/topic/[topic]/page.tsx` | news | `status = 'published'` ✓ |
| `app/(main)/colleges/[slug]/page.tsx` | news (sidebar) | `status = 'published'` ✓ |
| `app/api/search/route.ts` | news | `status = 'published'` ✓ |
| `app/(main)/scholarships/page.tsx` | scholarships (both the primary query and the `42703` fallback) | `is_active = true` ✓ |
| `app/(main)/deadlines/page.tsx` | scholarships | `is_active = true` ✓ |
| `app/(main)/programs/[slug]/page.tsx` | scholarships | `is_active = true` ✓ |
| `app/(main)/colleges/[slug]/page.tsx` | scholarships | `is_active = true` ✓ |
| `app/api/search/route.ts` | scholarships | `is_active = true` ✓ |

**All already filter correctly — the public site shows exactly what it shows today.**

Admin/service-role reads (`createAdminSupabaseClient`, bypasses RLS entirely, unaffected by this migration either way): `app/admin/page.tsx`, `app/api/admin/content-quality/route.ts`, `app/api/admin/news/**`, `app/admin/news/[id]/edit/page.tsx`, `app/api/admin/scholarships/**`, `app/api/colleges/compare/route.ts`, `app/api/my-path/route.ts`. Listed for completeness; not part of the "public client" audit and not changed.

**One flagged gap, not fixed (outside this brief's file list):** `app/admin/scholarships/[id]/edit/page.tsx` reads its scholarship via `createServerSupabaseClient()` (the anon-key client) with **no `is_active` filter**. Today that's harmless because the old policy was `USING (true)`. After this migration ships, opening that admin edit page for an **inactive** scholarship will 404 (RLS will hide the row from the anon-key client). Recommend a follow-up swapping it to `createAdminSupabaseClient()`, matching the equivalent news edit page (`app/admin/news/[id]/edit/page.tsx`), which already uses the admin client correctly.

## Category mapping gap (D6)

The `safety_privacy_reports` form's `concern_type` only allows `safety | privacy | other`, and `source_page` only `safety | privacy`. Appeal, copyright, billing and general/editorial enquiries have no matching category, so they all map to `other` (no database values were added, per instructions):

| Link label | Page | `concern_type` |
|---|---|---|
| Report a safety concern | `/safety` | `safety` |
| Report a privacy concern | `/privacy` | `privacy` |
| Appeal a moderation decision | `/safety?concern_type=other` | `other` |
| Copyright / takedown request | `/privacy?concern_type=other` | `other` |
| Advertising and billing | `/privacy?concern_type=other` | `other` |
| General / editorial enquiries | `/privacy?concern_type=other` | `other` |

`ReportConcernForm` now reads `concern_type` from the query string (falling back to its existing `defaultConcernType` prop) to preselect the dropdown; the message field lets the student say more (e.g. "this is a copyright request…").

"Something is wrong on a page" (data correction) links to the existing `ReportCorrectionForm`, which only mounts on college profile pages (it requires a specific `entity_id`); the contact page points there by name rather than linking a generic route that doesn't exist.

## Migration verification query

Run after the founder applies the migration:

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('news', 'scholarships')
ORDER BY tablename, policyname;
```

Expected: exactly one SELECT policy per table — `Public read published news` (`{anon,authenticated}`, `qual: status = 'published'::text`) and `Public read active scholarships` (`{anon,authenticated}`, `qual: is_active = true`). The old `Public read news` / `Public read scholarships` rows should no longer appear.

## Undo SQL

```sql
BEGIN;
DROP POLICY IF EXISTS "Public read published news" ON news;
CREATE POLICY "Public read news" ON news FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "Public read active scholarships" ON scholarships;
CREATE POLICY "Public read scholarships" ON scholarships FOR SELECT TO anon USING (true);
COMMIT;
```

## Other `@sikshyanepal.com` occurrences found by grep (not fixed)

- `supabase/migrations/20261022_safety_privacy_reports.sql` — a SQL comment in an already-applied, historical migration. Not user-facing; migrations other than the new one are explicitly off-limits for this brief.
- `docs/SEO_LAUNCH_CHECKLIST.md` — a docs file, not under `app/`, `components/` or `lib/`, and not in the file list for this brief.

Both are outside this brief's scope per its own rules and are left unfixed, as instructed.

## Tautology proof

Each fix was reverted individually, `npm run test:w2-trust` was confirmed to fail, then the file was restored from an untouched backup (verified byte-identical via `diff`/`git status` afterward — final state has no unintended changes):

1. **`lib/community-status.ts`: `COMMUNITY_OPEN = false` → `true`.** Failure: `AssertionError: COMMUNITY_OPEN must be false for this brief (community stays closed)`.
2. **`app/api/community/posts/route.ts`: removed the `if (!COMMUNITY_OPEN) return NextResponse.json(...)` guard.** Failure: the route fell through to `getAuthContext()`, which is a tripwire in this test — `AssertionError: app/api/community/posts/route.ts: threw instead of returning 503 while COMMUNITY_OPEN is false (@/lib/auth.getAuthContext must not be touched here)`.
3. **`app/api/admin/reviews/[id]/route.ts`: removed the `verification_status === 'verified'` → 409 check.** Failure: the route fell through to `getAuthContext()` (also a tripwire for this scenario) — `Error: getAuthContext must not be called when rejecting a verify request`.
4. **Re-added a dead address** (`safety@sikshyanepal.com` in a comment appended to `app/(main)/contact/page.tsx`). Failure: `AssertionError: Dead @sikshyanepal.com address(es) found: app/(main)/contact/page.tsx`.
5. **Re-added the Community link** to `components/design-system/Nav.tsx`. Failure: `AssertionError: Nav.tsx must not link to Community`.

## Smoke-test list for the founder

- The homepage nav and footer (Community gone from both; language switch in the footer).
- `/news` and a news article (unchanged).
- `/scholarships` and a scholarship (unchanged).
- `/contact`, and one report submitted through it (then deleted in `/admin/safety-reports`).
- `/community` (should show the closed notice, not the feed).
- The admin reviews screen (`/admin/reviews`) — no Verify button, one-line note instead.
- The language switch in the footer (not in the main nav).

## Files changed

**The 11 files from step 1:**
`app/(main)/community/guidelines/page.tsx`, `app/(main)/community/my-content/page.tsx`, `app/(main)/contact/page.tsx`, `app/(main)/copyright/page.tsx`, `app/(main)/refunds/page.tsx`, `app/(main)/terms/page.tsx`, `app/admin/safety-reports/page.tsx`, `components/community/CommunityIdentityGate.tsx`, `components/community/PolicyPage.tsx`, `components/design-system/Footer.tsx`, `components/layout/Footer.tsx`.

**Necessary supporting files (not in the original 11, in direct service of D6's "pre-select a category through a query param" instruction):**
`components/trust/ReportConcernForm.tsx`, `app/(main)/safety/page.tsx`, `app/(main)/privacy/page.tsx`.

**Community closed (D2):**
`lib/community-status.ts` (new), `app/(main)/community/page.tsx`, `app/(main)/community/[id]/page.tsx`, `app/api/community/posts/route.ts`, `app/api/community/posts/[id]/comments/route.ts`, `app/api/community/vote/route.ts`, `app/api/community/me/route.ts`, `components/design-system/Nav.tsx`.

**Verification pause (D3):**
`app/admin/reviews/page.tsx`, `app/api/admin/reviews/[id]/route.ts`.

**Language switch (D8):**
`components/design-system/LanguageSwitch.tsx` (new), `components/design-system/Nav.tsx`, `components/design-system/Footer.tsx`, `components/layout/Footer.tsx`.

**Migration:**
`supabase/migrations/20261026_published_only_news_scholarships.sql` (new).

**Test:**
`scripts/test-w2-trust.mjs` (new), `package.json` (one new script line).

**Not part of the app, produced for this PR:**
`w2-trust.diff`, `w2-trust-pr.md`.
