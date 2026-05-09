"use client";

import { useState, useEffect, useCallback } from "react";
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
          "bg-[var(--bg-elev)] border-l border-[var(--line)]",
          "flex flex-col shadow-sm",
          "transition-transform duration-200 ease-out",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <svg width={14} height={14} viewBox="0 0 16 16" fill="currentColor" className="text-[var(--ink)]" aria-hidden="true">
              <path d="M8 1a.5.5 0 0 1 .5.5v1.793l1.146-1.147a.5.5 0 0 1 .708.708L9.207 4l1.147 1.146a.5.5 0 0 1-.708.708L8.5 4.707V6.5a.5.5 0 0 1-1 0V4.707L6.354 5.854a.5.5 0 1 1-.708-.708L6.793 4 5.646 2.854a.5.5 0 1 1 .708-.708L7.5 3.293V1.5A.5.5 0 0 1 8 1zM2.5 8a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0z" />
            </svg>
            <span className="[font-family:var(--font-mono)] text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--ink)]">
              Help me write with AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors duration-150 p-1"
            aria-label="Close panel"
          >
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
              <path d="M3 3l10 10M13 3 3 13" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {view === "prompts" && (
            <div className="space-y-6">
              <p className="text-[13px] leading-[1.65] text-[var(--ink-3)]">
                Answer one or more questions below. The AI will draft a positioning statement using your answers and any profile context you&apos;ve already entered.
              </p>

              {PROMPTS.map((prompt) => (
                <div key={prompt.id} className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-[var(--ink)]">
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
                      "w-full rounded-md border bg-[var(--bg-sub)] border-[var(--line)]",
                      "px-3 py-2.5 text-[14px] text-[var(--ink)] placeholder:text-[var(--ink-4)]",
                      "focus:outline-none focus:border-[var(--ink-4)]",
                      "focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_18%,transparent)]",
                      "resize-y min-h-[80px] transition-[border-color,box-shadow] duration-[120ms]",
                    )}
                  />
                </div>
              ))}

              {resumeRaw?.trim() && (
                <p className="text-[12px] text-[var(--ink-3)] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)] shrink-0" />
                  Resume included for richer context
                </p>
              )}
            </div>
          )}

          {view === "loading" && (
            <div className="flex flex-col items-center justify-center h-full min-h-[240px] gap-4">
              <svg
                className="animate-spin h-6 w-6 text-[var(--ink)]"
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
              <p className="text-[13px] text-[var(--ink-3)]">Drafting your statement…</p>
            </div>
          )}

          {view === "draft" && (
            <div className="space-y-5">
              <p className="text-[13px] text-[var(--ink-3)]">
                Here&apos;s a draft based on your answers. Use it as-is or as a starting point.
              </p>
              <div className="rounded-md border-l-2 border-[var(--line)] bg-[var(--bg-sub)] pl-4 pr-4 py-4">
                <p className="text-[14px] leading-[1.75] text-[var(--ink)]">{draft}</p>
              </div>

              {confirmReplace && (
                <p className="text-[12px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md px-3 py-2.5">
                  This will replace your current statement. Click &quot;Use this draft&quot; again to confirm.
                </p>
              )}
            </div>
          )}

          {view === "error" && (
            <div className="space-y-4">
              <div className="rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3">
                <p className="text-[13px] text-red-700 dark:text-red-400">{errorMsg}</p>
              </div>
              <button
                onClick={() => setView("prompts")}
                className="text-[13px] text-[var(--ink)] hover:text-[var(--ink-2)] transition-colors"
              >
                ← Back to questions
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
          {view === "prompts" && (
            <>
              <button
                onClick={onClose}
                className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
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
                className="flex items-center gap-1.5 text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
              >
                <svg width={13} height={13} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" />
                  <path d="M8 1v3.5L10.5 2" />
                </svg>
                Regenerate
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
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
                className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
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
