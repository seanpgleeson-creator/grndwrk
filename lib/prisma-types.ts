import type { Prisma } from "@prisma/client";

/** Opportunity rows used by dashboard + GET /api/dashboard */
export type DashboardOpportunityRow = Prisma.OpportunityGetPayload<{
  include: {
    brief: { select: { completed_at: true } };
    company: { select: { id: true; name: true; tier: true } };
  };
}>;

/** Company rows used by dashboard data loader */
export type DashboardCompanyRow = Prisma.CompanyGetPayload<{
  include: {
    brief: { select: { completed_at: true } };
  };
}>;

/** Brief rows used only for completed_at counts */
export type BriefCompletedRow = Prisma.CompanyPositioningBriefGetPayload<{
  select: { completed_at: true };
}>;

/** Company rows returned by GET /api/companies */
export type CompaniesApiRow = Prisma.CompanyGetPayload<{
  include: {
    brief: { select: { completed_at: true; draft: true; edited: true } };
    contacts: { select: { warmth: true } };
    _count: { select: { opportunities: true } };
  };
}>;
