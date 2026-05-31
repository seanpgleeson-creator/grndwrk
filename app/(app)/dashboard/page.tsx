import { prisma } from "@/lib/prisma";
import type {
  BriefCompletedRow,
  DashboardCompanyRow,
  DashboardOpportunityRow,
  DashboardContactRow,
  DashboardOutreachRow,
  DashboardSignalRow,
} from "@/lib/prisma-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActionItem {
  type: string;
  label: string;
  company_name?: string;
  action: string;
  href: string;
  urgency: "high" | "medium" | "low";
}

async function getDashboardData() {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [opportunities, companies, briefs, highTriggerSignals, contacts, recentOutreach] =
    await Promise.all([
      prisma.opportunity.findMany({
        include: {
          brief: { select: { completed_at: true } },
          company: { select: { id: true, name: true, tier: true } },
        },
      }),
      prisma.company.findMany({
        include: { brief: { select: { completed_at: true } } },
      }),
      prisma.companyPositioningBrief.findMany({ select: { completed_at: true } }),
      prisma.earningsSignal.findMany({
        where: { outreach_trigger_score: { gte: 4 } },
        orderBy: { date: "desc" },
        include: { company: { select: { id: true, name: true } } },
      }),
      prisma.contact.findMany({
        include: { company: { select: { id: true, name: true, tier: true } } },
      }),
      prisma.outreachRecord.findMany({
        where: { date: { gte: fourteenDaysAgo } },
        select: {
          contact_id: true,
          opportunity_id: true,
          date: true,
          contact: { select: { company_id: true } },
        },
      }),
    ]);

  // Build lookup sets from recent outreach
  const recentOutreachByCompany = new Set<string>();
  const recentOutreachByOpp14 = new Set<string>();
  const recentOutreachByOpp7 = new Set<string>();

  for (const record of recentOutreach as DashboardOutreachRow[]) {
    if (record.contact.company_id) {
      recentOutreachByCompany.add(record.contact.company_id);
    }
    if (record.opportunity_id) {
      recentOutreachByOpp14.add(record.opportunity_id);
      if (new Date(record.date) >= sevenDaysAgo) {
        recentOutreachByOpp7.add(record.opportunity_id);
      }
    }
  }

  // Funnel counts
  const monitoring = opportunities.filter((o: DashboardOpportunityRow) =>
    ["Watching", "Preparing"].includes(o.status),
  ).length;

  const positioned = opportunities.filter(
    (o: DashboardOpportunityRow) =>
      ["Watching", "Preparing"].includes(o.status) &&
      o.brief?.completed_at != null &&
      !o.outreach_sent,
  ).length;

  const appliedOutreach = opportunities.filter(
    (o: DashboardOpportunityRow) => o.status === "Applied" || o.outreach_sent,
  ).length;

  const inProcess = opportunities.filter((o: DashboardOpportunityRow) => o.status === "InProcess").length;
  const outcome = opportunities.filter((o: DashboardOpportunityRow) => o.status === "Closed").length;

  const openOpps = opportunities.filter((o: DashboardOpportunityRow) => o.status !== "Closed");
  const scoredOpps = openOpps.filter((o: DashboardOpportunityRow) => o.cmf_score != null);
  const avgCmf =
    scoredOpps.length > 0
      ? Math.round(
          (scoredOpps.reduce(
            (sum: number, o: DashboardOpportunityRow) => sum + (o.cmf_score ?? 0),
            0,
          ) /
            scoredOpps.length) *
            10,
        ) / 10
      : null;

  const brifsComplete = briefs.filter((b: BriefCompletedRow) => b.completed_at != null).length;

  // Priority Action Queue — 6 urgency tiers (backend.md §7)
  const actions: (ActionItem & { tier: number })[] = [];

  // Tier 1: EarningsSignal with trigger score >= 4, no outreach to that company in 14 days
  for (const signal of (highTriggerSignals as DashboardSignalRow[]).slice(0, 3)) {
    if (!recentOutreachByCompany.has(signal.company_id)) {
      actions.push({
        type: "earnings_trigger",
        label: `${signal.company.name} earnings signal (score ${signal.outreach_trigger_score}/5) — review and draft outreach`,
        company_name: signal.company.name,
        action: "Review signal",
        href: `/companies/${signal.company_id}`,
        urgency: "high",
        tier: 1,
      });
    }
  }

  // Tier 2: Opportunity InProcess with no outreach record in 7 days
  for (const opp of openOpps
    .filter(
      (o: DashboardOpportunityRow) =>
        o.status === "InProcess" && !recentOutreachByOpp7.has(o.id),
    )
    .slice(0, 2)) {
    actions.push({
      type: "inprocess_no_followup",
      label: `${opp.role_title} at ${opp.company.name} is In Process — no follow-up in 7 days`,
      company_name: opp.company.name,
      action: "Log outreach",
      href: `/opportunities/${opp.id}`,
      urgency: "high",
      tier: 2,
    });
  }

  // Tier 3: Contact at Tier 1 company, last_contact > 30 days or never
  for (const contact of (contacts as DashboardContactRow[])
    .filter(
      (c) =>
        c.company?.tier === 1 &&
        (!c.last_contact || new Date(c.last_contact) < thirtyDaysAgo),
    )
    .slice(0, 2)) {
    actions.push({
      type: "cold_tier1_contact",
      label: `${contact.name} at ${contact.company?.name ?? "Tier 1 company"} — no contact in 30+ days`,
      company_name: contact.company?.name,
      action: "Reach out",
      href: `/outreach`,
      urgency: "high",
      tier: 3,
    });
  }

  // Tier 4: Unscored open opportunities
  for (const opp of openOpps
    .filter((o: DashboardOpportunityRow) => o.cmf_score == null)
    .slice(0, 3)) {
    actions.push({
      type: "unscored_opportunity",
      label: `Score CMF for ${opp.role_title} at ${opp.company.name}`,
      company_name: opp.company.name,
      action: "Score now",
      href: `/opportunities/${opp.id}`,
      urgency: "medium",
      tier: 4,
    });
  }

  // Tier 5: Tier 1 company with incomplete (or missing) positioning brief
  for (const company of (companies as DashboardCompanyRow[])
    .filter((c) => c.tier === 1 && !c.brief?.completed_at)
    .slice(0, 2)) {
    actions.push({
      type: "tier1_brief_incomplete",
      label: `Complete positioning brief for ${company.name} (Tier 1)`,
      company_name: company.name,
      action: "Write brief",
      href: `/companies/${company.id}`,
      urgency: "medium",
      tier: 5,
    });
  }

  // Tier 6: Opportunity in Applied with no follow-up outreach in 14 days
  for (const opp of openOpps
    .filter(
      (o: DashboardOpportunityRow) =>
        o.status === "Applied" && !recentOutreachByOpp14.has(o.id),
    )
    .slice(0, 2)) {
    actions.push({
      type: "applied_no_followup",
      label: `${opp.role_title} at ${opp.company.name} — Applied with no follow-up in 14 days`,
      company_name: opp.company.name,
      action: "Follow up",
      href: `/opportunities/${opp.id}`,
      urgency: "low",
      tier: 6,
    });
  }

  const priorityQueue: ActionItem[] = actions
    .sort((a, b) => a.tier - b.tier)
    .slice(0, 5)
    .map(({ tier: _tier, ...rest }) => rest);

  return {
    funnel: { monitoring, positioned, appliedOutreach, inProcess, outcome },
    metrics: {
      companies_monitored: companies.length,
      tier1_targets: companies.filter((c: DashboardCompanyRow) => c.tier === 1).length,
      open_opportunities: openOpps.length,
      avg_cmf_score: avgCmf,
      briefs_complete: brifsComplete,
      total_briefs: briefs.length,
    },
    priority_queue: priorityQueue,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { funnel, metrics, priority_queue } = data;

  const funnelStages = [
    { label: "Monitoring", count: funnel.monitoring, href: "/opportunities?status=active", color: "bg-[var(--ink-4)]" },
    { label: "Positioned", count: funnel.positioned, href: "/opportunities", color: "bg-[var(--ink)]" },
    { label: "Applied / Outreach", count: funnel.appliedOutreach, href: "/opportunities?status=Applied", color: "bg-[var(--ink-2)]" },
    { label: "In Process", count: funnel.inProcess, href: "/opportunities?status=InProcess", color: "bg-[var(--ink-3)]" },
    { label: "Outcome", count: funnel.outcome, href: "/opportunities?status=Closed", color: "bg-[var(--ink-5)]" },
  ];

  const metricCards = [
    { label: "Companies monitored", value: metrics.companies_monitored },
    { label: "Tier 1 targets", value: metrics.tier1_targets },
    { label: "Open opportunities", value: metrics.open_opportunities },
    { label: "Avg CMF score", value: metrics.avg_cmf_score ?? "—" },
    { label: "Briefs complete", value: `${metrics.briefs_complete} / ${metrics.total_briefs}` },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your job search at a glance."
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Priority Queue + Funnel */}
        <div className="col-span-2 space-y-6">
          {/* Priority Action Queue */}
          <Card className="p-5">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-3)] mb-4 [font-family:var(--font-mono)]">
              Priority Actions
            </h2>
            {priority_queue.length === 0 ? (
              <p className="text-sm text-[var(--ink-3)]">
                No actions needed right now. Add companies and opportunities to get started.
              </p>
            ) : (
              <div className="space-y-1">
                {priority_queue.map((item, i) => (
                  <Link key={i} href={item.href}>
                    <div className="flex items-center gap-3 p-3 rounded-md hover:bg-[var(--bg-sub)] transition-colors group">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          item.urgency === "high"
                            ? "bg-[var(--ink)]"
                            : item.urgency === "medium"
                              ? "bg-[var(--ink-3)]"
                              : "bg-[var(--ink-5)]",
                        )}
                      />
                      <p className="flex-1 text-sm text-[var(--ink)]">{item.label}</p>
                      <span className="text-xs text-[var(--ink-3)] group-hover:text-[var(--ink)] transition-colors shrink-0">
                        {item.action} →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Funnel View */}
          <Card className="p-5">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-3)] mb-4 [font-family:var(--font-mono)]">
              Search Funnel
            </h2>
            <div className="space-y-2">
              {funnelStages.map((stage) => (
                <Link key={stage.label} href={stage.href}>
                  <div className="flex items-center gap-3 group">
                    <span className="text-sm text-[var(--ink-3)] w-36 shrink-0">{stage.label}</span>
                    <div className="flex-1 h-5 bg-[var(--bg-mute)] rounded overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded transition-[width] duration-300",
                          stage.color,
                          stage.count === 0 ? "opacity-20" : "opacity-90",
                        )}
                        style={{
                          width: stage.count > 0
                            ? `${Math.max(8, Math.min(100, (stage.count / Math.max(funnel.monitoring, 1)) * 100))}%`
                            : "4%",
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[var(--ink)] w-6 text-right tabular-nums">
                      {stage.count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Metrics */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--ink-3)] [font-family:var(--font-mono)]">
            Search Health
          </h2>
          {metricCards.map((m: { label: string; value: string | number }) => (
            <Card key={m.label} className="p-4">
              <p className="text-xs text-[var(--ink-3)] mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[var(--ink)] tabular-nums">{m.value}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
