import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; recordId: string }> },
) {
  const { recordId } = await params;
  try {
    const body = await req.json();
    const record = await prisma.outreachRecord.update({
      where: { id: recordId },
      data: { response: body.response },
    });
    return NextResponse.json({ data: record });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to update outreach record" },
      { status: 500 },
    );
  }
}
