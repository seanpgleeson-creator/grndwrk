# grndwrk UI Design System

## Overview

grndwrk uses a Linear-inspired aesthetic: clean, dense, sidebar-driven, with dual dark/light mode support. The design prioritizes clarity and confidence for users making serious career decisions.

## Color System

### Dual-Mode Tokens

All colors are defined as CSS custom properties in `app/globals.css`. Dark mode is the default; light mode activates via `.light` class on `<html>`.

| Token | Dark | Light |
|-------|------|-------|
| `--background` | `#0F0F0F` | `#FAFAF8` |
| `--sidebar` | `#161616` | `#F4F4F2` |
| `--surface` | `#1A1A1A` | `#FFFFFF` |
| `--surface-raised` | `#1F1F1F` | `#F4F4F2` |
| `--border` | `#2A2A2A` | `#E5E5E5` |
| `--foreground` | `#E5E5E5` | `#1A1A1A` |
| `--muted` | `#6B6B6B` | `#6B6B6B` |
| `--accent` | `#4B7BEC` | `#4B7BEC` |
| `--accent-hover` | `#3A6AD4` | `#3A6AD4` |
| `--success` | `#22c55e` | `#16a34a` |
| `--warning` | `#f59e0b` | `#d97706` |
| `--danger` | `#ef4444` | `#dc2626` |

### Theme Toggle

- Managed by `components/ThemeProvider.tsx` (React context + localStorage)
- Toggle lives in sidebar footer (`components/nav/ThemeToggle.tsx`)
- Persists user preference across sessions

### Usage Rules

- Never use hardcoded hex colors in components; always reference CSS variables
- Accent color is used sparingly: active states, CTAs, focus rings
- Status colors (success/warning/danger) adapt per mode

## Typography

### Font Stack

- **Body/UI**: DM Sans (loaded via `next/font/google`, variable `--font-body`)
- **Page headings**: Fraunces (loaded via `next/font/google`, variable `--font-heading`)

### Hierarchy

| Role | Font | Size | Weight | Extra |
|------|------|------|--------|-------|
| Page title | Fraunces | 28px | normal | `[font-family:var(--font-heading),serif]` |
| Section heading | DM Sans | 13px | semibold | uppercase, `tracking-[0.08em]`, muted color |
| Body / form label | DM Sans | 14px | medium | |
| Input text | DM Sans | 14px | regular | |
| Helper / metadata | DM Sans | 12px | regular | muted color |

## Layout

### Application Shell

- Fixed left sidebar: 220px wide, `var(--sidebar)` background
- Main content: fills remaining width, `px-12 py-10` (48px horizontal, 40px vertical)
- No top navigation bar
- Form-heavy views constrain to `max-w-[800px]` at the page level

### Sidebar

- Lowercase `grndwrk` wordmark at top in Fraunces
- Nav items use lucide-react icons + labels
- Active state: `var(--surface-raised)` background + accent text
- Theme toggle in sidebar footer
- Module order: Dashboard, Profile, Companies, Opportunities, Compensation, Outreach

### Onboarding

- Sidebar-step layout replacing the main app sidebar during setup
- Left sidebar shows step list: number + label per step
- Steps are muted when incomplete, accent when active, checkmark when complete
- Content area uses same `px-12 py-10` padding, `max-w-[680px]`

## Components

### Cards

- Border: `1px solid var(--border)`, `rounded-lg` (8px)
- Background: `var(--surface)`
- No drop shadows

### Inputs / Textarea / Select

- Background: `var(--surface)`
- Border: `1px solid var(--border)`, `rounded-md` (6px)
- Focus: accent border, no ring/shadow (`focus:ring-0 focus:border-[var(--accent)]`)
- Label: 13px, medium weight, above input
- Textarea: `min-h-[120px]`, resize vertical only
- Helper text: 12px, muted

### Buttons

- Primary: accent background, white text
- Secondary: surface-raised background, foreground text, border
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

## Design Constants

- Border radii: 8px cards, 6px inputs, 4px badges
- Transitions: 150ms ease on all interactive states
- Icons: lucide-react throughout (replacing inline SVGs)
- No gradients on primary surfaces

## Experience Principles

- Confident, not flashy
- Focused, not feature-heavy
- Dense but readable, like Linear
- Trustworthy for serious career decisions
