import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export default async function ProfilePage() {
  const profile = await prisma.userProfile.findUnique({
    where: { id: "singleton" },
  });

  const data = {
    positioning_statement: profile?.positioning_statement ?? "",
    narrative_pillars: parseJsonField<string[]>(profile?.narrative_pillars, []),
    target_roles: parseJsonField<string[]>(profile?.target_roles, []),
    target_stages: parseJsonField<string[]>(profile?.target_stages, []),
    geography: profile?.geography ?? "",
    remote_preference: profile?.remote_preference ?? "",
    resume_raw: profile?.resume_raw ?? "",
    cmf_weights: parseJsonField(profile?.cmf_weights, {
      domain: 30, stage: 20, scope: 20, strategic: 20, narrative: 10,
    }),
    comp_target: parseJsonField<{
      base_target?: number;
      total_target?: number;
      minimum?: number;
      level?: string;
    }>(profile?.comp_target, {}),
  };

  return (
    <div>
      <PageHeader
        title="Profile & Positioning Hub"
        description="Your positioning foundation powers every module in grndwrk."
      />
      <Card className="p-0 overflow-hidden">
        <ProfileEditor data={data} />
      </Card>
    </div>
  );
}
