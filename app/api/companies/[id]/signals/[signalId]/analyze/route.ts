import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import {
  buildEarningsPrompt,
  EarningsAnalysisSchema,
} from "@/lib/ai/prompts/earnings";

export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; signalId: string }> },
) {
  const { id: companyId, signalId } = await params;

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
    const signal = await prisma.earningsSignal.findFirst({
      where: { id: signalId, company_id: companyId },
    });
    if (!signal) {
      return NextResponse.json(
        { error: "not_found", message: "Signal not found" },
        { status: 404 },
      );
    }

    const text = await callClaudeWithProfile({
      systemSuffix:
        "You analyze earnings transcripts for hiring and strategy signals. Return ONLY valid JSON.",
      user: buildEarningsPrompt(signal.transcript),
      maxTokens: 8192,
    });

    const analysis = parseWithSchema(text, EarningsAnalysisSchema);

    const updated = await prisma.earningsSignal.update({
      where: { id: signalId },
      data: {
        parsed_signals: JSON.stringify(analysis),
        outreach_trigger_score: analysis.outreach_trigger_score,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "ai_failure",
        message: err instanceof Error ? err.message : "Analysis failed",
        retryable: true,
      },
      { status: 502 },
    );
  }
}
