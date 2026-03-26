"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConsistencyBannerProps {
  score: number;
  explanation: string;
}

export function ConsistencyBanner({ score, explanation }: ConsistencyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || score >= 3) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-3">
      <AlertTriangle className="h-4 w-4 text-[var(--warning)] mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-[13px] font-medium text-[var(--foreground)]">Narrative consistency warning</p>
        <p className="mt-0.5 text-[12px] text-[var(--muted)]">{explanation}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss warning"
        className="text-[var(--muted)] hover:text-[var(--foreground)] shrink-0 transition-colors duration-150"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
