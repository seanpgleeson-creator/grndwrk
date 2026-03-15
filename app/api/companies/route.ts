import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function deriveWarmth(contacts: { warmth: string }[]): string | null {
  if (contacts.length === 0) return null;
  if (contacts.some((c) => c.warmth === "Hot")) return "Hot";
  if (contacts.some((c) => c.warmth === "Warm")) return "Warm";
  return "Cold";
}

export async function GET() {
  const companies = await prisma.company.findMany({
    orderBy: { created_at: "desc" },
    include: {
      brief: { select: { completed_at: true, draft: true, edited: true } },
      contacts: { select: { warmth: true } },
      _count: { select: { opportunities: true } },
    },
  });

  const data = companies.map((c) => ({
    ...c,
    warmth: deriveWarmth(c.contacts),
    brief_status: !c.brief
      ? "none"
      : c.brief.completed_at
        ? "complete"
        : c.brief.draft || c.brief.edited
          ? "in-progress"
          : "none",
    opportunity_count: c._count.opportunities,
  }));

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "validation_error", message: "Name is required", fields: { name: "Required" } },
        { status: 422 },
      );
    }
    const company = await prisma.company.create({
      data: {
        name: body.name,
        website: body.website,
        linkedin_url: body.linkedin_url,
        hq: body.hq,
        stage: body.stage,
        size: body.size,
        tier: body.tier ? Number(body.tier) : undefined,
        notes: body.notes,
      },
    });
    return NextResponse.json({ data: company }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to create company" },
      { status: 500 },
    );
  }
}
