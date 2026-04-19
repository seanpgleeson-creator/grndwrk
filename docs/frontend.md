# grndwrk — Frontend Specification

> **Status:** Phase 1 is **implemented and deployed** (Vercel + Neon). Modules 1, 2, 3, 4, and 6 are live. Module 5 (Outreach) is deferred to Phase 3. AI-driven UI (resume parse, generate briefs, CMF AI, etc.) is Phase 2.

---

## 1. App Architecture

### Framework & Tooling

- **Next.js 16+ (App Router)** — all pages use the `app/` directory with React Server Components (RSC) by default
- **Tailwind CSS** — utility-first styling with a custom design token configuration
- **Prisma ORM** — database access via server actions and API routes
- **No global state library** — React Server Components handle most data fetching; minimal `useState`/`useReducer` for local UI state; React context only where needed (e.g. onboarding wizard step state)

### Rendering Strategy

| Pattern | When |
|---|---|
| React Server Component (RSC) | Default. Data fetching, layout, read-heavy pages |
| `"use client"` Client Component | Forms, sliders, interactive UI (CMF weight sliders, tabs, modals) |
| Server Action | All mutations (create, update, delete). Called from client forms or RSC forms. |
| API Route (`app/api/`) | AI calls (streaming or long-running), Levels.fyi proxy if needed, any non-mutation async |

### Data Flow

1. Server components fetch data directly via Prisma (no fetch/REST overhead)
2. Mutations go through server actions — `revalidatePath` or `revalidateTag` refreshes the server component tree
3. AI calls (Phase 2) will go through `app/api/...` route handlers (e.g. `/api/opportunities/[id]/cmf`); use `export const maxDuration` where needed for long calls
4. Client components receive data as props from their RSC parent; they own only ephemeral UI state

---

## 2. Route Map

### Route Structure

```
/                           → redirect to /dashboard (or /welcome on first launch)
/welcome                    → Standalone intro/philosophy page (no sidebar); sets grndwrk_welcomed cookie
/profile/setup              → onboarding wizard (7 steps)
/profile                    → Profile & Positioning Hub (Module 1)
/companies                  → Company list (Module 2)
/companies/new              → Add company form
/companies/[id]             → Company profile detail (tabs: Overview, Earnings Signals, Positioning Brief)
/opportunities              → Opportunity list (Module 3)
/opportunities/new          → Add opportunity form
/opportunities/[id]         → Opportunity detail (tabs: Overview, CMF, Role Brief, Comp snapshot)
/comp                       → Compensation benchmarking panel (Module 4)
/dashboard                  → Activity Dashboard (Module 6)
```

**Note:** Company brief, earnings, and comp content live **on** `/companies/[id]` as tabs, not as separate top-level routes. Role brief and CMF live **on** `/opportunities/[id]` as tabs. Global comp benchmarking is `/comp` only.

### Route Groups & Layout Nesting

```
app/
  layout.tsx                 ← Root layout: fonts, global styles, metadata
  (onboarding)/
    welcome/
      page.tsx               ← Standalone intro page; sets grndwrk_welcomed cookie
    profile/
      setup/
        page.tsx             ← Wizard (7 steps); no sidebar
    layout.tsx               ← Minimal layout (no sidebar/nav)
  (app)/
    layout.tsx               ← App shell layout: sidebar + <main>
    dashboard/
      page.tsx
    profile/
      page.tsx
    companies/
      page.tsx
      new/
        page.tsx
      [id]/
        page.tsx             ← detail + tabs (no /brief or /comp child routes)
    opportunities/
      page.tsx
      new/
        page.tsx
      [id]/
        page.tsx             ← detail + tabs (no /brief child route)
    comp/
      page.tsx
  actions/
    profile.ts
    companies.ts
    opportunities.ts
  api/
    profile/...
    companies/...
    opportunities/...
    contacts/...
    benchmarks/...
    dashboard/
      route.ts
```

### First-Launch Gate

In the root `(app)/layout.tsx`, the gate logic (server-side) is:
1. If `positioning_statement` is set and `narrative_pillars` is non-empty → allow through (onboarding complete)
2. If `positioning_statement` is set but pillars are missing (partial progress) → `redirect('/profile/setup')`
3. If `grndwrk_welcomed=1` cookie exists → `redirect('/profile/setup')`
4. Otherwise (brand-new user, no cookie) → `redirect('/welcome')`

The welcome page sets the cookie client-side on "Get started →" click, then routes to `/profile/setup`.

---

## 3. App Shell & Navigation

### Shell Layout (`(app)/layout.tsx`)

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (fixed, 220px wide)  │  Main Content Area      │
│                               │  ┌────────────────────┐ │
│  [grndwrk logo]               │  │ Page Header        │ │
│                               │  │ (title + actions)  │ │
│  ○ Dashboard                  │  ├────────────────────┤ │
│  ○ Profile                    │  │                    │ │
│  ○ Companies                  │  │  <page content>    │ │
│  ○ Opportunities              │  │                    │ │
│  ○ Compensation               │  │                    │ │
│                               │  └────────────────────┘ │
│  (bottom)                     │                         │
│  ○ Settings (future)          │                         │
└─────────────────────────────────────────────────────────┘
```

### Sidebar Component (`components/nav/Sidebar.tsx`)

- Fixed left sidebar, full viewport height
- `NavItem` — icon + label, active state via `usePathname()`
- Active item: accent foreground colour + subtle background highlight
- Module 5 (Outreach) nav item rendered but marked "Coming soon" (disabled, greyed)
- Logo at top links to `/dashboard`

### Topbar / Page Header

- Not a persistent topbar; instead each page renders a `<PageHeader>` component inline
- `PageHeader` props: `title`, `description?`, `actions?` (JSX slot for CTA buttons)
- Keeps layout simple — no double-header confusion

---

## 4. Design System

> **Canonical reference:** See [`docs/ui.md`](ui.md) for the full, authoritative design system. The summary below reflects the current implementation.

### Overview

grndwrk uses a **dual-mode** (light default / dark opt-in) design system with a Linear-inspired aesthetic. Light mode is the default; dark mode activates via `.light`/`:root` CSS class toggle managed by `ThemeProvider`.

### Colour Tokens

All colours are CSS custom properties defined in `app/globals.css`. **Never use hardcoded hex values in components** — always reference tokens.

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--background` | `#FAFAF8` | `#0F0F0F` | Page background |
| `--sidebar` | `#F4F4F2` | `#161616` | Sidebar background |
| `--surface` | `#FFFFFF` | `#1A1A1A` | Cards, panels |
| `--surface-raised` | `#F4F4F2` | `#1F1F1F` | Nested inputs, secondary panels |
| `--border` | `#E5E5E5` | `#2A2A2A` | Dividers, card borders |
| `--foreground` | `#1A1A1A` | `#E5E5E5` | Primary text |
| `--muted` | `#6B6B6B` | `#6B6B6B` | Secondary text, placeholders |
| `--accent` | `#3B4F7C` | `#3B4F7C` | Active states, CTAs, focus rings |
| `--success` / `--warning` / `--danger` | mode-adaptive | mode-adaptive | Semantic status colours |

### Typography

- **Body/UI:** DM Sans (loaded via `next/font/google`, variable `--font-body`)
- **Display/headings:** Fraunces (loaded via `next/font/google`, variable `--font-heading`)
- Page titles: Fraunces 28px normal weight
- Section labels: DM Sans 13px semibold uppercase `tracking-[0.08em]`
- Body/labels: DM Sans 14px medium
- Metadata: DM Sans 12–13px muted

### Layout

- Fixed left sidebar: 220px, `var(--sidebar)` background
- Main content: `px-12 py-10` on desktop, responsive padding on mobile
- Sidebar collapses to a top bar + drawer on narrow viewports (`md` breakpoint)
- No drop shadows — borders provide hierarchy
- Border radii: 8px cards, 6px inputs, 4px badges

### Wizard whitespace spec (`WizardShell`)

| Property | Value |
|---|---|
| Content max-width | `max-w-[520px]` |
| Horizontal padding (desktop) | `px-20` |
| Vertical padding (desktop) | `py-16` |
| Step header bottom margin | `mb-12` |
| Field group spacing | `space-y-8` |
| Navigation top margin | `mt-14` |
| Sidebar width | `220px` |
| Step label: active | DM Sans 13px medium |
| Step label: inactive | DM Sans 12px muted |

The wizard sidebar shows step number + short label for all steps. The active step indicator uses `var(--accent)` border; completed steps fill with `var(--accent)` background + white check icon.

### AI assist panel

Used for the positioning statement draft flow. Pattern:
- Right-side drawer: `w-[440px]` desktop / full-width mobile
- Background: `var(--surface)`, left border `var(--border)`
- Header: 13px semibold uppercase label + close icon
- Prompt inputs: `var(--surface-raised)` background
- Footer: sticky, always-visible action row
- Animation: 200ms ease-out slide-in
- Closes on Escape or backdrop click

---

## 5. Shared UI Components

### Card

```tsx
// components/ui/Card.tsx
// Props: children, className?
// Usage: wraps page sections, list items
<Card className="p-6">...</Card>
```

Renders a `div` with `bg-surface border border-border rounded-lg`.

### Badge / Status Badge

```tsx
// components/ui/Badge.tsx
// Props: variant ('watching'|'preparing'|'applied'|'in-process'|'closed'|'tier-1'|'tier-2'|'tier-3')
```

| Variant | Colour |
|---|---|
| `watching` | Slate / muted |
| `preparing` | Indigo / accent |
| `applied` | Blue |
| `in-process` | Amber |
| `closed` | Green (offer) or Red (rejection) — determined by sub-status |
| `tier-1` | Indigo bold |
| `tier-2` | Indigo muted |
| `tier-3` | Slate |

### CMF Score Display

```tsx
// components/ui/CmfScore.tsx
// Props: score (number 1-10), breakdown? (per-dimension), size ('sm'|'md'|'lg')
```

- Displays numeric score with a colour-coded ring or bar
- Score bands: `≥8` green, `6–7` amber, `4–5` orange, `<4` red
- `breakdown` prop renders a 5-row dimension breakdown table
- Used in opportunity list rows (compact) and opportunity detail (full breakdown)

### Draft/Edited Content Pattern

All AI-generated content (briefs, cover letters, outreach drafts) follows the same UI pattern:

```tsx
// components/ui/DraftEditor.tsx
// Props: draft (string), edited (string | null), onSave (fn), onReset (fn)
```

- Shows `edited` content when present, else `draft`
- "Reset to AI draft" button — confirmation modal before overwriting
- Rich textarea or markdown editor for editing
- No version history; single draft slot

### Narrative Consistency Banner

```tsx
// components/ui/ConsistencyBanner.tsx
// Props: score (1-5), explanation (string), assessments[]
// Rendered above any AI-generated content when score < 3
```

- Yellow background (`warning`), warning icon
- Shows explanation text + expandable per-pillar assessment table
- Dismissible per session (never blocks user)
- Only rendered Phase 2+ when AI consistency check is active; placeholder/disabled in Phase 1

### Loading States

- **Skeleton loaders:** Used for page-level data loading (RSC suspense boundaries)
- **Inline spinner:** Used within buttons during form submission / server action
- **AI loading state:** Full-section overlay with animated indicator + "Generating..." label for long AI calls (5–15s)
- Pattern: `<Suspense fallback={<SkeletonCard />}>` wraps server components in layouts

### Error States

- **Inline API error:** Red `ErrorMessage` component with message + Retry button
- **Form errors:** Field-level validation messages below inputs
- **AI error:** Preserves form state; replaces loading state with inline error + Retry

### Modal / Dialog

- Built on Radix UI `Dialog` primitive (or `shadcn/ui` Dialog)
- Used for: confirm actions (reset draft, delete company), quick-add forms

---

## 6. Onboarding Wizard (`/profile/setup`)

### Structure

4-step wizard rendered in a centered, minimal layout (no sidebar).

```
Step 1: Core Profile + Resume
Step 2: Narrative Pillars          ← required to proceed
Step 3: CMF Weights                ← pre-filled defaults
Step 4: Compensation Targets       ← pre-filled defaults
```

Steps 1 and 2 are required — the "Next" button is disabled until minimum required fields are filled. Steps 3 and 4 have pre-filled defaults and can be completed with one click.

### State Management

- Wizard state (current step, form data per step) managed with `useReducer` in a `WizardProvider` context
- Each step is a separate client component; context holds accumulated form state
- On final step submit, a single server action persists the full profile and sets `onboarding_complete: true`
- After submit, redirect to `/dashboard`

### Step Components

```
components/onboarding/
  WizardShell.tsx         ← Step indicator, back/next nav, progress bar
  Step1CoreProfile.tsx    ← Name, target roles, target stages, geography, resume paste
  Step2NarrativePillars.tsx ← 3–5 free-text narrative pillar inputs
  Step3CmfWeights.tsx     ← Five dimension sliders (see §7)
  Step4CompTargets.tsx    ← Base target, total comp target, minimum comp, target level
```

### Gate Logic

Server-side in `(app)/layout.tsx`:

```tsx
const profile = await prisma.userProfile.findFirst()
if (!profile?.onboarding_complete) redirect('/profile/setup')
```

No client-side auth — just this single server check. On fresh DB, the profile row doesn't exist yet; the wizard creates it.

---

## 7. CMF Weight Slider Component

### Behaviour

Five sliders, one per CMF dimension: `domain`, `stage`, `scope`, `strategic`, `narrative`. All integers. Must sum to exactly 100.

### Sum-to-100 Constraint

When the user adjusts one slider, the remaining weight is distributed proportionally across the other four:

1. Record the previous value of the moved slider
2. Calculate delta: `delta = newValue - prevValue`
3. Distribute `-delta` across the other four sliders proportionally to their current values
4. If any slider would go below 0, clamp to 0 and redistribute remainder
5. Enforce a minimum of 5 per dimension to prevent zero weights
6. Display running total with a visual indicator: green when sum = 100, red with count when off

```tsx
// components/profile/CmfWeightSliders.tsx
// Props: value (CmfWeights), onChange (fn)
// CmfWeights = { domain: number, stage: number, scope: number, strategic: number, narrative: number }
```

### Visual Feedback

- Each slider label shows the dimension name + current percentage value
- A summary bar at the bottom shows all five dimensions proportionally (stacked bar, colour-coded by dimension)
- Sum indicator: "Total: 100 / 100" in green; "Total: 95 / 100" in red

---

## 8. Module-by-Module UI Breakdown

### Module 1: Profile & Positioning Hub (`/profile`)

#### Page Layout

Single-page with tabbed sections or an accordion layout. Tabs:

1. **Core Profile** — positioning statement, target roles/stages/geography
2. **Resume** — paste/upload area + parsed resume preview
3. **Narrative Pillars** — 3–5 pillar cards with edit-in-place
4. **CMF Weights** — `CmfWeightSliders` component
5. **Comp Targets** — base, total comp, minimum, target level

#### Key Components

```
components/profile/
  PositioningStatement.tsx    ← Textarea with character guidance; auto-saved
  ResumeUpload.tsx            ← Paste area + parsed JSON preview (Phase 2: Claude parse)
  NarrativePillars.tsx        ← List of pillar cards; add/remove/reorder
  CmfWeightSliders.tsx        ← See §7
  CompTargets.tsx             ← Range inputs: base, total, minimum; level select
```

#### Data Flow

- Page is a server component; fetches `UserProfile` singleton
- Each tab section is a client component receiving profile data as props
- Edits go through server actions: `updatePositioningStatement`, `updateNarrativePillars`, `updateCmfWeights`, `updateCompTargets`
- Resume parse: Phase 2 — in Phase 1, store `resume_raw` only; `resume_parsed` is null

---

### Module 2: Company Intelligence Center (`/companies`)

#### Company List (`/companies`)

- Grid of `CompanyCard` components (2–3 columns)
- Each card: company name, tier badge, stage, brief completion status, link to detail
- Filter bar: by tier (1/2/3), by stage, by brief status (complete / in progress / none)
- "Add Company" button → `/companies/new`
- Empty state: illustrated prompt to add first company

#### Add Company (`/companies/new`)

Form fields:
- Name (required)
- Website URL
- LinkedIn URL
- HQ location
- Stage (Pre-seed / Seed / Series A / Series B / Series C / Series D+ / Public / Other)
- Size (1–50 / 51–200 / 201–1000 / 1000+)
- Tier (1 / 2 / 3)
- Notes (free text)

Submit → server action → redirect to `/companies/[id]`.

#### Company Detail (`/companies/[id]`)

Tabbed layout:

| Tab | Content |
|---|---|
| **Overview** | Basic info, notes, linked opportunities count, linked contacts count (Phase 3) |
| **Brief** | Company Positioning Brief editor (see below) |
| **Opportunities** | List of tracked opportunities at this company |
| **Comp** | Levels.fyi iframe embed (Module 4, see §8.4) |

#### Company Positioning Brief (`/companies/[id]/brief`)

Uses `DraftEditor` pattern. Sections:

1. **Why this company** — free text
2. **Why now** — free text; in Phase 2, auto-populated from earnings signals
3. **Value proposition** — free text
4. **Proof points** — ordered list of 2–3 items (add/remove)
5. **The ask** — free text

- "Mark complete" button sets `completed_at` timestamp
- Completed briefs show a green "Complete" badge in the header
- Phase 1: all sections are manual free-text; no AI generation button yet
- Phase 2: "Generate with AI" button per section

```
components/companies/
  CompanyCard.tsx
  CompanyForm.tsx
  CompanyDetail.tsx
  CompanyBriefEditor.tsx
  CompanyBriefSection.tsx   ← Reusable section wrapper with label + textarea
```

---

### Module 3: Opportunity Tracker (`/opportunities`)

#### Opportunity List (`/opportunities`)

- List view (not grid — more data density needed)
- Each row: company name + role title, status badge, CMF score chip, outreach_sent indicator, date added
- Filter/sort bar: by status, by CMF score band, by company
- "Add Opportunity" button → `/opportunities/new`
- Empty state: prompt to add first opportunity

#### Add Opportunity (`/opportunities/new`)

Form fields:
- Company (select from existing companies, or type to create new)
- Role title (required)
- Level (IC1–IC7 / Manager / Director / VP / C-Suite / Other)
- Team / function
- Job description (large textarea, paste JD)
- Initial status (default: Watching)

Submit → server action → redirect to `/opportunities/[id]`.

#### Opportunity Detail (`/opportunities/[id]`)

Tabbed layout:

| Tab | Content |
|---|---|
| **Overview** | Role info, JD text (collapsible), status selector, outreach_sent toggle |
| **CMF Score** | Manual CMF score entry (Phase 1); score display + dimension breakdown |
| **Brief** | Role Positioning Brief editor |
| **Materials** | Cover letter editor (Phase 2) |
| **Comp** | Comp snapshot: Levels.fyi embed + vs. user target comparison |

#### CMF Score Entry (Phase 1 — Manual)

- Five numeric inputs (1–10), one per dimension
- Composite score calculated client-side: `sum(score * weight/100)` using profile weights
- Application recommendation badge auto-derives from composite score
- "CMF Score" tab shows the `CmfScore` component (full breakdown mode)
- Phase 2: "Generate with AI" button replaces manual entry

#### Status Management

- Status selector: dropdown or segmented control
- Values: `Watching` | `Preparing` | `Applied` | `In process` | `Closed`
- `outreach_sent` toggle: separate checkbox/switch, clearly labelled
- Status changes saved immediately via server action

```
components/opportunities/
  OpportunityRow.tsx
  OpportunityForm.tsx
  OpportunityDetail.tsx
  CmfScoreEntry.tsx          ← Manual score entry (Phase 1)
  CmfScoreDisplay.tsx        ← Read-only score + breakdown
  RoleBriefEditor.tsx
  StatusSelector.tsx
```

---

### Module 4: Compensation Intelligence (`/comp`, inline embeds)

#### Levels.fyi Embed Component

```tsx
// components/comp/LevelsFyiEmbed.tsx
// Props: company (string), track ('Product Manager' | 'Software Engineer' | ...)
```

Renders an `<iframe>` with:
- `src="https://www.levels.fyi/charts_embed.html?company={company}&track={track}"`
- `width="100%" height="500"` (responsive container)
- Error boundary: if iframe fails to load, shows "Compensation data unavailable" message with option to manually enter comp notes

CSP in `next.config.js`:

```js
headers: [{ key: 'Content-Security-Policy', value: "frame-src https://www.levels.fyi" }]
```

#### Compensation Tab (Company Profile)

- Role family selector (track): PM / SWE / Design / Data / EM
- Renders `LevelsFyiEmbed` with selected company + track
- Below embed: user's comp target displayed for reference

#### Compensation Snapshot (Opportunity Detail)

- Renders `LevelsFyiEmbed` scoped to the opportunity's company + inferred role family
- Displays user's comp target with a simple "Above / At / Below / Unknown" indicator
- Comp target comparison is derived from `UserProfile.comp_target`; no AI in Phase 1

#### Benchmarking Panel (`/comp`)

- Company selector + role family selector
- Renders `LevelsFyiEmbed` with selected parameters
- "Compare companies" view: side-by-side embeds (up to 3 companies)

---

### Module 6: Activity Dashboard (`/dashboard`)

#### Layout

Two-column layout:
- Left column (2/3 width): Priority Action Queue + Funnel View
- Right column (1/3 width): Search Health Metrics

#### Search Health Metrics

Static metric cards (Phase 1 — computed from DB, no AI):

| Metric | Source |
|---|---|
| Companies monitored | `COUNT(Company)` |
| Tier 1 targets | `COUNT(Company WHERE tier=1)` |
| Open opportunities | `COUNT(Opportunity WHERE status != 'Closed')` |
| Avg CMF score (open) | `AVG(cmf_score WHERE status != 'Closed')` |
| Briefs completed | `COUNT(CompanyPositioningBrief WHERE completed_at IS NOT NULL)` |
| Days since last activity | `MAX(updatedAt)` across all entities |

```tsx
// components/dashboard/MetricCard.tsx
// Props: label, value, trend?, description?
```

#### Priority Action Queue

Phase 1: rule-based, no AI. Generates up to 5 action items from DB queries:

| Rule | Trigger |
|---|---|
| Company added but no brief started | `CompanyPositioningBrief` is null |
| Opportunity in Watching/Preparing with no CMF score | `cmf_score` is null |
| High CMF opportunity not applied | `cmf_score >= 8` and `status == 'Watching'` |
| Opportunity in Preparing for > 7 days | `status == 'Preparing'` and age > 7 days |
| No activity in > 3 days | `MAX(updatedAt)` across all entities |

Actions rendered as `ActionItem` cards with a label, description, and a link to the relevant page.

```tsx
// components/dashboard/ActionItem.tsx
// Props: title, description, href, urgency ('high'|'medium'|'low')
```

#### Funnel View

Visual funnel showing opportunity counts per funnel stage.

| Funnel Stage | Mapped From |
|---|---|
| Monitoring | `status IN ('Watching', 'Preparing')` |
| Positioned | Brief complete + not yet applied/outreach |
| Applied/Outreach Sent | `status == 'Applied'` OR `outreach_sent == true` |
| In Process | `status == 'In process'` |
| Outcome | `status == 'Closed'` |

Rendered as a horizontal bar funnel or step diagram. Each stage is a clickable chip that links to `/opportunities?status=<filter>`.

```tsx
// components/dashboard/FunnelView.tsx
// Props: stages (Array<{ label, count, href }>)
```

---

## 9. State Management

### Principle

- **Fetch on the server, mutate via server actions.** No Redux, Zustand, or global stores in Phase 1.
- **Server components own data.** Each page fetches its own data via Prisma; data flows down as props.
- **Client components own UI state only.** Sliders, tab selection, form field values, loading indicators.

### Patterns by Use Case

| Use Case | Pattern |
|---|---|
| Page data | RSC + `await prisma.*` |
| List mutations (add/edit/delete) | Server action + `revalidatePath` |
| Form state | `useState` in client component |
| Wizard step state | `useReducer` + React context |
| CMF weight slider state | Controlled `useState` with sum constraint logic |
| AI loading state | `useState(loading)` in client component calling `/api/ai/*` |
| Tab selection | `useState` in client component |
| Active nav item | `usePathname()` from `next/navigation` |

### Server Actions Convention

All server actions live in `app/actions/` grouped by entity:

```
app/actions/
  profile.ts          ← updateProfile, updateNarrativePillars, updateCmfWeights, updateCompTargets
  companies.ts        ← createCompany, updateCompany, deleteCompany, updateCompanyBrief
  opportunities.ts    ← createOpportunity, updateOpportunity, updateStatus, updateCmfScore, updateRoleBrief
```

Pattern:
```ts
"use server"
export async function updateCompany(id: string, data: Partial<Company>) {
  await prisma.company.update({ where: { id }, data })
  revalidatePath(`/companies/${id}`)
}
```

---

## 10. Phase 1 File/Folder Scaffold

```
grndwrk/
├── app/
│   ├── layout.tsx                         ← Root layout
│   ├── globals.css                        ← CSS variables, Tailwind base
│   ├── (onboarding)/
│   │   ├── layout.tsx                     ← Minimal layout (no sidebar)
│   │   └── profile/
│   │       └── setup/
│   │           └── page.tsx               ← Wizard page
│   ├── (app)/
│   │   ├── layout.tsx                     ← App shell (sidebar + onboarding gate)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── companies/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── brief/
│   │   │       │   └── page.tsx
│   │   │       └── comp/
│   │   │           └── page.tsx
│   │   ├── opportunities/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── brief/
│   │   │           └── page.tsx
│   │   └── comp/
│   │       └── page.tsx
│   └── api/
│       └── ai/
│           ├── cmf/
│           │   └── route.ts               ← Phase 2
│           ├── brief/
│           │   └── route.ts               ← Phase 2
│           └── consistency/
│               └── route.ts               ← Phase 2
│
├── components/
│   ├── ui/                                ← Shared primitives
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Tabs.tsx
│   │   ├── Skeleton.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── DraftEditor.tsx
│   │   ├── CmfScore.tsx
│   │   └── ConsistencyBanner.tsx
│   ├── nav/
│   │   ├── Sidebar.tsx
│   │   └── NavItem.tsx
│   ├── onboarding/
│   │   ├── WizardShell.tsx
│   │   ├── Step1CoreProfile.tsx
│   │   ├── Step2NarrativePillars.tsx
│   │   ├── Step3CmfWeights.tsx
│   │   └── Step4CompTargets.tsx
│   ├── profile/
│   │   ├── PositioningStatement.tsx
│   │   ├── ResumeUpload.tsx
│   │   ├── NarrativePillars.tsx
│   │   ├── CmfWeightSliders.tsx
│   │   └── CompTargets.tsx
│   ├── companies/
│   │   ├── CompanyCard.tsx
│   │   ├── CompanyForm.tsx
│   │   ├── CompanyDetail.tsx
│   │   ├── CompanyBriefEditor.tsx
│   │   └── CompanyBriefSection.tsx
│   ├── opportunities/
│   │   ├── OpportunityRow.tsx
│   │   ├── OpportunityForm.tsx
│   │   ├── OpportunityDetail.tsx
│   │   ├── CmfScoreEntry.tsx
│   │   ├── CmfScoreDisplay.tsx
│   │   ├── RoleBriefEditor.tsx
│   │   └── StatusSelector.tsx
│   ├── comp/
│   │   └── LevelsFyiEmbed.tsx
│   └── dashboard/
│       ├── MetricCard.tsx
│       ├── ActionItem.tsx
│       └── FunnelView.tsx
│
├── app/actions/
│   ├── profile.ts
│   ├── companies.ts
│   └── opportunities.ts
│
├── lib/
│   ├── prisma.ts                          ← Prisma client singleton
│   ├── ai.ts                              ← Claude service layer (Phase 2)
│   └── utils.ts                           ← cn(), formatDate(), CMF calc helpers
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                            ← Seeds UserProfile singleton
│
├── public/
│   └── logo.svg
│
├── next.config.js                         ← CSP headers for Levels.fyi
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                             ← DATABASE_URL, ANTHROPIC_API_KEY
```

---

## 11. Key Implementation Notes

### `next.config.js` — Levels.fyi CSP

```js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.levels.fyi",
          },
        ],
      },
    ]
  },
}
```

### Prisma Client Singleton (`lib/prisma.ts`)

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### CMF Score Calculation (`lib/utils.ts`)

```ts
type CmfWeights = { domain: number; stage: number; scope: number; strategic: number; narrative: number }
type CmfBreakdown = { domain: number; stage: number; scope: number; strategic: number; narrative: number }

export function calcCmfScore(breakdown: CmfBreakdown, weights: CmfWeights): number {
  const keys = ['domain', 'stage', 'scope', 'strategic', 'narrative'] as const
  return keys.reduce((sum, k) => sum + (breakdown[k] * weights[k]) / 100, 0)
}
```

### Application Recommendation from Score

```ts
export function cmfRecommendation(score: number): 'prioritize' | 'proceed' | 'marginal' | 'skip' {
  if (score >= 8) return 'prioritize'
  if (score >= 6) return 'proceed'
  if (score >= 4) return 'marginal'
  return 'skip'
}
```

### Desktop-First Responsive Strategy

Phase 1 is desktop-first. Tailwind breakpoints used conservatively:

- Primary layouts designed for `lg:` (1024px+)
- Sidebar collapses to icon-only at `md:` (768px–1023px) — single icon column, tooltips on hover
- Below `md:`: sidebar hidden, hamburger menu (deferred to Phase 2 polish)
- No specific mobile-optimised layouts in Phase 1; readable but not optimised

---

## 12. Component Conventions

- All components use named exports (no default exports)
- File names: PascalCase for components, camelCase for utilities and actions
- Props interfaces defined inline or as a named type directly above the component
- `cn()` utility (from `clsx` + `tailwind-merge`) used for conditional class composition
- Server actions use `"use server"` directive at the top of the file
- Client components declare `"use client"` as first line
- No barrel `index.ts` files — import directly from component file paths to keep tree-shaking clean and imports explicit

---

## 13. Phase 2 Additions (Reference — Not Phase 1 Scope)

To avoid re-architecting later, Phase 2 additions are designed into the structure now:

- `DraftEditor` and `ConsistencyBanner` components are built in Phase 1 (UI shells), but AI calls that populate them are wired in Phase 2
- `/api/ai/*` routes are scaffolded in Phase 1 with placeholder responses; actual Claude calls added in Phase 2
- `lib/ai.ts` service layer is created in Phase 1 with type signatures; implementation in Phase 2
- Resume parsing (Phase 2): `ResumeUpload` component already has the form; the server action calls the AI service in Phase 2
- CMF AI scoring (Phase 2): `CmfScoreEntry` component shows manual inputs in Phase 1; in Phase 2, "Generate with AI" button calls `/api/ai/cmf` and populates the same fields
