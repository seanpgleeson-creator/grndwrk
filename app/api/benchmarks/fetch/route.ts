import { NextResponse } from "next/server";

export const maxDuration = 60;

/** Phase 2 placeholder: Levels.fyi does not expose a stable public API for markdown. */
export async function POST() {
  return NextResponse.json({
    data: null,
    fallback: true,
    message: "Automated Levels.fyi fetch is not implemented; use manual benchmarks or iframe embed.",
  });
}
