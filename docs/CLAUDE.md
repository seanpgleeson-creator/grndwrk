# grndwrk — Agent Reference

MVP: Prioritize simple and functional. Ship core flows first; defer nice-to-haves. Single user through main workflow with minimal complexity.

---
## Design Context

### Users
Single-candidate users using grndwrk to run a deliberate, proactive job search campaign focused on important career decisions.

### Brand Personality
Premium, focused, editorial, and a little serious — closer to Linear or Notion than a generic SaaS dashboard. Emotional target: calm confidence and trustworthiness.

### Aesthetic Direction (Linear-inspired)
- Fixed left sidebar (~220px) with a lowercase `grndwrk` wordmark in Fraunces.
- **Light mode is the default**; dark mode is opt-in via toggle in the sidebar footer.
- Full-width main content with generous padding; no centered modal cards as primary content areas.
- Onboarding/profile setup uses a left sidebar step list (number + label; muted when incomplete, accent when active, checkmark when complete), temporarily replacing the module nav pattern.

### Typography (canonical)
- Body/UI font: DM Sans
- Display/headings: Fraunces

### Color System
- Light defaults (primary): background `#FAFAF8`, sidebar `#F4F4F2`, surface `#FFFFFF`, text `#1A1A1A`, muted `#6B6B6B`, border `#E5E5E5`
- Dark defaults: background `#0F0F0F`, sidebar `#161616`, surface `#1A1A1A`, text `#E5E5E5`, muted `#6B6B6B`, border `#2A2A2A`
- Accent: `#3B4F7C` (slate blue) used for active states, CTAs, and focus rings only. No gradients on primary backgrounds.
- Status/semantic tokens (success/warning/danger) must adapt per mode.

### Design Principles
1. Confident, not flashy: predictable UI patterns and minimal decorative chrome.
2. Focused, not feature-heavy looking: fewer, larger content regions; generous whitespace but not empty.
3. Trustworthy for serious decisions: typography hierarchy and restraint signal credibility.
4. Consistency: use semantic tokens and avoid hardcoded hex colors in UI components.
5. Calm interaction feedback: ~150ms transitions for hover + mode toggle; respect reduced motion preferences.

---

## Current status (pick up here)

- **Phase 1:** Shipped — Vercel + Neon, full app shell and CRUD.
- **Phase 2 (AI):** **Core work is done** — Anthropic is wired end-to-end for resume parse, CMF (AI), company brief, role brief, earnings signal analysis, and cover letter generation. Env: `ANTHROPIC_API_KEY` (required for AI). Optional: `ANTHROPIC_MODEL` (defaults to `claude-sonnet-4-20250514`).
- **Onboarding + positioning AI (in progress):** Branch `cursor/ai-positioning-onboarding-redesign` — not yet merged to main. See §“Last session” below.

**Remaining before calling Phase 2 “complete” (product-wise):**
1. Merge `cursor/ai-positioning-onboarding-redesign` and smoke-test the full onboarding flow (see §“Last session — next steps”)
2. Wire `ConsistencyBanner` to `narrative_check` from API responses
3. `outreachDraft` prompt (Phase 3 prep)
4. Production smoke test with a real API key

**Next product phase:** Phase 3 — Outreach & contacts UI (routes largely exist; needs pages and wiring).

---

## Last session — what was built

Work is on branch `cursor/ai-positioning-onboarding-redesign` (committed, not yet merged or deployed).

### 1. AI positioning draft
- **`lib/ai/prompts/positioningStatement.ts`** — Zod schema + prompt builder. Three guided questions → 2–4 sentence first-person statement. Anchors to resume when provided.
- **`app/api/profile/positioning/draft/route.ts`** — `POST`, draft-only (no DB write). Uses raw `callClaude` (not `callClaudeWithProfile`) since the profile doesn’t yet exist during onboarding. Standard error shape (503/502/422).
- **`components/profile/AiPositioningPanel.tsx`** — Right-side drawer (440px desktop / full mobile). Four states: prompts → loading → draft → error. Use / Regenerate / Discard actions. Replace-with-confirm if textarea already has content.

### 2. Onboarding redesign (7 single-idea steps)
- **`app/(onboarding)/profile/setup/page.tsx`** — Rewritten. Steps: Positioning → Target roles → Stages & location → Resume → Pillars → CMF weights → Comp targets. AI panel wired to Step 1. Resume step has “Skip for now →” ghost action. Per-step validation gates.
- **`components/onboarding/WizardShell.tsx`** — More breathing room: `max-w-[520px]`, `px-20 py-16`, `mb-12` header margin, `space-y-8` fields. Step labels: active = 13px medium, inactive = 12px muted.

### 3. Welcome page
- **`app/(onboarding)/welcome/page.tsx`** — Editorial intro: hero, three philosophy blocks (Proactive / Positioned / Pointed), numbered setup preview. “Get started →” sets `grndwrk_welcomed=1` cookie and routes to `/profile/setup`.

### 4. First-launch gate
- **`app/(app)/layout.tsx`** — Three-way redirect logic: onboarding complete → through; partial progress or cookie present → `/profile/setup`; brand-new user (no cookie) → `/welcome`.

### 5. AI panel on `/profile`
- **`components/profile/ProfileEditor.tsx`** — `CoreProfileTab` wired with same `AiPositioningPanel`, pre-seeded with full profile context (resume, roles, stages, geography).

### 6. All five `/docs` updated
`prd.md`, `frontend.md`, `backend.md`, `CLAUDE.md`, `ui.md` — new route, 7-step structure, AI prompt contract, wizard whitespace spec, AI assist panel pattern.

---

## Last session — next steps (pick up here on return)

Ordered by dependency and urgency.

### Immediate: smoke-test and merge
1. **Smoke-test the onboarding flow end-to-end** — `npm run dev` locally against a seeded DB. Key things to verify:
   - `/welcome` renders correctly; “Get started →” sets cookie and routes to step 1
   - AI panel opens/closes, runs draft, Use/Discard work (requires `ANTHROPIC_API_KEY` in `.env`)
   - Step validation: step 1 blocks on empty statement, step 2 blocks on empty roles, steps 3–7 don’t block
   - “Skip for now” on resume step advances correctly
   - Step 7 submit lands on `/dashboard`
   - Returning user (cookie already set) goes to `/profile/setup`, not `/welcome`
2. **Verify `/profile` Core Profile tab** — “Help me write with AI” button appears and panel works with existing profile data.
3. **Merge `cursor/ai-positioning-onboarding-redesign` to main** once smoke-tested.

### Shortly after
4. **Wire `ConsistencyBanner`** — Read `narrative_check` from CMF / brief / cover-letter API responses; show yellow banner when `consistency_score < 3`. `ConsistencyBanner` component already exists in `components/ui/`.
5. **Production smoke test** — Confirm `ANTHROPIC_API_KEY` is set on Vercel; test all AI buttons end-to-end in production.

### Phase 3 (next major phase)
6. **Outreach page + contact CRUD UX** — Routes exist (`/contacts`, `/contacts/[id]/outreach`); need pages, forms, and wiring to the priority queue.
7. **`outreachDraft` prompt** — Connect earnings signals or role priorities to user background; feed into the outreach pipeline.
8. **Dashboard priority queue enhancements** — Extend `GET /api/dashboard` with urgency tiers using contacts + earnings signals (per `todo.md`).

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
| `POST /api/profile/positioning/draft` | Draft-only positioning statement from guided answers + context; no DB write |
| `POST /api/profile/resume` | Parse `resume_raw` → `resume_parsed` JSON on `UserProfile` |
| `POST /api/opportunities/[id]/cmf` | Body `{ generate: true }` → AI CMF; else manual 5 dimension scores |
| `POST /api/companies/[id]/brief` | Body `{ generate: true }` → company positioning brief fields + draft |
| `POST /api/opportunities/[id]/brief` | Body `{ generate: true }` → role brief fields + draft |
| `POST /api/companies/[id]/signals/[signalId]/analyze` | Analyze transcript → `parsed_signals`, `outreach_trigger_score` |
| `POST /api/opportunities/[id]/cover-letter` | Generate cover letter → `materials.cover_letter.draft` |
| `POST /api/benchmarks/fetch` | Returns `{ data: null, fallback: true }` (no scraper yet) |

Successful AI generations may include **`narrative_check`** in the JSON body (optional) — not yet consumed by UI for `ConsistencyBanner`.

### UI hooks (current)
- **Onboarding Step 1 + Profile → Core Profile:** “Help me write with AI” opens `AiPositioningPanel` (guided prompts → side panel draft → Use/Regenerate/Discard). Uses `POST /api/profile/positioning/draft`. Draft-only until user accepts.
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

See §“Last session — next steps” above for the current ordered list. Short form:

1. Smoke-test `cursor/ai-positioning-onboarding-redesign` branch — onboarding flow + AI panel
2. Merge to main
3. Wire `ConsistencyBanner` to `narrative_check`
4. Production smoke test (`ANTHROPIC_API_KEY` on Vercel)
5. Phase 3: Outreach page, contact CRUD, `outreachDraft` prompt

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

- **First launch:** `/welcome` (editorial intro, sets `grndwrk_welcomed=1` cookie) → `/profile/setup` (7-step wizard) → `/dashboard`. Skip welcome if cookie already set or profile has partial progress.
- **UI design system:** Linear-inspired, light mode default. See [ui.md](ui.md) for full spec.
  - Light mode default; dark mode via `.dark` class on `<html>`, toggled in sidebar footer.
  - Accent: `#3B4F7C` (slate blue). Fonts: DM Sans (body) + Fraunces (headings) via `next/font/google`.
  - Icons: `lucide-react`. No inline SVGs in nav components.
  - Sidebar: 220px fixed left, `var(--sidebar)` bg, lowercase `grndwrk` wordmark in Fraunces.
  - Onboarding: sidebar-step layout (7 steps) with step list replacing module nav during `/profile/setup`.
  - All colors via CSS variables; never hardcode hex in components.
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
