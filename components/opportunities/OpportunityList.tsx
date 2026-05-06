"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge, statusToBadgeVariant, tierToBadgeVariant } from "@/components/ui/Badge";
import { CmfScore } from "@/components/ui/CmfScore";
import { cn, formatDate } from "@/lib/utils";

interface Opportunity {
  id: string;
  role_title: string;
  status: string;
  cmf_score: number | null;
  outreach_sent: boolean;
  created_at: Date;
  company: { id: string; name: string; tier: number | null };
}

interface OpportunityListProps {
  opportunities: Opportunity[];
}

const STATUS_OPTIONS = ["Watching", "Preparing", "Applied", "InProcess", "Closed"];

export function OpportunityList({ opportunities }: OpportunityListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [cmfFilter, setCmfFilter] = useState<string>("all");

  const filtered = opportunities.filter((o) => {
    if (statusFilter === "active" && o.status === "Closed") return false;
    if (statusFilter !== "active" && statusFilter !== "all" && o.status !== statusFilter) return false;
    if (cmfFilter === "high" && (o.cmf_score == null || o.cmf_score < 8)) return false;
    if (cmfFilter === "medium" && (o.cmf_score == null || o.cmf_score < 6 || o.cmf_score >= 8)) return false;
    if (cmfFilter === "low" && (o.cmf_score == null || o.cmf_score >= 6)) return false;
    if (cmfFilter === "unscored" && o.cmf_score != null) return false;
    return true;
  });

  if (opportunities.length === 0) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-base font-semibold text-[var(--ink)] mb-2">No opportunities yet</h3>
        <p className="text-sm text-[var(--ink-3)] mb-6 max-w-sm mx-auto">
          Start tracking roles you&apos;re pursuing to score your fit and manage your pipeline.
        </p>
        <Link
          href="/opportunities/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[color-mix(in_srgb,var(--accent)_88%,transparent)] text-sm font-medium transition-colors"
        >
          Add your first opportunity
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <FilterGroup
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "active", label: "Active" },
            { value: "all", label: "All" },
            ...STATUS_OPTIONS.map((s) => ({
              value: s,
              label: s === "InProcess" ? "In Process" : s,
            })),
          ]}
        />
        <FilterGroup
          label="CMF"
          value={cmfFilter}
          onChange={setCmfFilter}
          options={[
            { value: "all", label: "All" },
            { value: "high", label: "≥8" },
            { value: "medium", label: "6–7" },
            { value: "low", label: "<6" },
            { value: "unscored", label: "Unscored" },
          ]}
        />
        <span className="[font-family:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-3)] ml-auto tabular-nums">
          {filtered.length} of {opportunities.length}
        </span>
      </div>

      {/* List */}
      <Card className="divide-y divide-[var(--line-2)]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--ink-3)]">
            No opportunities match the current filters.
          </div>
        ) : (
          filtered.map((opp) => (
            <Link key={opp.id} href={`/opportunities/${opp.id}`} className="block">
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-sub)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[var(--ink)] truncate tracking-[-0.005em]">
                    {opp.role_title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12.5px] text-[var(--ink-3)]">{opp.company.name}</span>
                    {opp.company.tier && (
                      <Badge variant={tierToBadgeVariant(opp.company.tier)} className="text-[10px]">
                        T{opp.company.tier}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {opp.outreach_sent && (
                    <span className="[font-family:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] text-[var(--ink-3)]">
                      Outreach sent
                    </span>
                  )}
                  <CmfScore score={opp.cmf_score} size="sm" />
                  <Badge variant={statusToBadgeVariant(opp.status)}>
                    {opp.status === "InProcess" ? "In Process" : opp.status}
                  </Badge>
                  <span className="text-[12px] text-[var(--ink-3)] w-20 text-right tabular-nums">
                    {formatDate(opp.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </Card>
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
