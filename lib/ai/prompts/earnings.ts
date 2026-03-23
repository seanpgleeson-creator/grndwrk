import { z } from "zod";

export const EarningsAnalysisSchema = z.object({
  hiring_signals: z.array(z.string()).default([]),
  strategic_priorities: z.array(z.string()).default([]),
  problem_areas: z.array(z.string()).default([]),
  outreach_trigger_score: z.number().min(1).max(5),
  suggested_follow_ups: z.array(z.string()).default([]),
});

export type EarningsAnalysis = z.infer<typeof EarningsAnalysisSchema>;

export function buildEarningsPrompt(transcript: string): string {
  return `Analyze this earnings call transcript for hiring signals relevant to a job seeker.

Transcript:
---
${transcript}
---

Return ONLY valid JSON:
{
  "hiring_signals": string[],
  "strategic_priorities": string[],
  "problem_areas": string[],
  "outreach_trigger_score": 1-5,
  "suggested_follow_ups": string[]
}`;
}
