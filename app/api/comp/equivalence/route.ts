import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasStaticCity, getColIndex } from "@/lib/comp/costOfLiving";
import { fetchEquivalenceRatio } from "@/lib/comp/apiverve";

export const maxDuration = 15;

// Cache entries are considered fresh for 90 days
const CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * GET /api/comp/equivalence?from=<city>&to=<city>
 *
 * Returns the CoL ratio (to / from) and its data source.
 * Priority: DB cache → static (if both cities known) → APIVerve → default static fallback.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  if (!from || !to) {
    return NextResponse.json(
      { error: "validation_error", message: "from and to query params are required" },
      { status: 422 },
    );
  }

  // 1. Check DB cache
  const cached = await prisma.colRatioCache.findUnique({
    where: { from_city_to_city: { from_city: from, to_city: to } },
  });

  if (cached) {
    const age = Date.now() - cached.fetched_at.getTime();
    if (age < CACHE_TTL_MS) {
      return NextResponse.json({
        ratio: cached.ratio,
        source: cached.source,
        regionFrom: cached.region_from,
        regionTo: cached.region_to,
        cached: true,
      });
    }
  }

  // 2. If both cities are in the static table, prefer the precise static ratio
  if (hasStaticCity(from) && hasStaticCity(to)) {
    const ratio = getColIndex(to) / getColIndex(from);
    await cacheRatio(from, to, ratio, "static", null, null);
    return NextResponse.json({ ratio, source: "static", cached: false });
  }

  // 3. Try APIVerve for cities outside the static table
  const result = await fetchEquivalenceRatio(from, to);
  if (result) {
    await cacheRatio(from, to, result.ratio, "apiverve", result.regionFrom ?? null, result.regionTo ?? null);
    return NextResponse.json({
      ratio: result.ratio,
      source: result.source,
      regionFrom: result.regionFrom,
      regionTo: result.regionTo,
      cached: false,
    });
  }

  // 4. Fallback: static index (uses DEFAULT_INDEX for unknown cities)
  const ratio = getColIndex(to) / getColIndex(from);
  await cacheRatio(from, to, ratio, "default", null, null);
  return NextResponse.json({ ratio, source: "default", cached: false });
}

async function cacheRatio(
  from: string,
  to: string,
  ratio: number,
  source: string,
  regionFrom: string | null,
  regionTo: string | null,
) {
  try {
    await prisma.colRatioCache.upsert({
      where: { from_city_to_city: { from_city: from, to_city: to } },
      update: { ratio, source, region_from: regionFrom, region_to: regionTo, fetched_at: new Date() },
      create: { from_city: from, to_city: to, ratio, source, region_from: regionFrom, region_to: regionTo },
    });
  } catch {
    // Non-fatal: cache write failure should not break the response
  }
}
