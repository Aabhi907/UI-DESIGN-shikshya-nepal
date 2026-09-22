# System operating model

**Last reviewed:** 20 September 2026
**Purpose:** Keep SikshyaNepal reliable as usage grows without adding infrastructure because it sounds advanced.

## The system today

SikshyaNepal runs as a Next.js application on Vercel with Supabase for PostgreSQL, Auth, Row Level Security and Storage. GitHub Actions collects approved source material on a schedule. Resend delivers transactional email and result alerts when configured.

This is intentionally a small, managed architecture. Vercel handles request distribution and Supabase Auth stores sessions outside an individual application instance, so a user is not tied to one server. It is sufficient for the present product. Do not add Redis, read replicas, a queue service or database sharding without a measured problem that one of those tools actually solves.

## Correctness comes before speed

These values must be current for the request that uses them:

- Sign-in state, permissions and account data.
- A student's saved items, My Path and admission planner.
- A form submission, report, vote, application or moderation decision.
- A published fee, deadline, eligibility condition or official result when the page is rendered.

Short-lived caching is acceptable only for public discovery information where a brief delay does not change a student's decision. Current examples are the search API (30 seconds shared cache) and college comparison API (60 seconds shared cache). Cache entries must be invalidated or given a deliberately short lifetime when source data changes.

Never cache an old deadline, payment amount or eligibility rule merely to make a page feel faster.

## Background work and alerts

The current result-alert request delivers a modest batch directly through Resend and writes one private aggregate delivery record. It is intentionally idempotent: the same result set does not create another batch. A delivery failure is recorded as `failed`; it must not remain `processing` indefinitely.

This direct path is appropriate while delivery completes comfortably within the platform time limit. Move notification delivery to a durable queue and worker only when one of these is observed:

- Vercel execution timeouts or repeat delivery failures.
- A normal batch has more than 250 active recipients.
- Delivery takes longer than 20 seconds in production.
- A provider outage needs automatic retry without a new scraper run.

When that happens, the queue design must include idempotency per recipient, bounded retries, a failed-job review view and unsubscribe checks at send time. Do not turn a partial delivery into a blind full resend, as it can duplicate emails.

## What to measure before scaling

Review real production data first:

1. Vercel function duration, error rate and cold-start behaviour.
2. Supabase query duration, slow queries, connection usage and database CPU.
3. Top public routes, cache hit behaviour and Core Web Vitals.
4. Resend delivery errors and the private notification delivery log.
5. The admin System Status screen after every migration or configuration change.

Investigate the query and its indexes before adding machines or replicas. A missing index, an unbounded result set or an accidental repeated request is usually a cheaper and safer fix.

## Growth decisions

| Observed problem | First response | Escalate only if it persists |
| --- | --- | --- |
| Slow public listing or search | Limit response, inspect query plan and add a targeted index | Short, explicitly stale cache |
| Connection exhaustion | Use Supabase's supported pooler and reduce concurrent queries | Upgrade database plan after measurement |
| Read-heavy traffic after query tuning | Cache clearly non-critical public discovery data | Read replica with documented freshness limits |
| Slow email or scraper side effect | Record the job outcome and retry deliberately | Durable queue and worker |
| Database does not fit or cannot be upgraded | Archive or partition an isolated dataset | Sharding, only with a migration plan and clear shard key |

## Release discipline

- Test the affected user flow on desktop, mobile and keyboard navigation.
- Run lint, link checks, copy checks, production build and `git diff --check`.
- Keep official source URLs and checked dates beside factual education data.
- Record any required Supabase, Vercel, Google or Resend dashboard action in the pull request or a project document.
- Prefer one reversible change over an unmeasured infrastructure rewrite.
