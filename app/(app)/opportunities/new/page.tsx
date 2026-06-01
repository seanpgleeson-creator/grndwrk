"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { createOpportunity } from "@/app/actions/opportunities";

const LEVEL_OPTIONS = [
  { value: "IC1", label: "IC1" },
  { value: "IC2", label: "IC2" },
  { value: "IC3", label: "IC3" },
  { value: "IC4", label: "IC4" },
  { value: "IC5", label: "IC5" },
  { value: "IC6", label: "IC6" },
  { value: "IC7", label: "IC7" },
  { value: "Manager", label: "Manager" },
  { value: "Director", label: "Director" },
  { value: "VP", label: "VP" },
  { value: "C-Suite", label: "C-Suite" },
  { value: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "Watching", label: "Watching" },
  { value: "Preparing", label: "Preparing" },
  { value: "Applied", label: "Applied" },
];

export default function NewOpportunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<{ value: string; label: string }[]>([]);

  // URL extraction state
  const [postingUrl, setPostingUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [extracted, setExtracted] = useState(false);

  const [form, setForm] = useState({
    company_id: searchParams.get("company_id") ?? "",
    role_title: "",
    level: "",
    team: "",
    jd_text: "",
    status: "Watching",
  });

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setCompanies(res.data.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name })));
        }
      });
  }, []);

  // Handle "add a new company" selection
  function handleCompanyChange(value: string) {
    if (value === "__add_new__") {
      router.push(`/companies/new?return=/opportunities/new`);
      return;
    }
    set("company_id", value);
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleExtract() {
    if (!postingUrl.trim()) return;
    setIsExtracting(true);
    setExtractError("");
    setExtracted(false);

    try {
      const res = await fetch("/api/opportunities/extract-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: postingUrl.trim() }),
      });
      const json = await res.json();

      if (!res.ok || json.error) {
        setExtractError(
          json.message ?? "Extraction failed. Try pasting the description manually.",
        );
        setShowManualPaste(true);
        return;
      }

      const data = json.data;
      // Only fill empty fields so user edits are not clobbered
      setForm((prev) => ({
        ...prev,
        role_title: prev.role_title || data.role_title || prev.role_title,
        level: prev.level || data.level || prev.level,
        team: prev.team || data.team || prev.team,
        jd_text: prev.jd_text || data.jd_text || prev.jd_text,
      }));
      setExtracted(true);
      setShowManualPaste(true); // show the JD textarea for review
    } catch {
      setExtractError("Network error. Try pasting the description manually.");
      setShowManualPaste(true);
    } finally {
      setIsExtracting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_id || !form.role_title.trim()) {
      setError("Company and role title are required");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const opp = await createOpportunity({
          company_id: form.company_id,
          role_title: form.role_title,
          level: form.level || undefined,
          team: form.team || undefined,
          jd_text: form.jd_text || undefined,
          status: form.status,
        });
        router.push(`/opportunities/${opp.id}`);
      } catch {
        setError("Failed to create opportunity. Please try again.");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Add Opportunity" description="Track a new role you're pursuing." />
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Company *"
            value={form.company_id}
            onChange={(e) => handleCompanyChange(e.target.value)}
            options={[
              ...companies,
              { value: "__add_new__", label: "+ Add a new company" },
            ]}
            placeholder="Select a company"
          />
          <Input
            label="Role title *"
            value={form.role_title}
            onChange={(e) => set("role_title", e.target.value)}
            placeholder="Principal Product Manager"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Level"
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              options={LEVEL_OPTIONS}
              placeholder="Select level"
            />
            <Input
              label="Team / function"
              value={form.team}
              onChange={(e) => set("team", e.target.value)}
              placeholder="Marketplace, Growth"
            />
          </div>
          <Select
            label="Initial status"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            options={STATUS_OPTIONS}
          />

          {/* Job description — URL extraction or manual paste */}
          <div className="space-y-3">
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink-2)",
                  marginBottom: 6,
                  letterSpacing: "-0.005em",
                }}
              >
                Job description
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={postingUrl}
                  onChange={(e) => {
                    setPostingUrl(e.target.value);
                    setExtractError("");
                    setExtracted(false);
                  }}
                  placeholder="Paste the posting URL (Greenhouse, Lever, Ashby…)"
                  style={{
                    flex: 1,
                    height: "var(--field-h)",
                    padding: "0 12px",
                    fontSize: 13,
                    background: "var(--bg-elev)",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius)",
                    color: "var(--ink)",
                    outline: "none",
                    transition: "border-color 120ms ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--ink-4)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
                />
                <Button
                  type="button"
                  variant="secondary"
                  loading={isExtracting}
                  disabled={!postingUrl.trim() || isExtracting}
                  onClick={handleExtract}
                >
                  {isExtracting ? "Extracting…" : "Extract from link"}
                </Button>
              </div>
            </div>

            {/* Extraction feedback */}
            {extracted && !extractError && (
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 8l4 4 6-7" />
                </svg>
                Description extracted — review and edit below before saving.
              </p>
            )}
            {extractError && (
              <p style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                {extractError}
              </p>
            )}

            {/* Toggle for manual paste */}
            {!showManualPaste && (
              <button
                type="button"
                onClick={() => setShowManualPaste(true)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12.5,
                  color: "var(--ink-3)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                Paste manually instead
              </button>
            )}

            {/* JD textarea — shown after extraction or manual toggle */}
            {showManualPaste && (
              <Textarea
                label={extracted ? "Extracted description (editable)" : "Paste job description"}
                value={form.jd_text}
                onChange={(e) => set("jd_text", e.target.value)}
                placeholder="Paste the full job description here…"
                rows={8}
              />
            )}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" loading={isPending}>
              Add opportunity
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
