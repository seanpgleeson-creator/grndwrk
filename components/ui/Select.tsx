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
          <label
            htmlFor={inputId}
            className="block text-[13px] font-medium text-[var(--ink)] tracking-[-0.005em]"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "w-full h-[var(--field-h)] rounded-[var(--radius)] border bg-[var(--bg-elev)]",
            "border-[var(--line)] px-3 text-[14px] text-[var(--ink)]",
            "outline-none transition-[border-color,box-shadow] duration-[120ms] ease-[ease]",
            "hover:border-[var(--ink-4)]",
            "focus:border-[var(--focus)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_12%,transparent)]",
            "disabled:opacity-50",
            error && "border-red-500/60",
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
        {hint && !error && <p className="text-[12px] text-[var(--ink-3)] leading-[1.45]">{hint}</p>}
        {error && <p className="text-[12px] text-red-500">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";
