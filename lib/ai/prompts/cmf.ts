import { z } from "zod";

const dim = z.object({
  score: z.number().min(1).max(10),
  rationale: z.string(),
});

export const CmfResponseSchema = z.object({
  domain: dim,
  stage: dim,
  scope: dim,
  strategic: dim,
  narrative: dim,
  resume_gap_analysis: z.string(),
  recommended_tweaks: z.array(z.string()),
  application_recommendation: z.enum([
    "prioritize",
    "proceed",
    "marginal",
    "skip",
  ]),
});

export type CmfAiResponse = z.infer<typeof CmfResponseSchema>;

export function buildCmfPrompt(input: {
  weights: Record<string, number>;
  jdText: string | null;
  resumeParsed: string | null;
  companyName: string;
  roleTitle: string;
}): string {
  return `You are a career strategy analyst. Score the candidate's fit for this role across five dimensions.

CMF weights (importance %): ${JSON.stringify(input.weights)}

Company: ${input.companyName}
Role: ${input.roleTitle}

Job description:
${input.jdText ?? "(not provided)"}

Parsed resume (JSON string):
${input.resumeParsed ?? "(not provided)"}

Return ONLY valid JSON matching:
{
  "domain": { "score": 1-10, "rationale": "..." },
  "stage": { "score": 1-10, "rationale": "..." },
  "scope": { "score": 1-10, "rationale": "..." },
  "strategic": { "score": 1-10, "rationale": "..." },
  "narrative": { "score": 1-10, "rationale": "..." },
  "resume_gap_analysis": string,
  "recommended_tweaks": string[],
  "application_recommendation": "prioritize" | "proceed" | "marginal" | "skip"
}`;
}
