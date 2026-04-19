import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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
    // If the user has already seen the welcome page (cookie set), skip straight
    // to setup. If there is partial progress (positioning_statement exists but
    // pillars are missing), also skip welcome and go to setup.
    const cookieStore = await cookies();
    const welcomed = cookieStore.get("grndwrk_welcomed");
    const hasPartialProgress = !!profile?.positioning_statement;

    if (welcomed || hasPartialProgress) {
      redirect("/profile/setup");
    } else {
      redirect("/welcome");
    }
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main
        className="px-6 py-6 lg:px-14 lg:py-10 pt-[60px] lg:pt-10"
        style={{ marginLeft: "var(--sidebar-offset, 0px)" }}
      >
        {children}
      </main>
    </div>
  );
}
