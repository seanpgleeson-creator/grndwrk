import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import { buildCompanyOverviewPrompt, CompanyOverviewSchema } from "@/lib/ai/prompts/companyOverview";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ai_not_configured", message: "Set ANTHROPIC_API_KEY in environment variables", retryable: false },
      { status: 503 },
    );
  }

  const body = (await req.json()) as { name?: string; website?: string };

  if (!body.name?.trim()) {
    return NextResponse.json(
      { error: "missing_name", message: "Company name is required" },
      { status: 400 },
    );
  }

  try {
    const prompt = buildCompanyOverviewPrompt(body.name, body.website);
    const raw = await callClaude({
      system: "You infer company profile information from your knowledge. Return ONLY valid JSON.",
      user: prompt,
      maxTokens: 512,
    });
    const result = parseWithSchema(raw, CompanyOverviewSchema);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("suggest-overview error:", err);
    return NextResponse.json(
      { error: "ai_failure", message: "Failed to suggest overview", retryable: true },
      { status: 502 },
    );
  }
}
