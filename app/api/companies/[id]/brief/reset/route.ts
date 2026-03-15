import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const brief = await prisma.companyPositioningBrief.update({
      where: { company_id: id },
      data: { edited: null },
    });
    return NextResponse.json({ data: brief });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to reset brief" },
      { status: 500 },
    );
  }
}
