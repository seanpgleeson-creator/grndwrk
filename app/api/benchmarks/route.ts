import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("company_id");
  const roleFamily = searchParams.get("role_family");
  const level = searchParams.get("level");

  if (!companyId || !roleFamily) {
    return NextResponse.json(
      { error: "validation_error", message: "company_id and role_family are required" },
      { status: 422 },
    );
  }

  const benchmark = await prisma.compBenchmark.findFirst({
    where: {
      company_id: companyId,
      role_family: roleFamily,
      level: level ?? undefined,
    },
  });

  if (!benchmark) {
    return NextResponse.json(
      { error: "not_found", message: "Benchmark not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: benchmark });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.company_id || !body.role_family) {
      return NextResponse.json(
        { error: "validation_error", message: "company_id and role_family are required" },
        { status: 422 },
      );
    }

    const benchmark = await prisma.compBenchmark.upsert({
      where: {
        company_id_role_family_level: {
          company_id: body.company_id,
          role_family: body.role_family,
          level: body.level ?? null,
        },
      },
      update: {
        base_low: body.base_low,
        base_high: body.base_high,
        total_low: body.total_low,
        total_high: body.total_high,
        source: body.source ?? "manual",
        fetched_at: new Date(),
      },
      create: {
        company_id: body.company_id,
        role_family: body.role_family,
        level: body.level,
        base_low: body.base_low,
        base_high: body.base_high,
        total_low: body.total_low,
        total_high: body.total_high,
        source: body.source ?? "manual",
      },
    });
    return NextResponse.json({ data: benchmark }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "server_error", message: "Failed to save benchmark" },
      { status: 500 },
    );
  }
}
