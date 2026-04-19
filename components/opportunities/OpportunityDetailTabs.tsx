"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Badge, statusToBadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { CmfScore } from "@/components/ui/CmfScore";
import { LevelsFyiEmbed } from "@/components/comp/LevelsFyiEmbed";
import { updateOpportunity, saveCmfScore, upsertRoleBrief } from "@/app/actions/opportunities";
import { ConsistencyBanner } from "@/components/ui/ConsistencyBanner";
import { calcCmfScore, cmfRecommendation, type CmfWeights } from "@/lib/utils";

type NarrativeCheck = { consistency_score: number; explanation: string };

interface Opportunity {
  id: string;
  role_title: string;
  level: string | null;
  team: string | null;
  jd_text: string | null;
  key_requirements: string[];
  status: string;
  outreach_sent: boolean;
  cmf_score: number | null;
  cmf_breakdown: { domain: number; stage: number; scope: number; strategic: number; narrative: number };
  cmf_ai?: unknown;
  materials: { cover_letter?: { draft?: string; edited?: string } };
  comp_snapshot: { base_low?: number; base_high?: number; total_low?: number; total_high?: number; stale?: boolean; meets_target?: boolean | null };
  company: { id: string; name: string };
}

interface Brief {
  id: string;
  fit_summary: string | null;
  contribution_narrative: string | null;
  differentiated_value: string | null;
  proof_points: string[];
  completed_at: Date | null;
}

interface OpportunityDetailTabsProps {
  opportunity: Opportunity;
  brief: Brief | null;
  cmfWeights: CmfWeights;
  compTarget: { minimum?: number };
}

const STATUS_OPTIONS = [
  { value: "Watching", label: "Watching" },
  { value: "Preparing", label: "Preparing" },
  { value: "Applied", label: "Applied" },
  { value: "InProcess", label: "In Process" },
  { value: "Closed", label: "Closed" },
];

export function OpportunityDetailTabs({ opportunity, brief, cmfWeights, compTarget }: OpportunityDetailTabsProps) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "cmf", label: "CMF Score" },
    { id: "brief", label: "Role Brief" },
    { id: "materials", label: "Materials" },
    { id: "comp", label: "Comp" },
  ];

  return (
    <Tabs tabs={tabs}>
      {(activeTab) => (
        <>
          {activeTab === "overview" && <OverviewTab opportunity={opportunity} />}
          {activeTab === "cmf" && (
            <CmfTab opportunity={opportunity} cmfWeights={cmfWeights} />
          )}
          {activeTab === "brief" && <BriefTab opportunityId={opportunity.id} brief={brief} />}
          {activeTab === "materials" && <MaterialsTab opportunity={opportunity} />}
          {activeTab === "comp" && <CompTab opportunity={opportunity} compTarget={compTarget} />}
        </>
      )}
    </Tabs>
  );
}

function OverviewTab({ opportunity }: { opportunity: Opportunity }) {
  const [status, setStatus] = useState(opportunity.status);
  const [outreachSent, setOutreachSent] = useState(opportunity.outreach_sent);
  const [isPending, startTransition] = useTransition();
  const [showJd, setShowJd] = useState(false);

  function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    startTransition(async () => {
      await updateOpportunity(opportunity.id, { status: newStatus });
    });
  }

  function handleOutreachToggle() {
    const newVal = !outreachSent;
    setOutreachSent(newVal);
    startTransition(async () => {
      await updateOpportunity(opportunity.id, { outreach_sent: newVal });
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-[13px] text-[var(--muted)] mb-1">Status</p>
          <Select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
        <div>
          <p className="text-[13px] text-[var(--muted)] mb-1">Outreach sent</p>
          <button
            onClick={handleOutreachToggle}
            disabled={isPending}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
              outreachSent
                ? "bg-[var(--accent)]/15 border-[var(--accent)]/25 text-[var(--accent)]"
                : "bg-[var(--surface-raised)] border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            <div className={`h-3 w-3 rounded-full ${outreachSent ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
            {outreachSent ? "Yes" : "No"}
          </button>
        </div>
      </div>

      {opportunity.key_requirements.length > 0 && (
        <div>
          <p className="text-xs text-[var(--muted)] mb-2">Key requirements</p>
          <ul className="space-y-1">
            {opportunity.key_requirements.map((req, i) => (
              <li key={i} className="text-sm text-[var(--foreground)] flex items-start gap-2">
                <span className="text-[var(--accent)] mt-0.5">·</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {opportunity.jd_text && (
        <div>
          <button
            onClick={() => setShowJd(!showJd)}
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
          >
            {showJd ? "Hide" : "Show"} job description
          </button>
          {showJd && (
            <div className="mt-3 p-4 rounded-md bg-[var(--surface-raised)] border border-[var(--border)]">
              <pre className="text-xs text-[var(--muted)] whitespace-pre-wrap font-sans">{opportunity.jd_text}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CmfTab({ opportunity, cmfWeights }: { opportunity: Opportunity; cmfWeights: CmfWeights }) {
  const router = useRouter();
  const [genLoading, setGenLoading] = useState(false);
  const [scores, setScores] = useState(
    opportunity.cmf_breakdown.domain > 0
      ? opportunity.cmf_breakdown
      : { domain: 5, stage: 5, scope: 5, strategic: 5, narrative: 5 },
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [narrativeCheck, setNarrativeCheck] = useState<NarrativeCheck | null>(null);

  useEffect(() => {
    const b = opportunity.cmf_breakdown;
    setScores(
      b.domain > 0 || b.stage > 0
        ? b
        : { domain: 5, stage: 5, scope: 5, strategic: 5, narrative: 5 },
    );
  }, [opportunity.cmf_breakdown]);

  const computedScore = calcCmfScore(scores, cmfWeights);
  const recommendation = cmfRecommendation(computedScore);

  async function handleGenerateAi() {
    setGenLoading(true);
    setNarrativeCheck(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/cmf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate: true }),
      });
      const json = (await res.json()) as { message?: string; narrative_check?: NarrativeCheck };
      if (!res.ok) throw new Error(json.message || "Generation failed");
      if (json.narrative_check) setNarrativeCheck(json.narrative_check);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenLoading(false);
    }
  }

  const DIMS = [
    { key: "domain" as const, label: "Domain Fit" },
    { key: "stage" as const, label: "Stage Fit" },
    { key: "scope" as const, label: "Scope Fit" },
    { key: "strategic" as const, label: "Strategic Fit" },
    { key: "narrative" as const, label: "Narrative Fit" },
  ];

  function handleSave() {
    startTransition(async () => {
      await saveCmfScore(opportunity.id, scores);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-6 max-w-xl">
      {narrativeCheck && (
        <ConsistencyBanner
          score={narrativeCheck.consistency_score}
          explanation={narrativeCheck.explanation}
        />
      )}

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          Score each dimension (1–10), or generate with AI using your profile + JD.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={genLoading}
          onClick={handleGenerateAi}
        >
          Generate with AI
        </Button>
      </div>

      {typeof opportunity.cmf_ai === "object" && opportunity.cmf_ai !== null ? (
        <Card className="p-4 space-y-2">
          <p className="text-xs font-medium text-[var(--foreground)]">AI rationale</p>
          {"resume_gap_analysis" in opportunity.cmf_ai && (
            <p className="text-xs text-[var(--muted)] whitespace-pre-wrap">
              {String((opportunity.cmf_ai as { resume_gap_analysis?: string }).resume_gap_analysis ?? "")}
            </p>
          )}
          {"application_recommendation" in opportunity.cmf_ai && (
            <Badge variant="default" className="capitalize">
              {String((opportunity.cmf_ai as { application_recommendation?: string }).application_recommendation ?? "")}
            </Badge>
          )}
        </Card>
      ) : null}

      <div className="space-y-4">
        {DIMS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="w-28 shrink-0">
              <p className="text-sm text-[var(--foreground)]">{label}</p>
              <p className="text-xs text-[var(--muted)]">Weight: {cmfWeights[key]}%</p>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={scores[key]}
              onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
              className="flex-1 h-1.5 rounded-full appearance-none bg-[var(--surface-raised)] cursor-pointer"
              style={{ accentColor: "var(--accent)" }}
            />
            <Input
              type="number"
              min={1}
              max={10}
              value={scores[key]}
              onChange={(e) => setScores({ ...scores, [key]: Math.min(10, Math.max(1, Number(e.target.value))) })}
              className="w-16"
            />
          </div>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--muted)] mb-1">Composite CMF Score</p>
            <CmfScore score={computedScore} size="lg" showRecommendation />
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--muted)] mb-1">Recommendation</p>
            <Badge
              variant={
                recommendation === "prioritize"
                  ? "success"
                  : recommendation === "proceed"
                    ? "warning"
                    : recommendation === "marginal"
                      ? "default"
                      : "danger"
              }
              className="capitalize"
            >
              {recommendation}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save CMF score
        </Button>
        {saved && <span className="text-sm text-[var(--success)]">Saved</span>}
      </div>
    </div>
  );
}

function BriefTab({ opportunityId, brief }: { opportunityId: string; brief: Brief | null }) {
  const router = useRouter();
  const [genLoading, setGenLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    fit_summary: brief?.fit_summary ?? "",
    contribution_narrative: brief?.contribution_narrative ?? "",
    differentiated_value: brief?.differentiated_value ?? "",
    proof_points: brief?.proof_points ?? [""],
  });
  const [saved, setSaved] = useState(false);
  const [narrativeCheck, setNarrativeCheck] = useState<NarrativeCheck | null>(null);

  useEffect(() => {
    if (!brief) return;
    setForm({
      fit_summary: brief.fit_summary ?? "",
      contribution_narrative: brief.contribution_narrative ?? "",
      differentiated_value: brief.differentiated_value ?? "",
      proof_points: brief.proof_points.length ? brief.proof_points : [""],
    });
  }, [brief]);

  async function handleGenerateAi() {
    setGenLoading(true);
    setNarrativeCheck(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generate: true }),
      });
      const json = (await res.json()) as { message?: string; narrative_check?: NarrativeCheck };
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
      await upsertRoleBrief(opportunityId, {
        ...form,
        proof_points: form.proof_points.filter((p) => p.trim()),
        completed,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-5 max-w-2xl">
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

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          Generate a role brief with AI, or edit sections manually.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={genLoading}
          onClick={handleGenerateAi}
        >
          Generate with AI
        </Button>
      </div>

      {[
        { key: "fit_summary" as const, label: "Fit summary", placeholder: "Why are you a strong fit for this role?" },
        { key: "contribution_narrative" as const, label: "Contribution narrative", placeholder: "What will you build or change in the first 6–12 months?" },
        { key: "differentiated_value" as const, label: "Differentiated value", placeholder: "What makes you uniquely suited vs. other candidates?" },
      ].map(({ key, label, placeholder }) => (
        <Textarea key={key} label={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} rows={3} />
      ))}

      <div>
        <p className="text-sm text-[var(--foreground)] mb-2">Proof points</p>
        {form.proof_points.map((point, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <Input value={point} onChange={(e) => { const u = [...form.proof_points]; u[i] = e.target.value; setForm({ ...form, proof_points: u }); }} placeholder={`Proof point ${i + 1}`} />
            </div>
            {form.proof_points.length > 1 && (
              <button
                onClick={() => setForm({ ...form, proof_points: form.proof_points.filter((_, idx) => idx !== i) })}
                aria-label={`Remove proof point ${i + 1}`}
                className="text-[var(--muted)] hover:text-[var(--danger)]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        ))}
        {form.proof_points.length < 3 && (
          <button onClick={() => setForm({ ...form, proof_points: [...form.proof_points, ""] })} className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]">+ Add proof point</button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => handleSave()} loading={isPending}>Save</Button>
        {!brief?.completed_at && <Button variant="secondary" onClick={() => handleSave(true)} loading={isPending}>Mark complete</Button>}
        {brief?.completed_at && <Button variant="ghost" onClick={() => handleSave(false)} loading={isPending}>Reopen</Button>}
        {saved && <span className="text-sm text-[var(--success)]">Saved</span>}
      </div>
    </div>
  );
}

function MaterialsTab({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter();
  const coverLetter = opportunity.materials.cover_letter;
  const [text, setText] = useState(coverLetter?.edited ?? coverLetter?.draft ?? "");
  const [isPending, startTransition] = useTransition();
  const [genLoading, setGenLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [narrativeCheck, setNarrativeCheck] = useState<NarrativeCheck | null>(null);

  useEffect(() => {
    const cl = opportunity.materials.cover_letter;
    setText(cl?.edited ?? cl?.draft ?? "");
  }, [opportunity.materials]);

  async function handleGenerateCoverLetter() {
    setGenLoading(true);
    setNarrativeCheck(null);
    try {
      const res = await fetch(`/api/opportunities/${opportunity.id}/cover-letter`, {
        method: "POST",
      });
      const json = (await res.json()) as { message?: string; narrative_check?: NarrativeCheck };
      if (!res.ok) throw new Error(json.message || "Generation failed");
      if (json.narrative_check) setNarrativeCheck(json.narrative_check);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenLoading(false);
    }
  }

  function handleSave() {
    startTransition(async () => {
      const materials = { cover_letter: { draft: coverLetter?.draft ?? null, edited: text } };
      await updateOpportunity(opportunity.id, { materials: materials as unknown as Record<string, unknown> });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {narrativeCheck && (
        <ConsistencyBanner
          score={narrativeCheck.consistency_score}
          explanation={narrativeCheck.explanation}
        />
      )}

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[var(--muted)]">
          Generate a draft with AI, then edit and save.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={genLoading}
          onClick={handleGenerateCoverLetter}
        >
          Generate cover letter
        </Button>
      </div>
      <Textarea label="Cover letter" value={text} onChange={(e) => setText(e.target.value)} rows={16} placeholder="Write your cover letter here..." />
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} loading={isPending}>Save</Button>
        {saved && <span className="text-sm text-[var(--success)]">Saved</span>}
      </div>
    </div>
  );
}

function CompTab({ opportunity, compTarget }: { opportunity: Opportunity; compTarget: { minimum?: number } }) {
  const snap = opportunity.comp_snapshot;
  const hasSnap = snap.total_low != null || snap.total_high != null;

  return (
    <div className="space-y-6">
      {hasSnap && (
        <Card className="p-4">
          <p className="text-xs text-[var(--muted)] mb-3">Comp snapshot</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {snap.base_low != null && (
              <div>
                <p className="text-xs text-[var(--muted)]">Base range</p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  ${snap.base_low?.toLocaleString()} – ${snap.base_high?.toLocaleString()}
                </p>
              </div>
            )}
            {snap.total_low != null && (
              <div>
                <p className="text-xs text-[var(--muted)]">Total comp range</p>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  ${snap.total_low?.toLocaleString()} – ${snap.total_high?.toLocaleString()}
                </p>
              </div>
            )}
          </div>
          {compTarget.minimum != null && snap.total_high != null && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <Badge variant={snap.meets_target ? "success" : snap.meets_target === false ? "danger" : "default"}>
                {snap.meets_target ? "Meets target" : snap.meets_target === false ? "Below target" : "Unknown vs. target"}
              </Badge>
            </div>
          )}
          {snap.stale && (
            <p className="mt-2 text-xs text-[var(--warning)]">Data may be outdated (180+ days)</p>
          )}
        </Card>
      )}

      <LevelsFyiEmbed company={opportunity.company.name} track="Product Manager" />
    </div>
  );
}
