# UI Technical Audit — grndwrk

Scope audited: existing `app/` + `components/` UI implementation against the current Linear-style design system (`docs/ui.md`) and technical quality dimensions.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | Multiple unlabeled icon-only buttons and likely sub-44px tap targets |
| 2 | Performance | 2/4 | Overuse of `transition-all`; width-based animated funnel bars trigger layout work |
| 3 | Responsive Design | 1/4 | Fixed 220px sidebar + fixed left offset without mobile variants |
| 4 | Theming | 3/4 | Good token foundation, but several hard-coded palette classes remain |
| 5 | Anti-Patterns | 3/4 | Mostly clean and intentional; a few generic patterns and hard-coded accents remain |
| **Total** |  | **11/20** | **Acceptable (significant work needed)** |

## Anti-Patterns Verdict

**Pass with caveats.** This does **not** read as obvious AI slop overall, but there are recurring tells:
- Hard-coded utility colors (`text-indigo-*`, `bg-indigo-*`, `text-red-400`) in feature components.
- Repeated `transition-all` across core UI surfaces.
- Card-heavy information layout in list/detail modules.

No gradient-text, glassmorphism spam, sparkline decorations, or metric-hero template abuse were found.

## Executive Summary

- Audit Health Score: **11/20 (Acceptable)**
- Issues by severity: **P0: 0**, **P1: 6**, **P2: 7**, **P3: 4**
- Top critical issues:
  1. Missing accessible names on several icon-only action buttons.
  2. Desktop-first fixed shell with no practical mobile adaptation.
  3. Theming consistency drift via remaining hard-coded color utilities.
  4. `transition-all` used broadly where property-targeted transitions are safer/faster.
  5. Reduced-motion preference is not respected for existing animation classes.

## Detailed Findings by Severity

### P1 Major

- **[P1] Icon-only controls missing accessible labels**
  - **Location**: `components/companies/CompanyDetailTabs.tsx` (delete/close icon buttons), `components/opportunities/OpportunityDetailTabs.tsx` (remove proof-point buttons), `components/profile/ProfileEditor.tsx` (remove pillar buttons), `components/ui/ConsistencyBanner.tsx` (dismiss), other icon-only control spots.
  - **Category**: Accessibility
  - **Impact**: Screen reader users cannot understand button purpose; fails non-text control naming.
  - **WCAG/Standard**: WCAG 2.1 — 4.1.2 Name, Role, Value; 2.4.6 Headings and Labels (supporting)
  - **Recommendation**: Add `aria-label` on icon-only controls; prefer visible text labels where possible.
  - **Suggested command**: `/harden`

- **[P1] Mobile layout risk from fixed shell geometry**
  - **Location**: `components/nav/Sidebar.tsx` (`w-[220px]` fixed), `app/(app)/layout.tsx` (left-offset main area pattern), `components/onboarding/WizardShell.tsx` (`aside` fixed + `ml-[220px]`)
  - **Category**: Responsive
  - **Impact**: On narrow viewports, content can be compressed/overflow and nav consumes too much horizontal space.
  - **WCAG/Standard**: WCAG 2.1 — 1.4.10 Reflow
  - **Recommendation**: Introduce responsive breakpoints for collapsed or drawer nav; remove fixed left offset on small screens.
  - **Suggested command**: `/adapt`

- **[P1] Touch targets likely below recommended minimum**
  - **Location**: `components/nav/NavItem.tsx` (`px-3 py-2 text-sm`), `components/ui/Button.tsx` size `sm` (`px-3 py-1.5`), multiple small icon buttons in tab editors.
  - **Category**: Accessibility / Responsive
  - **Impact**: Harder interaction on touch devices; higher mis-tap rate.
  - **WCAG/Standard**: WCAG 2.5.5 Target Size (AAA advisory), platform usability standard 44x44px
  - **Recommendation**: Increase minimum interactive area (especially small/icon controls) or add invisible hit-area padding.
  - **Suggested command**: `/adapt`

- **[P1] Hard-coded semantic colors bypass design tokens**
  - **Location**: `components/ui/Button.tsx` (`bg-red-500/10 ... text-red-400`), `components/opportunities/OpportunityDetailTabs.tsx` (`bg-indigo-500/20 ... text-indigo-300`), `components/profile/ProfileEditor.tsx` (`text-red-400`)
  - **Category**: Theming
  - **Impact**: Inconsistent appearance across light/dark modes and weak long-term maintainability.
  - **WCAG/Standard**: Design-system consistency / token governance
  - **Recommendation**: Replace with semantic token classes using `var(--danger)`, `var(--warning)`, `var(--accent)`, etc.
  - **Suggested command**: `/normalize`

- **[P1] Reduced-motion preference not implemented**
  - **Location**: multiple components using `animate-spin`, `animate-pulse`, transition classes; no `prefers-reduced-motion` handling in `app/globals.css`.
  - **Category**: Accessibility / Performance
  - **Impact**: Motion-sensitive users receive full animation behavior.
  - **WCAG/Standard**: WCAG 2.3.3 Animation from Interactions (supporting), OS accessibility alignment
  - **Recommendation**: Add `@media (prefers-reduced-motion: reduce)` to disable/reduce non-essential animation.
  - **Suggested command**: `/harden`

- **[P1] Layout-affecting animation in funnel bars**
  - **Location**: `app/(app)/dashboard/page.tsx` (`h-full rounded transition-all` + dynamic `style={{ width: ... }}`)
  - **Category**: Performance
  - **Impact**: Width transitions can trigger layout recalculation and less smooth rendering.
  - **WCAG/Standard**: Performance best-practice
  - **Recommendation**: Avoid `transition-all`; if animation needed, use transform-based approach or discrete updates.
  - **Suggested command**: `/optimize`

### P2 Minor

- **[P2] Overuse of `transition-all`**
  - **Location**: `components/nav/ThemeToggle.tsx`, `components/nav/NavItem.tsx`, `components/onboarding/WizardShell.tsx`, `components/profile/CmfWeightSliders.tsx`, and others.
  - **Category**: Performance
  - **Impact**: Animates unnecessary properties and can increase rendering overhead.
  - **Recommendation**: Scope transitions to explicit properties (`transition-colors`, `transition-opacity`, etc.).
  - **Suggested command**: `/optimize`

- **[P2] Overlay blur in modal is expensive on low-end devices**
  - **Location**: `components/ui/Modal.tsx` (`backdrop-blur-sm`)
  - **Category**: Performance
  - **Impact**: Potential GPU cost on slower hardware.
  - **Recommendation**: Consider reducing blur strength or using flat overlay for constrained devices.
  - **Suggested command**: `/optimize`

- **[P2] Mixed historical docs vs current implementation**
  - **Location**: `docs/frontend.md` still describes older dark/Inter baseline while `docs/ui.md` + implementation are tokenized dual-mode.
  - **Category**: Theming / Systemic process
  - **Impact**: Contributors may follow stale specs and reintroduce inconsistencies.
  - **Recommendation**: Reconcile frontend docs with canonical `docs/ui.md`.
  - **Suggested command**: `/normalize`

- **[P2] Some status colors still tied to hue utilities rather than semantic tiers**
  - **Location**: `components/ui/Badge.tsx` (blue/amber/green utility classes), `components/opportunities/OpportunityDetailTabs.tsx` outreach chip.
  - **Category**: Theming
  - **Impact**: Harder global palette changes and less predictable mode behavior.
  - **Recommendation**: Map all status appearances through semantic token set.
  - **Suggested command**: `/normalize`

- **[P2] Reflow risk in side-by-side forms on narrow screens**
  - **Location**: `components/companies/CompanyDetailTabs.tsx` (`grid-cols-2`, `grid-cols-3`), `components/opportunities/OpportunityDetailTabs.tsx` (`grid-cols-2`)
  - **Category**: Responsive
  - **Impact**: Dense forms can become cramped before breakpoints are applied.
  - **Recommendation**: Add responsive column fallbacks (`grid-cols-1 md:grid-cols-2` etc.).
  - **Suggested command**: `/adapt`

- **[P2] Link-like text buttons rely on color + underline only**
  - **Location**: `components/ui/DraftEditor.tsx` reset action.
  - **Category**: Accessibility
  - **Impact**: Reduced clarity in high-density UI and for low-vision users.
  - **Recommendation**: Add stronger state treatment/focus ring; ensure keyboard focus visibility.
  - **Suggested command**: `/harden`

- **[P2] Small metadata text frequently at 12px muted**
  - **Location**: multiple components (`PageHeader` descriptions, badges, metadata labels).
  - **Category**: Accessibility
  - **Impact**: Readability can degrade, especially in dark mode with muted color.
  - **Recommendation**: Audit contrast and bump critical metadata to 13–14px where it carries task-relevant info.
  - **Suggested command**: `/clarify`

### P3 Polish

- **[P3] Card-heavy composition in list/detail areas**
  - **Location**: company/opportunity list and detail tabs.
  - **Category**: Anti-Pattern
  - **Impact**: Slight visual heaviness vs the intended editorial minimal tone.
  - **Recommendation**: Flatten selected sections to separators/rows where suitable.
  - **Suggested command**: `/arrange`

- **[P3] Inconsistent microcopy casing across small labels**
  - **Location**: section labels and helper copy in mixed title/sentence casing.
  - **Category**: UX Writing / Consistency
  - **Impact**: Minor inconsistency in perceived polish.
  - **Recommendation**: Normalize casing rules for section labels and metadata.
  - **Suggested command**: `/typeset`

- **[P3] A few visual states still rely on opacity changes only**
  - **Location**: disabled and muted states in nav/buttons.
  - **Category**: Accessibility
  - **Impact**: Minor clarity gap for distinguishing disabled vs inactive.
  - **Recommendation**: Pair opacity with explicit tokenized color variants.
  - **Suggested command**: `/clarify`

- **[P3] Some transitions use generic duration without easing specification**
  - **Location**: several components rely on defaults rather than explicit easing consistency.
  - **Category**: Motion consistency
  - **Impact**: Subtle inconsistency in interaction feel.
  - **Recommendation**: standardize timing/easing utility mapping at component level.
  - **Suggested command**: `/polish`

## Patterns & Systemic Issues

- Hard-coded color utilities still appear in multiple feature components despite tokenized theme foundation.
- Responsive strategy remains desktop-first with fixed shell assumptions (220px sidebar + offset) repeated in app and onboarding.
- `transition-all` appears broadly across components; indicates missing motion utility discipline.
- Accessibility semantics for icon-only controls are inconsistent across editors/tabs.

## Positive Findings

- Strong semantic token foundation exists in `app/globals.css` with dark/light mode parity.
- Theme switching architecture is clean (`ThemeProvider`, persisted localStorage state).
- Typography and hierarchy direction is coherent with documented design intent (`docs/ui.md`).
- Component architecture is modular, with reusable primitives (`Card`, `Input`, `Textarea`, `Tabs`, `Badge`).
- No major “AI slop” visual signatures (no gradient-text metrics hero, no glassmorphism overuse, no decorative chart spam).

## Recommended Actions (Priority Order)

1. **[P1] `/harden`** — Add ARIA labels to icon-only controls, improve focus visibility, and implement reduced-motion support.
2. **[P1] `/adapt`** — Make shell and onboarding layouts responsive (sidebar collapse/drawer, remove fixed-offset dependency on small screens, improve touch target sizes).
3. **[P1] `/normalize`** — Replace remaining hard-coded utility colors with semantic token-based classes.
4. **[P1] `/optimize`** — Replace `transition-all` with property-specific transitions; remove layout-affecting width animation where possible.
5. **[P2] `/clarify`** — Improve readability of critical metadata text and strengthen non-color-only state distinctions.
6. **[P3] `/arrange`** — Reduce card stacking where list/separator patterns better match the design direction.
7. **[P3] `/typeset`** — Normalize section label and metadata casing/typography details.
8. **[P3] `/polish`** — Final consistency pass once P1/P2 changes land.

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `/audit` after fixes to see your score improve.

