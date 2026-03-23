import { z } from "zod";

export const CoverLetterSchema = z.object({
  draft: z.string(),
});

export type CoverLetterAi = z.infer<typeof CoverLetterSchema>;

export function buildCoverLetterPrompt(input: {
  companyName: string;
  roleTitle: string;
  jdText: string | null;
}): string {
  return `Write a concise cover letter draft for this role. Tone: professional, specific, no fluff.

Company: ${input.companyName}
Role: ${input.roleTitle}

Job description:
${input.jdText ?? "(not provided)"}

Return ONLY valid JSON:
{ "draft": string }`;
}
