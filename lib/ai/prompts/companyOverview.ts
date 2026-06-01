import { z } from "zod";

export const CompanyOverviewSchema = z.object({
  stage: z.string().optional(),
  size: z.string().optional(),
  hq: z.string().optional(),
  notes: z.string().optional(),
});

export type CompanyOverviewResult = z.infer<typeof CompanyOverviewSchema>;

export function buildCompanyOverviewPrompt(name: string, website?: string | null): string {
  const websiteCtx = website ? `\nWebsite: ${website}` : "";

  return `You infer high-level company profile information based on your knowledge.

Company: ${name}${websiteCtx}

Use what you know about this company to fill in the fields below. Be specific and accurate. If you are not confident about a field, omit it rather than guess.

Fields:
- stage: company stage — one of: "Pre-seed", "Seed", "Series A", "Series B", "Series C", "Series D+", "Public", or "Other"
- size: headcount band — one of: "1-50", "51-200", "201-1000", "1000+"
- hq: headquarters city and state/country, e.g. "San Francisco, CA" or "London, UK"
- notes: 1–2 sentence description of what the company does, why it's notable, and what makes it interesting for candidates

Return ONLY valid JSON (no markdown):
{
  "stage": string | null,
  "size": string | null,
  "hq": string | null,
  "notes": string | null
}`;
}
