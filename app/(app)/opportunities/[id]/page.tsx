import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { normalizeCmfBreakdownForSliders, parseJsonField } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { CmfScore } from "@/components/ui/CmfScore";
import { OpportunityDetailTabs } from "@/components/opportunities/OpportunityDetailTabs";
import Link from "next/link";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      company: {
        include: {
          brief: { select: { completed_at: true } },
        },
      },
      brief: true,
    },
  });

  if (!opportunity) notFound();

  const profile = await prisma.userProfile.findUnique({
    where: { id: "singleton" },
    select: { cmf_weights: true, comp_target: true },
  });

  const cmfWeights = parseJsonField(profile?.cmf_weights, {
    domain: 30, stage: 20, scope: 20, strategic: 20, narrative: 10,
  });

  const compTarget = parseJsonField<{ minimum?: number }>(profile?.comp_target, {});
  const compSnapshot = parseJsonField<{
    base_low?: number; base_high?: number; total_low?: number; total_high?: number;
    stale?: boolean; meets_target?: boolean | null;
  }>(opportunity.comp_snapshot, {});

  const briefData = opportunity.brief
    ? {
        ...opportunity.brief,
        proof_points: parseJsonField<string[]>(opportunity.brief.proof_points, []),
      }
    : null;

  const rawCmf = parseJsonField<Record<string, unknown> | null>(
    opportunity.cmf_breakdown,
    null,
  );
  const cmfBreakdown = normalizeCmfBreakdownForSliders(rawCmf);
  const cmfAi =
    rawCmf && typeof rawCmf === "object" && "ai" in rawCmf
      ? (rawCmf as { ai: unknown }).ai
      : null;

  const materials = parseJsonField<{
    cover_letter?: { draft?: string; edited?: string };
  }>(opportunity.materials, {});

  const keyRequirements = parseJsonField<string[]>(opportunity.key_requirements, []);

  return (
    <div>
      <div className="mb-2">
        <Link href="/opportunities" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
          ← Opportunities
        </Link>
      </div>
      <PageHeader
        title={opportunity.role_title}
        description={opportunity.company.name + (opportunity.level ? ` · ${opportunity.level}` : "")}
        actions={
          <div className="flex items-center gap-2">
            <CmfScore score={opportunity.cmf_score} size="md" />
            <Badge variant={statusToBadgeVariant(opportunity.status)}>
              {opportunity.status === "InProcess" ? "In Process" : opportunity.status}
            </Badge>
          </div>
        }
      />
      <OpportunityDetailTabs
        opportunity={{
          id: opportunity.id,
          role_title: opportunity.role_title,
          level: opportunity.level,
          team: opportunity.team,
          jd_text: opportunity.jd_text,
          key_requirements: keyRequirements,
          status: opportunity.status,
          outreach_sent: opportunity.outreach_sent,
          cmf_score: opportunity.cmf_score,
          cmf_breakdown: cmfBreakdown,
          cmf_ai: cmfAi,
          materials,
          comp_snapshot: compSnapshot,
          company: {
            id: opportunity.company.id,
            name: opportunity.company.name,
          },
        }}
        brief={briefData}
        cmfWeights={cmfWeights}
        compTarget={compTarget}
      />
    </div>
  );
}
