"use client";

import { Modal } from "@/components/ui/Modal";

interface WhatIsGrndwrkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTIONS = [
  {
    eyebrow: "What it helps you accomplish",
    body: "grndwrk is a command center for a deliberate job search. It helps you pursue the right companies with positioning, research, and timing — often before a role is posted. Instead of sending dozens of applications into a void, you build relationships, craft company-specific positioning briefs, and show up to conversations already prepared. The goal is to turn a passive job hunt into a proactive campaign with fewer moves and better outcomes.",
  },
  {
    eyebrow: "What it requires from you",
    body: "Setup takes about 5 minutes: write your positioning statement, define your narrative pillars, calibrate your CMF fit criteria, and set compensation targets. From there, the work is ongoing — scoring each opportunity you track, logging company signals (earnings, leadership changes, product news), and sending proactive outreach. grndwrk rewards consistency over volume. It is most useful when you treat it as a daily brief, not a one-time form.",
  },
  {
    eyebrow: "Why it's different from job boards",
    body: "LinkedIn and Indeed surface listings — grndwrk surfaces fit and positioning. Job boards are built for recruiters to find candidates. grndwrk is built for candidates to find the right companies, understand their moment, and arrive ready. There is no job feed here. Instead, you define your target list, research each company, and build the case for why you belong — before anyone asks. It is a candidate-side tool, not a marketplace.",
  },
];

export function WhatIsGrndwrkModal({ open, onOpenChange }: WhatIsGrndwrkModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="What is grndwrk?"
      description="A deliberate job search tool — not a job board."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 4 }}>
        {SECTIONS.map((section) => (
          <div key={section.eyebrow} style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--ink-3)",
                marginBottom: 8,
              }}
            >
              {section.eyebrow}
            </p>
            <p
              style={{
                fontSize: 13.5,
                lineHeight: 1.65,
                color: "var(--ink-2)",
              }}
            >
              {section.body}
            </p>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4 }}>
          <button
            onClick={() => onOpenChange(false)}
            style={{
              background: "var(--accent)",
              color: "var(--accent-ink)",
              border: "none",
              borderRadius: "var(--radius)",
              height: "var(--field-h)",
              padding: "0 16px",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "-0.005em",
              cursor: "pointer",
              transition: "opacity 120ms ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}
