"use client";

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
  const progressPct = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-3">
          <span className="font-medium text-[var(--foreground)] text-lg tracking-tight [font-family:var(--font-heading),serif]">
            grndwrk
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Step indicators */}
      <div className="mb-8">
        <div className="h-px w-full bg-[var(--border)]">
          <div
            className="h-px bg-[var(--accent)] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-[2rem] leading-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-[15px] leading-6 text-[var(--muted)]">{description}</p>
        )}
      </div>

      <div className="space-y-7">{children}</div>

      <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--border)]">
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
  );
}
