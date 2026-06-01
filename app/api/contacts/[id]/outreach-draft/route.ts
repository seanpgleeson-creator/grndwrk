import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeWithProfile } from "@/lib/ai/claude";
import { parseWithSchema } from "@/lib/ai/extractJson";
import {
  buildOutreachDraftPrompt,
  OutreachDraftSchema,
} from "@/lib/ai/prompts/outreachDraft";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { company: { select: { name: true } } },
  });

  if (!contact) {
    return NextResponse.json(
      { error: "not_found", message: "Contact not found" },
      { status: 404 },
    );
  }

  const body = (await req.json()) as {
    channel?: string;
    opportunity_id?: string;
    context_note?: string;
    existing_draft?: string;
  };

  const channel = body.channel ?? "linkedin";

  // Optionally load the linked opportunity for role context
  let opportunityTitle: string | null = null;
  if (body.opportunity_id) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: body.opportunity_id },
      select: { role_title: true },
    });
    opportunityTitle = opp?.role_title ?? null;
  }

  // Pull last 3 outreach summaries for context-aware follow-ups
  const priorRecords = await prisma.outreachRecord.findMany({
    where: { contact_id: id, message_summary: { not: null } },
    orderBy: { date: "desc" },
    take: 3,
    select: { message_summary: true },
  });
  const priorSummaries = priorRecords
    .map((r) => r.message_summary)
    .filter((s): s is string => s !== null);

  try {
    const userPrompt = buildOutreachDraftPrompt({
      contactName: contact.name,
      contactTitle: contact.title,
      companyName: contact.company?.name ?? null,
      connectionDegree: contact.connection_degree,
      channel,
      opportunityTitle,
      contextNote: body.context_note ?? null,
      priorOutreachSummaries: priorSummaries,
      existingDraft: body.existing_draft ?? null,
    });

    const raw = await callClaudeWithProfile({
      systemSuffix:
        "You draft professional outreach messages for a job seeker. Use their positioning statement and narrative pillars (in system context) to write specific, credible messages. Output only valid JSON.",
      user: userPrompt,
      maxTokens: 1024,
    });

    const result = parseWithSchema(raw, OutreachDraftSchema);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("outreachDraft AI error:", err);
    return NextResponse.json(
      { error: "ai_error", message: "Failed to generate draft", retryable: true },
      { status: 502 },
    );
  }
}
