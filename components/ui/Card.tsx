import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-[var(--surface)] border-[var(--border)] transition-colors duration-150",
        className,
      )}
    >
      {children}
    </div>
  );
}
