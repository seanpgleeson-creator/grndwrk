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
  domain: "bg-indigo-500",
  stage: "bg-violet-500",
  scope: "bg-blue-500",
  strategic: "bg-cyan-500",
  narrative: "bg-teal-500",
};

interface CmfWeightSlidersProps {
  value: CmfWeights;
  onChange: (weights: CmfWeights) => void;
}

export function CmfWeightSliders({ value, onChange }: CmfWeightSlidersProps) {
  const sum = Object.values(value).reduce((a, b) => a + b, 0);

  function handleChange(key: keyof CmfWeights, newVal: number) {
    const clamped = Math.max(5, Math.min(60, newVal));
    const delta = clamped - value[key];
    if (delta === 0) return;

    const others = DIMENSIONS.map((d) => d.key).filter((k) => k !== key);
    const othersTotal = others.reduce((s, k) => s + value[k], 0);

    const newWeights = { ...value, [key]: clamped };

    if (othersTotal > 0) {
      let remaining = -delta;
      for (let i = 0; i < others.length; i++) {
        const k = others[i];
        const proportion = value[k] / othersTotal;
        const adj = i === others.length - 1
          ? remaining
          : Math.round(proportion * -delta);
        const newV = Math.max(5, value[k] + adj);
        remaining -= newV - value[k];
        newWeights[k] = newV;
      }
    }

    // Ensure sum is exactly 100
    const newSum = Object.values(newWeights).reduce((a, b) => a + b, 0);
    if (newSum !== 100) {
      const diff = 100 - newSum;
      const adjustKey = others.find((k) => newWeights[k] + diff >= 5) ?? others[0];
      newWeights[adjustKey] = Math.max(5, newWeights[adjustKey] + diff);
    }

    onChange(newWeights);
  }

  return (
    <div className="space-y-4">
      {DIMENSIONS.map((dim) => (
        <div key={dim.key} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-[var(--foreground)]">{dim.label}</span>
              <span className="ml-2 text-xs text-[var(--muted)]">{dim.description}</span>
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)] w-8 text-right">
              {value[dim.key]}%
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            value={value[dim.key]}
            onChange={(e) => handleChange(dim.key, Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-[var(--surface-raised)] accent-indigo-500 cursor-pointer"
          />
        </div>
      ))}

      {/* Stacked bar */}
      <div className="mt-4">
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          {DIMENSIONS.map((dim) => (
            <div
              key={dim.key}
              className={cn("transition-all", DIM_COLORS[dim.key])}
              style={{ width: `${value[dim.key]}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-3">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key} className="flex items-center gap-1">
                <div className={cn("h-2 w-2 rounded-full", DIM_COLORS[dim.key])} />
                <span className="text-xs text-[var(--muted)]">{dim.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              sum === 100 ? "text-green-400" : "text-red-400",
            )}
          >
            Total: {sum} / 100
          </span>
        </div>
      </div>
    </div>
  );
}
