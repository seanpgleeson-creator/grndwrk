import { z } from "zod";

export const RoleBriefSchema = z.object({
  fit_summary: z.string(),
  contribution_narrative: z.string(),
  differentiated_value: z.string(),
  proof_points: z.array(z.string()).optional(),
});

export type RoleBriefAi = z.infer<typeof RoleBriefSchema>;

export function buildRoleBriefPrompt(input: {
  companyName: string;
  roleTitle: string;
  jdText: string | null;
  level: string | null;
}): string {
  return `Write a role positioning brief: why this candidate fits this specific role.

Company: ${input.companyName}
Role: ${input.roleTitle}
Level: ${input.level ?? ""}

Job description:
${input.jdText ?? "(not provided)"}

Return ONLY valid JSON:
{
  "fit_summary": string,
  "contribution_narrative": string,
  "differentiated_value": string,
  "proof_points": string[] (2-3)
}`;
}
