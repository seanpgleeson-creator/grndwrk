import { NextResponse } from "next/server";

// Phase 2: Levels.fyi markdown fetch
export async function POST() {
  return NextResponse.json(
    { error: "not_implemented", message: "Levels.fyi fetch available in Phase 2" },
    { status: 501 },
  );
}
