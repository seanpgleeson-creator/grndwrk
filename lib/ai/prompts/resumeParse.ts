import { z } from "zod";

export const ResumeParsedSchema = z.object({
  experience: z
    .array(
      z.object({
        company: z.string().optional(),
        title: z.string().optional(),
        dates: z.string().optional(),
        bullets: z.array(z.string()).optional(),
      }),
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  education: z
    .array(
      z.object({
        school: z.string().optional(),
        degree: z.string().optional(),
        year: z.string().optional(),
      }),
    )
    .default([]),
});

export type ResumeParsed = z.infer<typeof ResumeParsedSchema>;

export function buildResumeParsePrompt(resumeRaw: string): string {
  return `You extract structured resume data from unstructured text.

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "experience": [ { "company": string, "title": string, "dates": string, "bullets": string[] } ],
  "skills": string[],
  "education": [ { "school": string, "degree": string, "year": string } ]
}

Resume text:
---
${resumeRaw}
---
`;
}
