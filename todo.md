# grndwrk Execution Checklist

## Approach

Feature-driven delivery: each phase ships a usable module end-to-end (schema → API → UI). Parallel tasks are marked **[PARALLEL]**. GitHub + Vercel is the deployment target; all testing happens in production (Vercel preview/prod URLs).

---

## Phase 0 — Project Bootstrap

- [x] Create GitHub repo, push initial Next.js 14 project (`npx create-next-app@latest`)
- [x] Connect repo to Vercel, configure auto-deploy on `main` and preview on PRs
- [x] **[PARALLEL]** Configure environment variables in Vercel: `DATABASE_URL` (Postgres); `ANTHROPIC_API_KEY` optional until Phase 2
- [x] **[PARALLEL]** Provision Postgres database (Neon) and add connection string
- [x] **[PARALLEL]** Set up Prisma: full schema, PostgreSQL + `@prisma/adapter-pg`, migrations in repo
- [x] **[PARALLEL]** Scaffold folder structure per `docs/frontend.md`: `app/`, `components/`, `lib/`, `prisma/`, `app/actions/`
- [x] **[PARALLEL]** Install and configure Tailwind CSS, set up design tokens (colors, typography) from `docs/frontend.md` design system section
- [x] **[PARALLEL]** Install Radix UI, `clsx`, `tailwind-merge`, set up `cn()` utility
- [x] Run `prisma migrate deploy` against prod Postgres, verify schema on Vercel
- [x] Add `next.config.js` CSP headers for Levels.fyi iframes

---

## Phase 1, Feature 1 — Onboarding Wizard + Profile Module

_Unblocks everything else — singleton `UserProfile` must exist before any other module._

- [x] Build 4-step onboarding wizard at `/profile/setup` (`useReducer` + context, single server action on submit)
  - Step 1: Resume paste + target roles/stages/geography
  - Step 2: Narrative pillars (3–5 items) — required to proceed
  - Step 3: CMF weight sliders (sum-to-100, min 5 per dimension) — pre-filled defaults
  - Step 4: Comp targets (base, equity, total) — pre-filled defaults
- [x] Implement `UserProfile` upsert server action (singleton `id = "singleton"`)
- [x] Implement `GET /api/profile` and `POST /api/profile` routes
- [x] Implement `PATCH /api/profile/cmf-weights` route (validates sum === 100)
- [x] Build Profile page at `/profile` — display all fields, inline edit, CMF weight sliders
- [x] Add first-launch gate in `(app)/layout.tsx` — redirect to `/profile/setup` if `onboarding_complete = false`
- [x] **[PARALLEL with profile UI]** Build shared `AppShell` — fixed 220px sidebar, `NavItem` with `usePathname()` active state
- [x] **[PARALLEL with profile UI]** Build shared UI components: `Card`, `Badge`, `DraftEditor`, `CmfScore`, skeleton loaders, error states
- [x] Deploy to Vercel, test onboarding flow end-to-end on preview URL

---

## Phase 1, Feature 2 — Company Intelligence Center (no AI)

_Depends on: Feature 1 complete (for nav/shell)._

- [x] **[PARALLEL]** Implement `Company` CRUD API routes (`GET`, `POST /api/companies`, `GET /api/companies/[id]`, `PATCH`, `DELETE`)
- [x] **[PARALLEL]** Implement `EarningsSignal` API routes (`GET /api/companies/[id]/signals`, `POST`, stub `POST .../analyze` with 501)
- [x] **[PARALLEL]** Implement `CompanyPositioningBrief` API routes (`GET`, `POST`, `PATCH /api/companies/[id]/brief`, stub AI generation with 501)
- [x] Build `/companies` list page — company cards with tier badge, brief status, filter bar
- [x] Build `/companies/[id]` detail page — tabs: Overview, Earnings Signals, Brief, Opportunities, Comp
- [x] Build "Add Company" form at `/companies/new` (Radix UI modal or page)
- [x] Build Earnings Signals tab — manual signal entry form, signal list with trigger score display
- [x] Build Company Positioning Brief tab — `DraftEditor` component, "Generate" button stubbed for Phase 2
- [x] Deploy to Vercel preview, smoke-test CRUD

---

## Phase 1, Feature 3 — Opportunity Tracker (manual CMF)

_Depends on: Feature 2 complete (opportunities belong to companies)._

- [x] **[PARALLEL]** Implement `Opportunity` CRUD API routes (`GET`, `POST /api/opportunities`, `GET /api/opportunities/[id]`, `PATCH`, `DELETE`)
- [x] **[PARALLEL]** Implement CMF scoring API route (`POST /api/opportunities/[id]/cmf`) — accepts manual scores, stubs AI with 501
- [x] **[PARALLEL]** Implement `RolePositioningBrief` API routes (`GET`, `POST`, `PATCH /api/opportunities/[id]/brief`, stub AI with 501)
- [x] Build `/opportunities` list page — list view, filter by status/CMF band/company, `CmfScore` badge
- [x] Build `/opportunities/new` — form with company selector, role title, level, team, JD paste
- [x] Build `/opportunities/[id]` detail page — tabs: Overview, CMF Score, Brief, Materials, Comp
- [x] Build CMF scoring panel — 5 numeric inputs (1–10), composite score computed client-side, colour bands (≥8 green, 6–7 amber, 4–5 orange, <4 red)
- [x] Build status selector (Watching → Preparing → Applied → In Process → Closed) + `outreach_sent` toggle
- [x] Build Role Positioning Brief editor using `DraftEditor` pattern
- [x] Deploy to Vercel preview, test full opportunity lifecycle

---

## Phase 1, Feature 4 — Compensation Intelligence (Levels.fyi iframes)

_Can be developed in parallel with Feature 3 after Feature 2 is complete._

- [x] **[PARALLEL with Feature 3]** Implement `CompBenchmark` API routes (`GET /api/benchmarks`, `POST`, stub `POST /api/benchmarks/fetch` with 501)
- [x] **[PARALLEL with Feature 3]** Build comp snapshot logic in `Opportunity` create/update — write snapshot on create, on `role_family`/`level` change, and on-demand refresh; include `stale` flag (>180 days) and `meets_target`
- [x] Build `LevelsFyiEmbed` component — `<iframe>` with error boundary fallback
- [x] Build `/comp` page — company + track selector, `LevelsFyiEmbed`, side-by-side compare (up to 3 companies)
- [x] Build Comp tab on `/companies/[id]` — role family selector + embed
- [x] Build Comp tab on `/opportunities/[id]` — embed scoped to company + inferred role family, comp snapshot vs. user target
- [x] Verify CSP headers allow Levels.fyi iframes on Vercel prod

---

## Phase 1, Feature 5 — Activity Dashboard

_Depends on: Features 2 & 3 complete (needs Opportunity + Company data)._

- [x] Implement `GET /api/dashboard` — funnel counts, search health metrics, priority action queue (top 5, rule-based for Phase 1)
- [x] Build `/dashboard` page — two-column layout: Priority Queue + Funnel View (left), Search Health Metrics (right)
- [x] Build `FunnelView` component — clickable stage chips linking to `/opportunities?status=<filter>`
- [x] Build `MetricCard` component — companies monitored, Tier 1 targets, open opportunities, avg CMF, briefs complete, days since last activity
- [x] Build `ActionItem` component — rule-based queue (no brief started, unscored opportunity, high CMF not applied, stale Preparing, no recent activity)
- [x] Set `/dashboard` as default redirect after onboarding completes
- [x] **Phase 1 complete — deploy to Vercel `main`, full smoke test in production**

---

## Phase 2 — AI Intelligence Layer

_Activate AI endpoints one at a time. Each follows: implement prompt file → wire API route → update UI._

- [x] Implement `lib/ai/claude.ts` — `callClaude()` and `callClaudeWithProfile()` with 3-attempt retry, Zod validation
- [x] **[PARALLEL]** Implement `resumeParse` prompt + activate `POST /api/profile/resume`; Profile resume tab + parsed JSON preview
- [x] **[PARALLEL]** Implement `earnings` prompt + activate `POST /api/companies/[id]/signals/[signalId]/analyze`; Earnings Signals tab "Analyze with AI"
- [x] **[PARALLEL]** Implement `companyBrief` prompt + activate `POST /api/companies/[id]/brief` with `generate: true`; "Generate with AI" on company Brief tab
- [x] **[PARALLEL]** Implement `cmf` prompt + activate `POST /api/opportunities/[id]/cmf`; "Generate with AI" on CMF tab
- [x] **[PARALLEL]** Implement `roleBrief` prompt + activate `POST /api/opportunities/[id]/brief` with `generate: true`; "Generate with AI" on Role Brief tab
- [x] **[PARALLEL]** Implement `coverLetter` via `POST /api/opportunities/[id]/cover-letter`; Materials tab "Generate cover letter"
- [ ] Implement `narrativeCheck` — runs after generation (API returns `narrative_check`); **TODO:** wire `ConsistencyBanner` to show when score < 3
- [ ] Implement `outreachDraft` prompt (prep for Phase 3)
- [x] Set `export const maxDuration = 60` on long-running AI routes
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

- [x] Every PR deploys a Vercel preview URL — use as the test environment
- [x] Keep `DATABASE_URL` pointing to Postgres in all Vercel environments
- [ ] Add `prisma migrate deploy` to Vercel build command (in `package.json` `build` script or as a post-deploy hook) ✓ Done
- [ ] Monitor Anthropic API errors in Vercel logs; all AI failures return 502 + `retryable: true`
- [x] `ConsistencyBanner` and `DraftEditor` UI shells built in Phase 1, AI wired in Phase 2 — no re-architecture needed
- [x] All API routes return `{ data: T }` on success, `{ error, message, retryable?, fields? }` on failure
