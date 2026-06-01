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
- [x] Implement `narrativeCheck` — runs after generation (API returns `narrative_check`); `ConsistencyBanner` wired in `OpportunityDetailTabs` (CMF, brief, cover-letter tabs) and `CompanyDetailTabs` (brief tab)
- [x] Implement `outreachDraft` prompt (prep for Phase 3)
- [x] Set `export const maxDuration = 60` on long-running AI routes
- [x] Activate Priority Action Queue full logic in `GET /api/dashboard` (6 urgency tiers using real Contact + EarningsSignal data)
- [ ] Test all AI routes via Vercel prod (real Anthropic API key)

---

## Phase 3 — Outreach & Relationship Pipeline

- [x] **[PARALLEL]** Implement `Contact` CRUD API routes (`GET /api/contacts`, `POST`, `PATCH /api/contacts/[id]`, `DELETE`) — already existed
- [x] **[PARALLEL]** Implement `OutreachRecord` API routes (`GET /api/contacts/[id]/outreach`, `POST`, `PATCH .../[recordId]`) — already existed
- [x] Build `/outreach` page — `ContactsPanel` with warmth filter (Hot/Warm/Cold), sorted by warmth priority, company name shown
- [x] Build contact detail view — inline row expansion with outreach history timeline, log-outreach form, connection degree, notes, last contact
- [x] Add Contacts tab to `/companies/[id]` detail page — `ContactsPanel` scoped to company, tab shows count
- [x] Sidebar nav Outreach item — removed `comingSoon` flag, fully live
- [x] Wire `outreachDraft` AI prompt to outreach compose flow (Phase 3 stretch)
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

---

## June 2026 — Page Updates

_Source: plan `groundwork_page_updates_12e22d28`. 18 items across 6 phases._

### Phase A — Quick UI / bug fixes (no schema changes)

- [ ] [UI] Fix "Add opportunity" button color on company detail page (`OpportunitiesTab` addAction in `CompanyDetailTabs.tsx`) — switch from light outline to primary `--accent` / `--accent-ink` (white) style
- [ ] [UI] Remove "Generate with AI" feature from company brief tab (`BriefTab` in `CompanyDetailTabs.tsx`) — delete `handleGenerateAi` and `generateAction`
- [ ] [UX] Comp target fields — change `type="number"` inputs in `ProfileEditor.tsx` `CompTab` to text with numeric validation so typing is the primary input method
- [ ] [AI] Positioning statement — add new question "Thinking about your career experiences, when were you the most satisfied? What brought you satisfaction and why?" to `positioningStatement.ts` prompt schema and `AiPositioningPanel.tsx`
- [ ] [UX] CMF weight sliders — remove auto-rebalance logic; sliders move independently; block Save unless total === 100 (indicator already exists)
- [ ] [UI] CMF weight sliders — fix label/description spacing (label and description are flush; add block layout or gap)
- [ ] [BUG] Company edit form — add missing `Size` `<Select>` field (present in create form, absent in edit form in `CompanyDetailTabs.tsx`)
- [ ] [UX] Outreach channels — add "Live chat (virtual)" and "Live chat (in person)" options to channel select in `ContactsPanel.tsx`

### Phase B — Opportunity & company flow

- [ ] [FEATURE] Edit opportunity — add edit UI on `/opportunities/[id]` using existing `updateOpportunity` action (role_title, level, team, jd_text, status)
- [ ] [FEATURE] "Add a new company" option in opportunity company dropdown — routes to `/companies/new?return=/opportunities/new`; after company created, redirects back with `company_id` pre-selected

### Phase C — Market Signals (rename + AI suggestions)

- [ ] [UX] Rename "Earnings signals" → "Market signals" in UI copy (`CompanyDetailTabs.tsx` tab label + descriptions); keep `EarningsSignal` model name internally
- [ ] [AI] AI-suggested market signals — new `lib/ai/prompts/marketSignals.ts` + `POST /api/companies/[id]/signals/suggest` route; "Suggest signals with AI" button in `SignalsTab` that lists proposals the user can add individually

### Phase D — Profile additions (schema changes)

- [ ] [FEATURE] Resume upload — add file upload (PDF/DOCX) to `ResumeTab`; new `POST /api/profile/resume/upload` route; parse server-side with `pdf-parse` / `mammoth`; populate `resume_raw` then auto-run Parse with AI
- [ ] [SCHEMA] Add `preferred_geographies` (JSON string array, ordered, max 5) to `UserProfile` in `prisma/schema.prisma` + migration
- [ ] [FEATURE] Preferred geographies — new profile section/UI with add/remove + priority ordering (drag or up/down arrows); surface in `ProfileEditor.tsx`

### Phase E — Compensation intelligence rework

- [ ] [FEATURE] Comp page full redesign — single set of up to 3 independent dropdowns backed by curated company list (saved companies pinned to top); remove old "select to pin then change inside box" pattern; keep `LevelsFyiEmbed`
- [ ] [FEATURE] Comp targets + geography equivalence — add geography dropdown (from `preferred_geographies`, pre-selects highest-priority city); right-side panel showing equivalent salary in other geographies using static CoL index (`lib/comp/costOfLiving.ts`)

### Phase F — AI enrichment (best-effort, no LinkedIn API)

- [ ] [AI] Company overview auto-fill — "Suggest with AI" button on company create/edit; new `POST /api/companies/suggest-overview` route; Claude infers stage/size/HQ/notes from name + website; user reviews before saving
- [ ] [AI] Proactive role suggestions — AI "Roles you might like" panel on Opportunities; gated until profile is complete (positioning + resume present); `POST /api/opportunities/role-suggestions`

---

## Design Fixes (from audit)

_Source: [docs/design-audit.md](docs/design-audit.md). Ordered by severity._

### P1 Major

- [x] [DESIGN] [P1] Add `aria-label` to all icon-only buttons (CompanyDetailTabs, OpportunityDetailTabs, ProfileEditor, ConsistencyBanner, and other icon-only controls)
- [x] [DESIGN] [P1] Implement responsive sidebar (collapse/drawer on narrow viewports; remove fixed `ml-[220px]` on small screens) — Sidebar.tsx, app/(app)/layout.tsx, WizardShell.tsx
- [x] [DESIGN] [P1] Increase touch targets to >= 44px on interactive controls (NavItem, Button size `sm`, icon buttons in tab editors)
- [x] [DESIGN] [P1] Replace remaining hard-coded utility colors with semantic tokens — Button.tsx danger variant, OpportunityDetailTabs outreach chip, ProfileEditor error text
- [x] [DESIGN] [P1] Add `@media (prefers-reduced-motion: reduce)` to globals.css to disable/reduce `animate-spin`, `animate-pulse`, and non-essential transitions
- [x] [DESIGN] [P1] Replace `transition-all` + width animation on dashboard funnel bars with property-specific or transform-based approach — dashboard/page.tsx
- [x] [DESIGN] [P1] Switch sidebar visibility and content offset from `md:` to `lg:` breakpoint (1024px) to prevent overlap on 768–1023px viewports — Sidebar.tsx, WizardShell.tsx, app/(app)/layout.tsx

### P2 Minor

- [x] [DESIGN] [P2] Replace `transition-all` with property-specific transitions across all components (ThemeToggle, NavItem, WizardShell, CmfWeightSliders, etc.)
- [x] [DESIGN] [P2] Evaluate modal overlay `backdrop-blur-sm` cost; consider flat overlay fallback — Modal.tsx
- [x] [DESIGN] [P2] Reconcile `docs/frontend.md` design system section with canonical `docs/ui.md` (remove stale Inter/dark-only references)
- [x] [DESIGN] [P2] Replace Badge status hue utilities (blue-500, amber-500, green-500) with semantic token variants — Badge.tsx, OpportunityDetailTabs outreach chip
- [x] [DESIGN] [P2] Add responsive column fallbacks to multi-column form grids (`grid-cols-1 md:grid-cols-2`) — CompanyDetailTabs, OpportunityDetailTabs
- [x] [DESIGN] [P2] Add visible focus ring / keyboard focus state to text-link-style buttons — DraftEditor.tsx reset action
- [x] [DESIGN] [P2] Audit 12px muted metadata for contrast; bump critical metadata to 13–14px where it carries task-relevant info

### P3 Polish

- [ ] [DESIGN] [P3] Flatten card-heavy list/detail compositions to separator/row patterns where suitable — company and opportunity lists
- [ ] [DESIGN] [P3] Normalize microcopy casing (sentence case vs uppercase) for section labels and metadata across all modules
- [ ] [DESIGN] [P3] Pair opacity-based disabled/muted states with explicit tokenized color variants for stronger distinction
- [x] [DESIGN] [P3] Standardize transition timing/easing utility mapping at component level for motion consistency

---

## May 26 2026 — small updates

- [x] [UI] Fix dark-on-dark button text on Companies / Opportunities pages and empty states — moved `color` / `background` to inline `style` on all primary `<Link>` CTAs to ensure `--accent-ink` always wins over anchor color inheritance
- [x] [AI] Replace JD paste textarea on `/opportunities/new` with posting URL input + AI extraction (`POST /api/opportunities/extract-jd`) — server fetches page, strips HTML, calls Claude with `jdExtract` prompt; manual paste fallback remains via disclosure toggle
- [x] [UX] Add "What is grndwrk?" modal (`components/nav/WhatIsGrndwrkModal.tsx`) — three sections: what it accomplishes, what it requires, why it's different from job boards; triggered from new sidebar footer nav item (desktop + mobile)

---

## Design System Migration (new design direction)

_Source: `docs/ui.md` (rewritten Apr 2026). Implements Inter + monochrome + icon-rail system from `docs/design-reference/`. Must be done in order — each layer unblocks the next._

### Layer 1 — CSS tokens + fonts (unblocks everything)

- [x] `app/globals.css` — Replace all CSS variables with new token set: `--bg`, `--bg-elev`, `--bg-sub`, `--bg-mute`, `--ink`, `--ink-2`, `--ink-3`, `--ink-4`, `--ink-5`, `--line`, `--line-2`, `--accent`, `--accent-ink`, `--focus`. Remove `--background`, `--sidebar`, `--surface`, `--surface-raised`, `--border`, `--foreground`, `--muted`, `--accent-hover`. Invert dark/light: light is `:root` default, `.dark` class adds dark values (currently reversed). Add spacing tokens (`--pad-x`, `--pad-y`, `--gap-row`, `--gap-section`, `--field-h`). Add global type scale (h1/h2/h3/p), scrollbar spec, and `font-feature-settings`.
- [x] `app/layout.tsx` — Replace `DM_Sans` + `Fraunces` imports with `Inter` (and `JetBrains_Mono` for `--font-mono`). Update `<html>` className.

### Layer 2 — Theme system

- [x] `components/ThemeProvider.tsx` — Change from toggling `.light` class on `<html>` to toggling `.dark` class. Default to light (remove dark default). Keep localStorage key and cookie logic.

### Layer 3 — Sidebar + app shell

- [x] `components/nav/Sidebar.tsx` — Replace fixed 200px sidebar with hover-expand icon rail: 60px collapsed → 220px expanded, `width 0.18s cubic-bezier(0.4,0,0.2,1)`. Replace lucide-react icons with custom icon set from `docs/design-reference/icons.jsx`. Replace Fraunces wordmark with 24×24 logo box (`--ink` bg) + Inter label. NavItem active state: `--bg-mute` bg (not accent). Footer: Settings nav item + 28px user-initials chip. Remove `ThemeToggle`.
- [x] `components/nav/NavItem.tsx` — Update all token references to new names. Height 36px, 7px radius, 13.5px/500/-0.005em label.
- [x] `app/(app)/layout.tsx` — Update main content padding to `var(--pad-y) var(--pad-x)`. Change sidebar offset from `var(--sidebar-offset)` to fixed `60px` rail width.

### Layer 4 — Primitive components (token rename)

- [x] `components/ui/Button.tsx` — New token names. Primary: `--accent`/`--accent-ink`, hover via `color-mix`. Secondary: `--bg-mute`/`--line`. Ghost: `--ink-2`. 120ms transition. `color-mix` focus ring (18%). Add `btn-sm` (30px/6px radius) and `btn-icon` (square) size variants.
- [x] `components/ui/Input.tsx` — `--bg-elev`, `--line`, `--ink`, `--ink-4`, `--focus`. Add hover border (`--ink-4`). 3px `color-mix` focus shadow. 120ms transition.
- [x] `components/ui/Textarea.tsx` — Same token changes as Input. `min-height: 96px`.
- [x] `components/ui/Select.tsx` — Same token changes as Input.
- [x] `components/ui/PageHeader.tsx` — Add `eyebrow` prop (JetBrains Mono, 11px, uppercase, 0.08em, `--ink-3`, 10px margin-bottom). Inter h1 at 32px/600/-0.02em. Remove Fraunces. Rename tokens.
- [x] `components/ui/Tabs.tsx` — Underline color `--ink` (not `--accent`). Rename `--border`/`--foreground`/`--muted` tokens. 13px font, `10px 14px` padding.
- [x] `components/ui/Badge.tsx` — Remap variants to monochrome token set. Remove `--accent`-tinted variants; use `--bg-mute`/`--ink` approach matching StatusPill spec in `ui.md`.
- [x] `components/ui/SectionCard.tsx` — Rename `--surface-raised` → `--bg-mute`, `--border` → `--line`, `--surface` → `--bg-elev`, `--foreground` → `--ink`, `--muted` → `--ink-3`.
- [x] `components/ui/Modal.tsx` — Rename tokens.
- [x] `components/ui/Skeleton.tsx` — Rename tokens.
- [x] `components/ui/Card.tsx` — Rename tokens.
- [x] `components/ui/DraftEditor.tsx` — Rename tokens (caught in sweep).
- [x] `components/ui/ConsistencyBanner.tsx` — Rename tokens, remove lucide-react icons (caught in sweep).
- [x] `components/ui/ErrorMessage.tsx` — Rename tokens, remove lucide-react icons (caught in sweep).
- [x] `components/ui/CmfScore.tsx` — Rename tokens (caught in sweep).

### Layer 5 — Page-level components

#### 5a — Token rename sweep (mechanical migration, no redesign)

- [x] App pages: `dashboard/page.tsx`, `companies/page.tsx`, `companies/[id]/page.tsx`, `opportunities/page.tsx`, `opportunities/[id]/page.tsx`, `comp/page.tsx`
- [x] Onboarding: `(onboarding)/layout.tsx`, `welcome/page.tsx`, `profile/setup/page.tsx`
- [x] Feature components: `CompanyList.tsx`, `CompanyDetailTabs.tsx`, `OpportunityList.tsx`, `OpportunityDetailTabs.tsx`, `ProfileEditor.tsx`, `AiPositioningPanel.tsx`, `CmfWeightSliders.tsx`, `WizardShell.tsx`, `LevelsFyiEmbed.tsx`, `ThemeToggle.tsx`
- [x] Removed all `--background`, `--surface`, `--surface-raised`, `--sidebar`, `--border`, `--foreground`, `--muted`, `--accent-hover`, `--success`, `--warning`, `--danger`, `--font-heading` references. Saved/danger/warning surfaces now use `text-{green|amber|red}-{700|400}` Tailwind hue pattern (matching `Badge` semantic variants).
- [x] `next build` + `tsc --noEmit` pass clean.

#### 5b — Page redesigns per `ui.md` (COMPLETE May 2026)

- [x] `components/companies/CompanyList.tsx` — Rebuilt as a table: `StatusPill` component (999px radius, Active/Engaged/Sourced tiers), `LogoBox` initials, `TierBadge`, mono-uppercase column headers on `--bg-sub`, `--line-2` row dividers, `--bg-sub` row hover, filter bar with FilterGroup components. `SectionCard` removed.
- [x] `components/opportunities/OpportunityList.tsx` — Rebuilt as kanban: 5 columns (Watching / Preparing / Applied / In Process / Closed), `OppCard` components (`--bg-elev`, hover border `--ink-4`, logo box + role + next-action footer with arrow-right icon), show/hide Closed toggle. `SectionCard` removed.
- [x] `components/profile/ProfileEditor.tsx` — All 5 tabs now use `FieldRow` two-column layout (`220px / 1fr`, `gap: 32`, `--line-2` dividers, max-w 920px). Inline tag chips on target roles and stages. `SectionCard` import removed entirely.
- [x] `tsc --noEmit` + `next build` pass clean.
