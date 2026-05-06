"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, tierToBadgeVariant } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
  website: string | null;
  hq: string | null;
  stage: string | null;
  size: string | null;
  tier: number | null;
  notes: string | null;
  created_at: Date;
  warmth: string | null;
  brief_status: "none" | "in-progress" | "complete";
  opportunity_count: number;
}

interface CompanyListProps {
  companies: Company[];
}

export function CompanyList({ companies }: CompanyListProps) {
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [briefFilter, setBriefFilter] = useState<string>("all");

  const filtered = companies.filter((c) => {
    if (tierFilter !== "all" && String(c.tier ?? "none") !== tierFilter) return false;
    if (briefFilter !== "all" && c.brief_status !== briefFilter) return false;
    return true;
  });

  if (companies.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-base font-semibold text-[var(--ink)] mb-2">No companies yet</h3>
        <p className="text-sm text-[var(--ink-3)] mb-6 max-w-sm mx-auto">
          Start building your target company list to track positioning and opportunities.
        </p>
        <Link
          href="/companies/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[color-mix(in_srgb,var(--accent)_88%,transparent)] text-sm font-medium transition-colors"
        >
          Add your first company
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <FilterGroup
          label="Tier"
          value={tierFilter}
          onChange={setTierFilter}
          options={[
            { value: "all", label: "All" },
            { value: "1", label: "T1" },
            { value: "2", label: "T2" },
            { value: "3", label: "T3" },
            { value: "none", label: "Untiered" },
          ]}
        />
        <FilterGroup
          label="Brief"
          value={briefFilter}
          onChange={setBriefFilter}
          options={[
            { value: "all", label: "All" },
            { value: "none", label: "None" },
            { value: "in-progress", label: "In progress" },
            { value: "complete", label: "Complete" },
          ]}
        />
        <span className="[font-family:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-3)] ml-auto tabular-nums">
          {filtered.length} of {companies.length}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[var(--ink-3)]">
          No companies match the current filters.
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="[font-family:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-3)] mr-1">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-2.5 h-[26px] rounded-[6px] text-[12px] font-medium tracking-[-0.005em] transition-colors duration-[120ms]",
            value === opt.value
              ? "bg-[var(--ink)] text-[var(--bg)]"
              : "bg-transparent text-[var(--ink-3)] hover:bg-[var(--bg-mute)] hover:text-[var(--ink)]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="p-5 hover:bg-[var(--bg-sub)] hover:border-[var(--ink-4)] transition-colors cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--ink)] truncate">{company.name}</h3>
            {company.hq && (
              <p className="text-[12.5px] text-[var(--ink-3)] mt-0.5">{company.hq}</p>
            )}
          </div>
          {company.tier && (
            <Badge variant={tierToBadgeVariant(company.tier)} className="ml-2 shrink-0">
              T{company.tier}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {company.stage && <Badge variant="default">{company.stage}</Badge>}
          {company.size && <Badge variant="default">{company.size}</Badge>}
          {company.warmth && (
            <Badge
              variant={
                company.warmth === "Hot"
                  ? "tier-1"
                  : company.warmth === "Warm"
                    ? "tier-2"
                    : "default"
              }
            >
              {company.warmth}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-[12px] text-[var(--ink-3)]">
          <span className="tabular-nums">
            {company.opportunity_count}{" "}
            {company.opportunity_count === 1 ? "opportunity" : "opportunities"}
          </span>
          <span className={cn(company.brief_status === "complete" && "text-[var(--ink)] font-medium")}>
            Brief: {company.brief_status === "none" ? "not started" : company.brief_status}
          </span>
        </div>
      </Card>
    </Link>
  );
}
