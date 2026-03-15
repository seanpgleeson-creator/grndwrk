"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createCompany(data: {
  name: string;
  website?: string;
  linkedin_url?: string;
  hq?: string;
  stage?: string;
  size?: string;
  tier?: number;
  notes?: string;
}) {
  const company = await prisma.company.create({ data });
  revalidatePath("/companies");
  return company;
}

export async function updateCompany(
  id: string,
  data: {
    name?: string;
    website?: string;
    linkedin_url?: string;
    hq?: string;
    stage?: string;
    size?: string;
    tier?: number;
    notes?: string;
    role_alert_criteria?: string;
  },
) {
  await prisma.company.update({ where: { id }, data });
  revalidatePath(`/companies/${id}`);
  revalidatePath("/companies");
}

export async function deleteCompany(id: string) {
  await prisma.company.delete({ where: { id } });
  revalidatePath("/companies");
}

export async function createEarningsSignal(
  companyId: string,
  data: {
    transcript: string;
    source_url?: string;
    date: string;
  },
) {
  const signal = await prisma.earningsSignal.create({
    data: {
      company_id: companyId,
      transcript: data.transcript,
      source_url: data.source_url,
      date: new Date(data.date),
    },
  });
  revalidatePath(`/companies/${companyId}`);
  return signal;
}

export async function deleteEarningsSignal(id: string, companyId: string) {
  await prisma.earningsSignal.delete({ where: { id } });
  revalidatePath(`/companies/${companyId}`);
}

export async function upsertCompanyBrief(
  companyId: string,
  data: {
    why_company?: string;
    why_now?: string;
    value_proposition?: string;
    proof_points?: string[];
    the_ask?: string;
    completed?: boolean;
  },
) {
  const { completed, proof_points, ...rest } = data;
  await prisma.companyPositioningBrief.upsert({
    where: { company_id: companyId },
    update: {
      ...rest,
      proof_points: proof_points ? JSON.stringify(proof_points) : undefined,
      completed_at: completed === true ? new Date() : completed === false ? null : undefined,
    },
    create: {
      company_id: companyId,
      proof_points: proof_points ? JSON.stringify(proof_points) : "[]",
    },
  });
  revalidatePath(`/companies/${companyId}`);
  revalidatePath(`/companies/${companyId}/brief`);
}
