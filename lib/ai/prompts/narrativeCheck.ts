import { z } from "zod";

export const NarrativeCheckSchema = z.object({
  consistency_score: z.number().min(1).max(5),
  assessments: z.array(z.string()).default([]),
  explanation: z.string(),
});

export type NarrativeCheck = z.infer<typeof NarrativeCheckSchema>;

export function buildNarrativeCheckPrompt(generatedContent: string): string {
  return `You check whether the following text stays consistent with the candidate's stated narrative pillars (provided in system context).

Generated content to evaluate:
---
${generatedContent}
---

Return ONLY valid JSON:
{
  "consistency_score": 1-5,
  "assessments": string[],
  "explanation": string
}`;
}
