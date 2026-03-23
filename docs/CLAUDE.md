# grndwrk — Agent Reference

MVP: Prioritize simple and functional. Ship core flows first; defer nice-to-haves. Single user through main workflow with minimal complexity.

---

## Current status (pick up here)

- **Phase 1:** Shipped — Vercel + Neon, full app shell and CRUD.
- **Phase 2 (AI):** **Core work is done** — Anthropic is wired end-to-end for resume parse, CMF (AI), company brief, role brief, earnings signal analysis, and cover letter generation. Env: `ANTHROPIC_API_KEY` (required for AI). Optional: `ANTHROPIC_MODEL` (defaults to `claude-sonnet-4-20250514`).
- **In parallel:** UI polish / design work may proceed in a separate session; this doc describes backend + AI behavior so you can align UI with real API responses.

**Remaining before calling Phase 2 “complete” (product-wise):** wire `ConsistencyBanner` to `narrative_check` from API responses, richer dashboard priority queue (optional), `outreachDraft` prompt (Phase 3 prep), production smoke test with a real API key.

**Next product phase:** Phase 3 — Outreach & contacts UI (routes largely exist; needs pages and wiring).

---

## Phase 2 — What was finished (AI layer)

### Libraries
- [`lib/ai/claude.ts`](../lib/ai/claude.ts) — `callClaude`, `callClaudeWithProfile` (injects `UserProfile` positioning + narrative pillars), 3-attempt retry.
- [`lib/ai/extractJson.ts`](../lib/ai/extractJson.ts) — Strip markdown JSON fences, `parseWithSchema` (Zod).
- [`lib/ai/narrative.ts`](../lib/ai/narrative.ts) — `runNarrativeCheck` after generations (optional; failures ignored).
- [`lib/ai/prompts/`](../lib/ai/prompts/) — `resumeParse`, `cmf`, `companyBrief`, `roleBrief`, `earnings`, `narrativeCheck`, `coverLetter` (Zod schemas + prompt builders).

### API behavior
- No key → **503** `ai_not_configured` on AI routes.
- AI / parse failure → **502** `ai_failure`, `retryable: true` (monitor in Vercel logs).
- `export const maxDuration = 60` on long-running AI routes.

### Endpoints (implemented)
| Route | Purpose |
|-------|---------|
| `POST /api/profile/resume` | Parse `resume_raw` → `resume_parsed` JSON on `UserProfile` |
| `POST /api/opportunities/[id]/cmf` | Body `{ generate: true }` → AI CMF; else manual 5 dimension scores |
| `POST /api/companies/[id]/brief` | Body `{ generate: true }` → company positioning brief fields + draft |
| `POST /api/opportunities/[id]/brief` | Body `{ generate: true }` → role brief fields + draft |
| `POST /api/companies/[id]/signals/[signalId]/analyze` | Analyze transcript → `parsed_signals`, `outreach_trigger_score` |
| `POST /api/opportunities/[id]/cover-letter` | Generate cover letter → `materials.cover_letter.draft` |
| `POST /api/benchmarks/fetch` | Returns `{ data: null, fallback: true }` (no scraper yet) |

Successful AI generations may include **`narrative_check`** in the JSON body (optional) — not yet consumed by UI for `ConsistencyBanner`.

### UI hooks (current)
- **Profile → Resume:** “Parse with AI” + parsed JSON preview.
- **Company → Brief:** “Generate with AI”.
- **Company → Signals:** “Analyze with AI” per signal.
- **Opportunity → CMF:** “Generate with AI” + short AI rationale / recommendation when `cmf_breakdown.ai` is present.
- **Opportunity → Role brief / Materials:** “Generate with AI” / “Generate cover letter”.

### Data note
- CMF `cmf_breakdown` JSON may include **flat scores** (manual) or **flat scores + `ai`** (AI: rationale, gaps, recommendation). [`normalizeCmfBreakdownForSliders`](../lib/utils.ts) keeps sliders working for both.

---

## What Has Been Built (Phase 1) — summary

### Infrastructure
- Next.js 16 App Router, Tailwind CSS v4, Radix UI, Zod, `clsx`, `tailwind-merge`
- Prisma 7 + PostgreSQL + `@prisma/adapter-pg`
- `vercel.json`: `framework: nextjs`, `vercel-build` = `prisma generate && prisma migrate deploy && next build`
- CSP: `frame-src https://www.levels.fyi`

### Modules
- **Module 1** — `/profile/setup`, `/profile`, CMF sliders, comp targets
- **Module 2** — Company list/detail, signals, company brief tabs
- **Module 3** — Opportunities, CMF tab, role brief, materials, comp snapshot
- **Module 4** — `/comp`, Levels.fyi embeds
- **Module 6** — `/dashboard` funnel + priority queue (rule-based)

### API surface (non-exhaustive; see `app/api/`)
- Profile, companies, opportunities, benchmarks, contacts, dashboard — as in Phase 1; AI-specific routes listed in the Phase 2 table above.

### Shared UI (`components/ui/`)
`Card`, `Badge`, `Button`, `Input`, `Textarea`, `Select`, `Skeleton`, `ErrorMessage`, `Modal`, `Tabs`, `PageHeader`, `CmfScore`, `DraftEditor`, `ConsistencyBanner` (banner not yet wired to AI `narrative_check`)

---

## Deployment troubleshooting

### Vercel dashboard (critical)

If builds succeed but you see **404** or **configuration mismatch**:

1. **Settings → Build and Deployment** → **Framework Preset** = **Next.js** (not “Other”). Save and redeploy.

### Database and TypeScript

- **P3019:** Migration provider mismatch — regenerate Postgres migrations; see past notes in git history if needed.
- **`next build` stricter than `next dev`:** Run `npx tsc --noEmit` and `npm run build` before pushing.

---

## Next steps (ordered suggestions)

1. **Your UI session:** Align components with AI flows (loading, errors from 502/503, retry, empty states). API responses: `{ data }` on success; `{ error, message, retryable }` on failure; some routes return `{ data, narrative_check }`.
2. **ConsistencyBanner:** Read `narrative_check` from CMF/brief/cover-letter responses (or pass from server components after fetch); show yellow when `consistency_score < 3`, dismissible.
3. **Dashboard:** Extend `GET /api/dashboard` priority queue with urgency tiers using contacts + earnings signals (per `todo.md`).
4. **Production:** Confirm `ANTHROPIC_API_KEY` (and optional `ANTHROPIC_MODEL`) on Vercel; smoke-test all AI buttons.
5. **Phase 3:** Outreach page, contact CRUD UX, `outreachDraft` prompt when ready.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4 |
| Backend | Next.js API routes + Server Actions |
| Database | PostgreSQL (Neon) via Prisma 7 + `@prisma/adapter-pg` |
| AI | Anthropic Claude (`@anthropic-ai/sdk`); `ANTHROPIC_API_KEY` required for AI features |
| Salary data | Levels.fyi iframe embeds; CSP `frame-src https://www.levels.fyi` |
| Auth (V1) | None. Single-user; `UserProfile` singleton `id = "singleton"`. |
| Hosting | Vercel + Neon |

---

## Module Structure (6 modules)

1. **Profile & Positioning Hub** — Resume (raw + parsed), positioning, pillars, CMF weights, comp targets.
2. **Company Intelligence Center** — Company profiles, earnings signals, company positioning brief.
3. **Opportunity Tracker** — Job pipeline, CMF (manual + AI), role brief, materials, comp snapshot.
4. **Compensation Intelligence** — Levels.fyi embeds, benchmarking, negotiation context.
5. **Outreach & Relationship Pipeline** — Phase 3.
6. **Activity Dashboard** — Funnel, metrics, priority queue.

---

## Data Model (authoritative schema)

See `prisma/schema.prisma` and table in earlier docs; `resume_parsed` and `cmf_breakdown` store JSON strings.

---

## Build Conventions

- **First launch:** `/profile/setup` until onboarding complete.
- **Onboarding visual direction (`/profile/setup`):**
  - Light mode with warm base (`#FAFAF8`), ink text (`#1A1A1A`), subtle borders (`#E5E5E5`).
  - Accent color is deep teal (`#0D7377`), used for focus states/progress/primary actions (no purple).
  - Layout is full-width single-column with left-aligned content and `max-width: 680px`; no centered modal card.
  - Progress UI is minimal: thin line + "Step X of Y"; no tab-style step bar.
  - Typography uses Fraunces for headings and DM Sans for body/UI in the onboarding flow.
  - Inputs are full-width with labels above fields; textareas should be comfortably tall for long-form input.
- **AI content:** Draft vs edited; reset-to-draft pattern for briefs.
- **Errors:** AI failures should surface **retry** in UI when `retryable: true`.
- **Prisma:** `npm run db:migrate` locally; Vercel runs migrate via `vercel-build`.
- **Env:** `DATABASE_URL` everywhere; `ANTHROPIC_API_KEY` for AI.

---

## AI Prompt Contracts

See `lib/ai/prompts/*` and [prd.md](prd.md) for full product intent. CMF, earnings, and narrative-check shapes match the Zod schemas in code.

---

## Funnel ↔ Status Mapping

- **Monitoring** = Watching or Preparing  
- **Positioned** = Brief ready, not yet applied / outreach_sent  
- **Applied/Outreach Sent** = Applied and/or outreach_sent  
- **In Process** = In process  
- **Outcome** = Closed  

Reference: [prd.md](prd.md) for full product spec.
