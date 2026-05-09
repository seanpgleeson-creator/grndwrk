# grndwrk UI Design System

## Design Direction

grndwrk should feel like a premium, focused tool — closer to Linear than a generic SaaS dashboard. Think: confident, monochrome, dense-but-spacious. The palette is intentionally neutral; hierarchy comes from weight, size, and spacing — not color. This is a tool for deliberate people making important career decisions.

## Color Tokens

All colors are CSS custom properties. **Light mode is the default**; dark mode activates via `.dark` class on `<body>`.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--bg` | `#ffffff` | `#0a0a0a` | Page background |
| `--bg-elev` | `#ffffff` | `#111111` | Elevated surfaces (cards, inputs) |
| `--bg-sub` | `#fafafa` | `#0f0f0f` | Subtle recessed backgrounds (sidebar, table headers, kanban columns) |
| `--bg-mute` | `#f5f5f5` | `#1a1a1a` | Muted fill (active nav, tags, fit bar track) |
| `--ink` | `#0a0a0a` | `#f5f5f5` | Primary text; also the accent / primary button background |
| `--ink-2` | `#404040` | `#d4d4d4` | Secondary text, cell values, soft labels |
| `--ink-3` | `#737373` | `#a3a3a3` | Muted text, hints, placeholders, inactive nav |
| `--ink-4` | `#a3a3a3` | `#737373` | Placeholder, disabled, subtle meta |
| `--ink-5` | `#d4d4d4` | `#404040` | Scrollbar hover, faintest ink |
| `--line` | `#e8e8e8` | `#1f1f1f` | Standard border (cards, inputs, sidebar) |
| `--line-2` | `#ededed` | `#262626` | Lighter divider (table row separators, activity rows) |
| `--accent` | `#0a0a0a` | `#f5f5f5` | Primary action background (same as `--ink` by default) |
| `--accent-ink` | `#ffffff` | `#0a0a0a` | Text on accent background |
| `--focus` | `#0a0a0a` | `#f5f5f5` | Focus ring color |

### Usage Rules

- Never use hardcoded hex values in components — always reference a CSS variable.
- There is no chromatic accent. Hierarchy is achieved through ink levels and background fills.
- Status colors (success / warning / danger) are not in the base token set; use contextual inline styles where needed and document them per-component.

### Dark Mode

Dark mode is activated by adding `.dark` to `<body>`. All tokens invert automatically. Primary actions invert: `--accent` becomes near-white, `--accent-ink` becomes near-black.

## Typography

### Font Stack

- **Body / UI**: `Inter` (variable font, `cv11`, `ss01`, `ss03` features enabled)
- **Mono accents**: `JetBrains Mono` (used for eyebrows, table column headers, meta labels)
- **Optional display** (variant only): `Instrument Serif` — applies to `h1`, `h2` when `body[data-type="serif-heads"]` is set; not the default
- Font smoothing: `antialiased`, `optimizeLegibility`

### Type Scale

| Role | Element | Size | Weight | Letter-spacing | Line-height | Color |
|------|---------|------|--------|----------------|-------------|-------|
| Page title | `h1` | 32px | 600 | `-0.02em` | 1.15 | `--ink` |
| Section heading | `h2` | 20px | 600 | `-0.01em` | 1.25 | `--ink` |
| Card heading | `h3` | 14px | 600 | `-0.005em` | — | `--ink` |
| Body paragraph | `p` | 14px | 400 | — | 1.5 | `--ink-2` |
| Form label | `.label` | 13px | 500 | `-0.005em` | — | `--ink` |
| Helper / hint | `.help` | 12px | 400 | — | 1.45 | `--ink-3` |
| Metadata | `.meta` | 12px | 500 | — | — | `--ink-3` |
| Muted text | `.muted` | inherit | inherit | — | — | `--ink-3` |
| Micro copy | `.micro` | 13px | 400 | — | 1.5 | `--ink-3` |
| Tag / badge | `.tag` | 11px | 500 | `0.005em` | — | `--ink-2` |
| Eyebrow label | — | 11px | 500 | `0.08em` | — | `--ink-3` |

### Eyebrow Labels

Page headers use a mono-uppercase eyebrow above the `h1`. Rendered with `font-family: var(--font-mono)`, `font-size: 11px`, `font-weight: 500`, `text-transform: uppercase`, `letter-spacing: 0.08em`, `color: var(--ink-3)`. Bottom margin before the title: `10px`.

Table column headers use the same treatment at `11.5px` with `letter-spacing: 0.06em` on a `--bg-sub` background row.

## Spacing & Sizing Tokens

Spacing is managed via CSS custom properties (balanced default):

| Token | Balanced | Compact | Spacious |
|-------|----------|---------|----------|
| `--pad-x` | `40px` | `28px` | `56px` |
| `--pad-y` | `32px` | `22px` | `44px` |
| `--gap-row` | `20px` | `14px` | `28px` |
| `--gap-section` | `40px` | `28px` | `56px` |
| `--field-h` | `38px` | `32px` | `44px` |

### Border Radii

| Context | Value |
|---------|-------|
| `--radius` | `8px` — inputs, default buttons, small cards, OppCards |
| `--radius-lg` | `12px` — large cards, kanban columns |
| Small buttons (`.btn-sm`) | `6px` |
| Nav items | `7px` |
| Logo box | `6px` |
| Tag / badge | `6px` |
| Status pill (companies) | `999px` |
| User avatar | `50%` |

## Application Shell

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (60px rail → 220px expanded)  │  Main content      │
│  background: var(--bg-sub)             │  flex: 1           │
│  border-right: 1px solid var(--line)   │  padding:          │
│  position: sticky; height: 100vh       │  var(--pad-y)      │
│                                        │  var(--pad-x)      │
│                                        │  max-width: 1280px │
│                                        │  margin: 0 auto    │
└─────────────────────────────────────────────────────────────┘
```

- The app root (`div.app`) is `display: flex; flex-direction: row; min-height: 100vh`.
- Main content scrolls; the sidebar is `position: sticky; top: 0`.
- No top navigation bar in the default configuration.
- Screen transitions: `animation: fadeIn 0.25s ease-out` — opacity 0→1 + `translateY(4px)` → `none`.

## Sidebar

The sidebar is an icon rail that hover-expands to full width.

### Dimensions

- **Collapsed (rail)**: `60px` wide
- **Expanded (hover)**: `220px` wide
- **Transition**: `width 0.18s cubic-bezier(0.4, 0, 0.2, 1)`
- The sidebar's flex basis is `60px` (rail); the absolute inner panel transitions its own `width`.

### Internal Layout

Padding: `20px 12px` all sides. Internal gap: `24px` between sections.

```
Sidebar
├── Wordmark
│     └── 24×24 logo box (--ink bg, --bg text, 6px radius) + "grndwrk" label (15px / 600 / -0.03em)
├── Nav (gap: 2px between items)
│     └── NavItem × 6
└── Footer
      ├── Settings NavItem
      └── User chip (28×28 circle, gradient, initials at 11px/600)
            + name (12.5px/500/--ink) + email (11.5px/--ink-3)
```

### NavItem

| State | Background | Text color |
|-------|-----------|------------|
| Default | `transparent` | `--ink-3` |
| Hover | `--bg-sub` | — |
| Active | `--bg-mute` | `--ink` |

- Height: `36px`; padding: `0 8px`; border-radius: `7px`
- Icon: `16×16`, `flex: 0 0 auto`, matches text color
- Label: `13.5px / 500 / -0.005em`; hidden (opacity 0) when rail is collapsed, opacity 1 when expanded, transition `0.15s ease`
- "Soon" badge: `10px / 500 / uppercase / 0.02em / --ink-4` on `--bg-mute`, `4px` radius, `2px 6px` padding

### User Chip (Sidebar Footer)

- Separated from Settings by `border-top: 1px solid var(--line)`, `margin-top: 8px`, `padding-top: 14px`
- Avatar: `28×28`, `border-radius: 50%`, `background: linear-gradient(135deg, var(--ink-2), var(--ink))`, `color: var(--bg)`, initials at `11px / 600 / -0.01em`
- Name: `12.5px / 500 / --ink`; email: `11.5px / --ink-3`; both truncated with ellipsis

## PageHeader

Used at the top of every screen. Always: eyebrow + title. Optionally: subtitle + right-aligned actions.

```jsx
<div style={{ marginBottom: 'var(--gap-section)' }}>
  <div className="row-between" style={{ alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
    <div>
      {eyebrow && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
        color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 10 }}>{eyebrow}</div>}
      <h1>{title}</h1>
      {subtitle && <p style={{ marginTop: 8, color: 'var(--ink-3)', maxWidth: 580 }}>{subtitle}</p>}
    </div>
    {actions && <div className="row" style={{ gap: 8 }}>{actions}</div>}
  </div>
</div>
```

- Bottom margin: `var(--gap-section)` (40px balanced)
- Eyebrow: JetBrains Mono, 11px, uppercase, 0.08em, `--ink-3`, 10px below
- Title (`h1`): 32px / 600 / -0.02em / `--ink`
- Subtitle (`p`): 14px / `--ink-3`, max-width 580px, margin-top 8px

## Forms & Inputs

### Input / Textarea / Select

```css
.input, .textarea, .select {
  width: 100%;
  height: var(--field-h);         /* 38px balanced */
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius);   /* 8px */
  background: var(--bg-elev);
  color: var(--ink);
  font: inherit; font-size: 14px;
  outline: none;
  transition: border-color 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
}
```

| State | Border | Shadow |
|-------|--------|--------|
| Default | `--line` | — |
| Hover | `--ink-4` | — |
| Focus | `--focus` | `0 0 0 3px color-mix(in srgb, var(--focus) 12%, transparent)` |

- Placeholder: `--ink-4`
- Textarea: `height: auto`, `padding: 10px 12px`, `line-height: 1.5`, `resize: vertical`, `min-height: 96px`
- Labels sit above inputs (`display: block`); bottom margin `6px`
- Helper text (`.help`): 12px, `--ink-3`, `margin-top: 6px`
- Hint text appears below the field at 12px `--ink-3`

### FieldRow (Profile two-column form)

Used on the Profile screen to align label/description alongside the field.

```
grid-template-columns: 220px 1fr
gap: 32px
padding: var(--gap-row) 0
border-bottom: 1px solid var(--line-2)
```

- Left column: label (`13px / 500 / --ink / -0.005em`) + help (`12px / --ink-3`); `padding-top: 8px`
- Right column: field + optional hint

## Buttons

All buttons: `display: inline-flex`, `align-items: center`, `gap: 6px`, `font: inherit`, `cursor: pointer`, `outline: none`, `white-space: nowrap`.

Transition: `all 0.12s ease` on all variants.

Focus ring: `box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 18%, transparent)` on `:focus-visible`.

### Variants

| Variant | Class | Height | Padding | Bg | Text | Border |
|---------|-------|--------|---------|----|----|--------|
| Default | `.btn` | `--field-h` (38px) | `0 16px` | `--bg-elev` | `--ink` | `1px solid --line` |
| Primary | `.btn.btn-primary` | `--field-h` | `0 16px` | `--accent` | `--accent-ink` | `1px solid --accent` |
| Ghost | `.btn.btn-ghost` | `--field-h` | `0 16px` | `transparent` | `--ink-2` | none |
| Small | `.btn.btn-sm` | `30px` | `0 10px` | — (inherits variant) | — | `6px` radius |
| Icon | `.btn.btn-icon` | `--field-h` | `0` (square) | — | — | — |
| Small icon | `.btn.btn-icon.btn-sm` | `30px` | `0` | — | — | — |

Font: `13px / 500 / -0.005em` for default; `12.5px` for `.btn-sm`.

Hover states:
- Default: border becomes `--ink-4`, bg becomes `--bg-sub`
- Primary: bg becomes `color-mix(in srgb, var(--accent) 88%, transparent)`, border becomes transparent
- Ghost: bg becomes `--bg-mute`, text becomes `--ink`

## Cards & Containers

### Card

```css
.card {
  background: var(--bg-elev);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg); /* 12px */
}
```

No drop shadows on cards. Use border alone.

### Divider

```css
.divider {
  height: 1px;
  background: var(--line);
  width: 100%;
}
```

## Tags

```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: var(--ink-2);
  background: var(--bg-mute);
  padding: 3px 8px;
  border-radius: 6px;
  letter-spacing: 0.005em;
}
```

Dismissible tags use a `×` button at `14px`, `--ink-4`, no border/background. Larger interactive tags use `padding: 6px 10px`.

## Status Pills (Companies)

Pill with a leading 5×5px dot (currentColor, 50% radius).

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Active | `--ink` | `--bg` | none |
| Engaged | `--bg-mute` | `--ink` | none |
| Sourced | `transparent` | `--ink-3` (dot at 60% opacity) | `1px solid --line` |

All pills: `border-radius: 999px`, `font-size: 11.5px`, `font-weight: 500`, `letter-spacing: -0.005em`, `padding: 3px 8px`, `gap: 5px`.

## Fit Bar (Companies)

```
Track: width 56px, height 4px, border-radius 2px, background --bg-mute
Fill:  absolute inset 0, width = score%, background --ink
Score: font-size 12.5px, --ink-2, tabular-nums, min-width 24px
```

Rendered inline as `row` with `gap: 8px`.

## Tabs

Bottom-border underline style. Tab row sits on a `border-bottom: 1px solid var(--line)` container. Each tab uses `margin-bottom: -1px` to sit the active underline flush on the container border.

| State | Font | Color | Bottom border |
|-------|------|-------|---------------|
| Active | `13px / 500 / -0.005em` | `--ink` | `2px solid --ink` |
| Inactive | same | `--ink-3` | `2px solid transparent` |
| Hover | same | `--ink` | `2px solid transparent` |

Padding per tab: `10px 14px`. Transition: `color 0.12s ease, border-color 0.12s ease`.

Tab content container: `margin-bottom: var(--gap-section)` below the tab row.

## Page Patterns

### Dashboard

**StatCard grid**: `grid-template-columns: repeat(4, 1fr)`, `gap: 16px`, `margin-bottom: var(--gap-section)`.

StatCard internals: `.card` with `padding: 20px`, `flex-direction: column`, `gap: 14px`.
- Label: `.meta` at `12.5px`
- Delta: `11.5px / 500`, positive delta `--ink-2`, negative `--ink-3`; upward arrow icon at 11px
- Value: `32px / 600 / -0.025em / tabular-nums / --ink`, line-height 1
- Hint: `12px / --ink-3 / line-height 1.4`

**Lower section**: `grid-template-columns: 2fr 1fr`, `gap: 24px`.

**Pipeline card** (left, 2fr): `.card` with `padding: 24px`. Card heading: `h2` at `16px` (inline override of global h2).
- Pipeline mini-grid: `repeat(4, 1fr)`, `gap: 1px`, background `--line` (creates 1px gaps), `border: 1px solid --line`, `border-radius: 8px`, overflow hidden. Each cell: `--bg-elev`, `padding: 14px 16px`. Stage label: `.meta 11.5px`. Count: `22px / 600 / -0.02em / --ink` (zero counts use `--ink-4`).
- Focus list below: company logo box (32×32, 7px radius, `--line` border, `--bg` bg, initial 12px/600/`--ink-2`), name (13.5px/500/`--ink`), role (12.5px/`--ink-3`), stage tag, next-action text (12px/`--ink-3`, min-width 180px, right-aligned). Rows separated by `1px solid --line-2`, `padding: 14px 0`.

**Activity card** (right, 1fr): `.card` with `padding: 24px`. Card heading: `h2` at `16px` (inline override of global h2).
- ActivityRow: icon container 32×32, 8px radius, `--bg-mute` bg, `--ink-2` icon at 14px. Title: 13.5px/500/`--ink`. Meta: 12.5px/`--ink-3`, margin-top 2px. Time: `.meta 12px`. Row padding: `14px 0`, border-bottom `1px solid --line-2`.

### Profile

Tab bar (see Tabs section above) + two-column FieldRow form (see FieldRow section).

Field groups below the tab row: `max-width: 920px`.

Profile tab list: Core profile / Resume / Narrative / Pillars / CMF weights / Comp targets.

Inline tag list below text inputs: `row`, `gap: 6px`, `flex-wrap: wrap`, `margin-top: 10px`. Tags are the standard `.tag` component.

Geography chips use larger `padding: 6px 10px` and include a `×` button.

### Companies

**Filter pills** (above the table): borderless buttons, active state `--bg-mute` bg / `--ink` text, inactive `transparent` / `--ink-3`, `13px / 500`, `padding: 6px 12px`, `border-radius: 6px`. Count shown at `--ink-4` tabular-nums. "Filter" button on the right is `.btn.btn-ghost.btn-sm`.

**Search input**: row container with `--line` border, `7px` radius, `--field-h` height, `--bg-elev` bg. Icon at 14px `--ink-3`. Input: no border, transparent bg, `13px`, `width: 180px`.

**Table**: `.card` with `overflow: hidden`.
- Header row: `padding: 12px 20px`, `border-bottom: 1px solid --line`, `background: --bg-sub`. Font: JetBrains Mono, `11.5px / 500 / uppercase / 0.06em / --ink-3`.
- Data rows: `padding: 14px 20px`, `font-size: 13.5px`, `border-bottom: 1px solid --line-2` (last row no border). Hover: `background: --bg-sub` (transition 0.1s).
- Column grid: `1.6fr 1fr 1.2fr 1fr 1.2fr .9fr 110px 36px`.
- Company cell: logo box 28×28 / 6px radius / `--line` border / `--bg` bg / initial 11px/600/`--ink-2` + name (500/`--ink`) + contact (12px/`--ink-3`).
- Actions: `.btn.btn-ghost.btn-icon.btn-sm` with More icon.

### Opportunities (Kanban)

**Column grid**: `grid-template-columns: repeat(4, 1fr)`, `gap: 16px`, `align-items: start`.

**Kanban column**: `background: --bg-sub`, `border: 1px solid --line`, `border-radius: --radius-lg (12px)`, `padding: 12px`, `gap: 10px`, `min-height: 200px`.
- Column header: stage name `h3 13px` + count `11.5px / --ink-3 / tabular-nums`, plus-icon button `.btn.btn-ghost.btn-icon.btn-sm` at 24×24.
- Empty column: `padding: 32px 12px`, `text-align: center`, `12px / --ink-4`, `border: 1px dashed --line`, `border-radius: 8px`.

**OppCard**: `background: --bg-elev`, `border: 1px solid --line`, `border-radius: 8px`, `padding: 14px`, `gap: 10px`. Hover: border becomes `--ink-4`. Cursor `grab`.
- Header row: company logo box 22×22 / 5px radius / `--line` border + company name `13px/500/--ink` + fit score `11.5px/--ink-3/tabular-nums`.
- Role: `12.5px / --ink-2 / line-height 1.4`.
- Next action footer: `padding-top: 8px`, `border-top: 1px solid --line-2`. Arrow-right icon at 11px `--ink-3` + text `11.5px / --ink-3 / line-height 1.3`.

## Empty States

Standard empty state block:

```css
border: 1px dashed var(--line);
border-radius: var(--radius-lg);
padding: 64px 32px;
text-align: center;
background: var(--bg-sub);
```

Icon container: 56×56, `border-radius: 14px`, `background: --bg-elev`, `border: 1px solid --line`, icon at 22px `--ink-2`. Bottom margin: `20px`.

Title: `h2` at `18px`. Description: `p` at max-width `380px`, `--ink-3`. Actions: `.row` centered, `gap: 8px`.

## Icons

The icon set is a custom 16×16 viewBox / 1.5-stroke Lucide-style set defined in `icons.jsx`. Use this set exclusively; do not use lucide-react or inline SVGs in components.

SVG props: `fill: none`, `stroke: currentColor`, `strokeWidth: 1.5`, `strokeLinecap: round`, `strokeLinejoin: round`, `aria-hidden: true`.

### Canonical Icon Names

| Name | Usage |
|------|-------|
| `Dashboard` | Dashboard nav |
| `User` | Profile nav |
| `Building` | Companies nav |
| `Target` | Opportunities nav |
| `Dollar` | Compensation nav |
| `Mail` | Outreach nav, activity |
| `Search` | Search inputs |
| `Plus` | Add actions, geography chips |
| `Check` | Save / confirm |
| `Chevron` | Right directional |
| `ChevronD` | Down directional |
| `ArrowRight` | View all, next action |
| `ArrowUp` | Positive delta indicator |
| `Settings` | Settings nav |
| `Moon` | Dark mode toggle |
| `Sparkle` | AI assist |
| `More` | Row actions (3-dot) |
| `Filter` | Filter button |
| `Calendar` | Date picker / period |
| `TrendUp` | Upward trend |
| `Briefcase` | Comp / work context |
| `Bookmark` | Saved benchmarks |
| `Globe` | Geography |
| `Edit` | Edit / update action |
| `Logo` | Brand mark (sidebar) |

All icons default to `size={16}`. Pass a `size` prop to override. Color is always `currentColor`.

## Motion

| Context | Duration | Easing |
|---------|----------|--------|
| All interactive states (inputs, buttons, links) | `120ms` | `ease` |
| Sidebar width expand/collapse | `180ms` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Label/text fade in sidebar | `150ms` | `ease` |
| Screen mount fade | `250ms` | `ease-out` (opacity 0→1, translateY 4px→0) |

Respect `prefers-reduced-motion: reduce` — disable transforms and reduce/eliminate opacity transitions.

## Scrollbar

```css
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--line); border-radius: 5px; border: 2px solid var(--bg); }
::-webkit-scrollbar-thumb:hover { background: var(--ink-5); }
```

## Utility Classes

| Class | Definition |
|-------|-----------|
| `.row` | `display: flex; align-items: center; gap: 12px` |
| `.row-between` | `display: flex; align-items: center; justify-content: space-between; gap: 12px` |
| `.col` | `display: flex; flex-direction: column` |
| `.grow` | `flex: 1; min-width: 0` |
| `.truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |

## Legacy Product Surfaces (Re-tokenized)

These screens are not shown in the current design reference prototype but remain product features. All token references below use the new system.

### Welcome Page

A standalone `/welcome` page introducing the grndwrk philosophy before setup. No sidebar.

- Background: `--bg`; max-width `600px`; single scrollable page
- Hero type: Inter, `32–40px / 600 / -0.02em` (no Fraunces)
- Body: Inter `15–16px / --ink-2`
- Theme toggle: top-right corner, `.btn.btn-ghost.btn-sm` with Moon icon
- CTA ("Get started →"): `.btn.btn-primary`, sets `grndwrk_welcomed=1` cookie, routes to `/profile/setup`
- No progress indicator, no step sidebar

### Onboarding Wizard

A 7-step setup flow. Each screen holds a single idea with generous whitespace.

Steps: Positioning → Target roles → Where → Resume → Pillars → CMF weights → Comp targets

- Left step sidebar (`220px`): replaces main nav during setup; `--bg-sub` background, `1px solid --line` right border
- Step list items: step number + label, `13px / 500 / --ink-3` muted when incomplete, `--ink` active, checkmark (Check icon) when complete
- Content: max-width `520px`; padding `0 80px` horizontal; `64px` top/bottom
- Step header margin below: `48px`; field group spacing: `32px` (2× `--gap-row`)
- All inputs/textareas use standard form tokens
- Step 1 "Help me write with AI" button: `.btn.btn-ghost.btn-sm` with Sparkle icon — opens AI assist panel

### AI Assist Panel

Right-side drawer for positioning statement drafting. Overlays the main content.

- Width: `440px` desktop, full-width mobile
- Background: `--bg-elev`; left border `1px solid --line`
- Header: `11px / 500 / uppercase / 0.08em` label (JetBrains Mono), Sparkle icon, close button
- Prompt inputs: `--bg-sub` background (recessed from panel), `min-height: 96px`
- Footer: sticky action row — Discard (`.btn.btn-ghost.btn-sm`) + Draft / Regenerate / Use this draft (`.btn.btn-primary.btn-sm`)
- States: prompts view → loading → draft view → error view
- Dismisses on Escape key or backdrop click

## Implementation Rules

1. **Never hardcode hex values in components.** All color references must use CSS variables.
2. **Never use JetBrains Mono for body text.** It is strictly for eyebrows, table headers, and `.meta`/`.tag` contexts when `data-type="mono-accents"`.
3. **No drop shadows on surfaces.** Use border (`1px solid var(--line)`) for elevation.
4. **No gradients on backgrounds or surfaces.** The user avatar gradient (`linear-gradient(135deg, var(--ink-2), var(--ink))`) is the only permitted gradient.
5. **No chromatic accent.** Do not introduce blue, teal, green, or any hue-bearing accent. If a design call requires an accent, use `--ink` / `--accent` (monochrome).
6. **Use the canonical icon set.** Do not import lucide-react or use inline SVG paths not in `icons.jsx`.
7. **Respect `prefers-reduced-motion`.** Disable transforms; reduce or remove opacity transitions.
8. **Consistent font feature settings.** Apply `font-feature-settings: "cv11", "ss01", "ss03"` on the body element for Inter.
