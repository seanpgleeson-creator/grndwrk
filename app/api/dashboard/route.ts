import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [opportunities, companies, briefs] = await Promise.all([
    prisma.opportunity.findMany({
      include: {
        brief: { select: { completed_at: true } },
        company: { select: { id: true, name: true, tier: true } },
      },
    }),
    prisma.company.findMany({
      include: {
        brief: { select: { completed_at: true } },
      },
    }),
    prisma.companyPositioningBrief.findMany({
      select: { completed_at: true },
    }),
  ]);

  // Funnel counts
  const monitoring = opportunities.filter((o) =>
    ["Watching", "Preparing"].includes(o.status),
  ).length;

  const positioned = opportunities.filter(
    (o) =>
      ["Watching", "Preparing"].includes(o.status) &&
      o.brief?.completed_at != null &&
      !o.outreach_sent,
  ).length;

  const appliedOutreach = opportunities.filter(
    (o) => o.status === "Applied" || o.outreach_sent,
  ).length;

  const inProcess = opportunities.filter((o) => o.status === "InProcess").length;
  const outcome = opportunities.filter((o) => o.status === "Closed").length;

  // Health metrics
  const openOpps = opportunities.filter((o) => o.status !== "Closed");
  const scoredOpps = openOpps.filter((o) => o.cmf_score != null);
  const avgCmf =
    scoredOpps.length > 0
      ? scoredOpps.reduce((sum, o) => sum + (o.cmf_score ?? 0), 0) /
        scoredOpps.length
      : null;

  const brifsComplete = briefs.filter((b) => b.completed_at != null).length;

  // Rule-based priority action queue (Phase 1)
  const actions: {
    type: string;
    label: string;
    company_name?: string;
    action: string;
    href: string;
    urgency: "high" | "medium" | "low";
  }[] = [];

  // No brief started for a company
  for (const company of companies.slice(0, 10)) {
    if (!company.brief) {
      actions.push({
        type: "company_no_brief",
        label: `Start positioning brief for ${company.name}`,
        company_name: company.name,
        action: "Start brief",
        href: `/companies/${company.id}/brief`,
        urgency: company.tier === 1 ? "high" : "medium",
      });
    }
  }

  // Unscored open opportunities
  for (const opp of openOpps.filter((o) => o.cmf_score == null).slice(0, 5)) {
    actions.push({
      type: "unscored_opportunity",
      label: `Score CMF for ${opp.role_title} at ${opp.company.name}`,
      company_name: opp.company.name,
      action: "Score now",
      href: `/opportunities/${opp.id}`,
      urgency: "medium",
    });
  }

  // High CMF not applied
  for (const opp of openOpps
    .filter((o) => (o.cmf_score ?? 0) >= 8 && o.status === "Watching")
    .slice(0, 3)) {
    actions.push({
      type: "high_cmf_not_applied",
      label: `High CMF match: ${opp.role_title} at ${opp.company.name}`,
      company_name: opp.company.name,
      action: "View opportunity",
      href: `/opportunities/${opp.id}`,
      urgency: "high",
    });
  }

  // Stale Preparing (> 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  for (const opp of openOpps
    .filter((o) => o.status === "Preparing" && o.updated_at < sevenDaysAgo)
    .slice(0, 3)) {
    actions.push({
      type: "stale_preparing",
      label: `${opp.role_title} at ${opp.company.name} has been Preparing for 7+ days`,
      company_name: opp.company.name,
      action: "Review",
      href: `/opportunities/${opp.id}`,
      urgency: "low",
    });
  }

  // Sort by urgency and take top 5
  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  const priorityQueue = actions
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
    .slice(0, 5);

  return NextResponse.json({
    data: {
      funnel: { monitoring, positioned, appliedOutreach, inProcess, outcome },
      metrics: {
        companies_monitored: companies.length,
        tier1_targets: companies.filter((c) => c.tier === 1).length,
        open_opportunities: openOpps.length,
        avg_cmf_score: avgCmf ? Math.round(avgCmf * 10) / 10 : null,
        briefs_complete: brifsComplete,
        total_briefs: briefs.length,
      },
      priority_queue: priorityQueue,
    },
  });
}
