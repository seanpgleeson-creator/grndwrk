"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, tierToBadgeVariant } from "@/components/ui/Badge";
import { CmfScore } from "@/components/ui/CmfScore";
import { formatDate } from "@/lib/utils";

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

// ── Status columns ────────────────────────────────────────────────────────────
const COLUMNS: { id: string; label: string; statuses: string[] }[] = [
  { id: "watching",   label: "Watching",   statuses: ["Watching"] },
  { id: "preparing",  label: "Preparing",  statuses: ["Preparing"] },
  { id: "applied",    label: "Applied",    statuses: ["Applied"] },
  { id: "inprocess",  label: "In Process", statuses: ["InProcess"] },
  { id: "closed",     label: "Closed",     statuses: ["Closed"] },
];

// ── Company logo box ──────────────────────────────────────────────────────────
function LogoBox({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        borderRadius: 5,
        border: "1px solid var(--line)",
        background: "var(--bg)",
        flexShrink: 0,
        fontSize: 10,
        fontWeight: 600,
        color: "var(--ink-2)",
        lineHeight: 1,
      }}
    >
      {initials}
    </span>
  );
}

// ── Derive next action text ───────────────────────────────────────────────────
function nextAction(opp: Opportunity): string {
  if (opp.status === "Watching") return "Score CMF fit →";
  if (opp.status === "Preparing" && !opp.outreach_sent) return "Complete brief →";
  if (opp.status === "Preparing" && opp.outreach_sent) return "Apply →";
  if (opp.status === "Applied") return "Follow up →";
  if (opp.status === "InProcess") return "Prepare for next step →";
  return "Review →";
}

// ── OppCard ───────────────────────────────────────────────────────────────────
function OppCard({ opp }: { opp: Opportunity }) {
  return (
    <Link href={`/opportunities/${opp.id}`}>
      <div
        style={{
          background: "var(--bg-elev)",
          border: "1px solid var(--line)",
          borderRadius: 8,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          cursor: "pointer",
          transition: "border-color 120ms ease",
        }}
        className="hover:border-[var(--ink-4)]"
      >
        {/* Header: logo + company + tier + fit score */}
        <div className="flex items-center gap-2 min-w-0">
          <LogoBox name={opp.company.name} />
          <span className="text-[13px] font-medium text-[var(--ink)] truncate flex-1 tracking-[-0.005em]">
            {opp.company.name}
          </span>
          {opp.company.tier && (
            <Badge variant={tierToBadgeVariant(opp.company.tier)} className="text-[10px] shrink-0">
              T{opp.company.tier}
            </Badge>
          )}
          <CmfScore score={opp.cmf_score} size="sm" />
        </div>

        {/* Role title */}
        <p className="text-[12.5px] text-[var(--ink-2)] leading-[1.4] line-clamp-2">
          {opp.role_title}
        </p>

        {/* Footer: next action + date */}
        <div
          style={{
            paddingTop: 8,
            borderTop: "1px solid var(--line-2)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg
            width={11}
            height={11}
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--ink-3)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
          <span className="text-[11.5px] text-[var(--ink-3)] leading-[1.3] flex-1 truncate">
            {opp.outreach_sent ? "Outreach sent · " : ""}{nextAction(opp)}
          </span>
          <span className="text-[11px] text-[var(--ink-4)] tabular-nums shrink-0">
            {formatDate(opp.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Kanban column ─────────────────────────────────────────────────────────────
function KanbanColumn({
  col,
  items,
  showClosed,
}: {
  col: (typeof COLUMNS)[number];
  items: Opportunity[];
  showClosed: boolean;
}) {
  if (col.id === "closed" && !showClosed && items.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--bg-sub)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 200,
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-[var(--ink)] tracking-[-0.005em]">
            {col.label}
          </h3>
          <span className="text-[11.5px] text-[var(--ink-3)] tabular-nums">{items.length}</span>
        </div>
        <Link
          href={`/opportunities/new${col.id !== "watching" ? `?status=${col.statuses[0]}` : ""}`}
          aria-label={`Add ${col.label} opportunity`}
          className="flex items-center justify-center h-6 w-6 rounded-md text-[var(--ink-3)] hover:bg-[var(--bg-mute)] hover:text-[var(--ink)] transition-colors"
        >
          <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 3v10M3 8h10" />
          </svg>
        </Link>
      </div>

      {/* Cards */}
      {items.length === 0 ? (
        <div
          style={{
            padding: "32px 12px",
            textAlign: "center",
            fontSize: 12,
            color: "var(--ink-4)",
            border: "1px dashed var(--line)",
            borderRadius: 8,
          }}
        >
          None here
        </div>
      ) : (
        items.map((opp) => <OppCard key={opp.id} opp={opp} />)
      )}
    </div>
  );
}

// ── OpportunityList ───────────────────────────────────────────────────────────
export function OpportunityList({ opportunities }: OpportunityListProps) {
  const [showClosed, setShowClosed] = useState(false);

  if (opportunities.length === 0) {
    return (
      <div
        className="text-center"
        style={{
          border: "1px dashed var(--line)",
          borderRadius: "var(--radius-lg)",
          padding: "64px 32px",
          background: "var(--bg-sub)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "var(--bg-elev)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 16 16" fill="none" stroke="var(--ink-2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" />
            <circle cx="8" cy="8" r="2.5" />
          </svg>
        </div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>No opportunities yet</h2>
        <p className="text-[var(--ink-3)] max-w-[380px] mx-auto mb-6">
          Start tracking roles you&apos;re pursuing to score your fit and manage your pipeline.
        </p>
        <Link
          href="/opportunities/new"
          style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          className="inline-flex items-center gap-2 h-[var(--field-h)] px-4 rounded-[var(--radius)] text-[13px] font-medium tracking-[-0.005em] hover:opacity-90 transition-opacity"
        >
          Add your first opportunity
        </Link>
      </div>
    );
  }

  // Group by column
  const byColumn = COLUMNS.reduce<Record<string, Opportunity[]>>((acc, col) => {
    acc[col.id] = opportunities.filter((o) => col.statuses.includes(o.status));
    return acc;
  }, {});

  const closedCount = byColumn.closed?.length ?? 0;
  const activeColumns = COLUMNS.filter((c) => c.id !== "closed" || showClosed || closedCount > 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <span
          style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}
          className="text-[var(--ink-3)] tabular-nums"
        >
          {opportunities.filter((o) => o.status !== "Closed").length} active · {opportunities.length} total
        </span>
        <button
          onClick={() => setShowClosed((v) => !v)}
          className="text-[12.5px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors flex items-center gap-1.5"
        >
          <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {showClosed ? (
              <path d="M8 3v10M3 8h10" />
            ) : (
              <path d="M2 8h12M7 4l4 4-4 4" />
            )}
          </svg>
          {showClosed ? "Hide closed" : `Show closed (${closedCount})`}
        </button>
      </div>

      {/* Kanban grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${activeColumns.length}, minmax(0, 1fr))`,
          gap: 16,
          alignItems: "start",
        }}
      >
        {activeColumns.map((col) => (
          <KanbanColumn
            key={col.id}
            col={col}
            items={byColumn[col.id] ?? []}
            showClosed={showClosed}
          />
        ))}
      </div>
    </div>
  );
}
