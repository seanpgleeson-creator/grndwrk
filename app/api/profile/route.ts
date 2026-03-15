import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const profile = await prisma.userProfile.findUnique({
    where: { id: "singleton" },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "not_found", message: "Profile not yet created", onboarding_required: true },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: profile });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = await prisma.userProfile.upsert({
      where: { id: "singleton" },
      update: {
        ...body,
        narrative_pillars: body.narrative_pillars
          ? JSON.stringify(body.narrative_pillars)
          : undefined,
        target_roles: body.target_roles
          ? JSON.stringify(body.target_roles)
          : undefined,
        target_stages: body.target_stages
          ? JSON.stringify(body.target_stages)
          : undefined,
        cmf_weights: body.cmf_weights
          ? JSON.stringify(body.cmf_weights)
          : undefined,
        comp_target: body.comp_target
          ? JSON.stringify(body.comp_target)
          : undefined,
      },
      create: {
        id: "singleton",
        narrative_pillars: body.narrative_pillars
          ? JSON.stringify(body.narrative_pillars)
          : "[]",
        target_roles: body.target_roles ? JSON.stringify(body.target_roles) : "[]",
        target_stages: body.target_stages
          ? JSON.stringify(body.target_stages)
          : "[]",
        cmf_weights: body.cmf_weights
          ? JSON.stringify(body.cmf_weights)
          : JSON.stringify({ domain: 30, stage: 20, scope: 20, strategic: 20, narrative: 10 }),
        positioning_statement: body.positioning_statement,
        geography: body.geography,
        remote_preference: body.remote_preference,
        resume_raw: body.resume_raw,
        comp_target: body.comp_target ? JSON.stringify(body.comp_target) : undefined,
      },
    });
    return NextResponse.json({ data: profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
