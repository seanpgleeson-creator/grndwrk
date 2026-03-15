import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const records = await prisma.outreachRecord.findMany({
    where: { contact_id: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ data: records });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const record = await prisma.outreachRecord.create({
      data: {
        contact_id: id,
        opportunity_id: body.opportunity_id,
        date: body.date ? new Date(body.date) : new Date(),
        channel: body.channel ?? "other",
        message_summary: body.message_summary,
      },
    });
    await prisma.contact.update({
      where: { id },
      data: { last_contact: record.date },
    });
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to log outreach" },
      { status: 500 },
    );
  }
}
