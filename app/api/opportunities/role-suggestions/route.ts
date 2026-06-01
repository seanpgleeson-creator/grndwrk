import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import { buildRoleSuggestionsPrompt, RoleSuggestionsSchema } from "@/lib/ai/prompts/roleSuggestions";
import { parseJsonField } from "@/lib/utils";

export const maxDuration = 60;

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ai_not_configured", message: "Set ANTHROPIC_API_KEY", retryable: false },
      { status: 503 },
    );
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: "singleton" },
    select: {
      positioning_statement: true,
      narrative_pillars: true,
      target_roles: true,
      target_stages: true,
      geography: true,
      resume_raw: true,
      preferred_geographies: true,
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "no_profile", message: "Complete your profile first" },
      { status: 400 },
    );
  }

  // Gate: require at minimum positioning statement OR resume
  const hasPositioning = profile.positioning_statement?.trim();
  const hasResume = profile.resume_raw?.trim();
  if (!hasPositioning && !hasResume) {
    return NextResponse.json(
      {
        error: "profile_incomplete",
        message: "Add your positioning statement or resume before using role suggestions",
        retryable: false,
      },
      { status: 400 },
    );
  }

  const targetRoles = parseJsonField<string[]>(profile.target_roles, []);
  const targetStages = parseJsonField<string[]>(profile.target_stages, []);
  const narrativePillars = parseJsonField<string[]>(profile.narrative_pillars, []);
  const preferredGeographies = parseJsonField<string[]>(profile.preferred_geographies, []);

  try {
    const prompt = buildRoleSuggestionsPrompt({
      targetRoles,
      targetStages,
      geography: profile.geography ?? "",
      positioningStatement: profile.positioning_statement ?? "",
      narrativePillars,
      preferredGeographies,
    });

    const raw = await callClaudeWithProfile({
      systemSuffix:
        "You suggest specific, concrete job opportunities based on the candidate's profile. Return ONLY valid JSON.",
      user: prompt,
      maxTokens: 2048,
    });

    const result = parseWithSchema(raw, RoleSuggestionsSchema);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("role suggestions error:", err);
    return NextResponse.json(
      { error: "ai_failure", message: "Failed to generate suggestions", retryable: true },
      { status: 502 },
    );
  }
}
