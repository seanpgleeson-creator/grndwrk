import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaude } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import {
  buildResumeParsePrompt,
  ResumeParsedSchema,
} from "@/lib/ai/prompts/resumeParse";

export const maxDuration = 60;

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

  try {
    const body = await req.json();
    const resume_raw = typeof body.resume_raw === "string" ? body.resume_raw : "";
    if (!resume_raw.trim()) {
      return NextResponse.json(
        { error: "validation_error", message: "resume_raw is required" },
        { status: 422 },
      );
    }

    const text = await callClaude({
      system:
        "You are an expert resume parser. Follow the user's format instructions exactly. Return only JSON.",
      user: buildResumeParsePrompt(resume_raw),
      maxTokens: 8192,
    });

    const parsed = parseWithSchema(text, ResumeParsedSchema);
    const resume_parsed = JSON.stringify(parsed);

    await prisma.userProfile.update({
      where: { id: "singleton" },
      data: { resume_raw, resume_parsed },
    });

    return NextResponse.json({ data: { resume_parsed: parsed } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "ai_failure",
        message: err instanceof Error ? err.message : "Resume parsing failed",
        retryable: true,
      },
      { status: 502 },
    );
  }
}
