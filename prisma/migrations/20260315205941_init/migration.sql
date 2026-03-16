-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "resume_raw" TEXT,
    "resume_parsed" TEXT,
    "positioning_statement" TEXT,
    "narrative_pillars" TEXT NOT NULL DEFAULT '[]',
    "target_roles" TEXT NOT NULL DEFAULT '[]',
    "target_stages" TEXT NOT NULL DEFAULT '[]',
    "geography" TEXT,
    "remote_preference" TEXT,
    "cmf_weights" TEXT NOT NULL DEFAULT '{"domain":30,"stage":20,"scope":20,"strategic":20,"narrative":10}',
    "comp_target" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "linkedin_url" TEXT,
    "hq" TEXT,
    "stage" TEXT,
    "size" TEXT,
    "tier" INTEGER,
    "notes" TEXT,
    "role_alert_criteria" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EarningsSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "transcript" TEXT NOT NULL,
    "source_url" TEXT,
    "parsed_signals" TEXT,
    "outreach_trigger_score" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "EarningsSignal_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompanyPositioningBrief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "draft" TEXT,
    "edited" TEXT,
    "why_company" TEXT,
    "why_now" TEXT,
    "value_proposition" TEXT,
    "proof_points" TEXT NOT NULL DEFAULT '[]',
    "the_ask" TEXT,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "CompanyPositioningBrief_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "role_title" TEXT NOT NULL,
    "level" TEXT,
    "team" TEXT,
    "jd_text" TEXT,
    "key_requirements" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'Watching',
    "outreach_sent" BOOLEAN NOT NULL DEFAULT false,
    "cmf_score" REAL,
    "cmf_breakdown" TEXT,
    "materials" TEXT NOT NULL DEFAULT '{}',
    "comp_snapshot" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Opportunity_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RolePositioningBrief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opportunity_id" TEXT NOT NULL,
    "draft" TEXT,
    "edited" TEXT,
    "fit_summary" TEXT,
    "contribution_narrative" TEXT,
    "differentiated_value" TEXT,
    "proof_points" TEXT NOT NULL DEFAULT '[]',
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "RolePositioningBrief_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "Opportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "company_id" TEXT,
    "linkedin_url" TEXT,
    "connection_degree" TEXT NOT NULL DEFAULT 'cold',
    "warmth" TEXT NOT NULL DEFAULT 'Cold',
    "source" TEXT,
    "notes" TEXT,
    "last_contact" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Contact_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutreachRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contact_id" TEXT NOT NULL,
    "opportunity_id" TEXT,
    "date" DATETIME NOT NULL,
    "channel" TEXT NOT NULL,
    "message_summary" TEXT,
    "response" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "OutreachRecord_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OutreachRecord_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompBenchmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company_id" TEXT NOT NULL,
    "role_family" TEXT NOT NULL,
    "level" TEXT,
    "base_low" INTEGER,
    "base_high" INTEGER,
    "total_low" INTEGER,
    "total_high" INTEGER,
    "source" TEXT NOT NULL,
    "fetched_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "CompBenchmark_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPositioningBrief_company_id_key" ON "CompanyPositioningBrief"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "RolePositioningBrief_opportunity_id_key" ON "RolePositioningBrief"("opportunity_id");

-- CreateIndex
CREATE UNIQUE INDEX "CompBenchmark_company_id_role_family_level_key" ON "CompBenchmark"("company_id", "role_family", "level");
