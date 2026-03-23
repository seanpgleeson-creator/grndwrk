# grndwrk — Product Specification

**MVP scope:** This is a minimum viable product. Prioritize simple and functional over comprehensive. Ship core flows first; defer nice-to-haves and edge cases. When in doubt, choose the option that gets a single user through the main workflow with minimal complexity.

**Related documentation:** Implementation details are specified in [docs/frontend.md](frontend.md) (app architecture, routes, design system, components), [docs/backend.md](backend.md) (Prisma schema, API routes, AI layer, conventions), and [docs/CLAUDE.md](CLAUDE.md) (agent reference and current phase). The Prisma schema in `prisma/schema.prisma` is the authoritative data model; backend.md documents it in full.

---

## Current status (as of March 2026)

- **Phase 1 is shipped:** Hosted on **Vercel** with **PostgreSQL (Neon)**. Core flows work: onboarding, profile, companies, opportunities, compensation page, dashboard. AI-powered features (CMF generation, briefs, resume parsing, earnings analysis) are **not** implemented yet — API stubs return HTTP 501 where applicable.
- **Next:** **Phase 2** — add `lib/ai/claude.ts`, wire Anthropic (`ANTHROPIC_API_KEY` in Vercel), replace 501 stubs with real generation and validation.

---

## Vision

Most job searches are reactive. A role gets posted, dozens of candidates apply, and the hiring team picks from whoever showed up. Hiring managers also often have a candidate in mind, or at least a short list, before the job is posted.  The candidate has no leverage, no relationship, and no differentiation beyond a resume that looks like everyone else's.

**grndwrk is built on a different premise.**

The best opportunities are won before they're posted — by candidates who have already done the work to understand a company, articulate why they belong there, and build relationships with the people who matter. Whether or not a role exists today, a prepared candidate can walk into any conversation and say:

> "Here is why I am a fit for this company — and here is the specific value I would bring."

And when a role does exist:

> "Here is why I am the right person for this role — and here is exactly how I will contribute."

This is the grndwrk philosophy: **proactive, positioned, and pointed.** Not a search for any open door, but a deliberate campaign toward the right ones.

grndwrk is a strategic command center built on the **Candidate-Market Fit** framework from *Never Search Alone*. It helps candidates monitor the right companies, understand their strategic priorities, build relationships before roles open, and show up to every conversation with a clear, credible, and differentiated story.

**Long-term goal:** grndwrk is architected to be easily cloned and adopted by *Never Search Alone* job search councils and structured job search communities, with multi-user support and shared council workspaces in mind.

---

## Core Design Principles

1. **Proactive over reactive** — The primary mode of the app is company-first, not role-first. Users build positioning and relationships before openings exist, not after.
2. **Positioned, not just qualified** — The goal is not to prove you meet the job requirements. It is to demonstrate that you understand the company's priorities and can articulate the specific value you bring to their specific situation.
3. **Pointed over broad** — The system actively discourages spray-and-pray job searching. Every signal, score, and workflow funnels toward fewer, better-fit opportunities pursued with more depth and preparation.
4. **Candidate-Market Fit as the north star** — Adapted from the product-market fit framework, CMF replaces resume-keyword matching with a richer, multi-dimensional assessment of strategic alignment between a candidate and a company or role.
5. **Narrative consistency** — Every piece of generated content reinforces a single differentiated story. The app flags drift and keeps the candidate from reverting to generic professional language.
6. **Negotiate with data** — Compensation intelligence is integrated throughout, not bolted on at the offer stage. Candidates should know market rates before they apply, not after they receive an offer.
7. **Portable and replicable** — Clean data models, modular architecture, and minimal external dependencies so the app can be forked and deployed by other users and councils with minimal friction.

---

## Two Modes of Engagement

grndwrk supports two distinct candidate scenarios, both of which are first-class experiences in the app:

### Mode 1: No Role Available — Proactive Company Positioning
The candidate has identified a company they want to work for, but no relevant role currently exists. The goal is to:
- Understand the company's strategic priorities deeply enough to articulate a fit narrative
- Build relationships with key people at the company before a need arises
- Create a "Company Positioning Brief" — a prepared statement of why the candidate belongs at this company and what they would contribute
- Stay alert to signals that a relevant role may be emerging, so the candidate is already known when it does

### Mode 2: Role Available — Targeted Role Positioning
A specific role exists, and the candidate wants to pursue it. The goal is to:
- Assess Candidate-Market Fit against the specific role, not just the company
- Generate tailored application materials that speak directly to the role's requirements and the company's stated priorities
- Connect their background to the specific outcomes the role is designed to drive
- Approach any conversation with a clear answer to: "Why you, for this role, at this company, right now?"

Both modes feed from the same underlying company intelligence and positioning infrastructure. Mode 1 naturally evolves into Mode 2 when a role opens — and because the candidate has already done the groundwork, they are ahead of everyone who only started when the posting went live.

---

## Application Architecture Overview

grndwrk is organized into six modules:

1. **Profile & Positioning Hub** — The candidate's strategic foundation
2. **Company Intelligence Center** — Proactive company monitoring, earnings analysis, and positioning prep
3. **Opportunity Tracker** — Role-specific analysis, application workflow, and materials generation
4. **Compensation Intelligence** — Salary benchmarking by company, role, and level
5. **Outreach & Relationship Pipeline** — Contact management and outreach prioritization
6. **Activity Dashboard** — Unified view of search health and priority actions

### Route map (Phase 1)

| Route | Purpose |
|-------|---------|
| `/` | Redirect to `/dashboard` or `/profile/setup` on first launch |
| `/profile/setup` | Onboarding wizard (4 steps); no sidebar |
| `/profile` | Profile & Positioning Hub (Module 1) |
| `/companies`, `/companies/new`, `/companies/[id]`, `/companies/[id]/brief`, `/companies/[id]/comp` | Company list, add, detail, brief, compensation (Modules 2, 4) |
| `/opportunities`, `/opportunities/new`, `/opportunities/[id]`, `/opportunities/[id]/brief` | Opportunity list, add, detail, role brief (Module 3) |
| `/comp` | Compensation benchmarking panel (Module 4) |
| `/dashboard` | Activity Dashboard (Module 6) |

Full route groups and layout nesting (e.g. `(onboarding)` vs `(app)` shell with sidebar) are in [frontend.md](frontend.md).

### First-launch gate

On first launch, the app redirects to the profile setup wizard until onboarding is complete. The gate is server-side: in the app layout, if the singleton `UserProfile` does not exist or has not completed required steps, redirect to `/profile/setup`. **Onboarding complete** is derived from data: `positioning_statement` is set and `narrative_pillars` is a non-empty array (steps 1 and 2). Steps 3 (CMF weights) and 4 (comp targets) have pre-filled defaults and are not blocking. See [backend.md](backend.md) §6 and [frontend.md](frontend.md) §6.

---

## Module 1: Profile & Positioning Hub

### Purpose
The foundation that powers every other module. Before any analysis, scoring, or content generation can happen, the candidate defines who they are, what they're looking for, what story they're telling, and what "fit" means to them.

### Features

#### 1.1 Core Profile
- Upload or paste resume — stored as both raw text and a structured JSON parse. Parsing happens at upload time via a Claude API call. Structured schema: `experience[]` (company, title, dates, bullets), `skills[]`, `education[]`.
- **Positioning statement**: A free-text summary of the candidate's core differentiator — the thing that makes them distinctly valuable, written in their own voice. This is not a bio. It is an answer to: "Why would the right company be lucky to have you?"
  - Example: "I combine deep marketplace and ecommerce domain expertise with hands-on technical building ability — a rare combination in senior PM roles. I've built the tools, not just managed the roadmaps."
- Target role types (e.g., Principal PM, Director of Product, Head of Marketplace)
- Target company stages (e.g., Series B–D, public tech, growth-phase)
- Preferred geography / remote preference

#### 1.2 Target Company List
- Maintain a named list of target companies with tiering (Tier 1 = highest priority)
- For each company: homepage URL, LinkedIn company page URL, notes on why they are a target
- Companies exist here with or without open roles — this is the proactive watchlist, not a job board

#### 1.3 Candidate-Market Fit Criteria
- User defines what "fit" means to them across multiple dimensions
- Customizable weighting sliders for: domain alignment, stage fit, role scope fit, strategic alignment, narrative fit
- Weights are stored as integers (percentages) that must sum to 100, e.g. `{ domain: 30, stage: 20, scope: 20, strategic: 20, narrative: 10 }`. The UI enforces sum-to-100 (e.g. proportional redistribution when one slider moves, minimum per dimension). See [frontend.md](frontend.md) §7.
- Composite CMF Score = `sum(dimension_score * weight/100)` across all five dimensions (each dimension scored 1–10 by AI). These weights drive the CMF Score calculation across all modules

#### 1.4 Compensation Targets
- User sets target compensation range: base salary, total comp (base + equity + bonus), and minimum acceptable total comp
- User sets target level/seniority (used to contextualize salary benchmarks in Module 4)
- These targets are used throughout to flag roles as above/below/at target range

#### 1.5 Narrative Pillars
- User writes 3–5 core narrative pillars — the themes their story should always reinforce
- Example: "Marketplace domain depth," "Technical building, not just PM oversight," "Operator who drives revenue outcomes"
- Pillars are passed as system context to every AI-generated output, ensuring all content reinforces the same story
- **Narrative consistency check:** After any AI content generation, a second Claude call evaluates the content against the pillars. It returns a consistency score (1–5) and a brief explanation. If score < 3, surface a yellow warning banner above the content with the explanation. Never block — the user can always proceed or edit. See AI Prompt Contracts for the full contract.

---

## Module 2: Company Intelligence Center

### Purpose
The heart of grndwrk's proactive philosophy. This module is used whether or not a role exists. The candidate builds a deep understanding of each target company — its strategic priorities, its challenges, its trajectory — and uses that knowledge to construct a compelling positioning story and identify the right moment to reach out.

### Features

#### 2.1 Company Profiles
Each company gets a rich profile that serves as the candidate's research dossier:
- Basic info: name, website, LinkedIn, HQ, stage, size
- User notes: why this company is a target, personal connections, relationship warmth
- Company Positioning Brief (see 2.5)
- Links to tracked opportunities (Module 3), compensation benchmarks (Module 4), and contacts (Module 5)

#### 2.2 Earnings Call & Public Signal Analysis
For public companies, earnings calls are one of the richest sources of intelligence about where a company is investing, what problems they're solving, and where hiring pressure may build.

- User pastes earnings call transcripts (primary), or provides an optional URL (e.g. SEC EDGAR, transcript site) for the app to fetch and parse. Manual paste is always supported; fetch is attempted when a URL is supplied.
- AI parses the transcript for:
  - **Hiring signals**: mentions of team expansion, new verticals, product investments
  - **Strategic priorities**: what leadership says is the focus for the next 12–18 months
  - **Problem areas**: challenges being named that may map to the candidate's expertise
  - **Outreach trigger score**: a 1–5 rating of how much this transcript suggests a relevant opportunity may be emerging. Rubric: 1 = No relevant signals detected; 2 = Vague strategic direction, low relevance to candidate's domain; 3 = Some alignment — worth monitoring; 4 = Clear investment in candidate's domain area; 5 = Explicit hiring intent or strong signal in candidate's exact domain. Score ≥ 4 → surface in Priority Action Queue.
- Output: a structured signal card per earnings call with extracted insights and suggested follow-up actions
- Signals feed directly into the outreach draft generator (2.3) and the Company Positioning Brief (2.5)

#### 2.3 Signal-to-Outreach Bridge
When a meaningful signal is identified — from an earnings call, product announcement, leadership hire, or press release — the system generates a draft proactive outreach message designed to:
- Reference a specific, real company priority (not generic flattery)
- Connect the candidate's background directly to that priority
- Add value to the recipient rather than just requesting something
- Be short, direct, and human

Example framing: "I saw [Company] mentioned doubling down on seller tools in Q3 — I've spent the last three years building exactly that infrastructure at Target, and I'd love to share what I've learned."

Outreach drafts are saved and linked to both the company profile and the Outreach Pipeline (Module 5).

#### 2.4 Role Alert Triggers
- User can note "watching for" criteria per company (e.g., "Any PM role on the marketplace or seller tools team")
- When a matching role is manually added, the system flags it, fast-tracks it into the Opportunity Tracker, and surfaces the existing company research as a head start

#### 2.5 Company Positioning Brief
For every target company — regardless of whether a role exists — the system helps the candidate build a **Company Positioning Brief**: a structured, AI-assisted document that answers the question a decision-maker would actually ask. Store AI output in a `draft` field and user edits in an `edited` field; the UI shows `edited` when present, otherwise `draft`. Always offer "Reset to AI draft." No version history in V1.

> "Why are you interested in us specifically — and why should we be interested in you?"

The brief includes:
- **Why this company**: What about their mission, problem space, or trajectory resonates with the candidate's background
- **Why now**: What current signals (earnings, press, product direction) make this a timely conversation
- **Value proposition**: What specific capabilities the candidate would bring that are directly relevant to the company's stated priorities
- **Proof points**: 2–3 specific examples from the candidate's background that map to the company's challenges
- **The ask**: A clear, low-pressure reason to connect

This brief is the foundation for any conversation — cold outreach, warm intro, networking coffee, or formal interview. It ensures the candidate never shows up unprepared or generic. **Complete** = user explicitly marks/saves the brief as complete; sections do not all need to be filled.

---

## Module 3: Opportunity Tracker

### Purpose
When a specific role exists, this module takes the company intelligence and positioning work already done in Module 2 and focuses it on the role — analyzing fit, generating tailored materials, and managing the application workflow.

### Features

#### 3.1 Job Submission & Analysis
- User pastes a job description
- System extracts: company, role title, level, team, key requirements, preferred qualifications
- If the company already exists in Module 2, all prior research is automatically surfaced as context
- AI performs a multi-dimensional Candidate-Market Fit analysis

**Candidate-Market Fit Score (1–10)**

The CMF Score is the primary signal for whether to pursue a role. It is not a resume keyword match. It is a weighted composite of five dimensions:

| Dimension | What It Measures |
|---|---|
| Domain alignment | Does my background map to the core problem this role solves? |
| Stage fit | Is this company at a stage where I've proven I add value? |
| Role scope fit | Does the scope, level, and ownership model match my target? |
| Strategic alignment | Is the company investing in the area this role addresses? |
| Narrative fit | Can I tell a natural, authentic story for this role without stretching? |

Each dimension is scored 1–10 and combined using the user's custom weights from Module 1. The score includes a full breakdown so the user understands why the score is what it is — not just a number.

Additional outputs:
- **Resume gap analysis**: What is missing or underrepresented for this specific role
- **Recommended resume tweaks**: Targeted adjustments, not a full rewrite
- **Compensation snapshot**: The relevant salary benchmark from Module 4 surfaced automatically
- **Application recommendation**: 8–10 = prioritize; 6–7 = proceed; 4–5 = marginal; below 4 = skip

#### 3.2 Role Positioning Brief
Just as Module 2 produces a Company Positioning Brief for proactive outreach, Module 3 produces a **Role Positioning Brief** when a specific role exists:

> "Why are you the right person for this specific role — and how will you contribute?"

The brief includes:
- **Role fit summary**: How the candidate's background maps to the role's core requirements
- **Contribution narrative**: What the candidate would actually do in the first 90 days, grounded in prior experience with similar problems
- **Differentiated value**: What the candidate brings that a typical applicant wouldn't — the narrative pillar most relevant to this role
- **Proof points**: 2–3 specific examples that directly address the role's stated priorities

This brief serves as the source document for cover letters, interview prep, and all role-specific conversations. **Complete** = user explicitly marks/saves the brief as complete; sections do not all need to be filled.

#### 3.3 Application Materials Generation
- **Cover letter**: AI drafts a cover letter grounded in the Role Positioning Brief and narrative pillars, with tone adjusted for company type (startup vs. enterprise). Store AI output in `draft` and user edits in `edited`; UI shows `edited` when present. Always offer "Reset to AI draft."
- **Narrative consistency check**: All generated content is checked against narrative pillars before the user finalizes it
- All materials are stored per opportunity for reference

#### 3.4 Application Status Tracking
- Pipeline status (not strictly sequential — multiple can apply): `Watching` (role identified, not yet acted on), `Preparing` (research and materials in progress), `Applied` (application submitted), `In process` (active interview or conversation underway), `Closed` (outcome reached: offer, rejection, or withdrawn)
- **Outreach sent** is a separate boolean tag/attribute on the opportunity, not a pipeline stage. Track whether proactive outreach has been sent to a contact at this company; outreach can happen at any stage (before or after applying)

#### 3.5 Custom Portfolio Links (post-V1)
- Generate a unique tracking URL per application; track click analytics (who clicked, when, from which application context). Surfaces which outreach and applications are generating real engagement. **Out of scope for V1** — implement in a later phase.

---

## Module 4: Compensation Intelligence

### Purpose
Give the candidate a clear, data-driven picture of compensation for their target roles and companies — before they apply, before they interview, and before they negotiate. Compensation context should be present at every decision point, not just at the offer stage.

### Features

#### 4.1 Salary Benchmarks by Company + Role

**Primary data source: Levels.fyi**

Levels.fyi is the most reliable publicly available source for total compensation data (base + equity + bonus) in tech and adjacent industries. It covers 85+ companies with breakdown by role, level, and location.

**Option A: Embeddable Charts (No API key required — recommended for V1)**
Levels.fyi provides free embeddable iframe charts for salary distributions by company and role family:
```
https://www.levels.fyi/charts_embed.html?company={CompanyName}&track={RoleFamily}
```
Supported role families: Software Engineer, Product Manager, Product Designer, Data Scientist, Software Engineering Manager. Charts render interactively in the app. Best used in Company Profile views and Opportunity detail views. **Implementation note:** Levels.fyi iframes require `frame-src https://www.levels.fyi` in the Content Security Policy (e.g. in `next.config.js` headers).

**Option B: Structured Markdown Data (Aspirational for V1)**
Levels.fyi exposes structured salary data in markdown format at predictable URLs; implementing Option B requires reverse-engineering the markdown format during development. Prefer Option A for V1. If implementing Option B: fetch at runtime, parse, and display; on fetch failure or 404, show "Compensation data unavailable" with an option to manually enter comp data. Attribution to Levels.fyi with a link back is required per their terms.

**Option C: Levels.fyi Paid API (recommended for V2)**
A paid enterprise/premium API returning fully structured compensation data filterable by company, level, location, and skills. Evaluate after V1 if free options prove limiting.

**Recommended V1 approach:** Option A for visual display in company profiles and opportunity views. Option B is optional for V1 (programmatic display); implement Option A first. Implementation: a dedicated `LevelsFyiEmbed` component (company + role family/track); iframe `src` as above; CSP in `next.config.js`: `frame-src 'self' https://www.levels.fyi`. On load failure, show "Compensation data unavailable" with manual entry fallback. See [frontend.md](frontend.md) §8.4.

#### 4.2 Compensation View: Company Profile
Within each company profile, a dedicated Compensation tab shows:
- Role compensation ranges by level (from Levels.fyi)
- Total comp breakdown: base, equity, bonus
- Location adjustments if relevant
- Data freshness indicator — flag when benchmark data is older than 6 months

#### 4.3 Compensation View: Opportunity Detail
When a role is added to the Opportunity Tracker, the relevant salary benchmark is automatically surfaced alongside the CMF Score:
- Estimated total comp range for this role at this company
- Whether that range meets the user's comp target: Above target / At target / Below target / Unknown
- A "comp gap" flag when a role scores well on CMF but falls short on compensation — surfacing a potential negotiation or walk-away scenario early

#### 4.4 Compensation Benchmarking Panel
A standalone view where the user can:
- Look up salary ranges for any company + role + level combination
- Compare total comp across multiple target companies side by side
- Understand how their current compensation compares to market
- Save benchmark snapshots to reference during the offer stage

#### 4.5 Negotiation Reference Card
When an opportunity moves to `In process` or receives an offer:
- Market comp range for this role/company/level (from Levels.fyi)
- User's stated target and minimum acceptable comp (from Module 1)
- CMF Score and fit summary (a reminder of the leverage the candidate has built)
- Suggested negotiation anchoring range based on the above

---

## Module 5: Outreach & Relationship Pipeline

### Purpose
The proactive job search runs on relationships. This module manages contacts, tracks relationship warmth, surfaces the highest-leverage outreach actions, and ensures no high-value relationship goes cold.

### Features

#### 5.1 Contact Management
- Name, title, company, LinkedIn URL
- Connection degree (1st / 2nd / cold)
- Relationship warmth: Cold / Warm / Hot
- Source, notes, last contact date
- Associated company and/or opportunity

#### 5.2 Outreach Priority Queue
Ranked list of highest-leverage outreach actions based on:
- **Urgency**: Open role at their company the candidate is tracking
- **Signal recency**: Recent earnings call or announcement with a relevant signal
- **Relationship warmth**: Warm contacts at Tier 1 companies rank higher
- **Time since last touch**: Flag contacts going cold at high-priority companies

Each item shows: **Contact → Company → Why now → Suggested action**

Answers the daily question: "Who should I reach out to today, and why?"

#### 5.3 Outreach Templates & Drafts
Template library by scenario:
- **No role available — company fit outreach**: Lead with company knowledge and a specific reason to connect, not a job ask
- **Role posted — warm intro request**: Ask for an introduction with a clear reason why this role is a strong fit
- **Cold outreach to potential hiring manager**: Lead with value and a relevant insight, not a resume
- **Earnings signal — proactive outreach**: Connect a company-stated priority to the candidate's background
- **Reconnecting with a lapsed contact**: Acknowledge the gap, lead with something relevant
- **Following up after an informational conversation**: Summarize value exchanged, suggest a next step

All templates are pre-loaded with the user's positioning context and narrative pillars. Each draft is editable before sending and saved with the contact record. Store AI-generated outreach text in `draft` and user edits in `edited`; UI shows `edited` when present. Always offer "Reset to AI draft."

#### 5.4 Outreach Tracking
- Log outreach sent: date, message summary, channel (LinkedIn / email / other)
- Track responses and outcomes
- Set follow-up reminders

---

## Module 6: Activity Dashboard

### Purpose
A single view of search health, momentum, and priority actions — designed to keep the search pointed and prevent it from stalling or sprawling.

### Features

#### 6.1 Search Health Metrics
- Companies in active monitoring
- Tier 1 targets with recent earnings signals
- Open opportunities by CMF Score band
- Warm contacts at target companies
- Company Positioning Briefs completed vs. in progress
- Days since last outreach activity

#### 6.2 Priority Action Queue
The 3–5 highest-leverage actions available right now. Examples:
- "Shopify published Q4 earnings 3 days ago — review signals and draft outreach"
- "Warm contact at Faire — no outreach in 30 days"
- "Role at Instacart matches Tier 1 criteria — CMF analysis pending"
- "Cover letter for [Role X] has a narrative consistency flag"
- "Company Positioning Brief for Etsy is incomplete"

Phase 1 can use rule-based DB queries (e.g. companies with no brief, opportunities without CMF score, high-CMF not applied); Phase 2+ uses the full ranked urgency tiers (earnings trigger score, in-process follow-up, cold Tier 1 contacts, etc.). See [backend.md](backend.md) §7 and [frontend.md](frontend.md) §8 (Dashboard).

#### 6.3 Funnel View
`Monitoring` → `Positioned` → `Applied/Outreach Sent` → `In Process` → `Outcome`

This is a visual roll-up of Module 3 opportunity statuses. Mapping: **Monitoring** = Watching or Preparing; **Positioned** = Company/Role brief ready but not yet applied or outreach sent; **Applied/Outreach Sent** = status Applied and/or outreach_sent tag true; **In Process** = In process; **Outcome** = Closed. Funnel counts are computed at request time from opportunities (see [backend.md](backend.md) §7). Goal: narrow and deep, not wide and shallow. Makes it immediately visible if the search is drifting toward volume over quality.

#### 6.4 Weekly Reflection Prompt
A weekly check-in surfacing patterns in the search data. Flags drift: too many low-CMF applications, neglected proactive outreach, incomplete Positioning Briefs, or high-priority contacts going cold.

---

## Data Model Summary

Module specs describe features and UX. This data model is the authoritative schema reference.

| Entity | Key Fields |
|---|---|
| `UserProfile` | resume_raw, resume_parsed (experience[], skills[], education[]), positioning_statement, narrative_pillars[], target_roles[], target_stages[], geography, remote_preference, cmf_weights, comp_target |
| `Company` | name, website, linkedin_url, hq, stage, size, tier, warmth (derived from contacts), notes, positioning_brief_id, signals[] |
| `EarningsSignal` | company_id, date, transcript, source_url (optional), parsed_signals[], outreach_trigger_score |
| `CompanyPositioningBrief` | company_id, draft (AI output), edited (user version), why_company, why_now, value_proposition, proof_points[], the_ask, completed_at |
| `Opportunity` | company_id, role_title, level, team, jd_text, key_requirements[], status, outreach_sent (boolean), cmf_score, cmf_breakdown, materials{} (draft/edited per item), comp_snapshot |
| `RolePositioningBrief` | opportunity_id, draft, edited, fit_summary, contribution_narrative, differentiated_value, proof_points[] |
| `Contact` | name, title, company_id, linkedin_url, connection_degree, warmth, source, notes, last_contact, outreach[] |
| `OutreachRecord` | contact_id, opportunity_id, date, channel, message_summary, response |
| `PortfolioLink` | opportunity_id, url, clicks[] |
| `CompBenchmark` | company_id, role_family, level, base_range, total_comp_range, source, fetched_at |

**Implementation notes:**

- **Authoritative schema:** The live schema is in `prisma/schema.prisma`; [backend.md](backend.md) §2 reproduces it and documents enums (`OpportunityStatus`, `ConnectionDegree`, `ContactWarmth`, `OutreachChannel`).
- **UserProfile singleton:** Exactly one row with `id = "singleton"`. All profile writes use upsert. See [backend.md](backend.md) §6.
- **Company warmth:** Not stored; derived from related contacts (Hot if any Hot, else Warm if any Warm, else Cold). See [backend.md](backend.md) Appendix.
- **Draft/edited pattern:** For all AI-generated content (`CompanyPositioningBrief`, `RolePositioningBrief`, `Opportunity.materials`): `draft` is write-once at generation time; `edited` is user edits; read as `edited ?? draft`. Reset sets `edited = null`. PATCH routes only write to `edited`. See [backend.md](backend.md) §5.
- **Comp snapshot:** `Opportunity.comp_snapshot` is a point-in-time copy (not a live FK). Written on opportunity create, when role_family/level change, or on refresh. Includes `meets_target` vs user `comp_target` and staleness. See [backend.md](backend.md) §8.

---

## AI Integration Points

All AI calls receive the user's `positioning_statement` and `narrative_pillars` as system context.

| Feature | AI Role |
|---|---|
| Earnings call analysis | Parse transcript, extract signals, priorities, outreach triggers |
| Company Positioning Brief | Generate structured brief from company research + user profile |
| CMF Score generation | Multi-dimensional role analysis against user profile |
| Resume gap analysis | Compare JD requirements to resume, identify gaps |
| Role Positioning Brief | Generate structured brief from JD + company research + user profile |
| Cover letter generation | Draft grounded in Role Positioning Brief and narrative pillars |
| Narrative consistency check | Flag content that drifts from narrative pillars |
| Outreach draft generation | Connect earnings signals or role priorities to user background |
| Priority action queue | Synthesize state across all modules into ranked next actions |
| Negotiation reference card | Compile comp data, CMF score, and targets into a negotiation brief |

---

## AI Prompt Contracts

The following three AI calls have explicit prompt contracts for implementation. All receive the user's `positioning_statement` and `narrative_pillars` as system context.

### CMF Score generation (§3.1)
- **System context:** positioning_statement, narrative_pillars, cmf_weights (the five dimension weights)
- **User message:** JD text + parsed resume + company research (if company exists in Module 2)
- **Instructions:** Score each of the five dimensions (domain alignment, stage fit, role scope fit, strategic alignment, narrative fit) 1–10 with a 1–2 sentence rationale per dimension. Return structured JSON: `{ domain: { score: number, rationale: string }, stage: { ... }, scope: { ... }, strategic: { ... }, narrative: { ... } }`. Also return resume_gap_analysis (string), recommended_tweaks (string[]), application_recommendation ("prioritize"|"proceed"|"marginal"|"skip").

### Earnings call analysis (§2.2)
- **System context:** positioning_statement, narrative_pillars
- **User message:** Full transcript text (and optionally company name for context)
- **Instructions:** Parse the transcript and extract: hiring_signals (string[]), strategic_priorities (string[]), problem_areas (string[]), outreach_trigger_score (1–5 integer), suggested_follow_ups (string[]). Return structured JSON. Use the outreach trigger rubric: 1 = no relevant signals; 2 = vague direction, low relevance; 3 = some alignment, worth monitoring; 4 = clear investment in candidate's domain; 5 = explicit hiring intent or strong signal in candidate's exact domain.

### Narrative consistency check (§1.5, §3.3)
- **System context:** narrative_pillars (array of strings)
- **User message:** The generated content to evaluate (e.g. cover letter, positioning brief section, outreach draft)
- **Instructions:** For each narrative pillar, assess whether this content reinforces, ignores, or contradicts it. Return JSON: `{ consistency_score: number (1–5), assessments: { pillar: string, assessment: "reinforces"|"ignores"|"contradicts", note: string }[], explanation: string }`. If consistency_score < 3, the UI surfaces a yellow warning banner with the explanation; never block the user from proceeding.

---

## Error Handling Conventions

- **AI call failures:** Show inline error with a "Retry" button. Never lose user-entered data; preserve form state.
- **External fetch failures (e.g. Levels.fyi):** Show "Data unavailable" with manual entry fallback where applicable.
- **Long-running AI calls:** CMF scoring and brief generation may take 5–15 seconds. Show a loading state with clear feedback; avoid timeouts that discard partial results.

**API error shape:** Backend routes return a consistent shape: success `{ data: T }`; error `{ error: string, message: string, retryable?: boolean, fields?: Record<string, string> }`. Use HTTP 502 for AI failures (with `retryable: true`), 422 for validation (e.g. CMF weights not summing to 100). Long AI routes set `maxDuration = 60` on the route segment. See [backend.md](backend.md) §9.

---

## Design System & Shared UI (Implementation)

The app uses a **neutral dark theme** aligned with a "strategic command center" tone. Key tokens: page background, surface/surface-raised for cards and inputs, border, foreground/muted text, accent for primary actions, plus success/warning/danger for CMF bands and narrative consistency. Typography uses Inter with a defined scale (page titles, section headers, body, metadata, badges). Layout: fixed 220px sidebar, main content max-width 1200px, spacing and card padding as in [frontend.md](frontend.md) §4.

**Shared UI patterns:**

- **Status badges:** Opportunity status (Watching, Preparing, Applied, In process, Closed) and company tier (Tier 1–3) with consistent colours; see [frontend.md](frontend.md) §5.
- **CMF score display:** Numeric score with colour bands (e.g. ≥8 green, 6–7 amber, 4–5 orange, &lt;4 red); optional per-dimension breakdown.
- **Draft/edited UI:** Single content area showing `edited ?? draft`; "Reset to AI draft" with confirmation; no version history in V1.
- **Narrative consistency banner:** When AI consistency score &lt; 3, show a yellow warning banner with explanation; never block the user.
- **Loading/error:** Skeleton loaders for page data; inline spinner for actions; AI calls show a clear "Generating..." state; errors preserve form state and offer Retry.

Full component list and conventions are in [frontend.md](frontend.md) §5 and §12. **State management:** No global state library in Phase 1; server components own data (Prisma), mutations via server actions with `revalidatePath`; client components own only UI state (forms, wizard step, sliders, tabs). See [frontend.md](frontend.md) §9.

---

## API Overview

Backend is Next.js App Router API routes under `app/api/`. Phase 1: no auth. Key groups: **Profile** (GET/POST upsert, PATCH cmf-weights); **Companies** (CRUD, signals, brief with GET/POST/PATCH/reset); **Opportunities** (CRUD, optional CMF POST in Phase 2, brief with GET/POST/PATCH/reset); **Contacts** and **Outreach** (Phase 3); **Benchmarks** (GET/POST, fetch in Phase 2); **Dashboard** (GET with funnel counts and priority action queue). Full route table and request/response semantics are in [backend.md](backend.md) §3.

**Funnel computation:** Dashboard funnel stages are computed from opportunities: Monitoring = Watching or Preparing; Positioned = same plus brief complete and not applied/outreach sent; Applied/Outreach Sent = status Applied or outreach_sent true; In Process; Outcome = Closed. Priority action queue is ranked by urgency tiers (e.g. high trigger score, in-process follow-up, cold Tier 1 contacts, unscored opportunities, incomplete briefs). See [backend.md](backend.md) §7.

---

## Multi-User & Council Mode (Future State)

### Council Mode Concepts
- **Shared company watchlist**: Members collectively monitor target companies and pool earnings signal analysis
- **Anonymous CMF benchmarking**: Members can see how others score similar roles for calibration
- **Peer positioning review**: Share Company or Role Positioning Briefs with council peers for feedback
- **Accountability dashboard**: Facilitators see aggregate search health metrics across members to guide coaching

### Portability Requirements
- User data fully exportable (JSON)
- No vendor lock-in on AI provider (API calls abstracted behind a service layer)
- Environment variables for all API keys and configuration
- Clear README for local and hosted deployment
- Optional: one-click deploy to Vercel / Railway / Render

---

## Tech Stack Recommendations

| Layer | Recommendation |
|---|---|
| Frontend | Next.js 14+ (App Router), React Server Components, Tailwind CSS, server actions for mutations |
| Backend | Next.js API routes in `app/api/`, Prisma ORM, Zod for request/response validation |
| Database | SQLite (local/dev), PostgreSQL (production) via Prisma |
| AI | Anthropic Claude API (claude-sonnet); single entry point in `lib/ai/claude.ts`, prompts in `lib/ai/prompts/` |
| Salary data | Levels.fyi iframe embeds only in V1; CSP `frame-src https://www.levels.fyi` in `next.config.js` |
| Auth (future) | Clerk or NextAuth for multi-user/council mode |
| Hosting | Vercel (frontend) + Railway or Supabase (database) |
| Analytics | Self-hosted click tracking via DB, or Plausible |

**V1 auth model:** Single-user; no authentication. All data scoped to the singleton `UserProfile`. Seeded on first run via `prisma/seed.ts`.

**Environment variables:** `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NODE_ENV`. See [backend.md](backend.md) §1.

**Phase 1 build order:** Implement profile and onboarding gate, then company CRUD, opportunity CRUD (manual CMF), dashboard with funnel and basic metrics, comp embed. No AI routes in Phase 1 (stub with 501). Frontend: route groups `(onboarding)` and `(app)` with sidebar, server actions in `app/actions/`, component scaffold as in [frontend.md](frontend.md) §10. Backend route order in [backend.md](backend.md) §10.

---

## Onboarding Flow

On first launch, redirect to a profile setup wizard at `/profile/setup` with four steps: (1) Core Profile + resume paste, (2) Narrative Pillars, (3) CMF Weights, (4) Compensation Targets. Steps 1 and 2 are required to proceed; steps 3 and 4 have pre-filled defaults. Completing this flow unlocks the full app. The app shell layout checks that the singleton profile exists and has completed steps 1 and 2 (e.g. `positioning_statement` set and `narrative_pillars` non-empty); if not, redirect to `/profile/setup`. Wizard state is client-side (e.g. `useReducer` + context); final submit upserts the profile and redirects to `/dashboard`. See [frontend.md](frontend.md) §6 and [backend.md](backend.md) §6.

---

## Development Phases

### Phase 1 — Foundation
- Profile & Positioning Hub (Module 1)
- Company list with basic profiles and Company Positioning Brief template (Module 2)
- Opportunity tracker with manual CMF scoring and status tracking (Module 3)
- Basic compensation embed from Levels.fyi (Module 4)
- Basic dashboard (Module 6)

### Phase 2 — Intelligence Layer
- Earnings call paste-and-parse with AI signal extraction (Module 2)
- AI-powered CMF scoring with full breakdown (Module 3)
- AI-generated Company and Role Positioning Briefs (Modules 2 + 3)
- Cover letter generation with narrative consistency check (Module 3)
- Outreach draft generation from earnings signals (Modules 2 + 5)
- Levels.fyi markdown fetch for programmatic comp display (Module 4)

### Phase 3 — Outreach & Relationships
- Full contact management and relationship warmth tracking (Module 5)
- Outreach priority queue (Modules 5 + 6)
- Negotiation reference card generation (Module 4)

### Phase 4 — Council Mode
- User authentication and multi-user support
- Shared company watchlist and pooled signal analysis
- Council facilitator dashboard
- Peer positioning review workflows
- Full export / portability features

Detailed route-by-route and AI activation order for each phase is in [backend.md](backend.md) §10. [CLAUDE.md](CLAUDE.md) summarizes the current phase and module scope for agents.

---

## Open Questions for Development

1. **Earnings transcript sourcing (resolved for V1):** Manual paste is primary; optional URL field allows the app to attempt fetch (e.g. SEC EDGAR or transcript sites). See §2.2.
2. **Levels.fyi data freshness (resolved):** Build in a staleness flag (warn if data is older than 6 months) and a manual refresh trigger. See §4.2.
3. **Levels.fyi coverage gaps (resolved):** For smaller or private companies not in the database, gracefully degrade with "no data available" and option to manually enter comp data. See §4.1.
4. **Portfolio link hosting:** Generate and host portfolio landing pages, or just track clicks on user-provided external links? Deferred; Portfolio Links are out of V1 scope (§3.5).
5. **LinkedIn integration:** API is heavily restricted. Contact discovery will need to be manual unless a third-party enrichment tool is introduced.
6. **CMF score recalculation:** Automatically recalculate when the user updates profile weights, or only on demand?
7. **Mobile experience (resolved):** Desktop-first for V1; responsive mobile layout in V2.