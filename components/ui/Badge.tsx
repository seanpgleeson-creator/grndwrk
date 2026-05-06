import { cn } from "@/lib/utils";

type BadgeVariant =
  | "watching"
  | "preparing"
  | "applied"
  | "in-process"
  | "closed"
  | "tier-1"
  | "tier-2"
  | "tier-3"
  | "default"
  | "success"
  | "warning"
  | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  // Status — mirrors StatusPill tones from ui.md
  watching:   "bg-transparent text-[var(--ink-3)] border-[var(--line)]",
  preparing:  "bg-[var(--bg-mute)] text-[var(--ink)] border-[var(--bg-mute)]",
  applied:    "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)]",
  "in-process": "bg-[var(--bg-mute)] text-[var(--ink)] border-[var(--bg-mute)]",
  closed:     "bg-transparent text-[var(--ink-4)] border-[var(--line-2)]",
  // Tier
  "tier-1":   "bg-[var(--ink)] text-[var(--bg)] border-[var(--ink)] font-semibold",
  "tier-2":   "bg-[var(--bg-mute)] text-[var(--ink)] border-[var(--bg-mute)]",
  "tier-3":   "bg-transparent text-[var(--ink-3)] border-[var(--line)]",
  // Generic
  default:    "bg-[var(--bg-mute)] text-[var(--ink-3)] border-[var(--line-2)]",
  // Semantic (contextual color kept for feedback legibility)
  success:    "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900",
  warning:    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
  danger:     "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded border",
        "text-[11px] font-medium tracking-[0.005em]",
        "transition-colors duration-[120ms]",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusToBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case "Watching":   return "watching";
    case "Preparing":  return "preparing";
    case "Applied":    return "applied";
    case "InProcess":  return "in-process";
    case "Closed":     return "closed";
    default:           return "default";
  }
}

export function tierToBadgeVariant(tier: number | null): BadgeVariant {
  if (tier === 1) return "tier-1";
  if (tier === 2) return "tier-2";
  if (tier === 3) return "tier-3";
  return "default";
}
