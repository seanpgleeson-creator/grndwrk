import { DM_Sans, Fraunces } from "next/font/google";
import type { CSSProperties } from "react";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
});

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${dmSans.variable} ${fraunces.variable} min-h-screen bg-[var(--background)] px-6 py-10 md:px-10 [font-family:var(--font-body),sans-serif]`}
      style={
        {
          "--background": "#FAFAF8",
          "--surface": "#FFFFFF",
          "--surface-raised": "#FFFFFF",
          "--border": "#E5E5E5",
          "--foreground": "#1A1A1A",
          "--muted": "#78716C",
          "--accent": "#0D7377",
          "--accent-hover": "#0A5E62",
        } as CSSProperties
      }
    >
      <div className="w-full max-w-[680px]">
        {children}
      </div>
    </div>
  );
}
