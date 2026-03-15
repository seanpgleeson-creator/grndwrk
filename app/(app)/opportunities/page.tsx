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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors"
          >
            + Add opportunity
          </Link>
        }
      />
      <OpportunityList opportunities={opportunities} />
    </div>
  );
}
