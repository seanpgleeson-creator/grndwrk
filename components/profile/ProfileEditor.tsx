"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CmfWeightSliders, type CmfWeights } from "./CmfWeightSliders";
import { AiPositioningPanel } from "./AiPositioningPanel";
import { updateProfile, updateCmfWeights, updateCompTargets } from "@/app/actions/profile";

interface ProfileData {
  positioning_statement: string;
  narrative_pillars: string[];
  target_roles: string[];
  target_stages: string[];
  geography: string;
  remote_preference: string;
  resume_raw: string;
  resume_parsed: string | null;
  cmf_weights: CmfWeights;
  comp_target: {
    base_target?: number;
    total_target?: number;
    minimum?: number;
    level?: string;
  };
}

interface ProfileEditorProps {
  data: ProfileData;
}

// ── FieldRow ──────────────────────────────────────────────────────────────────
function FieldRow({
  label,
  help,
  action,
  last,
  children,
}: {
  label: string;
  help?: string;
  action?: React.ReactNode;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gap: 32,
        padding: "var(--gap-row) 0",
        borderBottom: last ? undefined : "1px solid var(--line-2)",
      }}
    >
      <div style={{ paddingTop: 8 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.005em",
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
        {help && (
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              lineHeight: 1.45,
              marginTop: 6,
            }}
          >
            {help}
          </div>
        )}
        {action && <div style={{ marginTop: 12 }}>{action}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ── SaveRow ───────────────────────────────────────────────────────────────────
function SaveRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ paddingTop: "var(--gap-row)" }}
      className="flex items-center gap-3"
    >
      {children}
    </div>
  );
}

// ── ProfileEditor ─────────────────────────────────────────────────────────────
export function ProfileEditor({ data }: ProfileEditorProps) {
  const tabs = [
    { id: "core", label: "Core Profile" },
    { id: "resume", label: "Resume" },
    { id: "pillars", label: "Narrative Pillars" },
    { id: "cmf", label: "CMF Weights" },
    { id: "comp", label: "Comp Targets" },
  ];

  return (
    <Tabs tabs={tabs}>
      {(activeTab) => (
        <>
          {activeTab === "core" && <CoreProfileTab data={data} />}
          {activeTab === "resume" && <ResumeTab data={data} />}
          {activeTab === "pillars" && <PillarsTab data={data} />}
          {activeTab === "cmf" && <CmfTab data={data} />}
          {activeTab === "comp" && <CompTab data={data} />}
        </>
      )}
    </Tabs>
  );
}

// ── CoreProfileTab ─────────────────────────────────────────────────────────────
function CoreProfileTab({ data }: { data: ProfileData }) {
  const [statement, setStatement] = useState(data.positioning_statement);
  const [roles, setRoles] = useState(data.target_roles.join(", "));
  const [stages, setStages] = useState(data.target_stages.join(", "));
  const [geography, setGeography] = useState(data.geography);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const parsedRoles = roles.split(",").map((r) => r.trim()).filter(Boolean);
  const parsedStages = stages.split(",").map((s) => s.trim()).filter(Boolean);

  function handleSave() {
    startTransition(async () => {
      await updateProfile({
        positioning_statement: statement,
        target_roles: parsedRoles,
        target_stages: parsedStages,
        geography,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <>
      <div style={{ maxWidth: 920 }}>
        <FieldRow
          label="Positioning statement"
          help="Your north star — who you are, what you do, and what makes you distinctive."
          action={
            <button
              type="button"
              onClick={() => setAiPanelOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 10px",
                borderRadius: 6,
                fontSize: 12.5,
                fontWeight: 500,
                color: "var(--ink-2)",
                background: "transparent",
                border: "1px solid var(--line)",
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
              className="hover:bg-[var(--bg-mute)] hover:text-[var(--ink)]"
            >
              <svg width={12} height={12} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a.5.5 0 0 1 .5.5v1.793l1.146-1.147a.5.5 0 0 1 .708.708L9.207 4l1.147 1.146a.5.5 0 0 1-.708.708L8.5 4.707V6.5a.5.5 0 0 1-1 0V4.707L6.354 5.854a.5.5 0 1 1-.708-.708L6.793 4 5.646 2.854a.5.5 0 1 1 .708-.708L7.5 3.293V1.5A.5.5 0 0 1 8 1zM2.5 8a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0z" />
              </svg>
              Help me write with AI
            </button>
          }
        >
          <Textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={5}
            placeholder="Describe who you are, what you do, and what makes you distinctive..."
          />
        </FieldRow>

        <FieldRow
          label="Target roles"
          help="The job titles you're actively pursuing."
        >
          <Input
            value={roles}
            onChange={(e) => setRoles(e.target.value)}
            hint="Comma-separated, e.g. Principal PM, Director of Product"
          />
          {parsedRoles.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {parsedRoles.map((r) => (
                <span
                  key={r}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--ink-2)",
                    background: "var(--bg-mute)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    letterSpacing: "0.005em",
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </FieldRow>

        <FieldRow
          label="Target company stages"
          help="Filter opportunities by company stage."
        >
          <Input
            value={stages}
            onChange={(e) => setStages(e.target.value)}
            hint="Comma-separated, e.g. Series B, Series C, Public"
          />
          {parsedStages.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {parsedStages.map((s) => (
                <span
                  key={s}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--ink-2)",
                    background: "var(--bg-mute)",
                    padding: "3px 8px",
                    borderRadius: 6,
                    letterSpacing: "0.005em",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </FieldRow>

        <FieldRow
          label="Geography"
          help="Preferred work location or region."
          last
        >
          <Input
            value={geography}
            onChange={(e) => setGeography(e.target.value)}
            placeholder="e.g. San Francisco, Remote"
          />
        </FieldRow>

        <SaveRow>
          <Button variant="primary" onClick={handleSave} loading={isPending}>
            Save changes
          </Button>
          {saved && (
            <span className="text-[13px] text-green-700 dark:text-green-400">Saved</span>
          )}
        </SaveRow>
      </div>

      <AiPositioningPanel
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        onUse={(draft) => setStatement(draft)}
        currentStatement={statement}
        resumeRaw={data.resume_raw}
        targetRoles={parsedRoles}
        targetStages={parsedStages}
        geography={geography}
      />
    </>
  );
}

// ── ResumeTab ─────────────────────────────────────────────────────────────────
function ResumeTab({ data }: { data: ProfileData }) {
  const router = useRouter();
  const [resume, setResume] = useState(data.resume_raw);
  const [isPending, startTransition] = useTransition();
  const [parseLoading, setParseLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateProfile({ resume_raw: resume });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function handleParse() {
    setParseLoading(true);
    try {
      const res = await fetch("/api/profile/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_raw: resume ?? "" }),
      });
      const json = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(json.message || "Parse failed");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    } finally {
      setParseLoading(false);
    }
  }

  let parsedPreview: unknown = null;
  if (data.resume_parsed) {
    try {
      parsedPreview = JSON.parse(data.resume_parsed);
    } catch {
      parsedPreview = null;
    }
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <FieldRow
        label="Resume text"
        help="Paste your resume. Save first, then run Parse with AI to extract experience and skills for CMF scoring."
        last={parsedPreview == null}
      >
        <Textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={20}
          placeholder="Paste your full resume here..."
        />
      </FieldRow>

      {parsedPreview != null && (
        <FieldRow
          label="Parsed structure"
          help="What the AI extracted — used for CMF scoring and role matching."
          last
        >
          <pre
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--ink-3)",
              background: "var(--bg-sub)",
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "12px 14px",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              maxHeight: 256,
              overflowY: "auto",
              lineHeight: 1.5,
            }}
          >
            {JSON.stringify(parsedPreview, null, 2)}
          </pre>
        </FieldRow>
      )}

      <SaveRow>
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save resume
        </Button>
        <Button variant="secondary" onClick={handleParse} loading={parseLoading}>
          Parse with AI
        </Button>
        {saved && (
          <span className="text-[13px] text-green-700 dark:text-green-400">Saved</span>
        )}
      </SaveRow>
    </div>
  );
}

// ── PillarsTab ─────────────────────────────────────────────────────────────────
function PillarsTab({ data }: { data: ProfileData }) {
  const [pillars, setPillars] = useState<string[]>(
    data.narrative_pillars.length >= 2 ? data.narrative_pillars : [...data.narrative_pillars, ""],
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateProfile({ narrative_pillars: pillars.filter((p) => p.trim()) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <FieldRow
        label="Narrative pillars"
        help="2–5 recurring themes that define your professional identity. These anchor all AI-generated content."
        last
      >
        <div className="space-y-3">
          {pillars.map((pillar, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  value={pillar}
                  onChange={(e) => {
                    const updated = [...pillars];
                    updated[i] = e.target.value;
                    setPillars(updated);
                  }}
                  placeholder={`Pillar ${i + 1}`}
                />
              </div>
              {pillars.length > 2 && (
                <button
                  onClick={() => setPillars(pillars.filter((_, idx) => idx !== i))}
                  aria-label={`Remove pillar ${i + 1}`}
                  style={{
                    color: "var(--ink-3)",
                    padding: 4,
                    transition: "color 120ms ease",
                  }}
                  className="hover:text-red-600 dark:hover:text-red-400"
                >
                  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {pillars.length < 5 && (
            <button
              onClick={() => setPillars([...pillars, ""])}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink-3)",
                transition: "color 120ms ease",
              }}
              className="hover:text-[var(--ink)]"
            >
              + Add pillar
            </button>
          )}
        </div>
      </FieldRow>

      <SaveRow>
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save pillars
        </Button>
        {saved && (
          <span className="text-[13px] text-green-700 dark:text-green-400">Saved</span>
        )}
      </SaveRow>
    </div>
  );
}

// ── CmfTab ─────────────────────────────────────────────────────────────────────
function CmfTab({ data }: { data: ProfileData }) {
  const [weights, setWeights] = useState<CmfWeights>(data.cmf_weights);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSave() {
    setError("");
    startTransition(async () => {
      try {
        await updateCmfWeights(weights);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <FieldRow
        label="CMF weights"
        help="How much each dimension matters in your Candidate Market Fit score. Weights must sum to 100."
        last
      >
        <div>
          <CmfWeightSliders value={weights} onChange={setWeights} />
          {error && (
            <p className="mt-4 text-[13px] text-red-700 dark:text-red-400">{error}</p>
          )}
        </div>
      </FieldRow>

      <SaveRow>
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save weights
        </Button>
        {saved && (
          <span className="text-[13px] text-green-700 dark:text-green-400">Saved</span>
        )}
      </SaveRow>
    </div>
  );
}

// ── CompTab ────────────────────────────────────────────────────────────────────
function CompTab({ data }: { data: ProfileData }) {
  const [base, setBase] = useState(String(data.comp_target.base_target ?? ""));
  const [total, setTotal] = useState(String(data.comp_target.total_target ?? ""));
  const [minimum, setMinimum] = useState(String(data.comp_target.minimum ?? ""));
  const [level, setLevel] = useState(data.comp_target.level ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateCompTargets({
        base_target: base ? Number(base) : undefined,
        total_target: total ? Number(total) : undefined,
        minimum: minimum ? Number(minimum) : undefined,
        level: level || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <FieldRow
        label="Base salary target"
        help="Your target base compensation in USD."
      >
        <Input
          type="number"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          placeholder="200000"
        />
      </FieldRow>

      <FieldRow
        label="Total comp target"
        help="Base + equity + bonus target, in USD."
      >
        <Input
          type="number"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          placeholder="300000"
        />
      </FieldRow>

      <FieldRow
        label="Minimum total comp"
        help="The floor you won't go below."
      >
        <Input
          type="number"
          value={minimum}
          onChange={(e) => setMinimum(e.target.value)}
          placeholder="250000"
        />
      </FieldRow>

      <FieldRow
        label="Target level"
        help="Title or level band, e.g. L6, Staff, Director."
        last
      >
        <Input
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="L6, Staff, Director"
        />
      </FieldRow>

      <SaveRow>
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save targets
        </Button>
        {saved && (
          <span className="text-[13px] text-green-700 dark:text-green-400">Saved</span>
        )}
      </SaveRow>
    </div>
  );
}
