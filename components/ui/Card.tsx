import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-elev)]",
        "transition-colors duration-[120ms]",
        className,
      )}
    >
      {children}
    </div>
  );
}
