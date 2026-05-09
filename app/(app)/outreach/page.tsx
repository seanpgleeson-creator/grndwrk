import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { ContactsPanel } from "@/components/contacts/ContactsPanel";

export default async function OutreachPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: [
      { warmth: "asc" },
      { last_contact: "asc" },
      { created_at: "desc" },
    ],
    include: {
      company: { select: { id: true, name: true } },
    },
  });

  // Sort: Hot > Warm > Cold (prisma sorts asc alphabetically: Cold < Hot < Warm — fix client-side)
  const warmthOrder: Record<string, number> = { Hot: 0, Warm: 1, Cold: 2 };
  const sorted = [...contacts].sort(
    (a, b) => (warmthOrder[a.warmth] ?? 3) - (warmthOrder[b.warmth] ?? 3),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Relationship Pipeline"
        title="Outreach"
        description="Track your contacts and manage relationship-building across target companies."
      />
      <ContactsPanel contacts={sorted} showCompany />
    </div>
  );
}
