/**
 * Manually defined row types matching the Prisma `include`/`select` shapes
 * used in dashboard and company list queries. These avoid importing from
 * the generated Prisma namespace, which may not exist on Vercel until
 * `prisma generate` runs.
 */

export interface DashboardOpportunityRow {
  id: string;
  company_id: string;
  role_title: string;
  level: string | null;
  team: string | null;
  jd_text: string | null;
  key_requirements: unknown;
  status: string;
  outreach_sent: boolean;
  cmf_score: number | null;
  cmf_breakdown: unknown;
  materials: unknown;
  comp_snapshot: unknown;
  created_at: Date;
  updated_at: Date;
  brief: { completed_at: Date | null } | null;
  company: { id: string; name: string; tier: number | null };
}

export interface DashboardCompanyRow {
  id: string;
  name: string;
  tier: number | null;
  brief: { completed_at: Date | null } | null;
  [key: string]: unknown;
}

export interface BriefCompletedRow {
  completed_at: Date | null;
}

export interface CompaniesApiRow {
  id: string;
  name: string;
  website: string | null;
  linkedin_url: string | null;
  hq: string | null;
  stage: string | null;
  size: string | null;
  tier: number | null;
  notes: string | null;
  role_alert_criteria: string | null;
  created_at: Date;
  updated_at: Date;
  brief: { completed_at: Date | null; draft: string | null; edited: string | null } | null;
  contacts: { warmth: string }[];
  _count: { opportunities: number };
}
