import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-[var(--foreground)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border bg-[var(--surface)] border-[var(--border)]",
            "px-3 py-2 text-[14px] text-[var(--foreground)]",
            "focus:outline-none focus:ring-0 focus:border-[var(--accent)]",
            "disabled:opacity-50 transition-colors duration-150",
            error && "border-red-500/50",
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error && <p className="text-[12px] text-[var(--muted)]">{hint}</p>}
        {error && <p className="text-[12px] text-[var(--danger)]">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
