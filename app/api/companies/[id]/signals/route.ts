import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const signals = await prisma.earningsSignal.findMany({
    where: { company_id: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json({ data: signals });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await req.json();
    if (!body.transcript) {
      return NextResponse.json(
        { error: "validation_error", message: "Transcript is required" },
        { status: 422 },
      );
    }
    const signal = await prisma.earningsSignal.create({
      data: {
        company_id: id,
        transcript: body.transcript,
        source_url: body.source_url,
        date: body.date ? new Date(body.date) : new Date(),
      },
    });
    return NextResponse.json({ data: signal }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to create signal" },
      { status: 500 },
    );
  }
}
