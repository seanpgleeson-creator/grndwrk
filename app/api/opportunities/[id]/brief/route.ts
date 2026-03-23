import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import { runNarrativeCheck } from "@/lib/ai/narrative";
import { buildRoleBriefPrompt, RoleBriefSchema } from "@/lib/ai/prompts/roleBrief";

export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const brief = await prisma.rolePositioningBrief.findUnique({
    where: { opportunity_id: id },
  });
  if (!brief) {
    return NextResponse.json(
      { error: "not_found", message: "Brief not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ data: brief });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();

    if (body.generate === true) {
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

      const text = await callClaudeWithProfile({
        systemSuffix:
          "You write role-specific positioning briefs. Return ONLY valid JSON as specified.",
        user: buildRoleBriefPrompt({
          companyName: opportunity.company.name,
          roleTitle: opportunity.role_title,
          jdText: opportunity.jd_text,
          level: opportunity.level,
        }),
        maxTokens: 8192,
      });

      const ai = parseWithSchema(text, RoleBriefSchema);
      const proof = ai.proof_points?.length
        ? ai.proof_points
        : ["Proof point 1", "Proof point 2"];

      const draftBlob = [
        ai.fit_summary,
        ai.contribution_narrative,
        ai.differentiated_value,
      ].join("\n\n");

      const brief = await prisma.rolePositioningBrief.upsert({
        where: { opportunity_id: id },
        update: {
          draft: draftBlob,
          fit_summary: ai.fit_summary,
          contribution_narrative: ai.contribution_narrative,
          differentiated_value: ai.differentiated_value,
          proof_points: JSON.stringify(proof),
        },
        create: {
          opportunity_id: id,
          draft: draftBlob,
          fit_summary: ai.fit_summary,
          contribution_narrative: ai.contribution_narrative,
          differentiated_value: ai.differentiated_value,
          proof_points: JSON.stringify(proof),
        },
      });

      let narrative_check = null;
      try {
        narrative_check = await runNarrativeCheck(draftBlob);
      } catch {
        /* optional */
      }

      return NextResponse.json({ data: brief, narrative_check });
    }

    const brief = await prisma.rolePositioningBrief.upsert({
      where: { opportunity_id: id },
      update: {},
      create: { opportunity_id: id, proof_points: "[]" },
    });
    return NextResponse.json({ data: brief }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "ai_failure",
        message: err instanceof Error ? err.message : "Failed to create brief",
        retryable: true,
      },
      { status: 502 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { completed, proof_points, ...rest } = body;

    const brief = await prisma.rolePositioningBrief.upsert({
      where: { opportunity_id: id },
      update: {
        ...rest,
        proof_points: proof_points ? JSON.stringify(proof_points) : undefined,
        completed_at:
          completed === true
            ? new Date()
            : completed === false
              ? null
              : undefined,
      },
      create: {
        opportunity_id: id,
        proof_points: proof_points ? JSON.stringify(proof_points) : "[]",
        ...rest,
      },
    });
    return NextResponse.json({ data: brief });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to update brief" },
      { status: 500 },
    );
  }
}
