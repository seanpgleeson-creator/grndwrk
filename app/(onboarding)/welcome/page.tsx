"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/nav/ThemeToggle";

const PHILOSOPHY = [
  {
    eyebrow: "Proactive",
    body: "The best opportunities are won before they're posted. grndwrk is built for candidates who do the work early — researching companies, building relationships, and showing up prepared before a role even exists.",
  },
  {
    eyebrow: "Positioned",
    body: "Qualifications get you in the room. Positioning gets you the role. The goal is to articulate exactly why you belong at a specific company, right now — not to prove you meet a job description.",
  },
  {
    eyebrow: "Pointed",
    body: "A deliberate search pursues fewer opportunities with more depth. grndwrk is built to help you focus — surfacing the highest-fit targets and keeping your energy where it compounds.",
  },
];

const SETUP_STEPS = [
  { step: "01", label: "Draft your positioning statement" },
  { step: "02", label: "Define your narrative pillars" },
  { step: "03", label: "Calibrate what 'fit' means to you" },
  { step: "04", label: "Set your compensation targets" },
];

export default function WelcomePage() {
  const router = useRouter();

  function handleGetStarted() {
    document.cookie = "grndwrk_welcomed=1; path=/; max-age=31536000; SameSite=Lax";
    router.push("/profile/setup");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors duration-150">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block h-6 w-6 rounded-[6px] bg-[var(--ink)]"
          />
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink)]">
            grndwrk
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Page content */}
      <main className="pt-20 pb-24 px-6">
        <div className="max-w-[600px] mx-auto">

          {/* Hero */}
          <section className="pt-12 pb-16">
            <h1 className="text-[38px] sm:text-[46px] leading-[1.1] font-semibold tracking-[-0.025em] text-[var(--ink)]">
              A command center for a deliberate job search.
            </h1>
            <p className="mt-6 text-[16px] leading-[1.75] text-[var(--ink-3)] max-w-[480px]">
              grndwrk helps you pursue the right companies with positioning, research, and timing — before the role is posted.
            </p>
          </section>

          {/* Divider */}
          <div className="border-t border-[var(--line)]" />

          {/* Philosophy */}
          <section className="py-14 space-y-10">
            {PHILOSOPHY.map((item) => (
              <div key={item.eyebrow}>
                <p className="[font-family:var(--font-mono)] text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--ink-3)] mb-3">
                  {item.eyebrow}
                </p>
                <p className="text-[15px] leading-[1.75] text-[var(--ink)]">
                  {item.body}
                </p>
              </div>
            ))}
          </section>

          {/* Divider */}
          <div className="border-t border-[var(--line)]" />

          {/* What to expect */}
          <section className="py-14">
            <p className="[font-family:var(--font-mono)] text-[11px] font-medium tracking-[0.08em] uppercase text-[var(--ink-3)] mb-8">
              What to expect
            </p>
            <p className="text-[14px] leading-[1.7] text-[var(--ink-3)] mb-8">
              Setup takes about 5 minutes. You&apos;ll build the foundation that powers every module — from company research to cover letters.
            </p>
            <div className="space-y-5">
              {SETUP_STEPS.map((item) => (
                <div key={item.step} className="flex items-baseline gap-4">
                  <span className="[font-family:var(--font-mono)] text-[11px] font-medium tracking-[0.08em] text-[var(--ink-3)] w-6 shrink-0">
                    {item.step}
                  </span>
                  <span className="text-[15px] text-[var(--ink)]">{item.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-md bg-[var(--accent)] text-[var(--accent-ink)] hover:bg-[color-mix(in_srgb,var(--accent)_88%,transparent)] text-[14px] font-medium tracking-[-0.005em] transition-colors duration-150"
              >
                Get started →
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
