import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, stage, scope, strategic, narrative } = body;
    const sum = (domain ?? 0) + (stage ?? 0) + (scope ?? 0) + (strategic ?? 0) + (narrative ?? 0);

    if (sum !== 100) {
      return NextResponse.json(
        {
          error: "invalid_cmf_weights",
          message: `CMF weights must sum to 100, got ${sum}`,
        },
        { status: 422 },
      );
    }

    const profile = await prisma.userProfile.upsert({
      where: { id: "singleton" },
      update: { cmf_weights: JSON.stringify({ domain, stage, scope, strategic, narrative }) },
      create: {
        id: "singleton",
        narrative_pillars: "[]",
        target_roles: "[]",
        target_stages: "[]",
        cmf_weights: JSON.stringify({ domain, stage, scope, strategic, narrative }),
      },
    });

    return NextResponse.json({ data: profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to update CMF weights" },
      { status: 500 },
    );
  }
}
