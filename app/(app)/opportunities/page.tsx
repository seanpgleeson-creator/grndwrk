import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { OpportunityList } from "@/components/opportunities/OpportunityList";
import { RoleSuggestionsPanel } from "@/components/opportunities/RoleSuggestionsPanel";
import Link from "next/link";

export default async function OpportunitiesPage() {
  const [opportunities, profile] = await Promise.all([
    prisma.opportunity.findMany({
      orderBy: { created_at: "desc" },
      include: {
        company: { select: { id: true, name: true, tier: true } },
      },
    }),
    prisma.userProfile.findUnique({
      where: { id: "singleton" },
      select: { positioning_statement: true, resume_raw: true },
    }),
  ]);

  const profileComplete =
    Boolean(profile?.positioning_statement?.trim()) ||
    Boolean(profile?.resume_raw?.trim());

  return (
    <div className="space-y-6">
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
      <RoleSuggestionsPanel profileComplete={profileComplete} />
      <OpportunityList opportunities={opportunities} />
    </div>
  );
}
