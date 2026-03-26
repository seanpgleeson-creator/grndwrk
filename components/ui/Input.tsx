import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border bg-[var(--surface)] border-[var(--border)]",
            "px-3 py-2.5 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted)]",
            "focus:outline-none focus:ring-0 focus:border-[var(--accent)]",
            "disabled:opacity-50 transition-colors duration-150",
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
Input.displayName = "Input";
