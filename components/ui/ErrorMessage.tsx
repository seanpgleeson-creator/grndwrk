"use client";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 rounded-[var(--radius)] border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/40">
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-red-500"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 5v3.5M8 10.5v.5" />
      </svg>
      <div className="flex-1">
        <p className="text-[13px] text-[var(--ink)]">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] underline shrink-0 transition-colors duration-[120ms]"
        >
          Retry
        </button>
      )}
    </div>
  );
}
