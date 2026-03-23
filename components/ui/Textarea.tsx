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
          <label htmlFor={inputId} className="text-[13px] font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border bg-[var(--surface)] border-[var(--border)]",
            "px-3 py-2 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted)]",
            "focus:outline-none focus:ring-0 focus:border-[var(--accent)]",
            "disabled:opacity-50 resize-y min-h-[120px] transition-colors duration-150",
            error && "border-red-500/50 focus:border-red-500",
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="text-[12px] text-[var(--muted)]">{hint}</p>}
        {error && <p className="text-[12px] text-[var(--danger)]">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
