import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({
  title,
  description,
  action,
  footer,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--bg-mute)]",
        "transition-colors duration-[120ms]",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-[var(--line)]">
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-[var(--ink)] tracking-[-0.005em]">{title}</h2>
          {description && (
            <p className="mt-1 text-[13px] text-[var(--ink-3)] leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className={cn("px-6 py-6", bodyClassName)}>{children}</div>
      {footer && (
        <footer className="flex items-center gap-3 px-6 py-4 border-t border-[var(--line)] bg-[var(--bg-elev)]/40">
          {footer}
        </footer>
      )}
    </section>
  );
}
