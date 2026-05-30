import { prisma } from "@/lib/prisma";
import type { CompaniesApiRow } from "@/lib/prisma-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { CompanyList } from "@/components/companies/CompanyList";
import Link from "next/link";

function deriveWarmth(contacts: { warmth: string }[]): string | null {
  if (contacts.length === 0) return null;
  if (contacts.some((c) => c.warmth === "Hot")) return "Hot";
  if (contacts.some((c) => c.warmth === "Warm")) return "Warm";
  return "Cold";
}

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: [{ tier: "asc" }, { created_at: "desc" }],
    include: {
      brief: { select: { completed_at: true, draft: true, edited: true } },
      contacts: { select: { warmth: true } },
      _count: { select: { opportunities: true } },
    },
  });

  const data = companies.map((c: CompaniesApiRow) => ({
    id: c.id,
    name: c.name,
    website: c.website,
    hq: c.hq,
    stage: c.stage,
    size: c.size,
    tier: c.tier,
    notes: c.notes,
    created_at: c.created_at,
    warmth: deriveWarmth(c.contacts),
    brief_status: !c.brief
      ? ("none" as const)
      : c.brief.completed_at
        ? ("complete" as const)
        : c.brief.draft || c.brief.edited
          ? ("in-progress" as const)
          : ("none" as const),
    opportunity_count: c._count.opportunities,
  }));

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Track and position yourself at your target companies."
        actions={
          <Link
            href="/companies/new"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            className="inline-flex items-center gap-2 h-[var(--field-h)] px-4 rounded-[var(--radius)] text-[13px] font-medium tracking-[-0.005em] hover:opacity-90 transition-opacity"
          >
            + Add company
          </Link>
        }
      />
      <CompanyList companies={data} />
    </div>
  );
}
