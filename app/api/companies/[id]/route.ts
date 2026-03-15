import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      brief: true,
      signals: { orderBy: { date: "desc" } },
      opportunities: {
        select: {
          id: true,
          role_title: true,
          status: true,
          cmf_score: true,
          outreach_sent: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
      },
      contacts: true,
      benchmarks: true,
    },
  });

  if (!company) {
    return NextResponse.json(
      { error: "not_found", message: "Company not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: company });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const company = await prisma.company.update({
      where: { id },
      data: {
        name: body.name,
        website: body.website,
        linkedin_url: body.linkedin_url,
        hq: body.hq,
        stage: body.stage,
        size: body.size,
        tier: body.tier !== undefined ? Number(body.tier) : undefined,
        notes: body.notes,
        role_alert_criteria: body.role_alert_criteria,
      },
    });
    return NextResponse.json({ data: company });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to update company" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to delete company" },
      { status: 500 },
    );
  }
}
