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
  "Positioning",
  "Target roles",
  "Where",
  "Resume",
  "Pillars",
  "CMF weights",
  "Comp targets",
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
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] border-r border-[var(--border)] bg-[var(--sidebar)] flex-col z-30 transition-colors duration-150">
        <div className="px-6 py-6">
          <span className="text-lg tracking-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
            grndwrk
          </span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
          {STEP_LABELS.slice(0, totalSteps).map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === currentStep;
            const isComplete = stepNum < currentStep;
            const isFuture = stepNum > currentStep;

            return (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-150",
                  isActive && "bg-[var(--surface-raised)]",
                )}
              >
                {/* Step indicator */}
                <span
                  className={cn(
                    "flex items-center justify-center h-5 w-5 rounded-full shrink-0 border transition-colors duration-150",
                    isActive && "border-[var(--accent)] text-[var(--accent)]",
                    isComplete && "border-[var(--accent)] bg-[var(--accent)] text-white",
                    isFuture && "border-[var(--border)] text-[var(--muted)]",
                    isActive ? "text-[11px] font-semibold" : "text-[10px] font-medium",
                  )}
                >
                  {isComplete ? <Check className="h-3 w-3" /> : stepNum}
                </span>

                {/* Label */}
                <span
                  className={cn(
                    "transition-colors duration-150",
                    isActive && "text-[var(--foreground)] text-[13px] font-medium",
                    isComplete && "text-[var(--foreground)] text-[12px]",
                    isFuture && "text-[var(--muted)] text-[12px]",
                  )}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-[var(--border)]">
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile: step progress bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-[var(--sidebar)] border-b border-[var(--border)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm tracking-tight text-[var(--foreground)] [font-family:var(--font-heading),serif]">
            grndwrk
          </span>
          <span className="text-[12px] text-[var(--muted)]">
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

      {/* Main content */}
      <main
        className="px-6 py-8 lg:px-20 lg:py-16 pt-[72px] lg:pt-16"
        style={{ marginLeft: "var(--sidebar-offset, 0px)" }}
      >
        <div className="max-w-[520px]">
          {/* Step header */}
          <div className="mb-12">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--muted)] mb-3">
              Step {currentStep} of {totalSteps}
            </p>
            <h2 className="text-[30px] leading-[1.2] font-normal text-[var(--foreground)] [font-family:var(--font-heading),serif]">
              {title}
            </h2>
            {description && (
              <p className="mt-4 text-[14px] leading-[1.7] text-[var(--muted)]">{description}</p>
            )}
          </div>

          <div className="space-y-6">{children}</div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-14 pt-6 border-t border-[var(--border)]">
            <button
              onClick={onBack}
              disabled={currentStep === 1}
              className="min-h-[44px] px-3 text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-0 disabled:pointer-events-none transition-colors duration-150"
            >
              ← Back
            </button>

            {isLastStep ? (
              <button
                onClick={onSubmit}
                disabled={submitting || nextDisabled}
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-md bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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
