"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { calcCmfScore, parseJsonField, type CmfWeights } from "@/lib/utils";

export async function createOpportunity(data: {
  company_id: string;
  role_title: string;
  level?: string;
  team?: string;
  jd_text?: string;
  status?: string;
}) {
  const opportunity = await prisma.opportunity.create({ data });
  revalidatePath("/opportunities");
  revalidatePath(`/companies/${data.company_id}`);
  return opportunity;
}

export async function updateOpportunity(
  id: string,
  data: {
    role_title?: string;
    level?: string;
    team?: string;
    jd_text?: string;
    key_requirements?: string[];
    status?: string;
    outreach_sent?: boolean;
    cmf_score?: number | null;
    cmf_breakdown?: Record<string, unknown> | null;
    materials?: Record<string, unknown>;
  },
) {
  const { key_requirements, cmf_breakdown, materials, ...rest } = data;
  await prisma.opportunity.update({
    where: { id },
    data: {
      ...rest,
      key_requirements: key_requirements
        ? JSON.stringify(key_requirements)
        : undefined,
      cmf_breakdown: cmf_breakdown !== undefined
        ? cmf_breakdown === null ? null : JSON.stringify(cmf_breakdown)
        : undefined,
      materials: materials !== undefined ? JSON.stringify(materials) : undefined,
    },
  });
  revalidatePath(`/opportunities/${id}`);
  revalidatePath("/opportunities");
}

export async function deleteOpportunity(id: string) {
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { company_id: true } });
  await prisma.opportunity.delete({ where: { id } });
  revalidatePath("/opportunities");
  if (opp) revalidatePath(`/companies/${opp.company_id}`);
}

export async function saveCmfScore(
  opportunityId: string,
  breakdown: {
    domain: number;
    stage: number;
    scope: number;
    strategic: number;
    narrative: number;
  },
) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: "singleton" },
    select: { cmf_weights: true },
  });
  const weights = parseJsonField<CmfWeights>(profile?.cmf_weights, {
    domain: 30, stage: 20, scope: 20, strategic: 20, narrative: 10,
  });
  const score = calcCmfScore(breakdown, weights);

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      cmf_score: score,
      cmf_breakdown: JSON.stringify(breakdown),
    },
  });
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath("/opportunities");
}

export async function upsertRoleBrief(
  opportunityId: string,
  data: {
    fit_summary?: string;
    contribution_narrative?: string;
    differentiated_value?: string;
    proof_points?: string[];
    completed?: boolean;
  },
) {
  const { completed, proof_points, ...rest } = data;
  await prisma.rolePositioningBrief.upsert({
    where: { opportunity_id: opportunityId },
    update: {
      ...rest,
      proof_points: proof_points ? JSON.stringify(proof_points) : undefined,
      completed_at: completed === true ? new Date() : completed === false ? null : undefined,
    },
    create: {
      opportunity_id: opportunityId,
      proof_points: proof_points ? JSON.stringify(proof_points) : "[]",
    },
  });
  revalidatePath(`/opportunities/${opportunityId}`);
  revalidatePath(`/opportunities/${opportunityId}/brief`);
}
