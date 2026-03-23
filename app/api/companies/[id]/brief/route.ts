import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import { runNarrativeCheck } from "@/lib/ai/narrative";
import {
  buildCompanyBriefPrompt,
  CompanyBriefSchema,
} from "@/lib/ai/prompts/companyBrief";

export const maxDuration = 60;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const brief = await prisma.companyPositioningBrief.findUnique({
    where: { company_id: id },
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

      const company = await prisma.company.findUnique({ where: { id } });
      if (!company) {
        return NextResponse.json(
          { error: "not_found", message: "Company not found" },
          { status: 404 },
        );
      }

      const text = await callClaudeWithProfile({
        systemSuffix:
          "You write strategic positioning briefs for job seekers. Return ONLY valid JSON as specified.",
        user: buildCompanyBriefPrompt({
          companyName: company.name,
          website: company.website,
          hq: company.hq,
          stage: company.stage,
          notes: company.notes,
        }),
        maxTokens: 8192,
      });

      const ai = parseWithSchema(text, CompanyBriefSchema);
      const proof = ai.proof_points?.length
        ? ai.proof_points
        : ["Proof point 1", "Proof point 2"];

      const draftBlob = [
        ai.why_company,
        ai.why_now,
        ai.value_proposition,
        ai.the_ask,
      ].join("\n\n");

      const brief = await prisma.companyPositioningBrief.upsert({
        where: { company_id: id },
        update: {
          draft: draftBlob,
          why_company: ai.why_company,
          why_now: ai.why_now,
          value_proposition: ai.value_proposition,
          proof_points: JSON.stringify(proof),
          the_ask: ai.the_ask,
        },
        create: {
          company_id: id,
          draft: draftBlob,
          why_company: ai.why_company,
          why_now: ai.why_now,
          value_proposition: ai.value_proposition,
          proof_points: JSON.stringify(proof),
          the_ask: ai.the_ask,
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

    const brief = await prisma.companyPositioningBrief.upsert({
      where: { company_id: id },
      update: {},
      create: { company_id: id, proof_points: "[]" },
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

    const brief = await prisma.companyPositioningBrief.upsert({
      where: { company_id: id },
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
        company_id: id,
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
