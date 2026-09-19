# SikshyaNepal

SikshyaNepal is a student-first education guide for Nepal. It helps students compare colleges, find schools, follow admissions and official notices, plan costs, save options, and organise their next steps.

The public site is designed to make education decisions clearer. It is not a substitute for an institution's current official notice: fees, deadlines, eligibility and seats must always be confirmed with the original source before a student applies or pays.

## What is in the product

- **College directory** — college profiles, programmes, sources, verification dates, comparison, cost planning and saved shortlists.
- **School directory** — CEHRD/IEMIS-sourced school records with location filters and saved schools.
- **Admissions and deadlines** — published admissions, entrance exams, scholarships and opportunities with source links.
- **Results, notices and editorial hub** — official material and reviewed education reporting.
- **My Path** — a signed-in student's private checklist, shortlist and stage-specific next actions.
- **Community** — pseudonymous student discussion with moderation and reporting safeguards.
- **Admin** — content review, data quality, evidence, sources, submissions, moderation and audit tools.

## Stack

- Next.js 14 App Router, React 18 and TypeScript
- Tailwind CSS and Lucide icons
- Supabase: PostgreSQL, Auth, Row Level Security and Storage
- Resend for transactional email
- Python collectors on GitHub Actions
- Vercel deployment

## Quick start

### 1. Prerequisites

- Node.js 20 LTS or newer
- npm 10 or newer
- A Supabase project

### 2. Install and configure

```bash
git clone https://github.com/kasamthapa/sikshyanepal.git
cd sikshyanepal
npm ci
```

Create `.env.local` at the project root. Never commit it. Fill this template with values from the relevant dashboards:

```dotenv
# Required for the web application
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only. Required for protected admin operations and immediate email registration.
SUPABASE_SERVICE_ROLE_KEY=

# Owner account used for admin access
ADMIN_EMAIL=

# Public site URL; localhost is fine for local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Required for privacy-preserving community abuse fingerprints
COMMUNITY_HASH_SALT=

# Optional integrations
RESEND_API_KEY=
NOTIFICATION_SECRET=
NEXT_PUBLIC_ONESIGNAL_APP_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADSENSE_SLOT_RESULTS=
NEXT_PUBLIC_ADSENSE_SLOT_COLLEGES=
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=
```

`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NOTIFICATION_SECRET` and `COMMUNITY_HASH_SALT` are secrets. Do not expose them in browser code, screenshots, issues, pull requests or Git history.

### 3. Prepare Supabase

For a fresh project, run `supabase/schema.sql`, then run every SQL file in `supabase/migrations/` in filename order in the Supabase SQL Editor. Do not edit a migration that has already been applied to a shared database. Add a new timestamped migration instead.

For existing production, check which migrations have already run before applying anything. Important recent migrations include:

- `20261013_private_community_media.sql` for private moderated community media
- `20261017_verify_core_programme_catalogue.sql` for audited core programme details
- `20261018_secure_immediate_email_signup.sql` for rate-limited, immediately confirmed email registration

See [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md) for Supabase Auth and Google sign-in configuration.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint |
| `npm run check:links` | Check internal link targets |
| `npm run check:slop` | Check copy for prohibited generic AI-writing patterns |
| `npm run build` | Run the production build and TypeScript checks |
| `npm run schools:extract` | Prepare a CEHRD school-source import |
| `npm run schools:import` | Import prepared CEHRD schools; requires a correctly configured environment |

Before opening a pull request, run:

```bash
npm run lint
npm run check:links
npm run check:slop
npm run build
git diff --check
```

## Project map

```text
app/                 Routes, pages, API handlers and global styles
components/          Reusable interface and feature components
lib/                 Supabase, auth, safety, editorial and domain helpers
supabase/            Base schema, seed data and ordered SQL migrations
scrapers/            Python collectors and school/research import utilities
scripts/             Local validation and data-import scripts
docs/                Product, editorial, SEO, UX and safety documentation
design-system/       Visual system source of truth
```

Useful starting points:

- `app/(main)/colleges/` — directory and college profiles
- `app/(main)/schools/` — school directory and profiles
- `app/(main)/my-path/` — private student planning experience
- `app/(main)/admin/` — protected operational tools
- `components/layout/Header.tsx` — primary navigation
- `lib/supabase.ts` and `lib/auth.ts` — data access and authorization boundaries

## Contribution guide

### Work in a branch

```bash
git checkout main
git pull origin main
git checkout -b codex/short-description
```

Keep each contribution focused. Do not mix visual cleanup, schema changes and unrelated refactors in the same pull request.

### Data and editorial standards

- Treat university, college, CEHRD, NEB, TU, KU, PU and CTEVT pages as sources—not automatically correct facts.
- Preserve the original source URL and a verification/check date for factual claims.
- Do not invent or infer fees, deadlines, rankings, results, placements, scholarships, affiliations, programme duration or eligibility.
- Scraped material enters the editorial queue first. Publishing needs source review. Read [scrapers/README.md](scrapers/README.md) and [docs/COLLEGE_NEWSROOM_PLAYBOOK.md](docs/COLLEGE_NEWSROOM_PLAYBOOK.md).
- Clearly label sponsorship or advertisements. Never let payment change an editorial score or a verification label.

### Safety and privacy standards

- Keep the service-role key server-only. Use the anon key only for intended public/client access.
- Do not weaken Supabase RLS policies to make a feature work.
- Treat community posts, comments, images and videos as moderated content. Do not add private messaging, phone sharing or precise-location sharing.
- Validate and sanitize every public input; preserve rate limits and CSRF/origin protections on mutations.
- Do not include real student data, passwords, access tokens or bulk CEHRD exports in Git.

### UI and accessibility standards

The visual source of truth is [design-system/sikshyanepal/MASTER.md](design-system/sikshyanepal/MASTER.md). For any interface or flow change, follow [docs/cognitive-ux-standard.md](docs/cognitive-ux-standard.md) and complete the relevant checks in [docs/ux-release-review.md](docs/ux-release-review.md).

In practice:

- Make the first screen explain the task and offer one clear next action.
- Build mobile-first with 44px or larger targets, keyboard support, visible focus states, and no hover-only controls.
- Provide useful loading, empty, error and success states.
- Prefer calm, factual language over marketing claims, fabricated urgency or generic AI-style copy.
- Respect `prefers-reduced-motion`; motion should communicate state, not decorate the page.

### Pull request checklist

- [ ] I tested the changed task on desktop and narrow mobile widths.
- [ ] I tested keyboard navigation and a meaningful empty/error state.
- [ ] I ran the commands in **Commands** above.
- [ ] I added a new migration instead of editing an applied one, if the schema changed.
- [ ] I added or retained source URLs and dates for factual education data.
- [ ] I did not add secrets, personal data, unlicensed assets or unsupported claims.
- [ ] I described what changed, how it was tested and any required Supabase/Vercel step.

## Scrapers and data imports

Collectors run on a schedule through GitHub Actions. They should collect source material, not manufacture publishable claims. Set scraper secrets in GitHub Actions—not in the repository. Their setup, source policies and manual run instructions are in [scrapers/README.md](scrapers/README.md).

The CEHRD school directory is large and is not stored in Git. Keep imported records traceable to the official source URL and IEMIS identifier. CEHRD records commonly cover identity and location, but may not contain current grades, fees, facilities or admissions information; show those fields only when sourced separately.

## Deployment

Vercel deploys `main`. Add production environment variables in Vercel Project Settings; add scraper-only values in GitHub Actions Secrets. Use the same `NOTIFICATION_SECRET` in both places if notifications are enabled.

Do not merge a change that depends on an unrecorded dashboard action. Document required production changes in the pull request description and, when appropriate, in `docs/`.

## Further reading

- [Authentication setup](docs/AUTH_SETUP.md)
- [Trust, safety and compliance checklist](docs/TRUST_SAFETY_COMPLIANCE_CHECKLIST.md)
- [Editorial and newsroom playbook](docs/COLLEGE_NEWSROOM_PLAYBOOK.md)
- [SEO launch checklist](docs/SEO_LAUNCH_CHECKLIST.md)
- [AEO playbook](docs/AEO_PLAYBOOK.md)
- [Launch readiness audit](docs/LAUNCH_READINESS_AUDIT.md)

## License

This repository currently has no open-source license. Do not reuse or redistribute code, data or brand assets outside the project without written permission from the project owner.
