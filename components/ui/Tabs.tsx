"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className="flex overflow-x-auto"
        style={{ borderBottom: "1px solid var(--line)", marginBottom: "var(--gap-section)", gap: 4 }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "whitespace-nowrap transition-[color,border-color] duration-[120ms] ease-[ease]",
              "border-0 bg-transparent cursor-pointer font-inherit tracking-[-0.005em]",
              active === tab.id
                ? "text-[var(--ink)]"
                : "text-[var(--ink-3)] hover:text-[var(--ink)]",
            )}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: "10px 14px",
              borderBottom: `2px solid ${active === tab.id ? "var(--ink)" : "transparent"}`,
              marginBottom: -1,
              font: "inherit",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children(active)}</div>
    </div>
  );
}
