"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/nav/ThemeToggle";

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
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[200px] border-r border-[var(--border)] bg-[var(--sidebar)] flex-col z-30 transition-colors duration-150">
        <div className="px-5 py-5">
          <span className="text-lg tracking-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
            grndwrk
          </span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {STEP_LABELS.slice(0, totalSteps).map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isComplete = stepNum < currentStep;

            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors duration-150",
                  isActive && "bg-[var(--surface-raised)] text-[var(--accent)]",
                  isComplete && "text-[var(--foreground)]",
                  !isActive && !isComplete && "text-[var(--muted)]",
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center h-5 w-5 rounded-full text-[11px] font-medium shrink-0 border transition-colors duration-150",
                    isActive && "border-[var(--accent)] text-[var(--accent)]",
                    isComplete && "border-[var(--accent)] bg-[var(--accent)] text-white",
                    !isActive && !isComplete && "border-[var(--border)] text-[var(--muted)]",
                  )}
                >
                  {isComplete ? <Check className="h-3 w-3" /> : stepNum}
                </span>
                <span>{label}</span>
              </div>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-[var(--border)]">
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile: step progress bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[var(--sidebar)] border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm tracking-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
            grndwrk
          </span>
          <span className="text-xs text-[var(--muted)]">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        <div className="h-0.5 w-full bg-[var(--border)] rounded-full">
          <div
            className="h-0.5 bg-[var(--accent)] rounded-full transition-[width] duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main content — inline margin ensures sidebar never overlaps regardless of Tailwind JIT */}
      <main
        className="px-6 py-6 lg:px-14 lg:py-10 pt-[72px] lg:pt-10"
        style={{ marginLeft: "var(--sidebar-offset, 0px)" }}
      >
        <div className="max-w-[680px]">
          <div className="mb-8">
            <h2 className="text-[28px] leading-tight font-normal text-[var(--foreground)] [font-family:var(--font-heading),serif]">
              {title}
            </h2>
            {description && (
              <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">{description}</p>
            )}
          </div>

          <div className="space-y-6">{children}</div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--border)]">
            <button
              onClick={onBack}
              disabled={currentStep === 1}
              className="min-h-[44px] px-3 text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
            >
              ← Back
            </button>

            {isLastStep ? (
              <button
                onClick={onSubmit}
                disabled={submitting || nextDisabled}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
