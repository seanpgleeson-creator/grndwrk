"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface RoleSuggestion {
  role_title: string;
  company_type: string;
  rationale: string;
  search_query: string;
}

interface RoleSuggestionsPanelProps {
  profileComplete: boolean;
}

export function RoleSuggestionsPanel({ profileComplete }: RoleSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<RoleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shown, setShown] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/opportunities/role-suggestions", { method: "POST" });
      const json = (await res.json()) as {
        data?: { suggestions: RoleSuggestion[] };
        message?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(json.message ?? "Failed to generate suggestions");
      setSuggestions(json.data?.suggestions ?? []);
      setShown(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  if (!profileComplete) {
    return (
      <div
        style={{
          padding: "14px 16px",
          background: "var(--bg-sub)",
          border: "1px solid var(--line-2)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p className="text-[13px] font-medium text-[var(--ink)]">Role suggestions</p>
          <p className="text-[12.5px] text-[var(--ink-3)] mt-0.5">
            Complete your positioning statement and add your resume to unlock AI role suggestions.
          </p>
        </div>
        <a
          href="/profile"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "5px 12px",
            borderRadius: "var(--radius)",
            border: "1px solid var(--line)",
            fontSize: 12.5,
            fontWeight: 500,
            color: "var(--ink-2)",
            background: "var(--bg-elev)",
            textDecoration: "none",
            transition: "border-color 120ms ease",
          }}
        >
          Complete profile →
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-sub)",
        border: "1px solid var(--line-2)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          gap: 12,
        }}
      >
        <div>
          <p className="text-[13px] font-medium text-[var(--ink)]">Role suggestions</p>
          <p className="text-[12.5px] text-[var(--ink-3)] mt-0.5">
            AI-generated role ideas based on your profile — not live listings.
          </p>
        </div>
        <Button variant="secondary" size="sm" loading={loading} onClick={handleSuggest}>
          {shown ? "Refresh" : "Suggest roles"}
        </Button>
      </div>

      {error && (
        <div style={{ padding: "0 16px 14px" }}>
          <p className="text-[12.5px] text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div
          style={{
            borderTop: "1px solid var(--line-2)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 1,
            background: "var(--line-2)",
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--bg-sub)",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>
                {s.role_title}
              </p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.4 }}>
                {s.company_type}
              </p>
              <p style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.45, marginTop: 2 }}>
                {s.rationale}
              </p>
              <a
                href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(s.search_query)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 4,
                  fontSize: 11.5,
                  color: "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  wordBreak: "break-all",
                }}
              >
                Search on LinkedIn →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
