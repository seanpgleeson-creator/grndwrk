import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import { runNarrativeCheck } from "@/lib/ai/narrative";
import { buildCoverLetterPrompt, CoverLetterSchema } from "@/lib/ai/prompts/coverLetter";

export const maxDuration = 60;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!opportunity) {
      return NextResponse.json(
        { error: "not_found", message: "Opportunity not found" },
        { status: 404 },
      );
    }

    const text = await callClaudeWithProfile({
      systemSuffix:
        "You write tailored cover letters. Return ONLY valid JSON: { \"draft\": string }.",
      user: buildCoverLetterPrompt({
        companyName: opportunity.company.name,
        roleTitle: opportunity.role_title,
        jdText: opportunity.jd_text,
      }),
      maxTokens: 8192,
    });

    const { draft } = parseWithSchema(text, CoverLetterSchema);

    let materials: Record<string, unknown> = {};
    try {
      materials = opportunity.materials
        ? (JSON.parse(opportunity.materials) as Record<string, unknown>)
        : {};
    } catch {
      materials = {};
    }

    const nextMaterials = {
      ...materials,
      cover_letter: { draft, edited: null as string | null },
    };

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { materials: JSON.stringify(nextMaterials) },
    });

    let narrative_check = null;
    try {
      narrative_check = await runNarrativeCheck(draft);
    } catch {
      /* optional */
    }

    return NextResponse.json({
      data: updated,
      narrative_check,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "ai_failure",
        message: err instanceof Error ? err.message : "Cover letter generation failed",
        retryable: true,
      },
      { status: 502 },
    );
  }
}
