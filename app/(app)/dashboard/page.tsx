import { prisma } from "@/lib/prisma";
import type {
  BriefCompletedRow,
  DashboardCompanyRow,
  DashboardOpportunityRow,
} from "@/lib/prisma-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
  const [opportunities, companies, briefs] = await Promise.all([
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
  ]);

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

  const actions: ActionItem[] = [];

  for (const company of companies.filter((c: DashboardCompanyRow) => !c.brief).slice(0, 5)) {
    actions.push({
      type: "company_no_brief",
      label: `Start positioning brief for ${company.name}`,
      company_name: company.name,
      action: "Start brief",
      href: `/companies/${company.id}/brief`,
      urgency: company.tier === 1 ? "high" : "medium",
    });
  }

  for (const opp of openOpps.filter((o: DashboardOpportunityRow) => o.cmf_score == null).slice(0, 3)) {
    actions.push({
      type: "unscored_opportunity",
      label: `Score CMF for ${opp.role_title} at ${opp.company.name}`,
      company_name: opp.company.name,
      action: "Score now",
      href: `/opportunities/${opp.id}`,
      urgency: "medium",
    });
  }

  for (const opp of openOpps
    .filter((o: DashboardOpportunityRow) => (o.cmf_score ?? 0) >= 8 && o.status === "Watching")
    .slice(0, 2)) {
    actions.push({
      type: "high_cmf_not_applied",
      label: `High CMF match: ${opp.role_title} at ${opp.company.name}`,
      company_name: opp.company.name,
      action: "View",
      href: `/opportunities/${opp.id}`,
      urgency: "high",
    });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  for (const opp of openOpps
    .filter((o: DashboardOpportunityRow) => o.status === "Preparing" && o.updated_at < sevenDaysAgo)
    .slice(0, 2)) {
    actions.push({
      type: "stale_preparing",
      label: `${opp.role_title} at ${opp.company.name} stale in Preparing`,
      company_name: opp.company.name,
      action: "Review",
      href: `/opportunities/${opp.id}`,
      urgency: "low",
    });
  }

  const urgencyOrder = { high: 0, medium: 1, low: 2 };
  const priorityQueue = actions
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
    .slice(0, 5);

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
    { label: "Monitoring", count: funnel.monitoring, href: "/opportunities?status=active", color: "bg-slate-500" },
    { label: "Positioned", count: funnel.positioned, href: "/opportunities", color: "bg-indigo-500" },
    { label: "Applied / Outreach", count: funnel.appliedOutreach, href: "/opportunities?status=Applied", color: "bg-blue-500" },
    { label: "In Process", count: funnel.inProcess, href: "/opportunities?status=InProcess", color: "bg-amber-500" },
    { label: "Outcome", count: funnel.outcome, href: "/opportunities?status=Closed", color: "bg-green-500" },
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
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Priority Actions</h2>
            {priority_queue.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                No actions needed right now. Add companies and opportunities to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {priority_queue.map((item, i) => (
                  <Link key={i} href={item.href}>
                    <div className="flex items-center gap-3 p-3 rounded-md hover:bg-[var(--surface-raised)] transition-colors group">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          item.urgency === "high"
                            ? "bg-red-400"
                            : item.urgency === "medium"
                              ? "bg-amber-400"
                              : "bg-slate-400",
                        )}
                      />
                      <p className="flex-1 text-sm text-[var(--foreground)]">{item.label}</p>
                      <span className="text-xs text-[var(--accent)] group-hover:underline shrink-0">
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
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-4">Search Funnel</h2>
            <div className="space-y-2">
              {funnelStages.map((stage) => (
                <Link key={stage.label} href={stage.href}>
                  <div className="flex items-center gap-3 group">
                    <span className="text-sm text-[var(--muted)] w-36 shrink-0">{stage.label}</span>
                    <div className="flex-1 h-6 bg-[var(--surface-raised)] rounded overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded transition-all",
                          stage.color,
                          stage.count === 0 ? "opacity-20" : "opacity-80",
                        )}
                        style={{
                          width: stage.count > 0
                            ? `${Math.max(8, Math.min(100, (stage.count / Math.max(funnel.monitoring, 1)) * 100))}%`
                            : "4%",
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[var(--foreground)] w-6 text-right">
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
          <h2 className="text-base font-semibold text-[var(--foreground)]">Search Health</h2>
          {metricCards.map((m: { label: string; value: string | number }) => (
            <Card key={m.label} className="p-4">
              <p className="text-xs text-[var(--muted)] mb-1">{m.label}</p>
              <p className="text-2xl font-semibold text-[var(--foreground)]">{m.value}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
