# grndwrk UI Design System

## Design Direction

grndwrk should feel like a premium, focused tool — closer to Linear or Notion than a generic SaaS dashboard. Think: editorial, confident, a little serious. This is a tool for deliberate people making important career decisions.

## Color System

### Dual-Mode Tokens

All colors are defined as CSS custom properties in `app/globals.css`. **Light mode is the default**; dark mode activates via `.dark` class on `<html>`.

| Token | Light (default) | Dark |
|-------|-----------------|------|
| `--background` | `#FAFAF8` | `#0F0F0F` |
| `--sidebar` | `#F4F4F2` | `#161616` |
| `--surface` | `#FFFFFF` | `#1A1A1A` |
| `--surface-raised` | `#F4F4F2` | `#1F1F1F` |
| `--border` | `#E5E5E5` | `#2A2A2A` |
| `--foreground` | `#1A1A1A` | `#E5E5E5` |
| `--muted` | `#6B6B6B` | `#6B6B6B` |
| `--accent` | `#3B4F7C` | `#3B4F7C` |
| `--accent-hover` | `#2E3F63` | `#2E3F63` |
| `--success` | `#16a34a` | `#22c55e` |
| `--warning` | `#d97706` | `#f59e0b` |
| `--danger` | `#dc2626` | `#ef4444` |

### Accent Color

Slate blue `#3B4F7C` is the single strong accent. Use it sparingly:
- Active nav states
- Primary CTAs
- Focus rings on inputs
- Active tab underlines

No gradients on primary backgrounds or surfaces.

### Theme Toggle

- Managed by `components/ThemeProvider.tsx` (React context + localStorage)
- Toggle lives in sidebar footer (`components/nav/ThemeToggle.tsx`)
- Persists user preference across sessions
- Light mode is the default on first visit

### Usage Rules

- Never use hardcoded hex colors in components; always reference CSS variables
- Accent color is used sparingly: active states, CTAs, focus rings only
- Status colors (success/warning/danger) adapt per mode

## Typography

### Font Stack

- **Body/UI**: DM Sans (loaded via `next/font/google`, variable `--font-body`)
- **Display/headings**: Fraunces (loaded via `next/font/google`, variable `--font-heading`)

### Hierarchy

| Role | Font | Size | Weight | Extra |
|------|------|------|--------|-------|
| Page title | Fraunces | 28px | normal | `[font-family:var(--font-heading),serif]` |
| Section heading | DM Sans | 13px | semibold | uppercase, `tracking-[0.08em]`, muted color |
| Body / form label | DM Sans | 14px | medium | |
| Input text | DM Sans | 14px | regular | |
| Helper / metadata | DM Sans | 12px | regular | muted color |

Page titles should be large and confident. Section labels should be small and restrained. Body text should be comfortable to read.

## Layout

### Application Shell

- Full-width layout. No centered modal cards as primary content areas.
- Fixed left sidebar: 220px wide, `var(--sidebar)` background
- Main content: fills remaining width, `px-12 py-10` (48px horizontal, 40px vertical)
- No top navigation bar competing with content
- Generous whitespace — content should breathe
- Form-heavy views constrain to `max-w-[800px]` at the page level

### Sidebar

- Lowercase `grndwrk` wordmark at top in Fraunces — wordmark style, not a logo image
- Nav items use lucide-react icons + labels, simple iconography
- Active state: `var(--surface-raised)` background + accent text, clearly visible
- Theme toggle in sidebar footer
- Module order: Dashboard, Profile, Companies, Opportunities, Compensation, Outreach

### Onboarding

Onboarding and setup flows should feel like a guided experience, not a form inside a box.

- Left sidebar-step layout replacing the main app sidebar during setup
- Left sidebar shows step list: number + label per step
- Steps are muted when incomplete, accent when active, checkmark when complete
- Content area uses same `px-12 py-10` padding, `max-w-[680px]`

## Forms & Inputs

- Full-width inputs, not cramped
- Labels above inputs, never floating
- Subtle borders: `var(--border)` (`#E5E5E5` in light), `rounded-md` (6px)
- Focus state uses accent color: `focus:ring-0 focus:border-[var(--accent)]`
- Textarea fields: `min-h-[120px]`, tall enough to invite real input, resize vertical only
- Helper text: 12px, muted, below input

## Components

### Cards

- Border: `1px solid var(--border)`, `rounded-lg` (8px)
- Background: `var(--surface)`
- No drop shadows

### Buttons

- Primary: accent background (`var(--accent)`), white text
- Secondary: `var(--surface-raised)` background, foreground text, border
- Ghost: transparent, muted text
- Danger: red tint background, red text
- All: `rounded-md`, 150ms transition

### Badges

- `rounded` (4px), 11px font, medium weight
- Use semantic variant styles that work in both modes
- Status badges: watching, preparing, applied, in-process, closed
- Tier badges: tier-1, tier-2, tier-3

### Tabs

- Bottom border style with accent underline on active tab
- Labels: 13px, semibold, uppercase, `tracking-[0.08em]`

### Modal

- Centered overlay, `rounded-lg`, border (no shadow)
- Title in foreground, description in muted
- Used for confirmations and focused sub-tasks, not primary content

## Design Constants

- Border radii: 8px cards, 6px inputs, 4px badges
- Transitions: 150ms ease on all interactive states
- Icons: lucide-react throughout (no inline SVGs in nav components)
- No gradients on primary backgrounds or surfaces

## Experience Principles

1. **Confident, not flashy.** Predictable UI patterns and minimal decorative chrome.
2. **Focused, not feature-heavy looking.** Fewer, larger content regions; generous whitespace but not empty.
3. **Trustworthy for serious decisions.** Typography hierarchy and restraint signal credibility.
4. **Consistency across the system.** Semantic tokens and reusable component styling; never hardcode hex in components.
5. **Calm interaction feedback.** 150ms ease transitions; avoid heavy motion. Respect reduced motion preferences.
