# grndwrk — Agent Reference

MVP: Prioritize simple and functional. Ship core flows first; defer nice-to-haves. Single user through main workflow with minimal complexity.

---

## Current Phase: Phase 1 — COMPLETE (deployed)

Phase 1 is built, uses **PostgreSQL only** (Neon) with Prisma 7 + `@prisma/adapter-pg`, and is deployed on **Vercel** with `DATABASE_URL` in project settings. Migrations run on each deploy via `vercel-build` (`prisma migrate deploy && next build`).

Phase 2 adds AI (CMF scoring, briefs, cover letters, earnings parsing). Phase 3 adds outreach/contacts. Phase 4 = council/multi-user.

---

## What Has Been Built (Phase 1)

### Infrastructure
- Next.js 16 App Router project scaffolded with Tailwind CSS v4, Radix UI, Zod, `clsx`, `tailwind-merge`
- Prisma 7 schema with all data models (see Data Model section below), provider = `postgresql`
- `@prisma/adapter-pg` driver adapter — no SQLite in production; Postgres everywhere
- `lib/prisma.ts` — singleton PrismaClient safe for Next.js hot reload, using `PrismaPg` with `PoolConfig`
- `prisma/seed.ts` — upserts singleton `UserProfile` on first deploy
- `next.config.ts` — CSP headers allowing `frame-src https://www.levels.fyi`
- `vercel.json` — tells Vercel to run `npm run vercel-build` (which runs `prisma migrate deploy && next build`)
- `package.json` scripts: `build` (local, no migrations), `vercel-build` (Vercel: migrate + build), `db:migrate`, `db:seed`

### Modules Built
- **Module 1 — Profile & Positioning Hub**: 4-step onboarding wizard at `/profile/setup`, profile editor at `/profile`, CMF weight sliders, server actions for all profile mutations
- **Module 2 — Company Intelligence Center**: `/companies` list, `/companies/new`, `/companies/[id]` detail with tabs (Overview, Earnings Signals, Positioning Brief)
- **Module 3 — Opportunity Tracker**: `/opportunities` list, `/opportunities/new`, `/opportunities/[id]` detail with tabs (Overview, CMF Scoring, Role Brief, Comp Snapshot), status funnel stepper
- **Module 4 — Compensation Intelligence**: `/comp` page with Levels.fyi embed, benchmarking panel, negotiation reference card; comp snapshot on opportunity detail
- **Module 6 — Activity Dashboard**: `/dashboard` with funnel metrics and priority action queue

### API Routes (all implemented, AI stubs return 501)
- `GET/PATCH /api/profile`
- `GET/POST /api/companies`, `GET/PATCH/DELETE /api/companies/[id]`
- `GET/POST /api/companies/[id]/signals`, `DELETE /api/companies/[id]/signals/[signalId]`
- `POST /api/companies/[id]/brief`, `POST /api/companies/[id]/brief/reset` (AI stub)
- `GET/POST /api/opportunities`, `GET/PATCH/DELETE /api/opportunities/[id]`
- `POST /api/opportunities/[id]/cmf` (manual scoring; AI stub)
- `POST /api/opportunities/[id]/brief`, `POST /api/opportunities/[id]/brief/reset` (AI stub)
- `GET/POST /api/benchmarks`, `DELETE /api/benchmarks/[id]`
- `GET/POST /api/contacts`, `GET/PATCH/DELETE /api/contacts/[id]` (Phase 3 ready)
- `GET /api/dashboard`

### Shared UI Components (`components/ui/`)
`Card`, `Badge`, `Button`, `Input`, `Textarea`, `Select`, `Skeleton`, `ErrorMessage`, `Modal`, `Tabs`, `PageHeader`, `CmfScore`, `DraftEditor`, `ConsistencyBanner`

---

## Deployment troubleshooting

- **P3019 (provider mismatch):** Old migrations were SQLite while the schema is PostgreSQL. Fix: reset migration history for Postgres-only (`prisma/migrations` regenerated with `prisma migrate dev` against Neon), commit, redeploy. If Neon already had tables from another app, reset that database or use a fresh Neon project before applying grndwrk migrations.
- **TypeScript `noImplicitAny` on Vercel:** Local `next dev` can be looser than `next build`; fix all `tsc` errors locally with `npx tsc --noEmit` before pushing.

## Next steps (ongoing)

- **Smoke test production:** onboarding → company → opportunity → dashboard.
- **Phase 2:** Add `ANTHROPIC_API_KEY` in Vercel, implement `lib/ai/claude.ts`, replace AI route stubs (501) with real calls.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4 |
| Backend | Next.js API routes + Server Actions |
| Database | PostgreSQL (Neon) via Prisma 7 + `@prisma/adapter-pg` |
| AI | Anthropic Claude API (Phase 2+); all AI routes stubbed with 501 |
| Salary data | Levels.fyi iframe embeds only (V1). CSP: `frame-src https://www.levels.fyi` |
| Auth (V1) | None. Single-user; `UserProfile` is a singleton (`id = "singleton"`), seeded on first launch. |
| Hosting | Vercel (frontend + API) + Neon (Postgres) |

---

## Module Structure (6 modules)

1. **Profile & Positioning Hub** — Resume (raw + parsed), positioning statement, target roles/stages/geography, CMF weight sliders (sum to 100), comp targets, narrative pillars (3–5). Powers all other modules.
2. **Company Intelligence Center** — Company profiles (name, website, LinkedIn, HQ, stage, size, tier, notes), earnings/signal analysis (Phase 2), Company Positioning Brief (draft/edited).
3. **Opportunity Tracker** — Job submission, CMF score (manual in Phase 1), status (Watching | Preparing | Applied | In process | Closed), outreach_sent (boolean tag), Role Positioning Brief, cover letter (Phase 2).
4. **Compensation Intelligence** — Levels.fyi embeds in company/opportunity views; optional markdown fetch later. Comp tab per company; comp snapshot per opportunity; benchmarking panel; negotiation card when in process.
5. **Outreach & Relationship Pipeline** — Contacts (name, title, company, warmth, last_contact), priority queue, templates, outreach tracking. Phase 3.
6. **Activity Dashboard** — Search health metrics, priority action queue (3–5 items), funnel view (Monitoring → Positioned → Applied/Outreach Sent → In Process → Outcome). Map funnel to Module 3 statuses.

---

## Data Model (authoritative schema)

| Entity | Key Fields |
|--------|------------|
| `UserProfile` | resume_raw, resume_parsed (experience[], skills[], education[]), positioning_statement, narrative_pillars[], target_roles[], target_stages[], geography, remote_preference, cmf_weights (e.g. domain, stage, scope, strategic, narrative — ints summing to 100), comp_target |
| `Company` | name, website, linkedin_url, hq, stage, size, tier, warmth (derived from contacts), notes, positioning_brief_id, signals[] |
| `EarningsSignal` | company_id, date, transcript, source_url?, parsed_signals[], outreach_trigger_score (1–5) |
| `CompanyPositioningBrief` | company_id, draft, edited, why_company, why_now, value_proposition, proof_points[], the_ask, completed_at |
| `Opportunity` | company_id, role_title, level, team, jd_text, key_requirements[], status, outreach_sent (boolean), cmf_score, cmf_breakdown, materials{}, comp_snapshot |
| `RolePositioningBrief` | opportunity_id, draft, edited, fit_summary, contribution_narrative, differentiated_value, proof_points[] |
| `Contact` | name, title, company_id, linkedin_url, connection_degree, warmth, source, notes, last_contact, outreach[] |
| `OutreachRecord` | contact_id, opportunity_id?, date, channel, message_summary, response |
| `CompBenchmark` | company_id, role_family, level, base_range, total_comp_range, source, fetched_at |

Resume parsing at upload: Claude returns structured `experience[]` (company, title, dates, bullets), `skills[]`, `education[]`. CMF composite: `sum(dimension_score * weight/100)`; each dimension 1–10.

---

## Build Conventions

- **First launch:** Redirect to profile setup wizard. Steps: (1) Core Profile + resume, (2) Narrative Pillars — required. (3) CMF Weights, (4) Compensation Targets — pre-filled defaults. Completing unlocks app.
- **AI-generated content:** Store in `draft`; user edits in `edited`. UI shows `edited` when present, else `draft`. Always offer "Reset to AI draft." No version history in V1.
- **Positioning brief "complete":** User explicitly marks/saves complete. Sections need not all be filled.
- **Errors:** AI failure → inline error + Retry; preserve form state. Levels.fyi failure → "Data unavailable" + manual entry fallback. Long AI calls (5–15s) → loading state, no timeout discard.
- **AI context:** Every AI call gets `positioning_statement` and `narrative_pillars` as system context. Abstract Claude behind a service; env vars for API keys.
- **Levels.fyi:** Option A (iframe) only for Phase 1. Add CSP `frame-src https://www.levels.fyi` in Next.js config.
- **Prisma migrations:** Never edit migration files manually. Run `npm run db:migrate` locally to generate new migrations. Vercel runs `prisma migrate deploy` automatically on every deploy via `vercel-build` script.
- **Environment variables:** `DATABASE_URL` must be set in `.env.local` for local dev and in Vercel project settings for all environments. `ANTHROPIC_API_KEY` needed for Phase 2.

---

## AI Prompt Contracts (Phase 2+)

**CMF generation:** System: positioning_statement, narrative_pillars, cmf_weights. User: JD + parsed resume + company research. Return JSON: per-dimension `{ score, rationale }`, plus resume_gap_analysis, recommended_tweaks, application_recommendation ("prioritize"|"proceed"|"marginal"|"skip").

**Earnings analysis:** System: positioning_statement, narrative_pillars. User: transcript text. Return JSON: hiring_signals[], strategic_priorities[], problem_areas[], outreach_trigger_score (1–5), suggested_follow_ups[]. Score ≥ 4 → Priority Action Queue.

**Narrative consistency:** System: narrative_pillars. User: generated content. Return JSON: consistency_score (1–5), assessments[], explanation. If score < 3 → yellow warning banner; never block.

---

## Funnel ↔ Status Mapping

- **Monitoring** = Watching or Preparing  
- **Positioned** = Brief ready, not yet applied / outreach_sent  
- **Applied/Outreach Sent** = status Applied and/or outreach_sent true  
- **In Process** = In process  
- **Outcome** = Closed  

Reference: [prd.md](prd.md) for full product spec, vision, and open questions.
