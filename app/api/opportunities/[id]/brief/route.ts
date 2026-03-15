import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json(
        { error: "not_implemented", message: "AI brief generation available in Phase 2" },
        { status: 501 },
      );
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
      { error: "server_error", message: "Failed to create brief" },
      { status: 500 },
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
