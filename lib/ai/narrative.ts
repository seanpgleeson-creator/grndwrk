import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import {
  buildNarrativeCheckPrompt,
  NarrativeCheckSchema,
} from "@/lib/ai/prompts/narrativeCheck";

/** Secondary consistency check after generation. Returns null if AI fails. */
export async function runNarrativeCheck(content: string) {
  const text = await callClaudeWithProfile({
    systemSuffix: `Evaluate whether the content aligns with the candidate's narrative pillars (in system context). Be concise. Output only valid JSON.`,
    user: buildNarrativeCheckPrompt(content),
    maxTokens: 2048,
  });
  return parseWithSchema(text, NarrativeCheckSchema);
}
