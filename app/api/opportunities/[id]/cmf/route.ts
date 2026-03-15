import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcCmfScore, parseJsonField, type CmfWeights } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();

    if (body.generate === true) {
      return NextResponse.json(
        { error: "not_implemented", message: "AI CMF scoring available in Phase 2" },
        { status: 501 },
      );
    }

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
      domain: 30, stage: 20, scope: 20, strategic: 20, narrative: 10,
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
      { error: "server_error", message: "Failed to save CMF score" },
      { status: 500 },
    );
  }
}
