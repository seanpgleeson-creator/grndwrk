import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id");

  const contacts = await prisma.contact.findMany({
    where: companyId ? { company_id: companyId } : undefined,
    orderBy: { created_at: "desc" },
    include: { company: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ data: contacts });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json(
        { error: "validation_error", message: "Name is required" },
        { status: 422 },
      );
    }
    const contact = await prisma.contact.create({
      data: {
        name: body.name,
        title: body.title,
        company_id: body.company_id,
        linkedin_url: body.linkedin_url,
        connection_degree: body.connection_degree ?? "cold",
        warmth: body.warmth ?? "Cold",
        source: body.source,
        notes: body.notes,
      },
    });
    return NextResponse.json({ data: contact }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to create contact" },
      { status: 500 },
    );
  }
}
