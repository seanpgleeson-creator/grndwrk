import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import { runNarrativeCheck } from "@/lib/ai/narrative";
import { buildCmfPrompt, CmfResponseSchema } from "@/lib/ai/prompts/cmf";
import { calcCmfScore, parseJsonField, type CmfWeights } from "@/lib/utils";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  if (body.generate === true) {
    try {
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

      const profile = await prisma.userProfile.findUnique({
        where: { id: "singleton" },
        select: { cmf_weights: true, resume_parsed: true },
      });
      const weights = parseJsonField<CmfWeights>(profile?.cmf_weights, {
        domain: 30,
        stage: 20,
        scope: 20,
        strategic: 20,
        narrative: 10,
      });

      const text = await callClaudeWithProfile({
        systemSuffix:
          "You are a career strategy analyst. Score candidate-market fit. Return ONLY valid JSON with the keys specified in the user message.",
        user: buildCmfPrompt({
          weights,
          jdText: opportunity.jd_text,
          resumeParsed: profile?.resume_parsed ?? null,
          companyName: opportunity.company.name,
          roleTitle: opportunity.role_title,
        }),
        maxTokens: 8192,
      });

      const ai = parseWithSchema(text, CmfResponseSchema);
      const flat = {
        domain: ai.domain.score,
        stage: ai.stage.score,
        scope: ai.scope.score,
        strategic: ai.strategic.score,
        narrative: ai.narrative.score,
      };
      const score = calcCmfScore(flat, weights);

      const cmf_breakdown = {
        ...flat,
        ai: {
          rationale: {
            domain: ai.domain.rationale,
            stage: ai.stage.rationale,
            scope: ai.scope.rationale,
            strategic: ai.strategic.rationale,
            narrative: ai.narrative.rationale,
          },
          resume_gap_analysis: ai.resume_gap_analysis,
          recommended_tweaks: ai.recommended_tweaks,
          application_recommendation: ai.application_recommendation,
        },
      };

      let narrative_check = null;
      try {
        narrative_check = await runNarrativeCheck(
          JSON.stringify(ai, null, 2),
        );
      } catch {
        /* optional */
      }

      const updated = await prisma.opportunity.update({
        where: { id },
        data: {
          cmf_score: score,
          cmf_breakdown: JSON.stringify(cmf_breakdown),
        },
      });

      return NextResponse.json({
        data: updated,
        narrative_check,
      });
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        {
          error: "ai_failure",
          message: err instanceof Error ? err.message : "CMF generation failed",
          retryable: true,
        },
        { status: 502 },
      );
    }
  }

  try {
    const { domain, stage, scope, strategic, narrative } = body;
    if ([domain, stage, scope, strategic, narrative].some((v) => v == null)) {
      return NextResponse.json(
        { error: "validation_error", message: "All 5 CMF dimensions are required" },
        { status: 422 },
      );
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: "singleton" },
      select: { cmf_weights: true },
    });
    const weights = parseJsonField<CmfWeights>(profile?.cmf_weights, {
      domain: 30,
      stage: 20,
      scope: 20,
      strategic: 20,
      narrative: 10,
    });

    const breakdown = { domain, stage, scope, strategic, narrative };
    const score = calcCmfScore(breakdown, weights);

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        cmf_score: score,
        cmf_breakdown: JSON.stringify(breakdown),
      },
    });

    return NextResponse.json({ data: opportunity });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "server_error",
        message: err instanceof Error ? err.message : "Failed to save CMF score",
        retryable: false,
      },
      { status: 500 },
    );
  }
}
