"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CmfWeightSliders, type CmfWeights } from "./CmfWeightSliders";
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

export function ProfileEditor({ data }: ProfileEditorProps) {
  const tabs = [
    { id: "core", label: "Core Profile" },
    { id: "resume", label: "Resume" },
    { id: "pillars", label: "Narrative Pillars" },
    { id: "cmf", label: "CMF Weights" },
    { id: "comp", label: "Comp Targets" },
  ];

  return (
    <Tabs tabs={tabs} className="px-6 pb-6">
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

function CoreProfileTab({ data }: { data: ProfileData }) {
  const [statement, setStatement] = useState(data.positioning_statement);
  const [roles, setRoles] = useState(data.target_roles.join(", "));
  const [stages, setStages] = useState(data.target_stages.join(", "));
  const [geography, setGeography] = useState(data.geography);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateProfile({
        positioning_statement: statement,
        target_roles: roles.split(",").map((r) => r.trim()).filter(Boolean),
        target_stages: stages.split(",").map((s) => s.trim()).filter(Boolean),
        geography,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Textarea
        label="Positioning statement"
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        rows={5}
        hint="Your north star — who you are, what you do, and what makes you distinctive."
      />
      <Input
        label="Target roles"
        value={roles}
        onChange={(e) => setRoles(e.target.value)}
        hint="Comma-separated"
      />
      <Input
        label="Target company stages"
        value={stages}
        onChange={(e) => setStages(e.target.value)}
        hint="Comma-separated (e.g. Series B, Series C, Public)"
      />
      <Input
        label="Geography"
        value={geography}
        onChange={(e) => setGeography(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save changes
        </Button>
        {saved && <span className="text-sm text-green-400">Saved</span>}
      </div>
    </div>
  );
}

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
    <div className="space-y-4 max-w-2xl">
      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-3">
        <p className="text-xs text-[var(--muted)]">
          Paste your resume, save, then run <strong className="text-[var(--foreground)]">Parse with AI</strong> to extract experience, skills, and education for CMF scoring.
        </p>
      </div>
      <Textarea
        label="Resume text"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        rows={20}
        placeholder="Paste your full resume here..."
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save resume
        </Button>
        <Button variant="secondary" onClick={handleParse} loading={parseLoading}>
          Parse with AI
        </Button>
        {saved && <span className="text-sm text-green-400">Saved</span>}
      </div>
      {parsedPreview != null && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs font-medium text-[var(--foreground)] mb-2">Parsed structure (preview)</p>
          <pre className="text-xs text-[var(--muted)] overflow-x-auto whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
            {JSON.stringify(parsedPreview, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

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
    <div className="space-y-4 max-w-xl">
      <p className="text-sm text-[var(--muted)]">
        2–5 recurring themes that define your professional identity. These anchor all AI-generated content.
      </p>
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
              className="text-[var(--muted)] hover:text-red-400 mt-1"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ))}
      {pillars.length < 5 && (
        <button
          onClick={() => setPillars([...pillars, ""])}
          className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)]"
        >
          + Add pillar
        </button>
      )}
      <div className="flex items-center gap-3 pt-2">
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save pillars
        </Button>
        {saved && <span className="text-sm text-green-400">Saved</span>}
      </div>
    </div>
  );
}

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
    <div className="space-y-6 max-w-xl">
      <p className="text-sm text-[var(--muted)]">
        Adjust how much each dimension matters in your CMF score calculations.
      </p>
      <CmfWeightSliders value={weights} onChange={setWeights} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save weights
        </Button>
        {saved && <span className="text-sm text-green-400">Saved</span>}
      </div>
    </div>
  );
}

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
    <div className="space-y-4 max-w-md">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Base salary target ($)"
          type="number"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          placeholder="200000"
        />
        <Input
          label="Total comp target ($)"
          type="number"
          value={total}
          onChange={(e) => setTotal(e.target.value)}
          placeholder="300000"
        />
      </div>
      <Input
        label="Minimum acceptable total comp ($)"
        type="number"
        value={minimum}
        onChange={(e) => setMinimum(e.target.value)}
        placeholder="250000"
      />
      <Input
        label="Target level"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
        placeholder="L6, Staff, Director"
      />
      <div className="flex items-center gap-3 pt-2">
        <Button variant="primary" onClick={handleSave} loading={isPending}>
          Save targets
        </Button>
        {saved && <span className="text-sm text-green-400">Saved</span>}
      </div>
    </div>
  );
}
