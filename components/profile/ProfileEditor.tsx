"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CmfWeightSliders, type CmfWeights } from "./CmfWeightSliders";
import { AiPositioningPanel } from "./AiPositioningPanel";
import { updateProfile, updateCmfWeights, updateCompTargets, updatePreferredGeographies } from "@/app/actions/profile";
import { formatCompact } from "@/lib/comp/costOfLiving";

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
  preferred_geographies: string[];
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
    { id: "geo", label: "Preferred Geographies" },
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
          {activeTab === "geo" && <GeoTab data={data} />}
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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/resume/upload", { method: "POST", body: form });
      const json = (await res.json()) as { data?: { resume_raw: string }; message?: string };
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setResume(json.data?.resume_raw ?? "");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadLoading(false);
      // Reset input so same file can be re-uploaded
      e.target.value = "";
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
        label="Upload resume"
        help="Upload a PDF, DOCX, or TXT file to automatically populate the text field below."
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--line)",
              background: "var(--bg-elev)",
              fontSize: 13,
              fontWeight: 500,
              color: uploadLoading ? "var(--ink-4)" : "var(--ink-2)",
              cursor: uploadLoading ? "wait" : "pointer",
              transition: "border-color 120ms ease",
            }}
            className="hover:border-[var(--ink-4)] hover:text-[var(--ink)]"
          >
            <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 2v8M5 5l3-3 3 3M2 12h12" />
            </svg>
            {uploadLoading ? "Uploading…" : "Upload file"}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              disabled={uploadLoading}
              style={{ display: "none" }}
            />
          </label>
          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>PDF, DOCX, or TXT</span>
        </div>
        {uploadError && (
          <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 6 }}>{uploadError}</p>
        )}
      </FieldRow>

      <FieldRow
        label="Resume text"
        help="Paste your resume or upload a file above. Save first, then run Parse with AI to extract experience and skills for CMF scoring."
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
        <Button variant="secondary" onClick={handleParse} loading={parseLoading} disabled={!resume?.trim()}>
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

  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  const sumOk = sum === 100;

  function handleSave() {
    if (!sumOk) return;
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
        help="Adjust each dimension freely. Weights must total exactly 100 before saving."
        last
      >
        <div>
          <CmfWeightSliders value={weights} onChange={setWeights} />
          {!sumOk && (
            <p className="mt-3 text-[13px] text-amber-700 dark:text-amber-400">
              Total is {sum} — adjust to reach exactly 100 before saving.
            </p>
          )}
          {error && (
            <p className="mt-2 text-[13px] text-red-700 dark:text-red-400">{error}</p>
          )}
        </div>
      </FieldRow>

      <SaveRow>
        <Button variant="primary" onClick={handleSave} loading={isPending} disabled={!sumOk}>
          Save weights
        </Button>
        {saved && (
          <span className="text-[13px] text-green-700 dark:text-green-400">Saved</span>
        )}
      </SaveRow>
    </div>
  );
}

// ── GeoTab ────────────────────────────────────────────────────────────────────
function GeoTab({ data }: { data: ProfileData }) {
  const [geos, setGeos] = useState<string[]>(
    data.preferred_geographies.length > 0 ? data.preferred_geographies : [""],
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updatePreferredGeographies(geos.filter((g) => g.trim()));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const updated = [...geos];
    [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
    setGeos(updated);
  }

  function moveDown(i: number) {
    if (i === geos.length - 1) return;
    const updated = [...geos];
    [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
    setGeos(updated);
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <FieldRow
        label="Preferred geographies"
        help="Up to 5 cities where you'd be willing to relocate or work. The first entry is your highest priority and is used as the baseline for comp equivalence calculations."
        last
      >
        <div className="space-y-3">
          {geos.map((geo, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  aria-label="Move up"
                  style={{
                    padding: "1px 4px",
                    fontSize: 10,
                    color: i === 0 ? "var(--ink-5)" : "var(--ink-3)",
                    background: "none",
                    border: "none",
                    cursor: i === 0 ? "default" : "pointer",
                    lineHeight: 1,
                  }}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  disabled={i === geos.length - 1}
                  aria-label="Move down"
                  style={{
                    padding: "1px 4px",
                    fontSize: 10,
                    color: i === geos.length - 1 ? "var(--ink-5)" : "var(--ink-3)",
                    background: "none",
                    border: "none",
                    cursor: i === geos.length - 1 ? "default" : "pointer",
                    lineHeight: 1,
                  }}
                >
                  ▼
                </button>
              </div>
              <div className="flex-1">
                <Input
                  value={geo}
                  onChange={(e) => {
                    const updated = [...geos];
                    updated[i] = e.target.value;
                    setGeos(updated);
                  }}
                  placeholder={i === 0 ? "e.g. San Francisco, CA (highest priority)" : `City ${i + 1}`}
                />
              </div>
              {i === 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--ink-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    flexShrink: 0,
                    paddingRight: 4,
                  }}
                >
                  #1
                </span>
              )}
              {geos.length > 1 && (
                <button
                  type="button"
                  onClick={() => setGeos(geos.filter((_, idx) => idx !== i))}
                  aria-label={`Remove city ${i + 1}`}
                  style={{
                    color: "var(--ink-3)",
                    padding: 4,
                    transition: "color 120ms ease",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                  className="hover:text-red-600 dark:hover:text-red-400"
                >
                  <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {geos.length < 5 && (
            <button
              type="button"
              onClick={() => setGeos([...geos, ""])}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--ink-3)",
                transition: "color 120ms ease",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              className="hover:text-[var(--ink)]"
            >
              + Add city
            </button>
          )}
        </div>
      </FieldRow>

      <SaveRow>
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save geographies
        </Button>
        {saved && (
          <span className="text-[13px] text-green-700 dark:text-green-400">Saved</span>
        )}
      </SaveRow>
    </div>
  );
}

function parseCompNumber(raw: string): number | undefined {
  const stripped = raw.replace(/[^0-9]/g, "");
  const n = Number(stripped);
  return stripped && !isNaN(n) ? n : undefined;
}

interface EquivResult {
  ratio: number;
  source: "static" | "apiverve" | "default";
  regionFrom?: string;
  regionTo?: string;
}

// ── CompTab ────────────────────────────────────────────────────────────────────
function CompTab({ data }: { data: ProfileData }) {
  const [base, setBase] = useState(String(data.comp_target.base_target ?? ""));
  const [total, setTotal] = useState(String(data.comp_target.total_target ?? ""));
  const [minimum, setMinimum] = useState(String(data.comp_target.minimum ?? ""));
  const [level, setLevel] = useState(data.comp_target.level ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  // Geography equivalence
  const geos = data.preferred_geographies;
  const [baseGeo, setBaseGeo] = useState(geos[0] ?? "");
  const [ratios, setRatios] = useState<Record<string, EquivResult>>({});
  const [ratiosLoading, setRatiosLoading] = useState(false);
  const [ratiosError, setRatiosError] = useState(false);
  const fetchRef = useRef(0);

  const baseTotal = parseCompNumber(total) ?? parseCompNumber(base);
  const otherGeos = geos.filter((g) => g !== baseGeo);

  // Fetch ratios whenever the reference city or the list of cities changes
  useEffect(() => {
    if (!baseGeo || otherGeos.length === 0) {
      setRatios({});
      return;
    }

    const id = ++fetchRef.current;
    setRatiosLoading(true);
    setRatiosError(false);

    Promise.all(
      otherGeos.map(async (city) => {
        const res = await fetch(
          `/api/comp/equivalence?from=${encodeURIComponent(baseGeo)}&to=${encodeURIComponent(city)}`,
        );
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as EquivResult;
        return [city, json] as const;
      }),
    )
      .then((pairs) => {
        if (id !== fetchRef.current) return;
        setRatios(Object.fromEntries(pairs));
        setRatiosLoading(false);
      })
      .catch(() => {
        if (id !== fetchRef.current) return;
        setRatiosError(true);
        setRatiosLoading(false);
      });
  }, [baseGeo, otherGeos.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    startTransition(async () => {
      await updateCompTargets({
        base_target: parseCompNumber(base),
        total_target: parseCompNumber(total),
        minimum: parseCompNumber(minimum),
        level: level || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  // Determine attribution label shown below the table
  const sources = new Set(Object.values(ratios).map((r) => r.source));
  function sourceAttribution(): string {
    if (sources.has("apiverve")) return "Estimates powered by APIVerve cost-of-living data. Actual offers vary.";
    if (sources.has("static")) return "Estimates based on curated cost-of-living indices. Actual offers vary.";
    return "Estimates based on approximate cost-of-living data. Actual offers vary.";
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <FieldRow
        label="Base salary target"
        help="Your target base compensation in USD."
      >
        <Input
          value={base}
          onChange={(e) => setBase(e.target.value)}
          placeholder="200000"
          hint="Numbers only, e.g. 200000"
        />
      </FieldRow>

      <FieldRow
        label="Total comp target"
        help="Base + equity + bonus target, in USD."
      >
        <Input
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          placeholder="300000"
          hint="Numbers only, e.g. 300000"
        />
      </FieldRow>

      <FieldRow
        label="Minimum total comp"
        help="The floor you won't go below."
      >
        <Input
          value={minimum}
          onChange={(e) => setMinimum(e.target.value)}
          placeholder="250000"
          hint="Numbers only, e.g. 250000"
        />
      </FieldRow>

      <FieldRow
        label="Target level"
        help="Title or level band, e.g. L6, Staff, Director."
        last={geos.length === 0}
      >
        <Input
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="L6, Staff, Director"
        />
      </FieldRow>

      {geos.length > 0 && (
        <FieldRow
          label="Geography equivalence"
          help="Select your reference city — see what equivalent comp looks like in your other preferred geographies."
          last
        >
          <div className="space-y-4">
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--ink-3)", marginBottom: 5 }}>
                Reference city
              </label>
              <select
                value={baseGeo}
                onChange={(e) => setBaseGeo(e.target.value)}
                style={{
                  height: "var(--field-h)",
                  padding: "0 28px 0 10px",
                  fontSize: 13,
                  background: "var(--bg-elev)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  color: "var(--ink)",
                  outline: "none",
                  transition: "border-color 120ms ease",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23737373'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                  minWidth: 200,
                  cursor: "pointer",
                } as React.CSSProperties}
              >
                {geos.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {baseTotal && otherGeos.length > 0 && (
              <div className="space-y-2">
                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-3)" }}>
                  To match {formatCompact(baseTotal)} in {baseGeo || "your reference city"}:
                </p>

                {ratiosLoading && (
                  <p style={{ fontSize: 13, color: "var(--ink-4)" }}>Loading…</p>
                )}

                {ratiosError && (
                  <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
                    Could not load equivalence data. Try refreshing.
                  </p>
                )}

                {!ratiosLoading && !ratiosError && otherGeos.map((city) => {
                  const result = ratios[city];
                  const equiv = result ? Math.round(baseTotal * result.ratio) : null;
                  return (
                    <div
                      key={city}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 12px",
                        background: "var(--bg-sub)",
                        border: "1px solid var(--line-2)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      <span style={{ fontSize: 13, color: "var(--ink)" }}>{city}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                        {equiv != null ? formatCompact(equiv) : "—"}
                      </span>
                    </div>
                  );
                })}

                {!ratiosLoading && !ratiosError && Object.keys(ratios).length > 0 && (
                  <p style={{ fontSize: 11.5, color: "var(--ink-4)", lineHeight: 1.5 }}>
                    {sourceAttribution()}
                  </p>
                )}
              </div>
            )}

            {geos.length <= 1 && (
              <p style={{ fontSize: 12.5, color: "var(--ink-4)" }}>
                Add more cities in the Preferred Geographies tab to see equivalence calculations.
              </p>
            )}
          </div>
        </FieldRow>
      )}

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
