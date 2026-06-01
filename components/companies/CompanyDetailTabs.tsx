"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CmfScore } from "@/components/ui/CmfScore";
import { LevelsFyiEmbed } from "@/components/comp/LevelsFyiEmbed";
import { updateCompany, createEarningsSignal, deleteEarningsSignal, upsertCompanyBrief, deleteCompany } from "@/app/actions/companies";
import { ContactsPanel, type Contact } from "@/components/contacts/ContactsPanel";
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
  contacts: Contact[];
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

const SIZE_OPTIONS = [
  { value: "1-50", label: "1–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-1000", label: "201–1000" },
  { value: "1000+", label: "1000+" },
];

export function CompanyDetailTabs({ company, brief, signals, opportunities, contacts }: CompanyDetailTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "brief", label: "Brief" },
    { id: "signals", label: `Market Signals (${signals.length})` },
    { id: "opportunities", label: `Opportunities (${opportunities.length})` },
    { id: "contacts", label: `Contacts (${contacts.length})` },
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
          {activeTab === "contacts" && (
            <ContactsPanel contacts={contacts} companyId={company.id} />
          )}
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
  const [suggesting, setSuggesting] = useState(false);
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

  async function handleSuggest() {
    setSuggesting(true);
    try {
      const res = await fetch("/api/companies/suggest-overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, website: form.website || undefined }),
      });
      const json = (await res.json()) as {
        data?: { stage?: string; size?: string; hq?: string; notes?: string };
        message?: string;
      };
      if (!res.ok) throw new Error(json.message || "Failed");
      const d = json.data ?? {};
      setForm((prev) => ({
        ...prev,
        stage: d.stage || prev.stage,
        size: d.size || prev.size,
        hq: d.hq || prev.hq,
        notes: d.notes || prev.notes,
      }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to suggest overview");
    } finally {
      setSuggesting(false);
    }
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
              <Select label="Size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} options={SIZE_OPTIONS} placeholder="Size" />
              <Select label="Tier" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} options={TIER_OPTIONS} placeholder="Tier" />
            </div>
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
            <Textarea label="Role alert criteria" value={form.role_alert_criteria} onChange={(e) => setForm({ ...form, role_alert_criteria: e.target.value })} rows={2} hint="What roles should trigger your attention?" />
            <div>
              <Button type="button" variant="secondary" size="sm" loading={suggesting} onClick={handleSuggest}>
                Suggest overview with AI
              </Button>
              <p className="mt-1.5 text-[12px] text-[var(--ink-4)]">AI will suggest stage, size, HQ, and notes — review before saving.</p>
            </div>
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
              <p className="text-[13px] text-[var(--ink-3)] mb-0.5">{label}</p>
              {value ? (
                href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent)] hover:underline">
                    {value}
                  </a>
                ) : (
                  <p className="text-sm text-[var(--ink)]">{value}</p>
                )
              ) : (
                <p className="text-sm text-[var(--ink-3)]">—</p>
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
                <p className="text-xs text-[var(--ink-3)] mb-1">Notes</p>
                <p className="text-sm text-[var(--ink)] whitespace-pre-wrap">{company.notes}</p>
              </div>
            )}
            {company.role_alert_criteria && (
              <div>
                <p className="text-xs text-[var(--ink-3)] mb-1">Role alert criteria</p>
                <p className="text-sm text-[var(--ink)]">{company.role_alert_criteria}</p>
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
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    why_company: brief?.why_company ?? "",
    why_now: brief?.why_now ?? "",
    value_proposition: brief?.value_proposition ?? "",
    the_ask: brief?.the_ask ?? "",
    proof_points: brief?.proof_points ?? [""],
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!brief) return;
    setForm({ // eslint-disable-line react-hooks/set-state-in-effect
      why_company: brief.why_company ?? "",
      why_now: brief.why_now ?? "",
      value_proposition: brief.value_proposition ?? "",
      the_ask: brief.the_ask ?? "",
      proof_points: brief.proof_points.length ? brief.proof_points : [""],
    });
  }, [brief]);

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
      {saved && <span className="text-sm text-green-700 dark:text-green-400">Saved</span>}
    </>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {brief?.completed_at && (
        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Brief marked complete
        </div>
      )}

      <SectionCard
        title="Positioning brief"
        description="Write your positioning brief for this company — why you, why them, why now."
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
            <p className="text-[13px] font-medium text-[var(--ink)] mb-2">Proof points (2–3)</p>
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
                    className="text-[var(--ink-3)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
                className="text-sm font-medium text-[var(--ink)] hover:text-[var(--ink-2)] transition-colors"
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

interface SuggestedSignal {
  title: string;
  summary: string;
  source_type: string;
}

function SignalsTab({ companyId, signals }: { companyId: string; signals: Signal[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [form, setForm] = useState({ transcript: "", source_url: "", date: new Date().toISOString().split("T")[0] });
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedSignal[]>([]);
  const [suggestError, setSuggestError] = useState("");
  const [addingIdx, setAddingIdx] = useState<number | null>(null);

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

  async function handleSuggest() {
    setSuggesting(true);
    setSuggestError("");
    setSuggestions([]);
    try {
      const res = await fetch(`/api/companies/${companyId}/signals/suggest`, { method: "POST" });
      const json = (await res.json()) as { data?: { signals: SuggestedSignal[] }; message?: string };
      if (!res.ok) throw new Error(json.message || "Suggestion failed");
      setSuggestions(json.data?.signals ?? []);
    } catch (e) {
      setSuggestError(e instanceof Error ? e.message : "Failed to suggest signals");
    } finally {
      setSuggesting(false);
    }
  }

  async function handleAddSuggestion(idx: number) {
    const s = suggestions[idx];
    setAddingIdx(idx);
    startTransition(async () => {
      await createEarningsSignal(companyId, {
        transcript: `${s.title}\n\n${s.summary}`,
        source_url: "",
        date: new Date().toISOString().split("T")[0],
      });
      setSuggestions((prev) => prev.filter((_, i) => i !== idx));
      setAddingIdx(null);
      router.refresh();
    });
  }

  const addAction = (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" loading={suggesting} onClick={handleSuggest}>
        Suggest with AI
      </Button>
      <Button size="sm" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Add signal"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <SectionCard
        title="Market signals"
        description="Earnings calls, competitor news, industry press releases, and market developments &#8212; track signals that create outreach opportunities."
        action={addAction}
      >
        {showForm && (
          <div className="mb-5 space-y-4 rounded-md border border-[var(--line)] bg-[var(--bg-elev)] p-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Source URL (optional)" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} placeholder="https://..." />
            <Textarea label="Transcript / notes *" value={form.transcript} onChange={(e) => setForm({ ...form, transcript: e.target.value })} rows={6} placeholder="Paste earnings call transcript, press release, or notes..." />
            <Button variant="primary" onClick={handleAdd} loading={isPending} disabled={!form.transcript.trim()}>
              Save signal
            </Button>
          </div>
        )}

        {/* AI-suggested signals */}
        {suggestions.length > 0 && (
          <div className="mb-5 space-y-3">
            <p className="text-[12px] font-medium text-[var(--ink-3)] uppercase tracking-[0.06em]" style={{ fontFamily: "var(--font-mono)" }}>
              AI suggestions — click to add
            </p>
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 p-3 rounded-md border border-[var(--line)] bg-[var(--bg-sub)]"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--ink)] mb-0.5">{s.title}</p>
                  <p className="text-xs text-[var(--ink-3)] line-clamp-2">{s.summary}</p>
                  <p className="text-[11px] text-[var(--ink-4)] mt-1 uppercase tracking-[0.04em]">{s.source_type}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={addingIdx === idx}
                  onClick={() => handleAddSuggestion(idx)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}

        {suggestError && (
          <p className="mb-4 text-[12.5px] text-red-700 dark:text-red-400">{suggestError}</p>
        )}

        {signals.length === 0 && !showForm && suggestions.length === 0 ? (
          <div className="text-center py-8 text-[var(--ink-3)]">
            <p className="text-sm">No signals yet. Use &ldquo;Suggest with AI&rdquo; to get ideas, or add your own.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {signals.map((signal) => (
          <Card key={signal.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">{formatDate(signal.date)}</p>
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
                  className="text-[var(--ink-3)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-xs text-[var(--ink-3)] line-clamp-3">{signal.transcript}</p>
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
      style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
    >
      + Add opportunity
    </Link>
  );

  return (
    <div className="max-w-2xl">
      <SectionCard title="Opportunities at this company" action={addAction}>
        {opportunities.length === 0 ? (
          <div className="text-center py-6 text-[var(--ink-3)]">
            <p className="text-sm">No opportunities tracked at this company yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <Link key={opp.id} href={`/opportunities/${opp.id}`}>
                <Card className="p-4 hover:border-[var(--ink-4)] hover:bg-[var(--bg-sub)] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--ink)]">{opp.role_title}</p>
                      <p className="text-xs text-[var(--ink-3)] mt-0.5">{formatDate(opp.created_at)}</p>
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
          <span className="text-sm text-[var(--ink-3)]">Role family:</span>
          <div className="flex gap-2">
            {tracks.map((t: string) => (
            <button
              key={t}
              onClick={() => setTrack(t)}
              className={`px-2.5 h-[26px] rounded-[6px] text-[12px] font-medium tracking-[-0.005em] transition-colors duration-[120ms] ${
                track === t
                  ? "bg-[var(--ink)] text-[var(--bg)]"
                  : "bg-transparent text-[var(--ink-3)] hover:bg-[var(--bg-mute)] hover:text-[var(--ink)]"
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
