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
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No opportunities yet</h3>
        <p className="text-sm text-[var(--muted)] mb-6">
          Start tracking roles you're pursuing to score your fit and manage your pipeline.
        </p>
        <Link
          href="/opportunities/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium transition-colors"
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
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--muted)]">Status:</span>
          {[
            { value: "active", label: "Active" },
            { value: "all", label: "All" },
            ...STATUS_OPTIONS.map((s) => ({ value: s, label: s === "InProcess" ? "In Process" : s })),
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors",
                statusFilter === opt.value
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-raised)] text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--muted)]">CMF:</span>
          {[
            { value: "all", label: "All" },
            { value: "high", label: "≥8" },
            { value: "medium", label: "6–7" },
            { value: "low", label: "<6" },
            { value: "unscored", label: "Unscored" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCmfFilter(opt.value)}
              className={cn(
                "px-2.5 py-1 rounded text-xs transition-colors",
                cmfFilter === opt.value
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-raised)] text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-[var(--muted)] ml-auto">
          {filtered.length} of {opportunities.length}
        </span>
      </div>

      {/* List */}
      <Card className="divide-y divide-[var(--border)]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--muted)]">
            No opportunities match the current filters.
          </div>
        ) : (
          filtered.map((opp) => (
            <Link key={opp.id} href={`/opportunities/${opp.id}`} className="block">
              <div className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-raised)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">
                    {opp.role_title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--muted)]">{opp.company.name}</span>
                    {opp.company.tier && (
                      <Badge variant={tierToBadgeVariant(opp.company.tier)} className="text-[10px]">
                        T{opp.company.tier}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {opp.outreach_sent && (
                    <span className="text-xs text-indigo-400">Outreach sent</span>
                  )}
                  <CmfScore score={opp.cmf_score} size="sm" />
                  <Badge variant={statusToBadgeVariant(opp.status)}>
                    {opp.status === "InProcess" ? "In Process" : opp.status}
                  </Badge>
                  <span className="text-xs text-[var(--muted)] w-20 text-right">
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
