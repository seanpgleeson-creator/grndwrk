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
        <div className="text-4xl mb-4">🏢</div>
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No companies yet</h3>
        <p className="text-sm text-[var(--muted)] mb-6">
          Start building your target company list to track positioning and opportunities.
        </p>
        <Link
          href="/companies/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors"
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
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--muted)]">Tier:</span>
          {["all", "1", "2", "3", "none"].map((t: string) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors",
                tierFilter === t
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-raised)] text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {t === "all" ? "All" : t === "none" ? "Untiered" : `T${t}`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--muted)]">Brief:</span>
          {["all", "none", "in-progress", "complete"].map((s: string) => (
            <button
              key={s}
              onClick={() => setBriefFilter(s)}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors capitalize",
                briefFilter === s
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-raised)] text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--muted)] ml-auto">
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
        <div className="text-center py-12 text-[var(--muted)]">
          No companies match the current filters.
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="p-5 hover:border-[var(--accent)]/40 transition-colors cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-[var(--foreground)] truncate">{company.name}</h3>
            {company.hq && (
              <p className="text-xs text-[var(--muted)] mt-0.5">{company.hq}</p>
            )}
          </div>
          {company.tier && (
            <Badge variant={tierToBadgeVariant(company.tier)} className="ml-2 shrink-0">
              T{company.tier}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {company.stage && (
            <Badge variant="default">{company.stage}</Badge>
          )}
          {company.size && (
            <Badge variant="default">{company.size}</Badge>
          )}
          {company.warmth && (
            <Badge
              variant={
                company.warmth === "Hot"
                  ? "danger"
                  : company.warmth === "Warm"
                    ? "warning"
                    : "default"
              }
            >
              {company.warmth}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--muted)]">
          <span>
            {company.opportunity_count}{" "}
            {company.opportunity_count === 1 ? "opportunity" : "opportunities"}
          </span>
          <span
            className={cn(
              "capitalize",
              company.brief_status === "complete"
                ? "text-green-400"
                : company.brief_status === "in-progress"
                  ? "text-amber-400"
                  : "",
            )}
          >
            Brief: {company.brief_status === "none" ? "not started" : company.brief_status}
          </span>
        </div>
      </Card>
    </Link>
  );
}
