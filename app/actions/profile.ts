"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function completeOnboarding(data: {
  positioning_statement: string;
  narrative_pillars: string[];
  target_roles: string[];
  target_stages: string[];
  geography?: string;
  remote_preference?: string;
  resume_raw?: string;
  cmf_weights?: {
    domain: number;
    stage: number;
    scope: number;
    strategic: number;
    narrative: number;
  };
  comp_target?: {
    base_target?: number;
    total_target?: number;
    minimum?: number;
    level?: string;
  };
}) {
  await prisma.userProfile.upsert({
    where: { id: "singleton" },
    update: {
      positioning_statement: data.positioning_statement,
      narrative_pillars: JSON.stringify(data.narrative_pillars),
      target_roles: JSON.stringify(data.target_roles),
      target_stages: JSON.stringify(data.target_stages),
      geography: data.geography,
      remote_preference: data.remote_preference,
      resume_raw: data.resume_raw,
      cmf_weights: data.cmf_weights
        ? JSON.stringify(data.cmf_weights)
        : undefined,
      comp_target: data.comp_target
        ? JSON.stringify(data.comp_target)
        : undefined,
    },
    create: {
      id: "singleton",
      positioning_statement: data.positioning_statement,
      narrative_pillars: JSON.stringify(data.narrative_pillars),
      target_roles: JSON.stringify(data.target_roles),
      target_stages: JSON.stringify(data.target_stages),
      geography: data.geography,
      remote_preference: data.remote_preference,
      resume_raw: data.resume_raw,
      cmf_weights: data.cmf_weights
        ? JSON.stringify(data.cmf_weights)
        : JSON.stringify({ domain: 30, stage: 20, scope: 20, strategic: 20, narrative: 10 }),
      comp_target: data.comp_target ? JSON.stringify(data.comp_target) : undefined,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
}

export async function updateProfile(data: {
  positioning_statement?: string;
  narrative_pillars?: string[];
  target_roles?: string[];
  target_stages?: string[];
  geography?: string;
  remote_preference?: string;
  resume_raw?: string;
}) {
  await prisma.userProfile.upsert({
    where: { id: "singleton" },
    update: {
      ...data,
      narrative_pillars: data.narrative_pillars
        ? JSON.stringify(data.narrative_pillars)
        : undefined,
      target_roles: data.target_roles
        ? JSON.stringify(data.target_roles)
        : undefined,
      target_stages: data.target_stages
        ? JSON.stringify(data.target_stages)
        : undefined,
    },
    create: {
      id: "singleton",
      narrative_pillars: "[]",
      target_roles: "[]",
      target_stages: "[]",
    },
  });
  revalidatePath("/profile");
}

export async function updateCmfWeights(weights: {
  domain: number;
  stage: number;
  scope: number;
  strategic: number;
  narrative: number;
}) {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (sum !== 100) {
    throw new Error(`CMF weights must sum to 100, got ${sum}`);
  }
  await prisma.userProfile.upsert({
    where: { id: "singleton" },
    update: { cmf_weights: JSON.stringify(weights) },
    create: {
      id: "singleton",
      narrative_pillars: "[]",
      target_roles: "[]",
      target_stages: "[]",
      cmf_weights: JSON.stringify(weights),
    },
  });
  revalidatePath("/profile");
}

export async function updateCompTargets(data: {
  base_target?: number;
  total_target?: number;
  minimum?: number;
  level?: string;
}) {
  await prisma.userProfile.upsert({
    where: { id: "singleton" },
    update: { comp_target: JSON.stringify(data) },
    create: {
      id: "singleton",
      narrative_pillars: "[]",
      target_roles: "[]",
      target_stages: "[]",
      comp_target: JSON.stringify(data),
    },
  });
  revalidatePath("/profile");
}
