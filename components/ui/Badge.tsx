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
  watching: "bg-slate-700/50 text-slate-300 border-slate-600/50",
  preparing: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  applied: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "in-process": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  closed: "bg-slate-600/30 text-slate-400 border-slate-600/30",
  "tier-1": "bg-indigo-500/30 text-indigo-200 border-indigo-500/40 font-semibold",
  "tier-2": "bg-indigo-500/15 text-indigo-400 border-indigo-500/20",
  "tier-3": "bg-slate-700/30 text-slate-400 border-slate-600/30",
  default: "bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--border)]",
  success: "bg-green-500/20 text-green-300 border-green-500/30",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  danger: "bg-red-500/20 text-red-300 border-red-500/30",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs border",
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
    case "Watching": return "watching";
    case "Preparing": return "preparing";
    case "Applied": return "applied";
    case "InProcess": return "in-process";
    case "Closed": return "closed";
    default: return "default";
  }
}

export function tierToBadgeVariant(tier: number | null): BadgeVariant {
  if (tier === 1) return "tier-1";
  if (tier === 2) return "tier-2";
  if (tier === 3) return "tier-3";
  return "default";
}
