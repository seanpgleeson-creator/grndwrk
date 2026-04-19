import { z } from "zod";

export const PositioningDraftSchema = z.object({
  statement: z.string(),
});

export type PositioningDraftResult = z.infer<typeof PositioningDraftSchema>;

export interface PositioningDraftInput {
  answers: {
    distinctly_good_at?: string;
    problems?: string;
    missed?: string;
  };
  resume_raw?: string;
  target_roles?: string[];
  target_stages?: string[];
  geography?: string;
}

export function buildPositioningDraftPrompt(input: PositioningDraftInput): string {
  const { answers, resume_raw, target_roles, target_stages, geography } = input;

  const contextParts: string[] = [];

  if (answers.distinctly_good_at?.trim()) {
    contextParts.push(`What they're most distinctly good at: ${answers.distinctly_good_at.trim()}`);
  }
  if (answers.problems?.trim()) {
    contextParts.push(`Problems they want to solve next: ${answers.problems.trim()}`);
  }
  if (answers.missed?.trim()) {
    contextParts.push(`What most resumes miss about them: ${answers.missed.trim()}`);
  }
  if (target_roles && target_roles.length > 0) {
    contextParts.push(`Target roles: ${target_roles.join(", ")}`);
  }
  if (target_stages && target_stages.length > 0) {
    contextParts.push(`Target company stages: ${target_stages.join(", ")}`);
  }
  if (geography?.trim()) {
    contextParts.push(`Location: ${geography.trim()}`);
  }

  const resumeSection = resume_raw?.trim()
    ? `\n\nResume (for context — extract specific skills, titles, and accomplishments; do not quote verbatim):\n---\n${resume_raw.trim()}\n---`
    : "";

  const candidateContext = contextParts.length > 0
    ? contextParts.join("\n")
    : "(minimal context provided — draft a professional positioning statement based on available signals)";

  return `You write sharp, first-person positioning statements for job seekers.

A positioning statement answers one question for a hiring decision-maker: "Why would the right company be lucky to have this person?"

Rules:
- 2–4 sentences, first-person, present tense
- Concrete and specific — reference actual skills, domains, or accomplishments
- No clichés ("passionate", "results-driven", "team player", "synergy", "leveraged")
- No generic openers like "I am a..." or "With X years of experience..."
- The statement should sound like a confident, thoughtful person wrote it — not a LinkedIn summary
- When a resume is provided, anchor specific claims in it
- Leave room for the candidate to personalise it — aim for honest and distinctive, not exhaustive

Return ONLY valid JSON (no markdown) with this exact shape:
{ "statement": string }

Candidate context:
${candidateContext}${resumeSection}
`;
}
