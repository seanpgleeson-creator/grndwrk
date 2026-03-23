import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey: key });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ClaudeCallOptions {
  system: string;
  user: string;
  maxTokens?: number;
}

/**
 * Raw Claude text completion. Retries up to 3 times on transient errors.
 */
export async function callClaude(options: ClaudeCallOptions): Promise<string> {
  const { system, user, maxTokens = 8192 } = options;
  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  const client = getClient();

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      });
      const block = response.content[0];
      if (!block || block.type !== "text") {
        throw new Error("Unexpected Claude response shape");
      }
      return block.text;
    } catch (err) {
      lastError = err;
      if (attempt < 2) await sleep(1000 * (attempt + 1));
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function callClaudeWithProfile(options: {
  systemSuffix: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const profile = await prisma.userProfile.findUnique({
    where: { id: "singleton" },
    select: {
      positioning_statement: true,
      narrative_pillars: true,
    },
  });

  const pillars =
    profile?.narrative_pillars != null
      ? profile.narrative_pillars
      : "[]";

  const profileContext = `Candidate positioning statement:
${profile?.positioning_statement ?? "(not set)"}

Narrative pillars (JSON):
${pillars}
`;

  return callClaude({
    system: `${profileContext}\n\n${options.systemSuffix}`,
    user: options.user,
    maxTokens: options.maxTokens,
  });
}
