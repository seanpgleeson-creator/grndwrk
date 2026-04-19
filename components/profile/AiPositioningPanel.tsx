"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface AiPositioningPanelProps {
  open: boolean;
  onClose: () => void;
  onUse: (draft: string) => void;
  currentStatement?: string;
  // Context silently passed to the AI
  resumeRaw?: string;
  targetRoles?: string[];
  targetStages?: string[];
  geography?: string;
}

type PanelView = "prompts" | "loading" | "draft" | "error";

const PROMPTS = [
  {
    id: "distinctly_good_at" as const,
    label: "What are you most distinctly good at?",
    placeholder: "e.g. building 0-to-1 products in ambiguous environments, or leading technical teams through platform migrations",
  },
  {
    id: "problems" as const,
    label: "What kinds of problems do you want to solve next?",
    placeholder: "e.g. scaling marketplace infrastructure, or turning messy research into clear product strategy",
  },
  {
    id: "missed" as const,
    label: "What's one thing most resumes miss about you?",
    placeholder: "e.g. I've shipped code, not just managed engineers — or I've built the business case, not just the product",
  },
];

export function AiPositioningPanel({
  open,
  onClose,
  onUse,
  currentStatement,
  resumeRaw,
  targetRoles,
  targetStages,
  geography,
}: AiPositioningPanelProps) {
  const [view, setView] = useState<PanelView>("prompts");
  const [answers, setAnswers] = useState({
    distinctly_good_at: "",
    problems: "",
    missed: "",
  });
  const [draft, setDraft] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmReplace, setConfirmReplace] = useState(false);

  // Reset state when panel opens
  useEffect(() => {
    if (open) {
      setView("prompts");
      setDraft("");
      setErrorMsg("");
      setConfirmReplace(false);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const hasAnyAnswer =
    answers.distinctly_good_at.trim() ||
    answers.problems.trim() ||
    answers.missed.trim() ||
    resumeRaw?.trim();

  const callDraft = useCallback(async () => {
    setView("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile/positioning/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: {
            distinctly_good_at: answers.distinctly_good_at || undefined,
            problems: answers.problems || undefined,
            missed: answers.missed || undefined,
          },
          resume_raw: resumeRaw || undefined,
          target_roles: targetRoles?.length ? targetRoles : undefined,
          target_stages: targetStages?.length ? targetStages : undefined,
          geography: geography || undefined,
        }),
      });

      const json = (await res.json()) as {
        data?: { statement: string };
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(json.message ?? "Something went wrong. Try again.");
      }

      setDraft(json.data?.statement ?? "");
      setView("draft");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Draft failed. Try again.");
      setView("error");
    }
  }, [answers, resumeRaw, targetRoles, targetStages, geography]);

  function handleUse() {
    if (currentStatement?.trim() && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }
    onUse(draft);
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 transition-opacity duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Help me write with AI"
        className={cn(
          "fixed right-0 top-0 h-full z-50 w-full sm:w-[440px]",
          "bg-[var(--surface)] border-l border-[var(--border)]",
          "flex flex-col shadow-sm",
          "transition-transform duration-200 ease-out",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" strokeWidth={1.5} />
            <span className="text-[13px] font-semibold tracking-[0.06em] uppercase text-[var(--foreground)]">
              Help me write with AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-150 p-1"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {view === "prompts" && (
            <div className="space-y-6">
              <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
                Answer one or more questions below. The AI will draft a positioning statement using your answers and any profile context you&apos;ve already entered.
              </p>

              {PROMPTS.map((prompt) => (
                <div key={prompt.id} className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[var(--foreground)]">
                    {prompt.label}
                  </label>
                  <textarea
                    value={answers[prompt.id]}
                    onChange={(e) =>
                      setAnswers((prev) => ({ ...prev, [prompt.id]: e.target.value }))
                    }
                    placeholder={prompt.placeholder}
                    rows={3}
                    className={cn(
                      "w-full rounded-md border bg-[var(--surface-raised)] border-[var(--border)]",
                      "px-3 py-2.5 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted)]",
                      "focus:outline-none focus:ring-0 focus:border-[var(--accent)]",
                      "resize-y min-h-[80px] transition-colors duration-150",
                    )}
                  />
                </div>
              ))}

              {resumeRaw?.trim() && (
                <p className="text-[12px] text-[var(--muted)] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] shrink-0" />
                  Resume included for richer context
                </p>
              )}
            </div>
          )}

          {view === "loading" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[240px] gap-4">
              <svg
                className="animate-spin h-6 w-6 text-[var(--accent)]"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-[13px] text-[var(--muted)]">Drafting your statement…</p>
            </div>
          )}

          {view === "draft" && (
            <div className="space-y-5">
              <p className="text-[13px] text-[var(--muted)]">
                Here&apos;s a draft based on your answers. Use it as-is or as a starting point.
              </p>
              <div className="rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-4 py-4">
                <p className="text-[14px] leading-[1.75] text-[var(--foreground)]">{draft}</p>
              </div>

              {confirmReplace && (
                <p className="text-[12px] text-[var(--warning)] bg-[var(--warning)]/10 border border-[var(--warning)]/25 rounded-md px-3 py-2.5">
                  This will replace your current statement. Click &quot;Use this draft&quot; again to confirm.
                </p>
              )}
            </div>
          )}

          {view === "error" && (
            <div className="space-y-4">
              <div className="rounded-md border border-[var(--danger)]/25 bg-[var(--danger)]/5 px-4 py-3">
                <p className="text-[13px] text-[var(--danger)]">{errorMsg}</p>
              </div>
              <button
                onClick={() => setView("prompts")}
                className="text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                ← Back to questions
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
          {view === "prompts" && (
            <>
              <button
                onClick={onClose}
                className="text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Discard
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={callDraft}
                disabled={!hasAnyAnswer}
              >
                Draft my statement
              </Button>
            </>
          )}

          {view === "draft" && (
            <>
              <button
                onClick={() => {
                  setConfirmReplace(false);
                  setView("prompts");
                }}
                className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Discard
                </button>
                <Button variant="primary" size="sm" onClick={handleUse}>
                  Use this draft
                </Button>
              </div>
            </>
          )}

          {view === "error" && (
            <>
              <button
                onClick={onClose}
                className="text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Discard
              </button>
              <Button variant="secondary" size="sm" onClick={callDraft}>
                Retry
              </Button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
