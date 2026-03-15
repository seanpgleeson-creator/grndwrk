import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm text-[var(--foreground)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border bg-[var(--surface-raised)] border-[var(--border)]",
            "px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]",
            "focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]",
            "disabled:opacity-50 resize-y min-h-[80px]",
            error && "border-red-500/50 focus:ring-red-500",
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
