"use client";

import { useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardShell } from "@/components/onboarding/WizardShell";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CmfWeightSliders, type CmfWeights } from "@/components/profile/CmfWeightSliders";
import { completeOnboarding } from "@/app/actions/profile";

type WizardState = {
  step: number;
  // Step 1
  positioning_statement: string;
  target_roles: string;
  target_stages: string;
  geography: string;
  resume_raw: string;
  // Step 2
  narrative_pillars: string[];
  // Step 3
  cmf_weights: CmfWeights;
  // Step 4
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
      return { ...state, step: Math.min(state.step + 1, 4) };
    case "PREV_STEP":
      return { ...state, step: Math.max(state.step - 1, 1) };
    default:
      return state;
  }
}

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

export default function SetupPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const step1Valid =
    state.positioning_statement.trim().length > 10 &&
    state.target_roles.trim().length > 0;

  const step2Valid =
    state.narrative_pillars.filter((p) => p.trim().length > 0).length >= 2;

  const isNextDisabled =
    (state.step === 1 && !step1Valid) || (state.step === 2 && !step2Valid);

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

  return (
    <WizardShell
      currentStep={state.step}
      totalSteps={4}
      title={
        state.step === 1
          ? "Build your positioning foundation"
          : state.step === 2
            ? "Define your narrative pillars"
            : state.step === 3
              ? "Set your CMF weights"
              : "Set compensation targets"
      }
      description={
        state.step === 1
          ? "Your positioning statement and target roles power every module in grndwrk."
          : state.step === 2
            ? "2–5 core themes that run through your career story. These anchor all AI-generated content."
            : state.step === 3
              ? "How much does each dimension matter to you? These weights shape your CMF scores."
              : "Optional — set targets to see how opportunities compare."
      }
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      onSubmit={handleSubmit}
      nextDisabled={isNextDisabled}
      isLastStep={state.step === 4}
      submitting={submitting}
    >
      {state.step === 1 && (
        <>
          <Textarea
            label="Positioning statement *"
            value={state.positioning_statement}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "positioning_statement", value: e.target.value })
            }
            placeholder="e.g. Product leader with 8+ years building marketplace products at Series B–D companies, known for turning ambiguous problems into scalable systems..."
            rows={4}
            className="min-h-[140px]"
            hint="Describe who you are, what you do, and what makes you distinctive. This is your north star."
          />
          <Input
            label="Target roles *"
            value={state.target_roles}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "target_roles", value: e.target.value })
            }
            placeholder="Principal PM, Director of Product, Head of Product"
            hint="Comma-separated list of role titles you're targeting"
          />
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
          <Textarea
            label="Resume (optional)"
            value={state.resume_raw}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "resume_raw", value: e.target.value })
            }
            placeholder="Paste your resume text here. AI parsing will be available in Phase 2."
            rows={6}
            className="min-h-[180px]"
          />
        </>
      )}

      {state.step === 2 && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--muted)]">
            Enter 2–5 narrative pillars. These are the recurring themes that define your professional identity.
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
                  placeholder={`Pillar ${i + 1}: e.g. "Systems thinker who builds for scale"`}
                />
              </div>
              {state.narrative_pillars.length > 2 && (
                <button
                  onClick={() => dispatch({ type: "REMOVE_PILLAR", index: i })}
                  className="mt-8 text-[var(--muted)] hover:text-red-600 transition-colors"
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
              className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
            >
              + Add pillar
            </button>
          )}
        </div>
      )}

      {state.step === 3 && (
        <CmfWeightSliders
          value={state.cmf_weights}
          onChange={(weights) => dispatch({ type: "SET_CMF_WEIGHTS", weights })}
        />
      )}

      {state.step === 4 && (
        <>
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
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </>
      )}
    </WizardShell>
  );
}
