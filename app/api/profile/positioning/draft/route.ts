import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { callClaude } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import {
  buildPositioningDraftPrompt,
  PositioningDraftSchema,
} from "@/lib/ai/prompts/positioningStatement";

export const maxDuration = 60;

const RequestSchema = z.object({
  answers: z
    .object({
      distinctly_good_at: z.string().optional(),
      problems: z.string().optional(),
      missed: z.string().optional(),
    })
    .optional()
    .default({}),
  resume_raw: z.string().optional(),
  target_roles: z.array(z.string()).optional(),
  target_stages: z.array(z.string()).optional(),
  geography: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error: "ai_not_configured",
        message: "Set ANTHROPIC_API_KEY in environment variables",
        retryable: false,
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "validation_error", message: "Invalid JSON body" },
      { status: 422 },
    );
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", message: parsed.error.message },
      { status: 422 },
    );
  }

  const { answers, resume_raw, target_roles, target_stages, geography } = parsed.data;

  const hasAnyContext =
    answers.distinctly_good_at?.trim() ||
    answers.problems?.trim() ||
    answers.missed?.trim() ||
    resume_raw?.trim() ||
    (target_roles && target_roles.length > 0);

  if (!hasAnyContext) {
    return NextResponse.json(
      {
        error: "validation_error",
        message: "Provide at least one answer or paste a resume to generate a draft",
        retryable: false,
      },
      { status: 422 },
    );
  }

  try {
    const text = await callClaude({
      system:
        "You are an expert career positioning writer. Follow the user's format instructions exactly. Return only JSON.",
      user: buildPositioningDraftPrompt({ answers, resume_raw, target_roles, target_stages, geography }),
      maxTokens: 2048,
    });

    const result = parseWithSchema(text, PositioningDraftSchema);
    return NextResponse.json({ data: { statement: result.statement } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "ai_failure",
        message: err instanceof Error ? err.message : "Positioning draft failed",
        retryable: true,
      },
      { status: 502 },
    );
  }
}
