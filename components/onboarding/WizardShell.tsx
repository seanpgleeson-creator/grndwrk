"use client";

import { cn } from "@/lib/utils";

interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  nextDisabled?: boolean;
  isLastStep?: boolean;
  submitting?: boolean;
}

const STEP_LABELS = [
  "Core Profile",
  "Narrative Pillars",
  "CMF Weights",
  "Comp Targets",
];

export function WizardShell({
  currentStep,
  totalSteps,
  title,
  description,
  children,
  onBack,
  onNext,
  onSubmit,
  nextDisabled,
  isLastStep,
  submitting,
}: WizardShellProps) {
  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center gap-2 justify-center mb-1">
          <div className="h-7 w-7 rounded-md bg-[var(--accent)] flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          <span className="font-semibold text-[var(--foreground)]">grndwrk</span>
        </div>
        <p className="text-xs text-[var(--muted)] mt-2">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div
              className={cn(
                "flex-1 h-1 rounded-full transition-colors",
                i + 1 <= currentStep
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--surface-raised)]",
              )}
            />
          </div>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex justify-between mb-6">
        {STEP_LABELS.map((label, i) => (
          <span
            key={i}
            className={cn(
              "text-xs",
              i + 1 === currentStep
                ? "text-[var(--accent)]"
                : i + 1 < currentStep
                  ? "text-[var(--muted)]"
                  : "text-[var(--border)]",
            )}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
          )}
        </div>

        <div className="space-y-6">{children}</div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border)]">
          <button
            onClick={onBack}
            disabled={currentStep === 1}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Back
          </button>

          {isLastStep ? (
            <button
              onClick={onSubmit}
              disabled={submitting || nextDisabled}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting && (
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Launch grndwrk →
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
