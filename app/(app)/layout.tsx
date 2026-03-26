import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/nav/Sidebar";

/** Avoid DB access during `next build` static generation when DATABASE_URL is offline locally. */
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: "singleton" },
    select: { positioning_statement: true, narrative_pillars: true },
  });

  const onboardingComplete =
    profile?.positioning_statement &&
    (() => {
      try {
        const pillars = JSON.parse(profile.narrative_pillars ?? "[]");
        return Array.isArray(pillars) && pillars.length > 0;
      } catch {
        return false;
      }
    })();

  if (!onboardingComplete) {
    redirect("/profile/setup");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-[220px] px-6 py-6 lg:px-12 lg:py-10 pt-[60px] lg:pt-10">
        {children}
      </main>
    </div>
  );
}
