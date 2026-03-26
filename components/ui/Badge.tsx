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
  watching: "bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--border)]",
  preparing: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
  applied: "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/25",
  "in-process": "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
  closed: "bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--border)]",
  "tier-1": "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/25 font-semibold",
  "tier-2": "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/15",
  "tier-3": "bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--border)]",
  default: "bg-[var(--surface-raised)] text-[var(--muted)] border-[var(--border)]",
  success: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
  warning: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
  danger: "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border transition-colors duration-150",
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
