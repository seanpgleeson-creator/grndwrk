import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge, tierToBadgeVariant } from "@/components/ui/Badge";
import { CompanyDetailTabs } from "@/components/companies/CompanyDetailTabs";
import Link from "next/link";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      brief: true,
      signals: { orderBy: { date: "desc" } },
      opportunities: {
        select: {
          id: true,
          role_title: true,
          status: true,
          cmf_score: true,
          outreach_sent: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
      },
      contacts: true,
      benchmarks: true,
    },
  });

  if (!company) notFound();

  const briefData = company.brief
    ? {
        ...company.brief,
        proof_points: parseJsonField<string[]>(company.brief.proof_points, []),
      }
    : null;

  return (
    <div>
      <div className="mb-2">
        <Link href="/companies" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
          ← Companies
        </Link>
      </div>
      <PageHeader
        title={company.name}
        description={[company.stage, company.hq].filter(Boolean).join(" · ")}
        actions={
          <div className="flex items-center gap-2">
            {company.tier && (
              <Badge variant={tierToBadgeVariant(company.tier)}>
                Tier {company.tier}
              </Badge>
            )}
            <Link
              href={`/opportunities/new?company_id=${company.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors"
            >
              + Add opportunity
            </Link>
          </div>
        }
      />
      <CompanyDetailTabs
        company={{
          id: company.id,
          name: company.name,
          website: company.website,
          linkedin_url: company.linkedin_url,
          hq: company.hq,
          stage: company.stage,
          size: company.size,
          tier: company.tier,
          notes: company.notes,
          role_alert_criteria: company.role_alert_criteria,
        }}
        brief={briefData}
        signals={company.signals.map((s) => ({
          ...s,
          parsed_signals: parseJsonField(s.parsed_signals, null),
        }))}
        opportunities={company.opportunities}
      />
    </div>
  );
}
