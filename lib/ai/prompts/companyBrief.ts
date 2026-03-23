import { z } from "zod";

export const CompanyBriefSchema = z.object({
  why_company: z.string(),
  why_now: z.string(),
  value_proposition: z.string(),
  proof_points: z.array(z.string()).optional(),
  the_ask: z.string(),
});

export type CompanyBriefAi = z.infer<typeof CompanyBriefSchema>;

export function buildCompanyBriefPrompt(input: {
  companyName: string;
  website: string | null;
  hq: string | null;
  stage: string | null;
  notes: string | null;
}): string {
  return `Write a company positioning brief for a candidate outreach / networking context.

Company: ${input.companyName}
Website: ${input.website ?? ""}
HQ: ${input.hq ?? ""}
Stage: ${input.stage ?? ""}
Notes: ${input.notes ?? ""}

Return ONLY valid JSON:
{
  "why_company": string,
  "why_now": string,
  "value_proposition": string,
  "proof_points": string[] (2-3 bullets),
  "the_ask": string
}`;
}
