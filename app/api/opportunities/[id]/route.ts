import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      company: {
        include: {
          brief: { select: { completed_at: true } },
        },
      },
      brief: true,
    },
  });

  if (!opportunity) {
    return NextResponse.json(
      { error: "not_found", message: "Opportunity not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: opportunity });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { key_requirements, cmf_breakdown, ...rest } = body;

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        ...rest,
        key_requirements: key_requirements
          ? JSON.stringify(key_requirements)
          : undefined,
        cmf_breakdown:
          cmf_breakdown !== undefined
            ? cmf_breakdown === null
              ? null
              : JSON.stringify(cmf_breakdown)
            : undefined,
      },
    });
    return NextResponse.json({ data: opportunity });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to update opportunity" },
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
    await prisma.opportunity.delete({ where: { id } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to delete opportunity" },
      { status: 500 },
    );
  }
}
