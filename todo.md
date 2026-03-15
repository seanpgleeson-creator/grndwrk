# grndwrk Execution Checklist

## Approach

Feature-driven delivery: each phase ships a usable module end-to-end (schema → API → UI). Parallel tasks are marked **[PARALLEL]**. GitHub + Vercel is the deployment target; all testing happens in production (Vercel preview/prod URLs).

---

## Phase 0 — Project Bootstrap

These are all prerequisites and can mostly be done in parallel once the repo exists.

- [ ] Create GitHub repo, push initial Next.js 14 project (`npx create-next-app@latest`)
- [ ] Connect repo to Vercel, configure auto-deploy on `main` and preview on PRs
- [ ] **[PARALLEL]** Configure environment variables in Vercel: `DATABASE_URL` (Postgres), `ANTHROPIC_API_KEY`, `NODE_ENV`
- [ ] **[PARALLEL]** Provision Postgres database (e.g. Neon, Supabase, or Vercel Postgres) and add connection string
- [ ] **[PARALLEL]** Set up Prisma: install deps, write full schema from `docs/backend.md`, configure SQLite for local dev
- [ ] **[PARALLEL]** Scaffold folder structure per `docs/frontend.md`: `app/`, `components/`, `lib/`, `prisma/`, `app/actions/`
- [ ] **[PARALLEL]** Install and configure Tailwind CSS, set up design tokens (colors, typography) from `docs/frontend.md` design system section
- [ ] **[PARALLEL]** Install Radix UI, `clsx`, `tailwind-merge`, set up `cn()` utility
- [ ] Run `prisma migrate deploy` against prod Postgres, verify schema on Vercel
- [ ] Add `next.config.js` CSP headers for Levels.fyi iframes

---

## Phase 1, Feature 1 — Onboarding Wizard + Profile Module

_Unblocks everything else — singleton `UserProfile` must exist before any other module._

- [ ] Build 4-step onboarding wizard at `/profile/setup` (`useReducer` + context, single server action on submit)
  - Step 1: Resume paste + target roles/stages/geography
  - Step 2: Narrative pillars (3–5 items) — required to proceed
  - Step 3: CMF weight sliders (sum-to-100, min 5 per dimension) — pre-filled defaults
  - Step 4: Comp targets (base, equity, total) — pre-filled defaults
- [ ] Implement `UserProfile` upsert server action (singleton `id = "singleton"`)
- [ ] Implement `GET /api/profile` and `POST /api/profile` routes
- [ ] Implement `PATCH /api/profile/cmf-weights` route (validates sum === 100)
- [ ] Build Profile page at `/profile` — display all fields, inline edit, CMF weight sliders
- [ ] Add first-launch gate in `(app)/layout.tsx` — redirect to `/profile/setup` if `onboarding_complete = false`
- [ ] **[PARALLEL with profile UI]** Build shared `AppShell` — fixed 220px sidebar, `NavItem` with `usePathname()` active state
- [ ] **[PARALLEL with profile UI]** Build shared UI components: `Card`, `Badge`, `DraftEditor`, `CmfScore`, skeleton loaders, error states
- [ ] Deploy to Vercel, test onboarding flow end-to-end on preview URL

---

## Phase 1, Feature 2 — Company Intelligence Center (no AI)

_Depends on: Feature 1 complete (for nav/shell)._

- [ ] **[PARALLEL]** Implement `Company` CRUD API routes (`GET`, `POST /api/companies`, `GET /api/companies/[id]`, `PATCH`, `DELETE`)
- [ ] **[PARALLEL]** Implement `EarningsSignal` API routes (`GET /api/companies/[id]/signals`, `POST`, stub `POST .../analyze` with 501)
- [ ] **[PARALLEL]** Implement `CompanyPositioningBrief` API routes (`GET`, `POST`, `PATCH /api/companies/[id]/brief`, stub AI generation with 501)
- [ ] Build `/companies` list page — company cards with tier badge, brief status, filter bar
- [ ] Build `/companies/[id]` detail page — tabs: Overview, Earnings Signals, Brief, Opportunities, Comp
- [ ] Build "Add Company" form at `/companies/new` (Radix UI modal or page)
- [ ] Build Earnings Signals tab — manual signal entry form, signal list with trigger score display
- [ ] Build Company Positioning Brief tab — `DraftEditor` component, "Generate" button stubbed for Phase 2
- [ ] Deploy to Vercel preview, smoke-test CRUD

---

## Phase 1, Feature 3 — Opportunity Tracker (manual CMF)

_Depends on: Feature 2 complete (opportunities belong to companies)._

- [ ] **[PARALLEL]** Implement `Opportunity` CRUD API routes (`GET`, `POST /api/opportunities`, `GET /api/opportunities/[id]`, `PATCH`, `DELETE`)
- [ ] **[PARALLEL]** Implement CMF scoring API route (`POST /api/opportunities/[id]/cmf`) — accepts manual scores, stubs AI with 501
- [ ] **[PARALLEL]** Implement `RolePositioningBrief` API routes (`GET`, `POST`, `PATCH /api/opportunities/[id]/brief`, stub AI with 501)
- [ ] Build `/opportunities` list page — list view, filter by status/CMF band/company, `CmfScore` badge
- [ ] Build `/opportunities/new` — form with company selector, role title, level, team, JD paste
- [ ] Build `/opportunities/[id]` detail page — tabs: Overview, CMF Score, Brief, Materials, Comp
- [ ] Build CMF scoring panel — 5 numeric inputs (1–10), composite score computed client-side, colour bands (≥8 green, 6–7 amber, 4–5 orange, <4 red)
- [ ] Build status selector (Watching → Preparing → Applied → In Process → Closed) + `outreach_sent` toggle
- [ ] Build Role Positioning Brief editor using `DraftEditor` pattern
- [ ] Deploy to Vercel preview, test full opportunity lifecycle

---

## Phase 1, Feature 4 — Compensation Intelligence (Levels.fyi iframes)

_Can be developed in parallel with Feature 3 after Feature 2 is complete._

- [ ] **[PARALLEL with Feature 3]** Implement `CompBenchmark` API routes (`GET /api/benchmarks`, `POST`, stub `POST /api/benchmarks/fetch` with 501)
- [ ] **[PARALLEL with Feature 3]** Build comp snapshot logic in `Opportunity` create/update — write snapshot on create, on `role_family`/`level` change, and on-demand refresh; include `stale` flag (>180 days) and `meets_target`
- [ ] Build `LevelsFyiEmbed` component — `<iframe>` with error boundary fallback
- [ ] Build `/comp` page — company + track selector, `LevelsFyiEmbed`, side-by-side compare (up to 3 companies)
- [ ] Build Comp tab on `/companies/[id]` — role family selector + embed
- [ ] Build Comp tab on `/opportunities/[id]` — embed scoped to company + inferred role family, comp snapshot vs. user target
- [ ] Verify CSP headers allow Levels.fyi iframes on Vercel prod

---

## Phase 1, Feature 5 — Activity Dashboard

_Depends on: Features 2 & 3 complete (needs Opportunity + Company data)._

- [ ] Implement `GET /api/dashboard` — funnel counts, search health metrics, priority action queue (top 5, rule-based for Phase 1)
- [ ] Build `/dashboard` page — two-column layout: Priority Action Queue + Funnel View (left), Search Health Metrics (right)
- [ ] Build `FunnelView` component — clickable stage chips linking to `/opportunities?status=<filter>`
- [ ] Build `MetricCard` component — companies monitored, Tier 1 targets, open opportunities, avg CMF, briefs complete, days since last activity
- [ ] Build `ActionItem` component — rule-based queue (no brief started, unscored opportunity, high CMF not applied, stale Preparing, no recent activity)
- [ ] Set `/dashboard` as default redirect after onboarding completes
- [ ] **Phase 1 complete — deploy to Vercel `main`, full smoke test in production**

---

## Phase 2 — AI Intelligence Layer

_Activate AI endpoints one at a time. Each follows: implement prompt file → wire API route → update UI._

- [ ] Implement `lib/ai/claude.ts` — `callClaude()` and `callClaudeWithProfile()` with 3-attempt retry, Zod validation
- [ ] **[PARALLEL]** Implement `resumeParse` prompt + activate `POST /api/profile/resume`; update `ResumeUpload` component to show parsed preview
- [ ] **[PARALLEL]** Implement `earnings` prompt + activate `POST /api/companies/[id]/signals/[signalId]/analyze`; update Earnings Signals tab
- [ ] **[PARALLEL]** Implement `companyBrief` prompt + activate `POST /api/companies/[id]/brief` with `generate: true`; wire "Generate" button
- [ ] **[PARALLEL]** Implement `cmf` prompt + activate `POST /api/opportunities/[id]/cmf`; add "Generate with AI" button to CMF panel
- [ ] **[PARALLEL]** Implement `roleBrief` prompt + activate `POST /api/opportunities/[id]/brief` with `generate: true`; wire "Generate" button
- [ ] **[PARALLEL]** Implement `coverLetter` prompt + activate cover letter generation; wire to Materials tab
- [ ] Implement `narrativeCheck` prompt — run as secondary call after any content generation; wire `ConsistencyBanner` component (yellow, dismissible, shown when score < 3)
- [ ] Implement `outreachDraft` prompt (prep for Phase 3)
- [ ] Set `export const maxDuration = 60` on all long-running AI routes
- [ ] Activate Priority Action Queue full logic in `GET /api/dashboard` (6 urgency tiers using real Contact + EarningsSignal data)
- [ ] Test all AI routes via Vercel prod (real Anthropic API key)

---

## Phase 3 — Outreach & Relationship Pipeline

- [ ] **[PARALLEL]** Implement `Contact` CRUD API routes (`GET /api/contacts`, `POST`, `PATCH /api/contacts/[id]`, `DELETE`)
- [ ] **[PARALLEL]** Implement `OutreachRecord` API routes (`GET /api/contacts/[id]/outreach`, `POST`, `PATCH .../[recordId]`)
- [ ] Build `/outreach` page — contact list with warmth badges, priority queue, filter by company/warmth
- [ ] Build contact detail view — outreach history timeline, connection degree, notes, last contact date
- [ ] Wire `outreachDraft` AI prompt to outreach compose flow
- [ ] Add Contacts tab to `/companies/[id]` detail page
- [ ] Deploy and test in production

---

## Phase 4 — Council Mode (Multi-user + Auth)

_Deferred — no auth in Phases 1–3. Plan separately when ready._

- [ ] Add `userId` to all models (except singleton `UserProfile` which becomes per-user)
- [ ] Integrate auth middleware (Clerk or NextAuth) on all routes
- [ ] Add `council_id` FK on `Company` + `Opportunity` for shared watchlists
- [ ] Facilitator-scoped dashboard endpoints
- [ ] `GET /api/export` — full user data as JSON

---

## Cross-cutting / Ongoing

- [ ] Every PR deploys a Vercel preview URL — use as the test environment
- [ ] Keep `DATABASE_URL` pointing to Postgres in all Vercel environments (no SQLite in prod)
- [ ] Add `prisma migrate deploy` to Vercel build command (in `package.json` `build` script or as a post-deploy hook)
- [ ] Monitor Anthropic API errors in Vercel logs; all AI failures return 502 + `retryable: true`
- [ ] `ConsistencyBanner` and `DraftEditor` UI shells built in Phase 1, AI wired in Phase 2 — no re-architecture needed
- [ ] All API routes return `{ data: T }` on success, `{ error, message, retryable?, fields? }` on failure
