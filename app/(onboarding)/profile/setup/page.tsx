"use client";

import { useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/onboarding/WizardShell";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { CmfWeightSliders, type CmfWeights } from "@/components/profile/CmfWeightSliders";
import { AiPositioningPanel } from "@/components/profile/AiPositioningPanel";
import { completeOnboarding } from "@/app/actions/profile";

type WizardState = {
  step: number;
  positioning_statement: string;
  target_roles: string;
  target_stages: string;
  geography: string;
  resume_raw: string;
  narrative_pillars: string[];
  cmf_weights: CmfWeights;
  base_target: string;
  total_target: string;
  minimum: string;
  level: string;
};

type WizardAction =
  | { type: "SET_FIELD"; field: string; value: string }
  | { type: "SET_PILLAR"; index: number; value: string }
  | { type: "ADD_PILLAR" }
  | { type: "REMOVE_PILLAR"; index: number }
  | { type: "SET_CMF_WEIGHTS"; weights: CmfWeights }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" };

const DEFAULT_WEIGHTS: CmfWeights = {
  domain: 30,
  stage: 20,
  scope: 20,
  strategic: 20,
  narrative: 10,
};

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_PILLAR": {
      const pillars = [...state.narrative_pillars];
      pillars[action.index] = action.value;
      return { ...state, narrative_pillars: pillars };
    }
    case "ADD_PILLAR":
      if (state.narrative_pillars.length >= 5) return state;
      return { ...state, narrative_pillars: [...state.narrative_pillars, ""] };
    case "REMOVE_PILLAR": {
      const pillars = state.narrative_pillars.filter((_, i) => i !== action.index);
      return { ...state, narrative_pillars: pillars };
    }
    case "SET_CMF_WEIGHTS":
      return { ...state, cmf_weights: action.weights };
    case "NEXT_STEP":
      return { ...state, step: Math.min(state.step + 1, TOTAL_STEPS) };
    case "PREV_STEP":
      return { ...state, step: Math.max(state.step - 1, 1) };
    default:
      return state;
  }
}

const TOTAL_STEPS = 7;

const initialState: WizardState = {
  step: 1,
  positioning_statement: "",
  target_roles: "",
  target_stages: "",
  geography: "",
  resume_raw: "",
  narrative_pillars: ["", ""],
  cmf_weights: DEFAULT_WEIGHTS,
  base_target: "",
  total_target: "",
  minimum: "",
  level: "",
};

const STEP_CONFIG = [
  {
    label: "Positioning",
    title: "Your positioning statement",
    description: "Your north star. The answer to: why would the right company be lucky to have you?",
  },
  {
    label: "Target roles",
    title: "What roles are you targeting?",
    description: "Be specific — these anchor your CMF scores and generated content throughout the app.",
  },
  {
    label: "Where",
    title: "Stages and location",
    description: "Company stage and geography help grndwrk surface the right opportunities.",
  },
  {
    label: "Resume",
    title: "Paste your resume",
    description: "Optional — used to parse structured experience for CMF scoring and richer AI output.",
  },
  {
    label: "Pillars",
    title: "Define your narrative pillars",
    description: "2–5 recurring themes that your story should always reinforce. These anchor every piece of AI-generated content.",
  },
  {
    label: "CMF weights",
    title: "Set your CMF weights",
    description: "How much does each dimension matter to you? These shape your fit scores across every opportunity.",
  },
  {
    label: "Comp targets",
    title: "Set compensation targets",
    description: "Optional — set targets to see how opportunities compare at a glance.",
  },
];

export default function SetupPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const router = useRouter();

  const stepConfig = STEP_CONFIG[state.step - 1];

  const step1Valid = state.positioning_statement.trim().length > 10;
  const step2Valid = state.target_roles.trim().length > 0;
  const step5Valid =
    state.narrative_pillars.filter((p) => p.trim().length > 0).length >= 2;

  const isNextDisabled =
    (state.step === 1 && !step1Valid) ||
    (state.step === 2 && !step2Valid) ||
    (state.step === 5 && !step5Valid);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await completeOnboarding({
        positioning_statement: state.positioning_statement,
        narrative_pillars: state.narrative_pillars.filter((p) => p.trim()),
        target_roles: state.target_roles
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        target_stages: state.target_stages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        geography: state.geography || undefined,
        resume_raw: state.resume_raw || undefined,
        cmf_weights: state.cmf_weights,
        comp_target:
          state.base_target || state.total_target || state.minimum || state.level
            ? {
                base_target: state.base_target ? Number(state.base_target) : undefined,
                total_target: state.total_target ? Number(state.total_target) : undefined,
                minimum: state.minimum ? Number(state.minimum) : undefined,
                level: state.level || undefined,
              }
            : undefined,
      });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const parsedRoles = state.target_roles
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);
  const parsedStages = state.target_stages
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <WizardShell
        currentStep={state.step}
        totalSteps={TOTAL_STEPS}
        title={stepConfig.title}
        description={stepConfig.description}
        onBack={() => dispatch({ type: "PREV_STEP" })}
        onNext={() => dispatch({ type: "NEXT_STEP" })}
        onSubmit={handleSubmit}
        nextDisabled={isNextDisabled}
        isLastStep={state.step === TOTAL_STEPS}
        submitting={submitting}
      >
        {/* Step 1: Positioning statement */}
        {state.step === 1 && (
          <div className="space-y-3">
            <Textarea
              value={state.positioning_statement}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "positioning_statement", value: e.target.value })
              }
              placeholder="e.g. Product leader with 8+ years building marketplace products at Series B–D companies, known for turning ambiguous problems into scalable systems that drive measurable revenue outcomes."
              rows={5}
              className="min-h-[140px]"
            />
            <button
              type="button"
              onClick={() => setAiPanelOpen(true)}
              className="flex items-center gap-1.5 text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors duration-150"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a.5.5 0 0 1 .5.5v1.793l1.146-1.147a.5.5 0 0 1 .708.708L9.207 4l1.147 1.146a.5.5 0 0 1-.708.708L8.5 4.707V6.5a.5.5 0 0 1-1 0V4.707L6.354 5.854a.5.5 0 1 1-.708-.708L6.793 4 5.646 2.854a.5.5 0 1 1 .708-.708L7.5 3.293V1.5A.5.5 0 0 1 8 1zM2.5 8a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0z" />
              </svg>
              Help me write with AI
            </button>
            <p className="text-[12px] text-[var(--muted)]">
              Describe who you are, what you do, and what makes you distinctive. This is your north star — every module in grndwrk builds from it.
            </p>
          </div>
        )}

        {/* Step 2: Target roles */}
        {state.step === 2 && (
          <Input
            label="Target roles *"
            value={state.target_roles}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "target_roles", value: e.target.value })
            }
            placeholder="Principal PM, Director of Product, Head of Product"
            hint="Comma-separated list of role titles you're targeting"
          />
        )}

        {/* Step 3: Stages + Geography */}
        {state.step === 3 && (
          <div className="space-y-6">
            <Input
              label="Target company stages"
              value={state.target_stages}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "target_stages", value: e.target.value })
              }
              placeholder="Series B, Series C, Public"
              hint="Comma-separated list of preferred company stages"
            />
            <Input
              label="Geography"
              value={state.geography}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "geography", value: e.target.value })
              }
              placeholder="San Francisco Bay Area, Remote"
            />
          </div>
        )}

        {/* Step 4: Resume */}
        {state.step === 4 && (
          <div className="space-y-4">
            <Textarea
              label="Resume text"
              value={state.resume_raw}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "resume_raw", value: e.target.value })
              }
              placeholder="Paste your full resume here..."
              rows={12}
              className="min-h-[280px]"
            />
            <p className="text-[12px] text-[var(--muted)]">
              Pasting your resume unlocks richer AI output — better positioning drafts, more precise CMF analysis, and stronger cover letters. You can skip this and add it later from your profile.
            </p>
            {!state.resume_raw.trim() && (
              <button
                type="button"
                onClick={() => dispatch({ type: "NEXT_STEP" })}
                className="text-[13px] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Skip for now →
              </button>
            )}
          </div>
        )}

        {/* Step 5: Narrative pillars */}
        {state.step === 5 && (
          <div className="space-y-4">
            <p className="text-[13px] text-[var(--muted)] leading-relaxed">
              Enter 2–5 narrative pillars. These are the recurring themes that define your professional identity and anchor all AI-generated content.
            </p>
            {state.narrative_pillars.map((pillar, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    label={`Pillar ${i + 1}`}
                    value={pillar}
                    onChange={(e) =>
                      dispatch({ type: "SET_PILLAR", index: i, value: e.target.value })
                    }
                    placeholder={`e.g. "Systems thinker who builds for scale"`}
                  />
                </div>
                {state.narrative_pillars.length > 2 && (
                  <button
                    onClick={() => dispatch({ type: "REMOVE_PILLAR", index: i })}
                    className="mt-8 text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                    aria-label={`Remove pillar ${i + 1}`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {state.narrative_pillars.length < 5 && (
              <button
                onClick={() => dispatch({ type: "ADD_PILLAR" })}
                className="text-[13px] text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                + Add pillar
              </button>
            )}
          </div>
        )}

        {/* Step 6: CMF weights */}
        {state.step === 6 && (
          <CmfWeightSliders
            value={state.cmf_weights}
            onChange={(weights) => dispatch({ type: "SET_CMF_WEIGHTS", weights })}
          />
        )}

        {/* Step 7: Comp targets */}
        {state.step === 7 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Base salary target ($)"
                type="number"
                value={state.base_target}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", field: "base_target", value: e.target.value })
                }
                placeholder="200000"
              />
              <Input
                label="Total comp target ($)"
                type="number"
                value={state.total_target}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", field: "total_target", value: e.target.value })
                }
                placeholder="300000"
              />
            </div>
            <Input
              label="Minimum acceptable total comp ($)"
              type="number"
              value={state.minimum}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "minimum", value: e.target.value })
              }
              placeholder="250000"
            />
            <Input
              label="Target level"
              value={state.level}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "level", value: e.target.value })
              }
              placeholder="L6, Staff, Director"
            />
            {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
          </>
        )}
      </WizardShell>

      <AiPositioningPanel
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        onUse={(draft) =>
          dispatch({ type: "SET_FIELD", field: "positioning_statement", value: draft })
        }
        currentStatement={state.positioning_statement}
        resumeRaw={state.resume_raw}
        targetRoles={parsedRoles}
        targetStages={parsedStages}
        geography={state.geography}
      />
    </>
  );
}
