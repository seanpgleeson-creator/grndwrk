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
    <div className="flex items-start gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <svg
        className="h-4 w-4 text-amber-400 mt-0.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-300">Narrative consistency warning</p>
        <p className="mt-0.5 text-xs text-amber-400/80">{explanation}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400/60 hover:text-amber-400 shrink-0"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
