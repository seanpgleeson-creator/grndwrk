"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge, statusToBadgeVariant, tierToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CmfScore } from "@/components/ui/CmfScore";
import { LevelsFyiEmbed } from "@/components/comp/LevelsFyiEmbed";
import { updateCompany, createEarningsSignal, deleteEarningsSignal, upsertCompanyBrief, deleteCompany } from "@/app/actions/companies";
import { ConsistencyBanner } from "@/components/ui/ConsistencyBanner";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  website: string | null;
  linkedin_url: string | null;
  hq: string | null;
  stage: string | null;
  size: string | null;
  tier: number | null;
  notes: string | null;
  role_alert_criteria: string | null;
}

interface Brief {
  id: string;
  why_company: string | null;
  why_now: string | null;
  value_proposition: string | null;
  proof_points: string[];
  the_ask: string | null;
  completed_at: Date | null;
}

interface Signal {
  id: string;
  date: Date;
  transcript: string;
  source_url: string | null;
  outreach_trigger_score: number | null;
  parsed_signals: unknown;
}

interface Opportunity {
  id: string;
  role_title: string;
  status: string;
  cmf_score: number | null;
  outreach_sent: boolean;
  created_at: Date;
}

interface CompanyDetailTabsProps {
  company: Company;
  brief: Brief | null;
  signals: Signal[];
  opportunities: Opportunity[];
}

const STAGE_OPTIONS = [
  { value: "Pre-seed", label: "Pre-seed" },
  { value: "Seed", label: "Seed" },
  { value: "Series A", label: "Series A" },
  { value: "Series B", label: "Series B" },
  { value: "Series C", label: "Series C" },
  { value: "Series D+", label: "Series D+" },
  { value: "Public", label: "Public" },
  { value: "Other", label: "Other" },
];

const TIER_OPTIONS = [
  { value: "1", label: "Tier 1" },
  { value: "2", label: "Tier 2" },
  { value: "3", label: "Tier 3" },
];

export function CompanyDetailTabs({ company, brief, signals, opportunities }: CompanyDetailTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "brief", label: "Brief" },
    { id: "signals", label: `Signals (${signals.length})` },
    { id: "opportunities", label: `Opportunities (${opportunities.length})` },
    { id: "comp", label: "Comp" },
  ];

  return (
    <Tabs tabs={tabs}>
      {(activeTab) => (
        <>
          {activeTab === "overview" && <OverviewTab company={company} />}
          {activeTab === "brief" && <BriefTab companyId={company.id} brief={brief} />}
          {activeTab === "signals" && <SignalsTab companyId={company.id} signals={signals} />}
          {activeTab === "opportunities" && <OpportunitiesTab opportunities={opportunities} companyId={company.id} />}
          {activeTab === "comp" && <CompTab companyName={company.name} />}
        </>
      )}
    </Tabs>
  );
}

function OverviewTab({ company }: { company: Company }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: company.name,
    website: company.website ?? "",
    linkedin_url: company.linkedin_url ?? "",
    hq: company.hq ?? "",
    stage: company.stage ?? "",
    size: company.size ?? "",
    tier: String(company.tier ?? ""),
    notes: company.notes ?? "",
    role_alert_criteria: company.role_alert_criteria ?? "",
  });

  function handleSave() {
    startTransition(async () => {
      await updateCompany(company.id, {
        name: form.name,
        website: form.website || undefined,
        linkedin_url: form.linkedin_url || undefined,
        hq: form.hq || undefined,
        stage: form.stage || undefined,
        size: form.size || undefined,
        tier: form.tier ? Number(form.tier) : undefined,
        notes: form.notes || undefined,
        role_alert_criteria: form.role_alert_criteria || undefined,
      });
      setEditing(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Delete ${company.name}? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteCompany(company.id);
      router.push("/companies");
    });
  }

  if (editing) {
    return (
      <div className="max-w-2xl">
        <SectionCard
          title="Edit company details"
          description="Keep this information current — it powers brief generation and comp snapshots."
          footer={
            <>
              <Button variant="primary" onClick={handleSave} loading={isPending}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </>
          }
        >
          <div className="space-y-5">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              <Input label="LinkedIn" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
            </div>
            <Input label="HQ" value={form.hq} onChange={(e) => setForm({ ...form, hq: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select label="Stage" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} options={STAGE_OPTIONS} placeholder="Stage" />
              <Select label="Tier" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} options={TIER_OPTIONS} placeholder="Tier" />
            </div>
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            <Textarea label="Role alert criteria" value={form.role_alert_criteria} onChange={(e) => setForm({ ...form, role_alert_criteria: e.target.value })} rows={2} hint="What roles should trigger your attention?" />
          </div>
        </SectionCard>
      </div>
    );
  }

  const editAction = (
    <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
      Edit
    </Button>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionCard title="Company details" action={editAction}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { label: "Website", value: company.website, href: company.website },
            { label: "LinkedIn", value: company.linkedin_url ? "View profile" : null, href: company.linkedin_url },
            { label: "HQ", value: company.hq },
            { label: "Stage", value: company.stage },
            { label: "Size", value: company.size },
            { label: "Tier", value: company.tier ? `Tier ${company.tier}` : null },
          ].map(({ label, value, href }) => (
            <div key={label}>
              <p className="text-[13px] text-[var(--muted)] mb-0.5">{label}</p>
              {value ? (
                href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-[var(--foreground)]">{value}</p>
                )
              ) : (
                <p className="text-sm text-[var(--muted)]">—</p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {(company.notes || company.role_alert_criteria) && (
        <SectionCard title="Notes & alerts">
          <div className="space-y-4">
            {company.notes && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Notes</p>
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{company.notes}</p>
              </div>
            )}
            {company.role_alert_criteria && (
              <div>
                <p className="text-xs text-[var(--muted)] mb-1">Role alert criteria</p>
                <p className="text-sm text-[var(--foreground)]">{company.role_alert_criteria}</p>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      <div className="flex items-center gap-3">
        <Button variant="danger" size="sm" onClick={handleDelete} loading={isPending}>Delete company</Button>
      </div>
    </div>
  );
}

function BriefTab({ companyId, brief }: { companyId: string; brief: Brief | null }) {
  const router = useRouter();
  const [genLoading, setGenLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    why_company: brief?.why_company ?? "",
    why_now: brief?.why_now ?? "",
    value_proposition: brief?.value_proposition ?? "",
    the_ask: brief?.the_ask ?? "",
    proof_points: brief?.proof_points ?? [""],
  });
  const [saved, setSaved] = useState(false);
  const [narrativeCheck, setNarrativeCheck] = useState<{ consistency_score: number; explanation: string } | null>(null);

  useEffect(() => {
    if (!brief) return;
    setForm({
      why_company: brief.why_company ?? "",
      why_now: brief.why_now ?? "",
      value_proposition: brief.value_proposition ?? "",
      the_ask: brief.the_ask ?? "",
      proof_points: brief.proof_points.length ? brief.proof_points : [""],
    });
  }, [brief]);

  async function handleGenerateAi() {
    setGenLoading(true);
    setNarrativeCheck(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate: true }),
      });
      const json = (await res.json()) as {
        message?: string;
        narrative_check?: { consistency_score: number; explanation: string };
      };
      if (!res.ok) throw new Error(json.message || "Generation failed");
      if (json.narrative_check) setNarrativeCheck(json.narrative_check);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenLoading(false);
    }
  }

  function handleSave(completed?: boolean) {
    startTransition(async () => {
      await upsertCompanyBrief(companyId, {
        ...form,
        proof_points: form.proof_points.filter((p) => p.trim()),
        completed,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const generateAction = (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      loading={genLoading}
      onClick={handleGenerateAi}
    >
      Generate with AI
    </Button>
  );

  const briefFooter = (
    <>
      <Button variant="primary" onClick={() => handleSave()} loading={isPending}>Save</Button>
      {!brief?.completed_at && (
        <Button variant="secondary" onClick={() => handleSave(true)} loading={isPending}>
          Mark complete
        </Button>
      )}
      {brief?.completed_at && (
        <Button variant="ghost" onClick={() => handleSave(false)} loading={isPending}>
          Reopen
        </Button>
      )}
      {saved && <span className="text-sm text-[var(--success)]">Saved</span>}
    </>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {narrativeCheck && (
        <ConsistencyBanner
          score={narrativeCheck.consistency_score}
          explanation={narrativeCheck.explanation}
        />
      )}

      {brief?.completed_at && (
        <div className="flex items-center gap-2 text-sm text-[var(--success)]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Brief marked complete
        </div>
      )}

      <SectionCard
        title="Positioning brief"
        description="Draft a positioning brief with AI, or edit sections manually."
        action={generateAction}
        footer={briefFooter}
      >
        <div className="space-y-5">
          {[
            { key: "why_company" as const, label: "Why this company", placeholder: "What draws you to this company specifically?" },
            { key: "why_now" as const, label: "Why now", placeholder: "What's happening at this company that creates opportunity for you?" },
            { key: "value_proposition" as const, label: "Your value proposition", placeholder: "What unique value do you bring to this company?" },
            { key: "the_ask" as const, label: "The ask", placeholder: "What are you looking for from this company?" },
          ].map(({ key, label, placeholder }) => (
            <Textarea
              key={key}
              label={label}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              rows={3}
            />
          ))}

          <div>
            <p className="text-[13px] font-medium text-[var(--foreground)] mb-2">Proof points (2–3)</p>
            {form.proof_points.map((point, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <Input
                    value={point}
                    onChange={(e) => {
                      const updated = [...form.proof_points];
                      updated[i] = e.target.value;
                      setForm({ ...form, proof_points: updated });
                    }}
                    placeholder={`Proof point ${i + 1}`}
                  />
                </div>
                {form.proof_points.length > 1 && (
                  <button
                    onClick={() => setForm({ ...form, proof_points: form.proof_points.filter((_, idx) => idx !== i) })}
                    aria-label={`Remove proof point ${i + 1}`}
                    className="text-[var(--muted)] hover:text-[var(--danger)]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {form.proof_points.length < 3 && (
              <button
                onClick={() => setForm({ ...form, proof_points: [...form.proof_points, ""] })}
                className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                + Add proof point
              </button>
            )}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function SignalsTab({ companyId, signals }: { companyId: string; signals: Signal[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [form, setForm] = useState({ transcript: "", source_url: "", date: new Date().toISOString().split("T")[0] });

  function handleAdd() {
    startTransition(async () => {
      await createEarningsSignal(companyId, form);
      setForm({ transcript: "", source_url: "", date: new Date().toISOString().split("T")[0] });
      setShowForm(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteEarningsSignal(id, companyId);
      router.refresh();
    });
  }

  async function handleAnalyze(signalId: string) {
    setAnalyzingId(signalId);
    try {
      const res = await fetch(
        `/api/companies/${companyId}/signals/${signalId}/analyze`,
        { method: "POST" },
      );
      const json = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(json.message || "Analysis failed");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setAnalyzingId(null);
    }
  }

  const addAction = (
    <Button size="sm" onClick={() => setShowForm(!showForm)}>
      {showForm ? "Cancel" : "+ Add signal"}
    </Button>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionCard
        title="Earnings signals"
        description="Earnings calls, press releases, and market signals — add them here to unlock AI-driven outreach triggers."
        action={addAction}
      >
        {showForm && (
          <div className="mb-5 space-y-4 rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Source URL (optional)" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} placeholder="https://..." />
            <Textarea label="Transcript / notes *" value={form.transcript} onChange={(e) => setForm({ ...form, transcript: e.target.value })} rows={6} placeholder="Paste earnings call transcript or key notes..." />
            <Button variant="primary" onClick={handleAdd} loading={isPending} disabled={!form.transcript.trim()}>
              Save signal
            </Button>
          </div>
        )}

        {signals.length === 0 && !showForm ? (
          <div className="text-center py-8 text-[var(--muted)]">
            <p className="text-sm">No signals yet. Add earnings calls or market signals to track company momentum.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((signal) => (
          <Card key={signal.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{formatDate(signal.date)}</p>
                {signal.source_url && (
                  <a href={signal.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--accent)] hover:underline">
                    Source →
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                {signal.outreach_trigger_score != null && (
                  <Badge variant={signal.outreach_trigger_score >= 4 ? "success" : "default"}>
                    Trigger: {signal.outreach_trigger_score}/5
                  </Badge>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  loading={analyzingId === signal.id}
                  disabled={analyzingId !== null && analyzingId !== signal.id}
                  onClick={() => handleAnalyze(signal.id)}
                >
                  Analyze with AI
                </Button>
                <button
                  onClick={() => handleDelete(signal.id)}
                  aria-label="Delete signal"
                  className="text-[var(--muted)] hover:text-[var(--danger)]"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-xs text-[var(--muted)] line-clamp-3">{signal.transcript}</p>
          </Card>
        ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function OpportunitiesTab({ opportunities, companyId }: { opportunities: Opportunity[]; companyId: string }) {
  const addAction = (
    <Link
      href={`/opportunities/new?company_id=${companyId}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--surface-raised)] border border-[var(--border)] text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)]/40 transition-colors"
    >
      + Add opportunity
    </Link>
  );

  return (
    <div className="max-w-2xl">
      <SectionCard title="Opportunities at this company" action={addAction}>
        {opportunities.length === 0 ? (
          <div className="text-center py-6 text-[var(--muted)]">
            <p className="text-sm">No opportunities tracked at this company yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                <Card className="p-4 hover:border-[var(--accent)]/40 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{opp.role_title}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{formatDate(opp.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CmfScore score={opp.cmf_score} size="sm" />
                      <Badge variant={statusToBadgeVariant(opp.status)}>{opp.status}</Badge>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function CompTab({ companyName }: { companyName: string }) {
  const [track, setTrack] = useState("Product Manager");
  const tracks = ["Product Manager", "Software Engineer", "Design", "Data", "Engineering Manager"];

  return (
    <SectionCard
      title="Compensation benchmarks"
      description="Live data from Levels.fyi scoped to this company."
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted)]">Role family:</span>
          <div className="flex gap-2">
            {tracks.map((t: string) => (
            <button
              key={t}
              onClick={() => setTrack(t)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                track === t
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-raised)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
                {t}
              </button>
            ))}
          </div>
        </div>
        <LevelsFyiEmbed company={companyName} track={track} />
      </div>
    </SectionCard>
  );
}
