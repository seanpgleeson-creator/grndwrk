import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import Link from "next/link";

export default async function OpportunitiesPage() {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { created_at: "desc" },
    include: {
      company: { select: { id: true, name: true, tier: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Opportunities"
        description="Track and score every role you're pursuing."
        actions={
          <Link
            href="/opportunities/new"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
            className="inline-flex items-center gap-2 h-[var(--field-h)] px-4 rounded-[var(--radius)] text-[13px] font-medium tracking-[-0.005em] hover:opacity-90 transition-opacity"
          >
            + Add opportunity
          </Link>
        }
      />
      <OpportunityList opportunities={opportunities} />
    </div>
  );
}
