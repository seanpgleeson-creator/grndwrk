"use client";

import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-4 py-3">
      <AlertCircle className="h-4 w-4 text-[var(--danger)] mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-[13px] text-[var(--foreground)]">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[12px] text-[var(--accent)] hover:text-[var(--accent-hover)] underline shrink-0 transition-colors duration-150"
        >
          Retry
        </button>
      )}
    </div>
  );
}
