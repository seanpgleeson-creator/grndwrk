import { z } from "zod";

export const JdExtractSchema = z.object({
  role_title: z.string().optional(),
  level: z.string().optional(),
  team: z.string().optional(),
  jd_text: z.string(),
  key_requirements: z.array(z.string()).default([]),
});

export type JdExtract = z.infer<typeof JdExtractSchema>;

export function buildJdExtractPrompt(pageText: string): string {
  return `You extract structured job description data from the raw text of a job posting page.

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "role_title": string | null,
  "level": string | null,
  "team": string | null,
  "jd_text": string,
  "key_requirements": string[]
}

Rules:
- role_title: the job title as listed (e.g. "Senior Product Manager"). Omit if not clearly stated.
- level: the seniority level or grade if explicitly mentioned (e.g. "IC4", "Senior", "Staff", "Director"). Omit if not stated.
- team: the team, function, or product area if mentioned (e.g. "Growth", "Marketplace", "Platform Engineering"). Omit if not stated.
- jd_text: the full, cleaned job description text — responsibilities, qualifications, about the team. Strip navigation, footer, cookie banners, ads, and boilerplate. Preserve sentence structure.
- key_requirements: up to 8 bullet-point requirements that are the most critical for this role. Extract verbatim or lightly paraphrased from the must-have/required sections. Empty array if requirements are not clearly listed.
- If a field is absent from the page, return null (or empty array for key_requirements) — do not invent values.

Page text:
---
${pageText}
---
`;
}
