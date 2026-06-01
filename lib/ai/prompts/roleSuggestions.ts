import { z } from "zod";

export const RoleSuggestionSchema = z.object({
  role_title: z.string(),
  company_type: z.string(),
  rationale: z.string(),
  search_query: z.string(),
});

export const RoleSuggestionsSchema = z.object({
  suggestions: z.array(RoleSuggestionSchema),
});

export type RoleSuggestion = z.infer<typeof RoleSuggestionSchema>;
export type RoleSuggestionsResult = z.infer<typeof RoleSuggestionsSchema>;

export interface RoleSuggestionsInput {
  targetRoles: string[];
  targetStages: string[];
  geography: string;
  positioningStatement: string;
  narrativePillars: string[];
  preferredGeographies: string[];
}

export function buildRoleSuggestionsPrompt(input: RoleSuggestionsInput): string {
  const {
    targetRoles,
    targetStages,
    geography,
    positioningStatement,
    narrativePillars,
    preferredGeographies,
  } = input;

  const contextParts: string[] = [];
  if (targetRoles.length) contextParts.push(`Target roles: ${targetRoles.join(", ")}`);
  if (targetStages.length) contextParts.push(`Target company stages: ${targetStages.join(", ")}`);
  if (geography) contextParts.push(`Primary location: ${geography}`);
  if (preferredGeographies.length) contextParts.push(`Open to: ${preferredGeographies.join(", ")}`);
  if (positioningStatement) contextParts.push(`Positioning: ${positioningStatement}`);
  if (narrativePillars.length) contextParts.push(`Core themes: ${narrativePillars.join("; ")}`);

  return `You suggest specific, interesting job opportunities for a candidate based on their profile.

Candidate profile:
${contextParts.join("\n")}

Generate 5–8 specific role suggestions. Each should be a real, plausible role type at a specific type of company (e.g. "Head of Product at a Series B fintech"). Be concrete — name the company type and stage, not just the role title.

Also provide a practical LinkedIn or job board search query the candidate can use to find these roles.

Return ONLY valid JSON (no markdown):
{
  "suggestions": [
    {
      "role_title": string,      // e.g. "Director of Product Management"
      "company_type": string,    // e.g. "Series B / C fintech or payments company"
      "rationale": string,       // 1 sentence: why this fits the candidate's profile
      "search_query": string     // LinkedIn job search query string
    }
  ]
}`;
}
