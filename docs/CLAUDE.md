# grndwrk — Agent Reference

MVP: Prioritize simple and functional. Ship core flows first; defer nice-to-haves. Single user through main workflow with minimal complexity.

---
## Design Context

### Users
Single-candidate users using grndwrk to run a deliberate, proactive job search campaign focused on important career decisions.

### Brand Personality
Premium, focused, editorial, and a little serious — closer to Linear or Notion than a generic SaaS dashboard. Emotional target: calm confidence and trustworthiness.

### Aesthetic Direction
- Icon-rail sidebar: 60px collapsed, 220px on hover-expand (`width 0.18s cubic-bezier(0.4,0,0.2,1)`). Logo box (24×24, `--ink` bg) + Inter wordmark. No Fraunces.
- **Light mode is the default**; dark mode via `.dark` class on `<body>`.
- Full-width main content (`var(--pad-y) var(--pad-x)`, max-width 1280px); no centered modal cards as primary content areas.
- Onboarding/profile setup uses a left sidebar step list (number + label; muted when incomplete, ink when active, checkmark when complete), temporarily replacing the module nav.
- No chromatic accent — hierarchy comes from ink levels and fills, not color.

### Typography (canonical)
- Body/UI font: **Inter** (`cv11`, `ss01`, `ss03` features). Variable: `--font-body`.
- Mono accents: **JetBrains Mono** — eyebrows, table headers, `.meta`/`.tag` contexts. Variable: `--font-mono`.
- No Fraunces, no DM Sans.

### Color System (new token names — see `docs/ui.md` for full table)
- Light defaults: `--bg #ffffff`, `--bg-sub #fafafa`, `--bg-mute #f5f5f5`, `--ink #0a0a0a`, `--ink-3 #737373`, `--line #e8e8e8`
- Dark defaults (`.dark` class): `--bg #0a0a0a`, `--bg-sub #0f0f0f`, `--bg-mute #1a1a1a`, `--ink #f5f5f5`, `--ink-3 #a3a3a3`, `--line #1f1f1f`
- Accent: `--accent` = `--ink` (monochrome — no slate blue). Primary buttons use `--accent`/`--accent-ink` (inverted pair).
- Never hardcode hex values. Never use old token names (`--background`, `--surface`, `--foreground`, `--border`, `--muted`, `--accent-hover`).

### Design Principles
1. Confident, not flashy: predictable UI patterns and minimal decorative chrome.
2. Focused, not feature-heavy looking: fewer, larger content regions; generous whitespace but not empty.
3. Trustworthy for serious decisions: typography hierarchy and restraint signal credibility.
4. Consistency: use semantic tokens; never hardcode hex in components.
5. Calm interaction feedback: 120ms transitions; respect reduced motion preferences.

---

## Current status (pick up here)

- **Phase 1:** Complete — Vercel + Neon, full app shell and CRUD.
- **Phase 2 (AI):** Substantially complete. All core AI routes wired end-to-end. `outreachDraft` prompt + API route + `LogOutreachForm` UI compose flow shipped May 23 2026. `jdExtract` prompt + `POST /api/opportunities/extract-jd` shipped May 26 2026. Two items remain (see below).
- **Phase 3 (Outreach):** Complete — `/outreach` page, `ContactsPanel` with full outreach history and log form, `outreachDraft` AI compose button all shipped and merged to `main`.
- **Design system migration:** Complete — all 5 layers done and merged to `main`. Env: `ANTHROPIC_API_KEY` required for AI; optional `ANTHROPIC_MODEL` (defaults to `claude-sonnet-4-20250514`).
- **May 26 2026 small updates:** Three items shipped — button text fix (Companies/Opportunities), JD extraction from URL, "What is grndwrk?" sidebar modal.

**Two items remaining before calling Phase 2 fully done:**
1. **Dashboard priority queue full logic** — upgrade `GET /api/dashboard` from rule-based to 6 urgency tiers using real `Contact` + `EarningsSignal` data (see `todo.md`).
2. **Production smoke test** — deploy to Vercel, confirm `ANTHROPIC_API_KEY` is set, test all AI buttons end-to-end in prod (including `outreachDraft`, `extract-jd`).

**Optional polish (P3 design audit — non-blocking):**
- Flatten card-heavy list/detail layouts to separator/row patterns where suitable
- Normalize microcopy casing across modules
- Replace opacity-only disabled states with explicit token variants

**Deferred:** Phase 4 — Council Mode (auth, multi-user, shared watchlists, export). Plan separately.

---

## Next steps (pick up here on return)

Ordered by priority.

1. **Dashboard priority queue full logic** — `GET /api/dashboard`: implement 6 urgency tiers using `Contact` + `EarningsSignal` data. Current rule-based Phase 1 logic is a stub.
2. **Production smoke test** — push to `main`, confirm Vercel build passes, verify `ANTHROPIC_API_KEY` in Vercel env, test all AI routes end-to-end in prod (including `extract-jd` with a real Greenhouse/Lever URL).
3. **P3 design polish** (optional) — see "Optional polish" above and `todo.md` P3 items.
4. **Phase 4** — auth (Clerk or NextAuth), multi-user, `userId` on all models, council shared watchlists, `GET /api/export`.

---

## Last session (May 26 2026) — what was built

### Three small updates

**Button text legibility fix (Companies + Opportunities pages)**
- All primary `<Link>` CTA buttons on `/companies`, `/opportunities`, and their empty-state CTAs now use inline `style={{ background: "var(--accent)", color: "var(--accent-ink)" }}` instead of Tailwind class utilities. This ensures `--accent-ink` (white in light mode, near-black in dark mode) always takes precedence over the `a { color: inherit }` rule in `globals.css`.
- Files changed: `app/(app)/companies/page.tsx`, `app/(app)/opportunities/page.tsx`, `components/companies/CompanyList.tsx`, `components/opportunities/OpportunityList.tsx`.

**JD extraction from posting URL (`POST /api/opportunities/extract-jd`)**
- `lib/ai/prompts/jdExtract.ts` — Zod schema `{ role_title?, level?, team?, jd_text, key_requirements[] }` + prompt that strips, cleans, and extracts from raw page text.
- `app/api/opportunities/extract-jd/route.ts` — accepts `{ url }`, server-side fetches the page with a descriptive User-Agent, strips `<script>`/`<style>`/all HTML tags to plain text, clamps to 50k chars, calls `callClaude` with the `jdExtract` prompt, returns `{ data: JdExtract }`. Errors: `fetch_failed` (non-2xx or timeout), `ai_error` (parse/Claude failure), `ai_not_configured` (503 no key). `maxDuration = 60`.
- `app/(app)/opportunities/new/page.tsx` — replaced the bare JD `<Textarea>` with a "Posting URL" input + "Extract from link" button. On success, populates `role_title`, `level`, `team`, `jd_text` (only overwrites empty fields). Inline spinner + error states. "Paste manually instead" toggle shows the textarea without a URL (also shown automatically after extraction for review). Works for static job boards (Greenhouse, Lever, Ashby); SPA/auth-gated pages (LinkedIn, Workday) may require manual paste.

**"What is grndwrk?" sidebar modal**
- `components/nav/WhatIsGrndwrkModal.tsx` — uses `Modal` from `components/ui/Modal.tsx`. Three sections: "What it helps you accomplish", "What it requires from you", "Why it's different from job boards". Voiced consistently with `/welcome`. "Got it" close button uses inline `style` for accent colors.
- `components/nav/Sidebar.tsx` — added `HelpCircle` icon (inline SVG), `helpOpen` state in `Sidebar`, `onHelp` prop on `MobileNav`. New `NavItem label="What is grndwrk?"` appears immediately above Settings in both desktop footer and mobile drawer footer. `<WhatIsGrndwrkModal>` rendered once at the `Sidebar` root, shared by both triggers.

`tsc --noEmit` passes clean.

---

## Session May 23 2026 — what was built

### `outreachDraft` — full AI outreach compose flow

**`lib/ai/prompts/outreachDraft.ts`**
- Zod schema: `{ draft: string, subject?: string }`.
- Prompt builder aware of: channel (linkedin/email/other — affects length and subject line), connection degree (first/second/cold — tone tier), prior outreach history (up to 3 summaries, avoids repeating), optional user context note. Uses `callClaudeWithProfile` so candidate positioning + narrative pillars are injected in system context.

**`app/api/contacts/[id]/outreach-draft/route.ts`**
- `POST` — accepts `{ channel?, opportunity_id?, context_note? }`. Fetches contact + optional opportunity for role title. Loads prior outreach summaries. Returns `{ data: { draft, subject? } }`. Has `maxDuration = 60`. Error shape: `{ error: "ai_error", retryable: true }` on failure.

**`components/contacts/ContactsPanel.tsx` — `LogOutreachForm` updates**
- "Draft with AI" button: calls `/api/contacts/[id]/outreach-draft`, populates the message textarea on success. Email drafts prepend `Subject: ...` to the textarea.
- "Add context" toggle: reveals an optional textarea for user guidance (role, angle, specific ask) before drafting.
- Drafting spinner state; inline error display if AI call fails.
- `tsc --noEmit` passes clean.

---

## Previous sessions — what was built

### Design system migration (complete, merged to main)

**Layer 1 — `app/globals.css` + `app/layout.tsx`**
- New 14-token CSS variable set (`--bg`, `--bg-elev`, `--bg-sub`, `--bg-mute`, `--ink`...`--ink-5`, `--line`, `--line-2`, `--accent`, `--accent-ink`, `--focus`). Light is `:root` default; dark via `body.dark`.
- Spacing tokens: `--pad-x/y`, `--gap-row/section`, `--field-h`, `--radius`, `--radius-lg`. Global type scale h1–p.
- Fonts: `Inter` (`--font-body`) + `JetBrains_Mono` (`--font-mono`). DM Sans + Fraunces removed.

**Layer 2 — `components/ThemeProvider.tsx`**
- Toggles `body.dark` (not `html.light`). Default is light.

**Layer 3 — Sidebar + app shell**
- `Sidebar.tsx`: hover-expand icon rail (60px → 220px), inline SVG icon set, no lucide-react, logo box + Inter wordmark, user-chip footer, ThemeToggle removed.
- `NavItem.tsx`: new tokens, 36px/7px radius, `collapsed` fade prop.
- `app/(app)/layout.tsx`: flex shell, `var(--pad-y) var(--pad-x)`, 1280px max-width.

**Layer 4 — All 15 primitive UI components in `components/ui/`**
- `Button`, `Input`, `Textarea`, `Select`, `PageHeader`, `Tabs`, `Badge`, `SectionCard`, `Modal`, `Skeleton`, `Card`, `DraftEditor`, `ConsistencyBanner`, `ErrorMessage`, `CmfScore`.
- Zero old token names remain in `components/ui/`. `PageHeader` gained `eyebrow` prop. `Badge` remapped to monochrome. lucide-react removed from `ConsistencyBanner` + `ErrorMessage`.

**Layer 5a — Token sweep (complete).** All 19 page/feature-level files migrated. Every legacy token reference removed (`--background`, `--surface`, `--surface-raised`, `--sidebar`, `--border`, `--foreground`, `--muted`, `--accent-hover`, `--success`, `--warning`, `--danger`, `--font-heading`). Error/warning/success surfaces use Tailwind hue classes with dark variants.

**Layer 5b — Page redesigns (complete):**
- `CompanyList.tsx` → table with `StatusPill`, `LogoBox`, `TierBadge`, mono-uppercase header, `--bg-sub` row hover, `FilterGroup` pills.
- `OpportunityList.tsx` → kanban with 5 columns, `OppCard` per spec, show/hide Closed toggle.
- `ProfileEditor.tsx` → all 5 tabs use `FieldRow` two-column layout (220px / 1fr, `--line-2` dividers, max-w 920px). `SectionCard` removed.

### Phase 3 — Outreach module (complete, merged to main)

- `/outreach` page (`app/(app)/outreach/page.tsx`) with `ContactsPanel` — warmth filter (Hot/Warm/Cold), sorted by warmth priority.
- `ContactsPanel.tsx` — contact table with `WarmthPill`, `DegreeBadge`, row expansion, outreach history timeline, `LogOutreachForm`, `AddContactForm`.
- Contacts tab wired into `/companies/[id]` detail page, scoped by company.
- Sidebar nav Outreach item fully live (no `comingSoon` flag).

### AI positioning + onboarding redesign (complete, merged to main)

- `lib/ai/prompts/positioningStatement.ts` — guided 3-question → 2–4 sentence first-person draft.
- `app/api/profile/positioning/draft/route.ts` — `POST`, draft-only, no DB write.
- `components/profile/AiPositioningPanel.tsx` — right-side drawer, 4 states (prompts / loading / draft / error), Use/Regenerate/Discard.
- Onboarding redesigned to 7 single-idea steps: Positioning → Target roles → Stages & location → Resume → Pillars → CMF weights → Comp targets.
- `/welcome` editorial intro page with cookie gate.
- `app/(app)/layout.tsx` — three-way redirect: new user → `/welcome`; partial progress → `/profile/setup`; complete → through.

---

## Phase 2 — AI layer reference

### Libraries
- [`lib/ai/claude.ts`](../lib/ai/claude.ts) — `callClaude`, `callClaudeWithProfile` (injects `UserProfile` positioning + narrative pillars), 3-attempt retry.
- [`lib/ai/extractJson.ts`](../lib/ai/extractJson.ts) — Strip markdown JSON fences, `parseWithSchema` (Zod).
- [`lib/ai/narrative.ts`](../lib/ai/narrative.ts) — `runNarrativeCheck` after generations (optional; failures ignored).
- [`lib/ai/prompts/`](../lib/ai/prompts/) — `resumeParse`, `cmf`, `companyBrief`, `roleBrief`, `earnings`, `narrativeCheck`, `coverLetter`, `positioningStatement`, `outreachDraft`, `jdExtract` (Zod schemas + prompt builders).

### API behavior
- No key → **503** `ai_not_configured` on AI routes.
- AI / parse failure → **502** `ai_failure`, `retryable: true` (monitor in Vercel logs).
- `export const maxDuration = 60` on long-running AI routes.

### Endpoints (all implemented)
| Route | Purpose |
|-------|---------|
| `POST /api/profile/positioning/draft` | Draft-only positioning statement; no DB write |
| `POST /api/profile/resume` | Parse `resume_raw` → `resume_parsed` JSON on `UserProfile` |
| `POST /api/opportunities/[id]/cmf` | Body `{ generate: true }` → AI CMF; else manual 5 dimension scores |
| `POST /api/companies/[id]/brief` | Body `{ generate: true }` → company positioning brief |
| `POST /api/opportunities/[id]/brief` | Body `{ generate: true }` → role brief |
| `POST /api/companies/[id]/signals/[signalId]/analyze` | Analyze transcript → `parsed_signals`, `outreach_trigger_score` |
| `POST /api/opportunities/[id]/cover-letter` | Generate cover letter → `materials.cover_letter.draft` |
| `POST /api/contacts/[id]/outreach-draft` | Body `{ channel?, opportunity_id?, context_note? }` → `{ draft, subject? }` |
| `POST /api/opportunities/extract-jd` | Body `{ url }` → fetch posting URL, strip HTML, extract `{ role_title?, level?, team?, jd_text, key_requirements[] }` via AI |
| `POST /api/benchmarks/fetch` | Returns `{ data: null, fallback: true }` (no scraper yet) |

Successful AI generations may include **`narrative_check`** in the JSON body (optional) — not yet consumed by UI for `ConsistencyBanner`.

### UI hooks
- **Onboarding Step 1 + Profile → Core Profile:** "Help me write with AI" → `AiPositioningPanel`.
- **Profile → Resume:** "Parse with AI" + parsed JSON preview.
- **Company → Brief / Signals:** "Generate with AI" / "Analyze with AI".
- **Opportunity → CMF / Role brief / Materials:** "Generate with AI" / "Generate cover letter".
- **Outreach → Log form:** "Draft with AI" → calls `outreachDraft` route, populates message textarea.
- **Opportunities → Add opportunity:** "Extract from link" → calls `extract-jd` with a posting URL, populates `role_title`, `level`, `team`, `jd_text` form fields. Manual paste fallback via toggle.

### Data note
- CMF `cmf_breakdown` JSON may include flat scores (manual) or flat scores + `ai` (AI: rationale, gaps, recommendation). `normalizeCmfBreakdownForSliders` in `lib/utils.ts` keeps sliders working for both.

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
- **Module 5** — `/outreach`, contacts, outreach history, AI compose
- **Module 6** — `/dashboard` funnel + priority queue (rule-based; full urgency-tier logic pending)

### Shared UI (`components/ui/`)
`Card`, `Badge`, `Button`, `Input`, `Textarea`, `Select`, `Skeleton`, `ErrorMessage`, `Modal`, `Tabs`, `PageHeader`, `CmfScore`, `DraftEditor`, `ConsistencyBanner` (banner shell exists; not yet wired to `narrative_check`)

---

## Deployment troubleshooting

### Vercel dashboard (critical)

If builds succeed but you see **404** or **configuration mismatch**:

1. **Settings → Build and Deployment** → **Framework Preset** = **Next.js** (not "Other"). Save and redeploy.

### Database and TypeScript

- **P3019:** Migration provider mismatch — regenerate Postgres migrations; see past notes in git history if needed.
- **`next build` stricter than `next dev`:** Run `npx tsc --noEmit` and `npm run build` before pushing.

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
5. **Outreach & Relationship Pipeline** — Contacts, warmth tracking, outreach history, AI compose.
6. **Activity Dashboard** — Funnel, metrics, priority queue.

---

## Data Model (authoritative schema)

See `prisma/schema.prisma` and table in earlier docs; `resume_parsed` and `cmf_breakdown` store JSON strings.

---

## Build Conventions

- **First launch:** `/welcome` (editorial intro, sets `grndwrk_welcomed=1` cookie) → `/profile/setup` (7-step wizard) → `/dashboard`. Skip welcome if cookie already set or profile has partial progress.
- **UI design system:** See [ui.md](ui.md) — that is the source of truth. Key conventions:
  - Light mode default; dark mode via `.dark` class on `<body>`.
  - Fonts: Inter (body/UI, `--font-body`) + JetBrains Mono (eyebrows/table headers, `--font-mono`) via `next/font/google`. No DM Sans, no Fraunces.
  - Tokens: `--bg`, `--bg-elev`, `--bg-sub`, `--bg-mute`, `--ink`...`--ink-5`, `--line`, `--line-2`, `--accent`, `--accent-ink`, `--focus`. Never use old names (`--background`, `--surface`, `--border`, etc.).
  - Icons: custom 16×16 / 1.5-stroke set (see `docs/design-reference/icons.jsx`). Do not import `lucide-react` in nav or new components.
  - Sidebar: icon rail (60px collapsed → 220px hover-expand). Active nav: `--bg-mute` bg, no accent color.
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
