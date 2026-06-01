import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import { buildMarketSignalsPrompt, MarketSignalsSuggestSchema } from "@/lib/ai/prompts/marketSignals";

export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: companyId } = await params;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ai_not_configured", message: "Set ANTHROPIC_API_KEY in environment variables", retryable: false },
      { status: 503 },
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true, website: true, hq: true, stage: true, notes: true },
  });

  if (!company) {
    return NextResponse.json(
      { error: "not_found", message: "Company not found" },
      { status: 404 },
    );
  }

  try {
    const prompt = buildMarketSignalsPrompt({
      companyName: company.name,
      website: company.website,
      hq: company.hq,
      stage: company.stage,
      notes: company.notes,
    });

    const raw = await callClaudeWithProfile({
      systemSuffix: "You identify market signals relevant to a job seeker tracking a target company. Return ONLY valid JSON.",
      user: prompt,
      maxTokens: 2048,
    });

    const result = parseWithSchema(raw, MarketSignalsSuggestSchema);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("marketSignals suggest error:", err);
    return NextResponse.json(
      { error: "ai_failure", message: "Failed to suggest signals", retryable: true },
      { status: 502 },
    );
  }
}
