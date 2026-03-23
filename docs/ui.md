# grndwrk UI Design Direction

## Purpose
This document defines the visual and interaction direction for grndwrk. It is the baseline for new screens, components, and flows. If a design decision does not support this direction, it should be reconsidered.

## Product Tone
- Premium, focused, and editorial rather than playful or flashy.
- Confident and deliberate, with restrained visual language.
- Serious enough for important career decisions, without feeling heavy.
- Clear over clever: communication should feel trustworthy and calm.

## Layout

### Application Shell
- Use a full-width app layout, not centered cards on dark canvases.
- Establish a fixed left sidebar for primary navigation.
- Let the main content area fill remaining width with responsive constraints.
- Avoid top navigation that competes with the sidebar.

### Spacing and Rhythm
- Use generous whitespace around major content sections.
- Keep consistent vertical rhythm between titles, copy, inputs, and actions.
- Prefer fewer, larger content regions instead of many nested containers.

### Onboarding and Setup
- Treat onboarding as a guided experience, not a boxed form.
- Present one clear step at a time with strong hierarchy.
- Use supportive context copy to explain why each input matters.
- Keep progress visible and low-friction.

## Color System

### Core Palette (Light-Mode First)
- Base background: very light warm neutral (`#FAFAF8` recommended).
- Primary text (ink): deep neutral, not pure black (`#1A1A1A` or `#1C1917`).
- Borders/dividers: soft neutral (`#E5E5E5` family).
- Primary surfaces should stay flat; no gradient backgrounds.

### Accent Color
- Use one accent color across the product, applied sparingly.
- Accent must not be purple.
- Recommended candidates:
  - Deep teal: `#0D7377`
  - Slate blue: `#3B4F7C`
  - Warm amber: `#C97D2E`
  - Light sage green (select one concrete token during implementation)
- Accent usage priority:
  - Focus states and interactive emphasis
  - Primary action buttons
  - Selected/active navigation state
- Do not use accent as a broad page background.

## Typography

### Font Pairing
- Display/heading font should have personality and editorial tone.
- Suggested display choices: Fraunces, DM Serif Display, Instrument Serif.
- Body/UI font should be highly legible and neutral.
- Suggested UI choices: DM Sans, Geist, Outfit.

### Hierarchy Rules
- Page titles: large, confident, and high contrast.
- Section headings: distinct but clearly secondary to page title.
- Labels/help text: smaller and restrained, never louder than body text.
- Body text: comfortable size and line height for sustained reading.
- Maintain consistent font roles across all modules.

## Forms and Inputs
- Inputs should be full-width in their container and not visually cramped.
- Place labels above fields; avoid floating labels.
- Use subtle input borders (`#E5E5E5` range) in resting state.
- Focus state should clearly use the product accent color.
- Textareas should be tall enough to invite thoughtful, detailed responses.
- Group related fields with spacing rather than heavy visual boxes.

## Navigation
- Use a fixed left sidebar as the primary navigation pattern.
- Navigation items should use simple iconography plus clear labels.
- Active state must be obvious at a glance (tone + accent support).
- Place the product name `grndwrk` at the top in lowercase wordmark style.
- Do not add a top nav bar that competes with sidebar orientation.

## Experience Principles
- Confident, not flashy.
- Focused, not feature-heavy.
- Calm, not empty.
- Structured, not rigid.
- Trustworthy for users making serious career decisions.

## Implementation Heuristics
- Every screen should answer: "What is the main decision this page helps make?"
- Remove decorative elements that do not improve clarity or confidence.
- Prefer predictable component patterns over one-off visual treatments.
- Keep interaction feedback subtle but unmistakable.
