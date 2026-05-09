"use client";

import { useState } from "react";
import Link from "next/link";
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

// ── StatusPill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: "none" | "in-progress" | "complete" }) {
  const styles = {
    complete: {
      bg: "var(--ink)",
      color: "var(--bg)",
      border: "none",
      label: "Complete",
    },
    "in-progress": {
      bg: "var(--bg-mute)",
      color: "var(--ink)",
      border: "none",
      label: "In progress",
    },
    none: {
      bg: "transparent",
      color: "var(--ink-3)",
      border: "1px solid var(--line)",
      label: "Not started",
    },
  }[status];

  const dotColor = status === "complete" ? "var(--bg)" : status === "in-progress" ? "var(--ink)" : "var(--ink-3)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 500,
        letterSpacing: "-0.005em",
        padding: "3px 8px",
        background: styles.bg,
        color: styles.color,
        border: styles.border || "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: status === "none" ? "var(--ink-3)" : dotColor,
          opacity: status === "none" ? 0.6 : 1,
          flexShrink: 0,
        }}
      />
      {styles.label}
    </span>
  );
}

// ── LogoBox ──────────────────────────────────────────────────────────────────
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
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "1px solid var(--line)",
        background: "var(--bg)",
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 600,
        color: "var(--ink-2)",
        lineHeight: 1,
      }}
    >
      {initials}
    </span>
  );
}

// ── TierBadge ────────────────────────────────────────────────────────────────
function TierBadge({ tier }: { tier: number }) {
  const styles: Record<number, { bg: string; color: string }> = {
    1: { bg: "var(--ink)", color: "var(--bg)" },
    2: { bg: "var(--bg-mute)", color: "var(--ink)" },
    3: { bg: "transparent", color: "var(--ink-3)" },
  };
  const s = styles[tier] ?? styles[3];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 7px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        border: tier === 3 ? "1px solid var(--line)" : "none",
        letterSpacing: "-0.005em",
      }}
    >
      T{tier}
    </span>
  );
}

// ── Columns ──────────────────────────────────────────────────────────────────
const COL_GRID = "1.5fr 1fr 1fr 64px 148px 72px";

function ColHeader({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11.5,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "var(--ink-3)",
        textAlign: right ? "right" : "left",
      }}
    >
      {children}
    </div>
  );
}

// ── CompanyList ──────────────────────────────────────────────────────────────
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
            <rect x="3" y="2.5" width="10" height="11" rx="1" />
            <path d="M6 5.5h1M9 5.5h1M6 8h1M9 8h1M6 10.5h1M9 10.5h1" />
          </svg>
        </div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>No companies yet</h2>
        <p className="text-[var(--ink-3)] max-w-[380px] mx-auto mb-6">
          Start building your target company list to track positioning and opportunities.
        </p>
        <Link
          href="/companies/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[color-mix(in_srgb,var(--accent)_88%,transparent)] text-sm font-medium transition-colors"
        >
          Add your first company
        </Link>
      </div>
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
            { value: "none", label: "Not started" },
            { value: "in-progress", label: "In progress" },
            { value: "complete", label: "Complete" },
          ]}
        />
        <span
          style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}
          className="text-[var(--ink-3)] ml-auto tabular-nums"
        >
          {filtered.length} / {companies.length}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-elev)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: COL_GRID,
            padding: "12px 20px",
            borderBottom: "1px solid var(--line)",
            background: "var(--bg-sub)",
            gap: 16,
            alignItems: "center",
          }}
        >
          <ColHeader>Company</ColHeader>
          <ColHeader>Stage</ColHeader>
          <ColHeader>Location</ColHeader>
          <ColHeader right>Tier</ColHeader>
          <ColHeader>Brief</ColHeader>
          <ColHeader right>Opps</ColHeader>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[13px] text-[var(--ink-3)]">
            No companies match the current filters.
          </div>
        ) : (
          filtered.map((company, i) => (
            <CompanyRow
              key={company.id}
              company={company}
              isLast={i === filtered.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── CompanyRow ────────────────────────────────────────────────────────────────
function CompanyRow({ company, isLast }: { company: Company; isLast: boolean }) {
  return (
    <Link href={`/companies/${company.id}`}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COL_GRID,
          padding: "14px 20px",
          borderBottom: isLast ? "none" : "1px solid var(--line-2)",
          gap: 16,
          alignItems: "center",
          transition: "background 0.1s ease",
          cursor: "pointer",
        }}
        className="hover:bg-[var(--bg-sub)]"
      >
        {/* Company */}
        <div className="flex items-center gap-2.5 min-w-0">
          <LogoBox name={company.name} />
          <div className="min-w-0">
            <p className="text-[13.5px] font-medium text-[var(--ink)] truncate tracking-[-0.005em]">
              {company.name}
            </p>
            {company.size && (
              <p className="text-[12px] text-[var(--ink-3)] truncate">{company.size}</p>
            )}
          </div>
        </div>

        {/* Stage */}
        <p className="text-[13.5px] text-[var(--ink-2)] truncate">
          {company.stage ?? <span className="text-[var(--ink-4)]">—</span>}
        </p>

        {/* Location */}
        <p className="text-[13.5px] text-[var(--ink-2)] truncate">
          {company.hq ?? <span className="text-[var(--ink-4)]">—</span>}
        </p>

        {/* Tier */}
        <div className="flex justify-end">
          {company.tier ? (
            <TierBadge tier={company.tier} />
          ) : (
            <span className="text-[var(--ink-4)] text-[12px]">—</span>
          )}
        </div>

        {/* Brief status */}
        <StatusPill status={company.brief_status} />

        {/* Opportunity count */}
        <p className="text-[13.5px] font-medium text-[var(--ink-2)] tabular-nums text-right">
          {company.opportunity_count > 0 ? company.opportunity_count : (
            <span className="text-[var(--ink-4)] font-normal">0</span>
          )}
        </p>
      </div>
    </Link>
  );
}

// ── FilterGroup ───────────────────────────────────────────────────────────────
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
      <span
        style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}
        className="text-[var(--ink-3)] mr-1"
      >
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 h-[28px] rounded-[6px] text-[13px] font-medium tracking-[-0.005em] transition-colors duration-[120ms]",
            value === opt.value
              ? "bg-[var(--bg-mute)] text-[var(--ink)]"
              : "bg-transparent text-[var(--ink-3)] hover:bg-[var(--bg-mute)] hover:text-[var(--ink)]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
