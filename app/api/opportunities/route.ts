import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id");

  const opportunities = await prisma.opportunity.findMany({
    where: companyId ? { company_id: companyId } : undefined,
    orderBy: { created_at: "desc" },
    include: {
      company: { select: { id: true, name: true, tier: true } },
    },
  });

  return NextResponse.json({ data: opportunities });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.company_id || !body.role_title) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: "company_id and role_title are required",
          fields: {
            company_id: !body.company_id ? "Required" : undefined,
            role_title: !body.role_title ? "Required" : undefined,
          },
        },
        { status: 422 },
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        company_id: body.company_id,
        role_title: body.role_title,
        level: body.level,
        team: body.team,
        jd_text: body.jd_text,
        status: body.status ?? "Watching",
      },
      include: {
        company: { select: { id: true, name: true, tier: true } },
      },
    });
    return NextResponse.json({ data: opportunity }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to create opportunity" },
      { status: 500 },
    );
  }
}
