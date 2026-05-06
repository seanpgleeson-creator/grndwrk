"use client";

import { useState } from "react";

interface ConsistencyBannerProps {
  score: number;
  explanation: string;
}

export function ConsistencyBanner({ score, explanation }: ConsistencyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || score >= 3) return null;

  return (
    <div className="flex items-start gap-3 rounded-[var(--radius)] border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
        aria-hidden="true"
      >
        <path d="M8 2 1.5 13.5h13L8 2zM8 6.5v3M8 11.5v.5" />
      </svg>
      <div className="flex-1">
        <p className="text-[13px] font-medium text-[var(--ink)]">Narrative consistency warning</p>
        <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">{explanation}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss warning"
        className="text-[var(--ink-3)] hover:text-[var(--ink)] shrink-0 transition-colors duration-[120ms] p-0.5 rounded"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
          <path d="M3 3l10 10M13 3 3 13" />
        </svg>
      </button>
    </div>
  );
}
