import { NextResponse } from "next/server";

// Phase 2: AI earnings analysis
export async function POST() {
  return NextResponse.json(
    { error: "not_implemented", message: "AI earnings analysis available in Phase 2" },
    { status: 501 },
  );
}
