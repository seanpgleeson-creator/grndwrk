import { z } from "zod";

export const MarketSignalSchema = z.object({
  title: z.string(),
  summary: z.string(),
  source_type: z.string(),
});

export const MarketSignalsSuggestSchema = z.object({
  signals: z.array(MarketSignalSchema),
});

export type MarketSignalSuggestion = z.infer<typeof MarketSignalSchema>;
export type MarketSignalsSuggestResult = z.infer<typeof MarketSignalsSuggestSchema>;

export interface MarketSignalsInput {
  companyName: string;
  website?: string | null;
  hq?: string | null;
  stage?: string | null;
  notes?: string | null;
}

export function buildMarketSignalsPrompt(input: MarketSignalsInput): string {
  const { companyName, website, hq, stage, notes } = input;

  const contextParts: string[] = [`Company: ${companyName}`];
  if (website) contextParts.push(`Website: ${website}`);
  if (hq) contextParts.push(`HQ: ${hq}`);
  if (stage) contextParts.push(`Stage: ${stage}`);
  if (notes?.trim()) contextParts.push(`Notes: ${notes.trim()}`);

  return `You identify market signals that a job seeker tracking this company should be aware of.

Market signals include:
- Recent earnings calls or financial results (the company itself and key competitors)
- Product launches, pivots, or major announcements
- Leadership changes (CEO, CPO, CTO, etc.)
- Funding rounds, M&A activity, or IPO news
- Industry trends or regulatory changes affecting the company
- Credible press coverage, analyst reports, or influential commentary
- Competitor moves that affect the company's strategic position

Company context:
${contextParts.join("\n")}

Generate 4–6 specific, actionable signal ideas. Each signal should be plausible based on what you know about this company and its industry. Be specific — name competitors, name the event type, describe why it matters for outreach timing.

Return ONLY valid JSON (no markdown):
{
  "signals": [
    {
      "title": string,        // Short headline, e.g. "Q3 Earnings Beat — Accelerating Hiring"
      "summary": string,      // 1–2 sentences on what the signal is and why it matters for outreach
      "source_type": string   // e.g. "Earnings call", "Competitor news", "Press release", "Industry trend", "Leadership change"
    }
  ]
}`;
}
