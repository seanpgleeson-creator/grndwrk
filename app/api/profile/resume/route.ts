import { NextResponse } from "next/server";

// Phase 2: AI resume parsing
export async function POST() {
  return NextResponse.json(
    { error: "not_implemented", message: "AI resume parsing available in Phase 2" },
    { status: 501 },
  );
}
