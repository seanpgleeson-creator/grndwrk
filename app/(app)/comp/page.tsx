"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { LevelsFyiEmbed } from "@/components/comp/LevelsFyiEmbed";

const TRACK_OPTIONS = [
  { value: "Product Manager", label: "Product Manager" },
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Design", label: "Design" },
  { value: "Data", label: "Data" },
  { value: "Engineering Manager", label: "Engineering Manager" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "Finance", label: "Finance" },
  { value: "Operations", label: "Operations" },
  { value: "HR / People", label: "HR / People" },
];

// Curated tech company list for Levels.fyi searches (company names must match Levels)
const CURATED_COMPANIES = [
  "Google", "Meta", "Apple", "Amazon", "Microsoft", "Netflix", "Stripe",
  "Airbnb", "Uber", "Lyft", "Salesforce", "Oracle", "Adobe", "Nvidia",
  "OpenAI", "Anthropic", "Databricks", "Snowflake", "Palantir",
  "Coinbase", "Block", "Shopify", "Twilio", "Datadog", "Cloudflare",
  "MongoDB", "Elastic", "HashiCorp", "Figma", "Canva", "Notion", "Linear",
  "Slack", "Zoom", "Okta", "CrowdStrike", "Palo Alto Networks", "Splunk",
  "Workday", "ServiceNow", "HubSpot", "Zendesk", "Asana", "Atlassian",
  "GitHub", "GitLab", "Vercel", "Netlify", "Supabase",
  "Tesla", "SpaceX", "Waymo", "Rivian",
  "JPMorgan Chase", "Goldman Sachs", "Morgan Stanley", "Citadel", "Two Sigma",
  "McKinsey", "Bain", "BCG",
  "Deloitte", "Accenture", "IBM",
].sort();

export default function CompPage() {
  const [savedCompanies, setSavedCompanies] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([""]);
  const [track, setTrack] = useState("Product Manager");

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setSavedCompanies(res.data.map((c: { name: string }) => c.name));
        }
      });
  }, []);

  // Build combined options: saved companies first (with divider), then curated list
  function buildOptions(saved: string[]): { value: string; label: string }[] {
    const savedSet = new Set(saved.map((s) => s.toLowerCase()));
    const remainingCurated = CURATED_COMPANIES.filter(
      (c) => !savedSet.has(c.toLowerCase()),
    );
    return [
      ...saved.map((c) => ({ value: c, label: c })),
      ...(saved.length > 0 ? [{ value: "__divider__", label: "─────────────" }] : []),
      ...remainingCurated.map((c) => ({ value: c, label: c })),
    ];
  }

  function addSlot() {
    if (selectedCompanies.length < 3) {
      setSelectedCompanies([...selectedCompanies, ""]);
    }
  }

  function removeSlot(index: number) {
    setSelectedCompanies(selectedCompanies.filter((_, i) => i !== index));
  }

  function setCompany(index: number, value: string) {
    if (value === "__divider__") return;
    const updated = [...selectedCompanies];
    updated[index] = value;
    setSelectedCompanies(updated);
  }

  const activeCompanies = selectedCompanies.filter(Boolean);
  const allOptions = buildOptions(savedCompanies);

  const selectStyle = {
    height: "var(--field-h)",
    padding: "0 28px 0 10px",
    fontSize: 13,
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius)",
    color: "var(--ink)",
    outline: "none",
    transition: "border-color 120ms ease",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23737373'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    minWidth: 200,
    maxWidth: 260,
    cursor: "pointer",
  };

  return (
    <div>
      <PageHeader
        title="Compensation Intelligence"
        description="Benchmark compensation across your target companies."
      />

      <div className="space-y-6">
        <Card className="p-5">
          <div className="flex flex-wrap items-end gap-4">
            {/* Role family */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-3)", marginBottom: 5 }}>
                Role family
              </label>
              <select
                style={selectStyle}
                value={track}
                onChange={(e) => setTrack(e.target.value)}
              >
                {TRACK_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Company slots */}
            <div className="flex items-end gap-3 flex-wrap">
              {selectedCompanies.map((company, i) => (
                <div key={i} className="flex items-end gap-1.5">
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-3)", marginBottom: 5 }}>
                      {i === 0 ? `Compare (up to 3)` : " "}
                    </label>
                    <select
                      style={selectStyle}
                      value={company}
                      onChange={(e) => setCompany(i, e.target.value)}
                    >
                      <option value="">Select company…</option>
                      {savedCompanies.length > 0 && (
                        <optgroup label="Your companies">
                          {savedCompanies.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Other companies">
                        {CURATED_COMPANIES.filter(
                          (c) => !savedCompanies.map((s) => s.toLowerCase()).includes(c.toLowerCase()),
                        ).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  {selectedCompanies.length > 1 && (
                    <button
                      onClick={() => removeSlot(i)}
                      aria-label="Remove company"
                      className="mb-1 text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {selectedCompanies.length < 3 && (
                <button
                  onClick={addSlot}
                  className="mb-1 text-sm font-medium text-[var(--ink-2)] hover:text-[var(--ink)] transition-colors"
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}
                >
                  + Compare
                </button>
              )}
            </div>
          </div>

          {savedCompanies.length > 0 && (
            <p className="mt-3 text-[11.5px] text-[var(--ink-4)]">
              Your saved companies appear at the top of each dropdown.
            </p>
          )}
        </Card>

        {activeCompanies.length === 0 ? (
          <div className="text-center py-16 text-[var(--ink-3)]">
            <p className="text-sm">Select a company above to view compensation data.</p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${activeCompanies.length > 1 ? (activeCompanies.length > 2 ? "grid-cols-3" : "grid-cols-2") : "grid-cols-1"}`}
          >
            {activeCompanies.map((company) => (
              <div key={company}>
                <p className="text-sm font-medium text-[var(--ink)] mb-2">{company}</p>
                <LevelsFyiEmbed company={company} track={track} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
