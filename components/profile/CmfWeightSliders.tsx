"use client";

import { cn } from "@/lib/utils";

export type CmfWeights = {
  domain: number;
  stage: number;
  scope: number;
  strategic: number;
  narrative: number;
};

const DIMENSIONS = [
  { key: "domain" as const, label: "Domain Fit", description: "Industry & functional expertise match" },
  { key: "stage" as const, label: "Stage Fit", description: "Company stage alignment" },
  { key: "scope" as const, label: "Scope Fit", description: "Role scope & seniority match" },
  { key: "strategic" as const, label: "Strategic Fit", description: "Strategic priorities alignment" },
  { key: "narrative" as const, label: "Narrative Fit", description: "Story & positioning alignment" },
];

const DIM_COLORS = {
  domain: "bg-[var(--ink)]",
  stage: "bg-[var(--ink-2)]",
  scope: "bg-[var(--ink-3)]",
  strategic: "bg-[var(--ink-4)]",
  narrative: "bg-[var(--ink-5)]",
};

interface CmfWeightSlidersProps {
  value: CmfWeights;
  onChange: (weights: CmfWeights) => void;
}

export function CmfWeightSliders({ value, onChange }: CmfWeightSlidersProps) {
  const sum = Object.values(value).reduce((a, b) => a + b, 0);

  function handleChange(key: keyof CmfWeights, newVal: number) {
    const clamped = Math.max(5, Math.min(60, newVal));
    onChange({ ...value, [key]: clamped });
  }

  return (
    <div className="space-y-4">
      {DIMENSIONS.map((dim) => (
        <div key={dim.key} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-[var(--ink)]">{dim.label}</div>
              <div className="text-xs text-[var(--ink-3)] mt-0.5">{dim.description}</div>
            </div>
            <span className="text-sm font-semibold text-[var(--ink)] w-8 text-right tabular-nums">
              {value[dim.key]}%
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            value={value[dim.key]}
            onChange={(e) => handleChange(dim.key, Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-[var(--bg-mute)] cursor-pointer"
            style={{ accentColor: "var(--accent)" }}
          />
        </div>
      ))}

      {/* Stacked bar */}
      <div className="mt-4">
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          {DIMENSIONS.map((dim) => (
            <div
              key={dim.key}
              className={cn("transition-[width] duration-200", DIM_COLORS[dim.key])}
              style={{ width: `${value[dim.key]}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-3">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="flex items-center gap-1">
                <div className={cn("h-2 w-2 rounded-full", DIM_COLORS[dim.key])} />
                <span className="text-xs text-[var(--ink-3)]">{dim.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              sum === 100
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400",
            )}
          >
            Total: {sum} / 100
          </span>
        </div>
      </div>
    </div>
  );
}
